// 인증 관련 공용 헬퍼. firebase-init.js 다음에 로드.
window.LWI = window.LWI || {};

// 로그인 안 되어 있으면 곧바로 익명 로그인시켜 체크인을 바로 체험할 수 있게 한다("초간편" 진입장벽 제거).
// 익명 사용자는 이메일 인증 절차를 건너뛴다. 이메일로 정식 가입한 사용자만 verify.html을 거친다.
// 통과하면 콜백에 user, profile(Firestore users/{uid} 문서)을 넘겨준다.
window.LWI.requireAuth = function (onReady) {
  if (!window.LWI.isConfigured) {
    onReady(null, null);
    return;
  }
  window.LWI.auth.onAuthStateChanged(function (user) {
    if (!user) {
      // 여기서 onReady를 부르지 않는다 — 익명 로그인이 완료되면 onAuthStateChanged가 다시 호출된다.
      // Firebase 콘솔에서 Anonymous 로그인 제공업체가 꺼져 있으면 이 호출이 실패하는데,
      // 그 경우엔 예전처럼 이메일 가입 화면으로 보내 앱 자체는 계속 쓸 수 있게 한다.
      window.LWI.auth.signInAnonymously().catch(function (err) {
        console.error("signInAnonymously failed — falling back to signup.html", err);
        window.location.href = "signup.html";
      });
      return;
    }

    if (user.isAnonymous) {
      proceedToProfile(user);
      return;
    }

    user.reload().then(function () {
      if (!user.emailVerified) {
        window.location.href = "verify.html";
        return;
      }
      // reload()는 user.emailVerified만 갱신하고, Firestore 규칙이 실제로 검사하는
      // ID 토큰의 email_verified 클레임은 갱신하지 않는다. 강제로 새 토큰을 받아둔다.
      return user.getIdToken(true).then(function () { proceedToProfile(user); });
    });
  });

  function proceedToProfile(user) {
    window.LWI.db.collection("users").doc(user.uid).get().then(function (doc) {
      if (!doc.exists) {
        window.location.href = "nickname.html";
        return;
      }
      onReady(user, doc.data());
    });
  }
};

// 익명(게스트) 계정을 이메일 계정으로 승격시킨다 — uid가 유지되므로 포인트·스트릭 기록이 그대로 이어진다.
// 이미 이메일 계정이거나 게스트가 아니면 일반 가입(createUserWithEmailAndPassword)으로 처리한다.
window.LWI.linkGuestAccount = function (email, password) {
  var current = window.LWI.auth.currentUser;
  var cred = firebase.auth.EmailAuthProvider.credential(email, password);
  if (current && current.isAnonymous) {
    return current.linkWithCredential(cred);
  }
  return window.LWI.auth.createUserWithEmailAndPassword(email, password);
};

window.LWI.signOut = function () {
  if (!window.LWI.isConfigured) return;
  window.LWI.auth.signOut().then(function () {
    window.location.href = "signup.html";
  });
};
