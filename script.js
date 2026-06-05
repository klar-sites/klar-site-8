(function () {
  'use strict';

  /* =======================================================================
     THEME TOGGLE
     ======================================================================= */
  function initTheme() {
    var root = document.documentElement;
    var toggles = document.querySelectorAll('[aria-label="Toggle theme"]');

    function applyTheme(dark) {
      root.classList.toggle('dark', dark);
      toggles.forEach(function (btn) {
        var sun = btn.querySelector('.sun-icon');
        var moon = btn.querySelector('.moon-icon');
        if (sun) sun.style.display = dark ? 'none' : 'block';
        if (moon) moon.style.display = dark ? 'block' : 'none';
      });
    }

    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored === 'dark' || (!stored && prefersDark));

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isDark = !root.classList.contains('dark');
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
    });
  }

  /* =======================================================================
     MOBILE NAVIGATION
     ======================================================================= */
  function initMobileNav() {
    var toggles = document.querySelectorAll('.mobile-menu-toggle');
    var mobileNavs = document.querySelectorAll('.mobile-nav');

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        mobileNavs.forEach(function (nav) {
          nav.classList.toggle('open', !expanded);
        });

        // Swap hamburger / close icon
        var svg = btn.querySelector('svg');
        if (svg) {
          if (!expanded) {
            svg.innerHTML =
              '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
          } else {
            svg.innerHTML =
              '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>';
          }
        }
      });
    });

    // Close mobile nav when a link is tapped
    mobileNavs.forEach(function (nav) {
      nav.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('open');
          toggles.forEach(function (btn) {
            btn.setAttribute('aria-expanded', 'false');
            var svg = btn.querySelector('svg');
            if (svg) {
              svg.innerHTML =
                '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>';
            }
          });
        });
      });
    });
  }

  /* =======================================================================
     READING PROGRESS BAR
     ======================================================================= */
  function initReadingProgress() {
    var bar = document.getElementById('reading-progress');
    var article = document.getElementById('article-body');
    if (!bar || !article) return;

    function updateProgress() {
      var rect = article.getBoundingClientRect();
      var articleTop = rect.top + window.pageYOffset;
      var articleHeight = article.offsetHeight;
      var windowHeight = window.innerHeight;
      var scrolled = window.pageYOffset;

      var start = articleTop;
      var end = articleTop + articleHeight - windowHeight;

      if (scrolled <= start) {
        bar.style.width = '0%';
      } else if (scrolled >= end) {
        bar.style.width = '100%';
      } else {
        var progress = ((scrolled - start) / (end - start)) * 100;
        bar.style.width = progress + '%';
      }
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateProgress();
  }

  /* =======================================================================
     TABLE OF CONTENTS — ACTIVE LINK TRACKING
     ======================================================================= */
  function initTocTracking() {
    var tocLinks = document.querySelectorAll('.toc__link');
    if (!tocLinks.length) return;

    var headingIds = [];
    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        headingIds.push(href.slice(1));
      }
    });

    function updateActive() {
      var current = '';
      var offset = 120; // header height + some buffer

      headingIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          var top = el.getBoundingClientRect().top;
          if (top <= offset) {
            current = id;
          }
        }
      });

      tocLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === '#' + current) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateActive();
  }

  /* =======================================================================
     COPY LINK BUTTON
     ======================================================================= */
  function initCopyLink() {
    var btn = document.getElementById('copy-link-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          var originalHTML = btn.innerHTML;
          btn.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          btn.setAttribute('aria-label', 'Link copied!');
          setTimeout(function () {
            btn.innerHTML = originalHTML;
            btn.setAttribute('aria-label', 'Copy link');
          }, 2000);
        });
      }
    });
  }

  /* =======================================================================
     CONTACT FORM VALIDATION
     ======================================================================= */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = {
      name: {
        input: document.getElementById('contact-name'),
        error: document.getElementById('contact-name-error'),
        validate: function (val) {
          if (!val.trim()) return 'Please enter your name.';
          if (val.trim().length < 2) return 'Name must be at least 2 characters.';
          return '';
        }
      },
      email: {
        input: document.getElementById('contact-email'),
        error: document.getElementById('contact-email-error'),
        validate: function (val) {
          if (!val.trim()) return 'Please enter your email address.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
            return 'Please enter a valid email address.';
          return '';
        }
      },
      message: {
        input: document.getElementById('contact-message'),
        error: document.getElementById('contact-message-error'),
        validate: function (val) {
          if (!val.trim()) return 'Please enter a message.';
          if (val.trim().length < 10)
            return 'Message must be at least 10 characters.';
          return '';
        }
      }
    };

    function showError(field, message) {
      field.error.textContent = message;
      field.error.hidden = false;
      field.input.setAttribute('aria-invalid', 'true');
      field.input.setAttribute('aria-describedby', field.error.id);
    }

    function clearError(field) {
      field.error.textContent = '';
      field.error.hidden = true;
      field.input.removeAttribute('aria-invalid');
      field.input.removeAttribute('aria-describedby');
    }

    function validateField(key) {
      var field = fields[key];
      var message = field.validate(field.input.value);
      if (message) {
        showError(field, message);
        return false;
      }
      clearError(field);
      return true;
    }

    // Live validation on blur
    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener('blur', function () {
        validateField(key);
      });

      // Clear error on input
      fields[key].input.addEventListener('input', function () {
        if (fields[key].input.getAttribute('aria-invalid') === 'true') {
          validateField(key);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key)) allValid = false;
      });

      if (!allValid) {
        // Focus the first invalid field
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulate submission success
      var successAlert = document.getElementById('contact-success');
      if (successAlert) {
        successAlert.hidden = false;
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      form.reset();

      // Clear all errors after reset
      Object.keys(fields).forEach(function (key) {
        clearError(fields[key]);
      });

      // Hide success message after a few seconds
      setTimeout(function () {
        if (successAlert) successAlert.hidden = true;
      }, 6000);
    });
  }

  /* =======================================================================
     NEWSLETTER FORM (basic)
     ======================================================================= */
  function initNewsletterForms() {
    var forms = document.querySelectorAll('#newsletter-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailInput = form.querySelector('input[type="email"]');
        if (!emailInput || !emailInput.value.trim()) return;

        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.textContent;
        btn.textContent = 'Subscribed!';
        btn.disabled = true;
        emailInput.value = '';

        setTimeout(function () {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      });
    });
  }

  /* =======================================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ======================================================================= */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  }

  /* =======================================================================
     INIT EVERYTHING
     ======================================================================= */
  function init() {
    initTheme();
    initMobileNav();
    initReadingProgress();
    initTocTracking();
    initCopyLink();
    initContactForm();
    initNewsletterForms();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
