// 공용 UI 헬퍼: 토스트, 신고/차단 바텀시트. data.js 다음에 로드.
window.LWI = window.LWI || {};

window.LWI.showToast = function (message) {
  var el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(function () { el.classList.add("show"); });
  setTimeout(function () {
    el.classList.remove("show");
    setTimeout(function () { el.remove(); }, 250);
  }, 1800);
};

// opts: { targetType: 'post'|'comment', targetId, postId, authorUid, authorNickname, reporterUid, isOwn, onBlocked }
window.LWI.openReportBlockSheet = function (opts) {
  var overlay = document.createElement("div");
  overlay.className = "sheet-overlay";
  var sheet = document.createElement("div");
  sheet.className = "sheet";

  var REASON_KEYS = { spam: "sheet.reasonSpam", abuse: "sheet.reasonAbuse", misinfo: "sheet.reasonMisinfo", privacy: "sheet.reasonPrivacy", etc: "sheet.reasonEtc" };
  var html = "<h3>" + window.LWI.t("sheet.reportTitle") + "</h3>";
  window.LWI.REPORT_REASONS.forEach(function (r) {
    html += '<button class="sheet-option" data-reason="' + r.code + '">' + window.LWI.t(REASON_KEYS[r.code]) + "</button>";
  });
  if (!opts.isOwn) {
    html += "<h3>" + window.LWI.t("sheet.otherTitle") + "</h3>";
    html += '<button class="sheet-option danger" data-action="block">' + window.LWI.t("sheet.blockAuthor") + '</button>';
  }
  html += '<button class="sheet-cancel" data-action="cancel">' + window.LWI.t("sheet.cancel") + '</button>';
  sheet.innerHTML = html;
  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  function close() { overlay.remove(); }
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

  sheet.querySelectorAll("[data-reason]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.LWI.reportContent({
        targetType: opts.targetType,
        targetId: opts.targetId,
        postId: opts.postId || null,
        authorUid: opts.authorUid,
        reporterUid: opts.reporterUid,
        reason: btn.dataset.reason
      }).then(function () {
        close();
        window.LWI.showToast(window.LWI.t("sheet.reportSuccess"));
      });
    });
  });

  var blockBtn = sheet.querySelector('[data-action="block"]');
  if (blockBtn) {
    blockBtn.addEventListener("click", function () {
      close();
      window.LWI.blockUser(opts.reporterUid, opts.authorUid, opts.authorNickname).then(function () {
        window.LWI.showToast(window.LWI.t("sheet.blockSuccess", { "{name}": opts.authorNickname || window.LWI.t("common.anonymous") }));
        if (opts.onBlocked) opts.onBlocked();
      });
    });
  }

  sheet.querySelector('[data-action="cancel"]').addEventListener("click", close);
};

function lwiKebabIcon() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
}
window.LWI.kebabIconHtml = lwiKebabIcon;
