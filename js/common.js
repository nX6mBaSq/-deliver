/**
 * 共通スクリプト
 * ハンバーガーメニュー（ドロワー）の開閉。全ページで読み込む。
 */
(function () {
  const drawer = document.getElementById("nav-drawer");
  const openButton = document.querySelector("[data-nav-open]");
  const closeButton = document.querySelector("[data-nav-close]");

  if (!drawer || !openButton) return;

  const openDrawer = () => {
    drawer.showModal();
    document.body.style.overflow = "hidden";
    document.body.classList.add("has-modal-open");
  };

  const closeDrawer = () => {
    drawer.close();
    document.body.style.overflow = "";
    document.body.classList.remove("has-modal-open");
  };

  openButton.addEventListener("click", openDrawer);
  closeButton?.addEventListener("click", closeDrawer);

  // dialog自身（背景部分）をクリックしたら閉じる
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) closeDrawer();
  });

  // メニュー内のリンクをクリックしたら閉じる
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  drawer.addEventListener("close", () => {
    document.body.style.overflow = "";
    document.body.classList.remove("has-modal-open");
  });
})();
