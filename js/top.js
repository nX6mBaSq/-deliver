/**
 * トップページ専用スクリプト
 * - よくある質問のアコーディオン開閉
 * - 標準装備セクションの画像拡大表示（ライトボックス）
 */
(function () {
  "use strict";

  /* ------------------- アコーディオン（FAQ／標準装備の詳細） ------------------- */
  document.querySelectorAll(".faq__question, .features__toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));

      const answer = document.getElementById(button.getAttribute("aria-controls"));
      if (answer) answer.classList.toggle("is-open", !expanded);
    });
  });

  /* ------------------------- FAQ「もっと見る」 ------------------------- */
  const faqMoreButton = document.querySelector(".faq__more");
  const faqList = document.querySelector(".faq__list");

  if (faqMoreButton && faqList) {
    const hiddenItems = faqList.querySelectorAll(".faq__item[hidden]");

    if (hiddenItems.length === 0) {
      // 追加で表示するFAQ項目が無い場合は、押しても何も起きないボタンを出さない
      faqMoreButton.hidden = true;
    } else {
      faqMoreButton.addEventListener("click", () => {
        hiddenItems.forEach((item) => { item.hidden = false; });
        faqMoreButton.hidden = true;
      }, { once: true });
    }
  }

  /* ------------------------------ ライトボックス ------------------------------ */
  const lightbox = document.getElementById("features-lightbox");
  const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
  const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");

  if (lightbox && lightboxImage) {
    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        lightboxImage.src = trigger.dataset.lightboxSrc;
        lightboxImage.alt = trigger.getAttribute("aria-label") || "";
        lightbox.showModal();
        document.body.style.overflow = "hidden";
      });
    });

    const closeLightbox = () => {
      lightbox.close();
      document.body.style.overflow = "";
    };

    lightboxClose?.addEventListener("click", closeLightbox);

    // dialog自身（背景部分）をクリックしたら閉じる
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("close", () => {
      document.body.style.overflow = "";
    });
  }
})();
