function setFooterYear() {
  const yearEl = document.querySelector("#year");
  if (!yearEl) return;
  const now = new Date();
  yearEl.textContent = String(now.getFullYear());
}

function enableSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      target?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

setFooterYear();
enableSmoothScroll();
