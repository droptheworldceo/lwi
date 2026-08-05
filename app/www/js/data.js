// Firestore 데이터 접근 공용 헬퍼. firebase-init.js 다음에 로드.
// 컬렉션 구조:
//   channels/{channelId}            { name, tier: 'main'|'sub', memberCount, createdAt }
//   posts/{postId}                  { channelId, channelName, authorUid, authorNickname,
//                                      body, kind: 'experience'|'evidence', sourceNote,
//                                      empathyCount, commentCount, createdAt }
//   posts/{postId}/reactions/{uid}  { createdAt }   -- 공감 중복 방지용
//   posts/{postId}/comments/{id}    { authorUid, authorNickname, body, createdAt }
//   users/{uid}                     { nickname, joinedChannels: [channelId], createdAt }

window.LWI = window.LWI || {};

window.LWI.createUserProfile = function (uid, nickname) {
  return window.LWI.db.collection("users").doc(uid).set({
    nickname: nickname,
    joinedChannels: [],
    blockedUsers: {},
    points: 0,
    streak: 0,
    badges: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// tier 필터 + memberCount 정렬을 Firestore 복합 색인 없이 처리하기 위해
// 정렬은 서버가 아니라 클라이언트에서 한다 (채널 수가 적어 문제 없음).
window.LWI.listChannels = function (tier) {
  var q = window.LWI.db.collection("channels");
  if (tier) q = q.where("tier", "==", tier);
  return q.get().then(function (snap) {
    var list = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    list.sort(function (a, b) { return (b.memberCount || 0) - (a.memberCount || 0); });
    return list;
  });
};

// 서브 채널이 메인 채널로 승격되는 참여자 수 기준. 실제 승격(전환)은 아직
// 자동화 전이라(Cloud Functions 도입 전) 운영자가 콘솔에서 tier 필드를 바꿔줘야 한다.
window.LWI.MAIN_PROMOTION_THRESHOLD = 30;

window.LWI.createChannel = function (name, tier) {
  return window.LWI.db.collection("channels").add({
    name: name,
    tier: tier || "sub",
    memberCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

window.LWI.joinChannel = function (uid, channelId) {
  var userRef = window.LWI.db.collection("users").doc(uid);
  var channelRef = window.LWI.db.collection("channels").doc(channelId);
  return window.LWI.db.runTransaction(function (tx) {
    return tx.get(userRef).then(function (userDoc) {
      var joined = (userDoc.data() && userDoc.data().joinedChannels) || [];
      if (joined.indexOf(channelId) !== -1) return;
      joined.push(channelId);
      tx.update(userRef, { joinedChannels: joined });
      tx.update(channelRef, { memberCount: firebase.firestore.FieldValue.increment(1) });
    });
  });
};

// channelId로 거르는 경우 Firestore 복합 색인이 필요해지므로,
// 넉넉히 최신순으로 가져온 뒤 채널은 클라이언트에서 거른다 (초기 트래픽 규모에 맞춘 절충).
window.LWI.listPosts = function (opts) {
  opts = opts || {};
  var fetchN = opts.channelId ? Math.max(opts.limitN || 20, 100) : (opts.limitN || 20);
  return window.LWI.db.collection("posts").orderBy("createdAt", "desc").limit(fetchN)
    .get().then(function (snap) {
      var list = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .filter(function (p) { return !p.hidden; });
      if (opts.channelId) list = list.filter(function (p) { return p.channelId === opts.channelId; });
      return list.slice(0, opts.limitN || 20);
    });
};

window.LWI.getPost = function (postId) {
  return window.LWI.db.collection("posts").doc(postId).get().then(function (d) {
    return d.exists ? Object.assign({ id: d.id }, d.data()) : null;
  });
};

// 의료광고법 대응: 효능을 단정하는 표현은 게시 전 클라이언트에서 1차 차단.
// (최종 법률 자문 결과에 따라 목록은 계속 갱신될 수 있음)
window.LWI.BANNED_TERMS = ["최초", "유일", "100% 치료", "부작용 없음"];

window.LWI.findBannedTerm = function (text) {
  if (!text) return null;
  return window.LWI.BANNED_TERMS.find(function (term) { return text.indexOf(term) !== -1; }) || null;
};

// 이미지 업로드: Storage postImages/{uid}/{timestamp}_{파일명}에 저장 후 다운로드 URL 반환.
window.LWI.uploadPostImage = function (uid, file) {
  var path = "postImages/" + uid + "/" + Date.now() + "_" + file.name.replace(/[^\w.\-]/g, "_");
  var ref = window.LWI.storage.ref().child(path);
  return ref.put(file).then(function (snap) { return snap.ref.getDownloadURL(); });
};

window.LWI.createPost = function (post) {
  return window.LWI.db.collection("posts").add(Object.assign({}, post, {
    empathyCount: 0,
    commentCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }));
};

window.LWI.toggleEmpathy = function (postId, uid) {
  var postRef = window.LWI.db.collection("posts").doc(postId);
  var reactionRef = postRef.collection("reactions").doc(uid);
  return window.LWI.db.runTransaction(function (tx) {
    return tx.get(reactionRef).then(function (reactionDoc) {
      if (reactionDoc.exists) {
        tx.delete(reactionRef);
        tx.update(postRef, { empathyCount: firebase.firestore.FieldValue.increment(-1) });
        return false;
      }
      tx.set(reactionRef, { createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      tx.update(postRef, { empathyCount: firebase.firestore.FieldValue.increment(1) });
      return true;
    });
  });
};

window.LWI.listComments = function (postId) {
  return window.LWI.db.collection("posts").doc(postId).collection("comments")
    .orderBy("createdAt", "asc").get().then(function (snap) {
      return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .filter(function (c) { return !c.hidden; });
    });
};

window.LWI.addComment = function (postId, comment) {
  var postRef = window.LWI.db.collection("posts").doc(postId);
  var commentRef = postRef.collection("comments").doc();
  return window.LWI.db.runTransaction(function (tx) {
    tx.set(commentRef, Object.assign({}, comment, {
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }));
    tx.update(postRef, { commentCount: firebase.firestore.FieldValue.increment(1) });
    return Promise.resolve();
  });
};

window.LWI.updateNickname = function (uid, nickname) {
  return window.LWI.db.collection("users").doc(uid).update({ nickname: nickname });
};

// 신고: reports 컬렉션에 기록만 남긴다 (검토는 운영진이 콘솔에서 수행 — 관리자 화면은 추후 작업).
window.LWI.REPORT_REASONS = [
  { code: "spam", label: "스팸·광고" },
  { code: "abuse", label: "욕설·혐오 표현" },
  { code: "misinfo", label: "잘못된 의료정보" },
  { code: "privacy", label: "개인정보 노출" },
  { code: "etc", label: "기타" }
];

window.LWI.reportContent = function (report) {
  return window.LWI.db.collection("reports").add(Object.assign({}, report, {
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }));
};

// 차단: users/{uid}.blockedUsers는 { [상대uid]: 닉네임 } 맵으로 저장한다.
// (배열 대신 맵을 쓰는 이유: 다른 사용자의 프로필 문서는 읽기 권한이 없어서,
//  마이페이지에서 차단 목록에 닉네임을 보여주려면 차단 시점에 같이 저장해둬야 함)
// 차단된 사용자의 글/댓글은 피드·댓글 렌더링 시 클라이언트에서 걸러낸다.
window.LWI.blockUser = function (uid, blockedUid, blockedNickname) {
  var update = {};
  update["blockedUsers." + blockedUid] = blockedNickname || "익명";
  return window.LWI.db.collection("users").doc(uid).update(update);
};

window.LWI.unblockUser = function (uid, blockedUid) {
  var update = {};
  update["blockedUsers." + blockedUid] = firebase.firestore.FieldValue.delete();
  return window.LWI.db.collection("users").doc(uid).update(update);
};

window.LWI.filterBlocked = function (list, blockedUsers) {
  if (!blockedUsers || !Object.keys(blockedUsers).length) return list;
  return list.filter(function (item) { return !blockedUsers[item.authorUid]; });
};

// authorUid where + createdAt orderBy도 복합 색인이 필요해 listPosts와 같은 방식으로 처리.
window.LWI.listMyPosts = function (uid, limitN) {
  return window.LWI.db.collection("posts").orderBy("createdAt", "desc").limit(200)
    .get().then(function (snap) {
      var list = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .filter(function (p) { return p.authorUid === uid; });
      return list.slice(0, limitN || 30);
    });
};

// 오늘 컨디션 체크인 — users/{uid}/checkins/{YYYY-MM-DD} { mood, createdAt }
window.LWI.todayKey = function () {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

// 체크인은 클라이언트가 직접 Firestore에 쓰지 않고, 포인트/스트릭 계산과 하루 1회 검증을
// 전부 서버에서 처리하는 checkIn 콜러블 Cloud Function을 통해서만 이루어진다(부정 적립 방지).
window.LWI.checkIn = function (mood, watchedAd) {
  var call = window.LWI.functions.httpsCallable("checkIn");
  return call({ mood: mood, watchedAd: !!watchedAd }).then(function (res) { return res.data; });
};

window.LWI.getTodayCheckin = function (uid) {
  return window.LWI.db.collection("users").doc(uid).collection("checkins").doc(window.LWI.todayKey())
    .get().then(function (d) { return d.exists ? d.data() : null; });
};

window.LWI.getCheckinCount = function (uid) {
  return window.LWI.db.collection("users").doc(uid).collection("checkins").get()
    .then(function (snap) { return snap.size; });
};

// Firestore가 아직 비어 있을 때(초기 세팅 전) 화면이 완전히 비지 않도록 보여줄 기본 메인 채널 후보.
// 실제 값은 KOSIS 다빈도 상병 데이터 확정 후 Firestore channels 컬렉션에 반영해야 한다 (기획안 07번 참고).
window.LWI.FALLBACK_MAIN_CHANNELS = [
  { id: "hypertension", name: "고혈압", tier: "main", memberCount: 0 },
  { id: "diabetes", name: "당뇨", tier: "main", memberCount: 0 },
  { id: "arthritis", name: "관절염", tier: "main", memberCount: 0 },
  { id: "hairloss", name: "탈모", tier: "main", memberCount: 0 },
  { id: "rhinitis", name: "비염", tier: "main", memberCount: 0 },
  { id: "gastritis", name: "위염", tier: "main", memberCount: 0 }
];
