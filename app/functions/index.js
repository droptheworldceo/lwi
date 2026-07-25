const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// 신고가 이 개수 이상 쌓이면 자동으로 숨김 처리한다.
const HIDE_THRESHOLD = 3;
// 서브 채널 참여자가 이 인원을 넘으면 메인 채널로 자동 승격한다. (data.js의 MAIN_PROMOTION_THRESHOLD와 동일하게 유지할 것)
const MAIN_PROMOTION_THRESHOLD = 30;

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
