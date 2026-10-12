/* LJD Welding — shared site behaviors */
(function () {
  "use strict";

  /* Header scroll state */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* Auto-stagger reveal delays within a row — must run before the
     IntersectionObserver below is set up, since it adds the .reveal
     class that observer looks for. */
  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.classList.add("reveal");
      child.style.transitionDelay = i * 90 + "ms";
    });
  });

  /* Scroll reveal animations */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Project / gallery filtering */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var filterItems = document.querySelectorAll("[data-category]");
  if (filterButtons.length && filterItems.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        var value = btn.getAttribute("data-filter");
        filterItems.forEach(function (item) {
          var cats = item.getAttribute("data-category");
          var show = value === "all" || (cats && cats.indexOf(value) !== -1);
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Lightbox */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var current = 0;

    function openLightbox(index) {
      current = index;
      var el = triggers[current];
      lbImg.src = el.getAttribute("data-full") || el.querySelector("img").src;
      lbImg.alt = el.getAttribute("data-caption") || "";
      if (lbCaption) lbCaption.textContent = el.getAttribute("data-caption") || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function step(dir) {
      current = (current + dir + triggers.length) % triggers.length;
      openLightbox(current);
    }

    triggers.forEach(function (el, i) {
      el.addEventListener("click", function () {
        openLightbox(i);
      });
    });

    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-nav.prev");
    var nextBtn = lightbox.querySelector(".lightbox-nav.next");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* File upload drop zone (Quote form) */
  var fileDrop = document.querySelector(".file-drop");
  var fileInput = document.querySelector("#project-files");
  var fileList = document.querySelector(".file-list");
  if (fileDrop && fileInput) {
    fileDrop.addEventListener("click", function () {
      fileInput.click();
    });
    ["dragenter", "dragover"].forEach(function (evt) {
      fileDrop.addEventListener(evt, function (e) {
        e.preventDefault();
        fileDrop.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      fileDrop.addEventListener(evt, function (e) {
        e.preventDefault();
        fileDrop.classList.remove("is-dragover");
      });
    });
    fileDrop.addEventListener("drop", function (e) {
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        renderFileList();
      }
    });
    fileInput.addEventListener("change", renderFileList);
    function renderFileList() {
      if (!fileList) return;
      var names = Array.prototype.map.call(fileInput.files, function (f) {
        return f.name;
      });
      fileList.textContent = names.length ? "Selected: " + names.join(", ") : "";
    }
  }

  /* Form submit handling (Quote + Contact) — client-side success state.
     To go live, wire the form's action to a backend such as Formspree,
     Web3Forms, or Netlify Forms; this handler shows the confirmation UI
     and can be extended to fetch() that endpoint before showing success. */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var successBox = document.querySelector(form.getAttribute("data-success"));
      form.style.display = "none";
      if (successBox) successBox.classList.add("is-visible");
      window.scrollTo({ top: form.offsetTop - 120, behavior: "smooth" });
    });
  });

  /* Set active nav link based on current page */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  /* Footer year */
  var yearEl = document.querySelector("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
