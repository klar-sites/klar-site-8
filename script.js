(function () {
  "use strict";

  var root = document.documentElement;
  var storageKey = "minimal-blog-theme";

  function preferredTheme() {
    var stored = localStorage.getItem(storageKey);
    if (stored === "dark" || stored === "light") return stored;

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  }

  function applyTheme(theme) {
    root.classList.toggle("dark", theme === "dark");
    document.querySelectorAll('[aria-label="Toggle theme"]').forEach(function (button) {
      button.textContent = theme === "dark" ? "☀" : "☾";
      button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }

  applyTheme(preferredTheme());

  document.querySelectorAll('[aria-label="Toggle theme"]').forEach(function (button) {
    button.addEventListener("click", function () {
      var nextTheme = root.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  });

  var menuToggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-primary-nav]");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
      }
    });
  }

  var progressBar = document.querySelector("[data-reading-progress]");

  function updateReadingProgress() {
    if (!progressBar) return;

    var article = document.querySelector("[data-article]");
    var target = article || document.documentElement;
    var rect = target.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var total = Math.max(target.scrollHeight - viewportHeight, 1);
    var scrolled;

    if (article) {
      scrolled = Math.min(Math.max(-rect.top, 0), total);
    } else {
      scrolled = window.scrollY || document.documentElement.scrollTop;
      total = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    }

    var progress = Math.min(Math.max((scrolled / total) * 100, 0), 100);
    progressBar.style.width = progress + "%";
  }

  if (progressBar) {
    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
  }

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll("[data-toc-link]"));
  var headings = tocLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return null;
      return document.querySelector(id);
    })
    .filter(Boolean);

  if (tocLinks.length && headings.length && "IntersectionObserver" in window) {
    var activeId = "";

    function setActive(id) {
      if (activeId === id) return;
      activeId = id;

      tocLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0.01
      }
    );

    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  document.querySelectorAll("[data-share]").forEach(function (button) {
    button.addEventListener("click", function () {
      var platform = button.getAttribute("data-share");
      var title = document.title;
      var url = window.location.href;
      var shareUrl = "";

      if (platform === "native" && navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
        return;
      }

      if (platform === "x") {
        shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url);
      }

      if (platform === "linkedin") {
        shareUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url);
      }

      if (platform === "copy") {
        navigator.clipboard
          .writeText(url)
          .then(function () {
            var original = button.textContent;
            button.textContent = "Copied";
            setTimeout(function () {
              button.textContent = original;
            }, 1800);
          })
          .catch(function () {
            window.prompt("Copy this link:", url);
          });
        return;
      }

      if (shareUrl) {
        window.open(shareUrl, "share", "width=720,height=520,noopener,noreferrer");
      }
    });
  });

  var contactForm = document.querySelector("[data-contact-form]");

  function setFieldError(field, message) {
    var wrapper = field.closest(".field");
    var error = wrapper ? wrapper.querySelector(".field-error") : null;

    field.setAttribute("aria-invalid", message ? "true" : "false");

    if (error) {
      error.textContent = message || "";
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (contactForm) {
    var status = contactForm.querySelector("[data-form-status]");

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = contactForm.querySelector('[name="name"]');
      var email = contactForm.querySelector('[name="email"]');
      var subject = contactForm.querySelector('[name="subject"]');
      var message = contactForm.querySelector('[name="message"]');
      var firstInvalid = null;
      var isValid = true;

      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      [
        { field: name, test: function (value) { return value.trim().length >= 2; }, error: "Please enter your name." },
        { field: email, test: function (value) { return validateEmail(value.trim()); }, error: "Please enter a valid email address." },
        { field: subject, test: function (value) { return value.trim().length >= 3; }, error: "Please add a short subject." },
        { field: message, test: function (value) { return value.trim().length >= 20; }, error: "Please write at least 20 characters." }
      ].forEach(function (rule) {
        if (!rule.field) return;

        var passes = rule.test(rule.field.value);
        setFieldError(rule.field, passes ? "" : rule.error);

        if (!passes) {
          isValid = false;
          if (!firstInvalid) firstInvalid = rule.field;
        }
      });

      if (!isValid) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
          status.classList.add("is-error");
        }

        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (status) {
        status.textContent = "Thanks — your message is ready to send. In production, connect this form to your preferred endpoint.";
        status.classList.add("is-success");
      }

      contactForm.reset();

      contactForm.querySelectorAll(".input, .textarea").forEach(function (field) {
        field.setAttribute("aria-invalid", "false");
      });
    });

    contactForm.querySelectorAll(".input, .textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        setFieldError(field, "");
        if (status) {
          status.textContent = "";
          status.className = "form-status";
        }
      });
    });
  }
})();
