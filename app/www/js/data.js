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
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

window.LWI.listChannels = function (tier) {
  var q = window.LWI.db.collection("channels");
  if (tier) q = q.where("tier", "==", tier);
  return q.orderBy("memberCount", "desc").get().then(function (snap) {
    return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  });
};

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

window.LWI.listPosts = function (opts) {
  opts = opts || {};
  var q = window.LWI.db.collection("posts");
  if (opts.channelId) q = q.where("channelId", "==", opts.channelId);
  q = q.orderBy("createdAt", "desc").limit(opts.limitN || 20);
  return q.get().then(function (snap) {
    return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  });
};

window.LWI.getPost = function (postId) {
  return window.LWI.db.collection("posts").doc(postId).get().then(function (d) {
    return d.exists ? Object.assign({ id: d.id }, d.data()) : null;
  });
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
      return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
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
  });
};

window.LWI.updateNickname = function (uid, nickname) {
  return window.LWI.db.collection("users").doc(uid).update({ nickname: nickname });
};

window.LWI.listMyPosts = function (uid, limitN) {
  return window.LWI.db.collection("posts").where("authorUid", "==", uid)
    .orderBy("createdAt", "desc").limit(limitN || 30).get().then(function (snap) {
      return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
};

// 오늘 컨디션 체크인 — users/{uid}/checkins/{YYYY-MM-DD} { mood, createdAt }
window.LWI.todayKey = function () {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

window.LWI.saveCheckin = function (uid, mood) {
  return window.LWI.db.collection("users").doc(uid).collection("checkins").doc(window.LWI.todayKey())
    .set({ mood: mood, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
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
