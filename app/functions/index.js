const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// 신고가 이 개수 이상 쌓이면 자동으로 숨김 처리한다.
const HIDE_THRESHOLD = 3;
// 서브 채널 참여자가 이 인원을 넘으면 메인 채널로 자동 승격한다. (data.js의 MAIN_PROMOTION_THRESHOLD와 동일하게 유지할 것)
const MAIN_PROMOTION_THRESHOLD = 30;

// 체크인 보상 정책. 스트릭 마일스톤은 1회성 보너스라 badges에 기록해 중복 지급을 막는다.
const CHECKIN_BASE_POINTS = 10;
const AD_BONUS_POINTS = 10;
const STREAK_MILESTONES = { 7: 50, 15: 100, 30: 200, 100: 1000 };
const VALID_MOODS = ["힘듦", "피곤", "보통", "좋음"];

// 한국 시간(KST, UTC+9) 기준 YYYY-MM-DD. 클라이언트 기기 시간이 아니라
// 서버 시간을 기준으로 "오늘"을 정하기 위해 Cloud Functions에서 직접 계산한다.
function kstDateKey(offsetDays) {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000 + (offsetDays || 0) * 86400000);
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 콜러블: 오늘의 컨디션 체크인을 서버에서 검증·기록한다.
 * - 하루 1회만 인정(같은 날짜 문서가 이미 있으면 거부)
 * - 어제 체크인 여부로 연속 스트릭을 계산해 users/{uid}.streak에 저장
 * - 기본 포인트 + (옵션) 광고 시청 보너스 + 스트릭 마일스톤 보너스를 users/{uid}.points에 누적
 * 클라이언트는 mood와 watchedAd만 보내고, 포인트/스트릭 계산은 전부 서버 책임.
 */
exports.checkIn = onCall(async (request) => {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError("unauthenticated", "로그인이 필요합니다.");

  const mood = request.data && request.data.mood;
  if (!VALID_MOODS.includes(mood)) throw new HttpsError("invalid-argument", "mood 값이 올바르지 않습니다.");
  const watchedAd = !!(request.data && request.data.watchedAd);

  const todayKey = kstDateKey(0);
  const yesterdayKey = kstDateKey(-1);
  const userRef = db.collection("users").doc(uid);
  const checkinRef = userRef.collection("checkins").doc(todayKey);

  return db.runTransaction(async (tx) => {
    const [checkinDoc, userDoc] = await Promise.all([tx.get(checkinRef), tx.get(userRef)]);
    if (checkinDoc.exists) throw new HttpsError("already-exists", "오늘은 이미 체크인했어요.");

    const userData = userDoc.exists ? userDoc.data() : {};
    const prevStreak = userData.streak || 0;
    const prevBadges = userData.badges || [];
    const newStreak = userData.lastCheckinDate === yesterdayKey ? prevStreak + 1 : 1;

    let pointsAwarded = CHECKIN_BASE_POINTS + (watchedAd ? AD_BONUS_POINTS : 0);
    const newBadges = [];
    Object.keys(STREAK_MILESTONES).forEach((days) => {
      const badgeKey = `streak_${days}`;
      if (newStreak >= Number(days) && prevBadges.indexOf(badgeKey) === -1) {
        pointsAwarded += STREAK_MILESTONES[days];
        newBadges.push(badgeKey);
      }
    });

    tx.set(checkinRef, { mood, pointsAwarded, createdAt: FieldValue.serverTimestamp() });
    tx.set(
      userRef,
      {
        points: FieldValue.increment(pointsAwarded),
        streak: newStreak,
        lastCheckinDate: todayKey,
        badges: newBadges.length ? FieldValue.arrayUnion(...newBadges) : (userData.badges || [])
      },
      { merge: true }
    );

    return {
      streak: newStreak,
      pointsAwarded,
      newBadges
    };
  });
});

/**
 * reports/{reportId} 생성 트리거.
 * 같은 targetId에 대한 누적 신고 수를 세서 대상 문서(post 또는 comment)에 기록하고,
 * 임계치를 넘으면 hidden: true로 표시한다. 클라이언트는 hidden된 글/댓글을 목록에서 제외한다.
 */
exports.onReportCreated = onDocumentCreated("reports/{reportId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const report = snap.data();
  const targetId = report.targetId;
  const targetType = report.targetType;
  if (!targetId || !targetType) return;

  const countSnap = await db.collection("reports").where("targetId", "==", targetId).get();
  const count = countSnap.size;

  let targetRef;
  if (targetType === "post") {
    targetRef = db.collection("posts").doc(targetId);
  } else if (targetType === "comment" && report.postId) {
    targetRef = db.collection("posts").doc(report.postId).collection("comments").doc(targetId);
  } else {
    return;
  }

  const update = { reportCount: count };
  if (count >= HIDE_THRESHOLD) update.hidden = true;

  await targetRef.set(update, { merge: true });
});

/**
 * channels/{channelId} 업데이트 트리거.
 * 서브 채널의 memberCount가 승격 기준을 처음 넘는 순간 tier를 main으로 바꾼다.
 * (이미 넘은 상태에서 다시 저장되는 경우 재실행되지 않도록 before 값과 비교)
 */
exports.onChannelUpdated = onDocumentUpdated("channels/{channelId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (!after || after.tier !== "sub") return;

  const beforeCount = before ? (before.memberCount || 0) : 0;
  const afterCount = after.memberCount || 0;
  if (afterCount < MAIN_PROMOTION_THRESHOLD) return;
  if (beforeCount >= MAIN_PROMOTION_THRESHOLD) return;

  await event.data.after.ref.set(
    { tier: "main", promotedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
});
