// 인증 관련 공용 헬퍼. firebase-init.js 다음에 로드.
window.LWI = window.LWI || {};

// 로그인 안 되어 있으면 signup.html로, 이메일 미인증이면 verify.html로 보낸다.
// 통과하면 콜백에 user, profile(Firestore users/{uid} 문서)을 넘겨준다.
window.LWI.requireAuth = function (onReady) {
  if (!window.LWI.isConfigured) {
    onReady(null, null);
    return;
  }
  window.LWI.auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "signup.html";
      return;
    }
    user.reload().then(function () {
      if (!user.emailVerified) {
        window.location.href = "verify.html";
        return;
      }
      // reload()는 user.emailVerified만 갱신하고, Firestore 규칙이 실제로 검사하는
      // ID 토큰의 email_verified 클레임은 갱신하지 않는다. 강제로 새 토큰을 받아둔다.
      return user.getIdToken(true).then(function () {
        return window.LWI.db.collection("users").doc(user.uid).get();
      }).then(function (doc) {
        if (!doc.exists) {
          window.location.href = "nickname.html";
          return;
        }
        onReady(user, doc.data());
      });
    });
  });
};

window.LWI.signOut = function () {
  if (!window.LWI.isConfigured) return;
  window.LWI.auth.signOut().then(function () {
    window.location.href = "signup.html";
  });
};
