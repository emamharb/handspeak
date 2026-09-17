const siteLinks = [
  { key: "home", label: "الرئيسية", href: "index.html#home" },
  { key: "downloads", label: "التحميل", href: "downloads.html", cta: true },
  { key: "team", label: "الفريق", href: "team.html" },
  { key: "about", label: "من نحن", href: "about.html" },
  { key: "contact", label: "تواصل", href: "contact.html" }
];

const footerLinks = [
  { label: "سياسة الخصوصية", href: "privacy.html" },
  { label: "من نحن", href: "about.html" },
  { label: "صفحة الفريق", href: "team.html" },
  { label: "التحميل", href: "downloads.html" }
];

const currentPage = document.body.dataset.page || "home";

function renderHeader() {
  const target = document.getElementById("site-header");
  if (!target) return;

  const navItems = siteLinks.map((item) => {
    const classes = [];
    if (item.key === currentPage) classes.push("is-active");
    if (item.cta) classes.push("cta-link");
    return `<li><a class="${classes.join(" ")}" href="${item.href}">${item.label}</a></li>`;
  }).join("");

  target.innerHTML = `
    <div class="site-header">
      <div class="container">
        <a class="brand" href="index.html" aria-label="العودة إلى الصفحة الرئيسية">
          <span class="brand-mark">
            <img src="assets/brand-icon.png" alt="HandSpeak">
          </span>
          <span class="brand-text">
            <span class="brand-title">HandSpeak</span>
          </span>
        </a>
        <button class="menu-toggle" id="menuToggle" aria-label="فتح القائمة">
          <span></span>
        </button>
        <nav class="site-nav" id="siteNav">
          <ul>${navItems}</ul>
        </nav>
      </div>
    </div>
  `;

  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");

  if (!menuToggle || !siteNav) return;

  menuToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    });
  });
}

function renderFooter() {
  const target = document.getElementById("site-footer");
  if (!target) return;

  const footerNav = [
    { label: "الرئيسية", href: "index.html#home" },
    { label: "التحميل", href: "downloads.html" },
    { label: "الفريق", href: "team.html" },
    { label: "تواصل", href: "contact.html" },
    { label: "سياسة الخصوصية", href: "privacy.html" }
  ].map((item) => {
    return `<li><a href="${item.href}">${item.label}</a></li>`;
  }).join("");

  target.innerHTML = `
    <div class="site-footer">
      <div class="container footer-strip">
        <a class="footer-brand-inline" href="index.html" aria-label="العودة إلى الرئيسية">
          <span class="brand-mark">
            <img src="assets/brand-icon.png" alt="HandSpeak">
          </span>
          <span class="footer-brand-text">
            <strong>HandSpeak</strong>
            <span>موقع المشروع الرسمي</span>
          </span>
        </a>
        <ul class="footer-links-inline">${footerNav}</ul>
        <div class="footer-meta-inline">كلية التربية النوعية · جامعة طنطا · إشراف: د. دينا نصار · د. سمر الذهبي</div>
      </div>
    </div>
  `;
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  items.forEach((item) => observer.observe(item));
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = encodeURIComponent(form.querySelector("[name='name']").value.trim());
    const email = encodeURIComponent(form.querySelector("[name='email']").value.trim());
    const subject = encodeURIComponent(form.querySelector("[name='subject']").value.trim());
    const message = encodeURIComponent(form.querySelector("[name='message']").value.trim());

    const mail = `mailto:nexcmd.official@gmail.com?subject=${subject || encodeURIComponent("رسالة من موقع HandSpeak")}&body=${encodeURIComponent("الاسم: ")}${name}%0A${encodeURIComponent("البريد: ")}${email}%0A%0A${message}`;
    window.location.href = mail;
  });
}

function setupDownloadHints() {
  document.querySelectorAll("[data-copy-mail]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyMail;
      try {
        await navigator.clipboard.writeText(value);
        button.textContent = "تم النسخ";
        setTimeout(() => {
          button.textContent = "نسخ البريد";
        }, 1800);
      } catch (error) {
        window.location.href = `mailto:${value}`;
      }
    });
  });
}

renderHeader();
renderFooter();
setupReveal();
setupContactForm();
setupDownloadHints();
