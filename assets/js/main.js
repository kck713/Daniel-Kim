(function () {
  "use strict";

  // Header background on scroll + TOP button
  var header = document.getElementById("header");
  var topBtn = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    topBtn.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  // Hero slider
  var slides = document.querySelectorAll(".hero__slide");
  var dots = document.querySelectorAll("#heroDots button");
  var heroLabel = document.getElementById("heroLabel");
  var current = 0;
  var timer;
  function goTo(i) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    if (heroLabel) heroLabel.textContent = slides[current].dataset.label || "";
  }
  function autoplay() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 5000);
  }
  if (slides.length > 1 && dots.length === slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); autoplay(); });
    });
    autoplay();
  }

  // Service tabs
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.dataset.tab;
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.panel === key);
      });
    });
  });

  // Before / After sliders
  document.querySelectorAll("[data-ba]").forEach(function (wrap) {
    var range = wrap.querySelector("input");
    function update() { wrap.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", update);
    update();
  });

  // Count-up numbers
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ko-KR") + (target >= 1000 ? "+" : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Scroll reveal
  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    counters.forEach(countUp);
  }

  // Reservation form (front-end validation only)
  var form = document.getElementById("reserveForm");
  var msg = document.getElementById("formMsg");
  var phoneRe = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var invalid = [];
    form.querySelectorAll("[required]").forEach(function (field) {
      var ok = field.type === "checkbox" ? field.checked : field.value.trim() !== "";
      if (ok && field.name === "phone") ok = phoneRe.test(field.value.trim());
      field.classList.toggle("is-invalid", !ok);
      if (!ok) invalid.push(field);
    });
    msg.className = "form__msg form__full";
    if (invalid.length) {
      msg.classList.add("is-error");
      msg.textContent = invalid[0].name === "phone"
        ? "연락처를 올바르게 입력해 주세요."
        : invalid[0].name === "agree"
          ? "개인정보 수집 및 이용에 동의해 주세요."
          : "필수 항목을 모두 입력해 주세요.";
      invalid[0].focus();
      return;
    }
    // TODO: 실제 접수 채널(이메일, 구글폼, CRM 등)과 연동
    msg.classList.add("is-success");
    msg.textContent = "상담 신청이 접수되었습니다. 곧 연락드리겠습니다.";
    form.reset();
  });
})();
