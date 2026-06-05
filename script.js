(function () {
  const root = document.documentElement;
  const body = document.body;

  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme === "dark") {
    root.classList.add("dark");
  }

  document.querySelectorAll('[aria-label="Toggle theme"]').forEach((button) => {
    button.addEventListener("click", () => {
      root.classList.toggle("dark");
      window.localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    });
  });

  const mobileToggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".site-nav");

  if (mobileToggle && nav) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("nav-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        body.classList.remove("nav-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll(".accordion__button").forEach((button) => {
    button.addEventListener("click", () => {
      const accordion = button.closest(".accordion");
      if (!accordion) return;

      const isOpen = accordion.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  document.querySelectorAll('form[data-form="booking-request"]').forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const existingMessage = form.querySelector("[data-form-message]");
      if (existingMessage) {
        existingMessage.remove();
      }

      const message = document.createElement("p");
      message.className = "form-note";
      message.setAttribute("data-form-message", "true");
      message.setAttribute("role", "status");
      message.textContent = "Tack! Din förfrågan är mottagen. Vi återkommer normalt inom en arbetsdag.";

      form.appendChild(message);

      if (submitButton) {
        submitButton.textContent = "Förfrågan skickad";
        submitButton.disabled = true;

        window.setTimeout(() => {
          submitButton.textContent = "Skicka förfrågan";
          submitButton.disabled = false;
          form.reset();
        }, 3500);
      }
    });
  });
})();
