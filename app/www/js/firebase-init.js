// firebase-config.js, Firebase compat SDK(app/auth/firestore) 스크립트 이후에 로드할 것.
(function () {
  var cfg = window.LWI_FIREBASE_CONFIG || {};
  window.LWI = window.LWI || {};
  window.LWI.isConfigured = cfg.apiKey && cfg.apiKey !== "REPLACE_ME";

  if (window.LWI.isConfigured && window.firebase) {
    firebase.initializeApp(cfg);
    window.LWI.auth = firebase.auth();
    window.LWI.db = firebase.firestore();
    if (firebase.storage) window.LWI.storage = firebase.storage();
    if (firebase.functions) window.LWI.functions = firebase.functions();
  }

  // 설정 전이면 페이지 상단에 안내 배너를 자동 삽입
  document.addEventListener("DOMContentLoaded", function () {
    if (window.LWI.isConfigured) return;
    var app = document.querySelector(".app");
    if (!app) return;
    var banner = document.createElement("div");
    banner.className = "config-banner";
    banner.innerHTML =
      "Firebase 설정이 아직 연결되지 않았습니다. " +
      "<code>js/firebase-config.js</code> 파일을 Firebase 콘솔의 프로젝트 설정 값으로 채워주세요.";
    app.insertBefore(banner, app.firstChild.nextSibling);
  });
})();
