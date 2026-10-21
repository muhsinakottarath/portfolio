document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));

  // ---- Day / night toggle (the page starts white; the choice is remembered) ----
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const root = document.documentElement;
    const applyTheme = (theme) => {
      if (theme === "dark") root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to day mode" : "Switch to night mode"
      );
    };
    applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        // Private mode or blocked storage: the toggle still works for this visit.
      }
    });
  }

  // ---- Certificate viewer (certifications page) ----
  const viewer = document.getElementById("cert-viewer");
  if (viewer && typeof viewer.showModal === "function") {
    const rows = Array.from(document.querySelectorAll("a[data-cert]"));
    const img = document.getElementById("cert-viewer-img");
    const titleEl = document.getElementById("cert-viewer-title");
    const metaEl = document.getElementById("cert-viewer-meta");
    const countEl = document.getElementById("cert-viewer-count");
    const pdfEl = document.getElementById("cert-viewer-pdf");
    let current = 0;

    const show = (index) => {
      current = (index + rows.length) % rows.length;
      const row = rows[current];
      img.src = row.getAttribute("href");
      img.alt = "Certificate: " + row.dataset.title;
      titleEl.textContent = row.dataset.title;
      metaEl.textContent = row.dataset.meta;
      countEl.textContent = current + 1 + " of " + rows.length;
      if (row.dataset.pdf) {
        pdfEl.href = row.dataset.pdf;
        pdfEl.hidden = false;
      } else {
        pdfEl.hidden = true;
      }
    };

    rows.forEach((row, i) => {
      row.addEventListener("click", (event) => {
        event.preventDefault();
        show(i);
        viewer.showModal();
      });
    });

    viewer.querySelector("[data-cert-prev]").addEventListener("click", () => show(current - 1));
    viewer.querySelector("[data-cert-next]").addEventListener("click", () => show(current + 1));
    viewer.querySelector("[data-cert-close]").addEventListener("click", () => viewer.close());

    // Click on the dark backdrop closes it; arrow keys move between certificates.
    viewer.addEventListener("click", (event) => {
      if (event.target === viewer) viewer.close();
    });
    viewer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
  }

  // ---- Highlight the nav link for the section in view ----
  const spyLinks = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    spyLinks.set(link.getAttribute("href").slice(1), link);
  });
  if (spyLinks.size) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((link) => link.classList.remove("is-active"));
          const active = spyLinks.get(entry.target.id);
          if (active) active.classList.add("is-active");
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    spyLinks.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // ---- Expandable timeline / project cards ----
  const toggles = document.querySelectorAll("[data-expand-toggle]");

  const setExpanded = (toggle, panel, expand) => {
    toggle.setAttribute("aria-expanded", String(expand));
    toggle.classList.toggle("is-expanded", expand);
    panel.classList.toggle("is-expanded", expand);
    panel.style.maxHeight = expand ? panel.scrollHeight + "px" : null;
  };

  toggles.forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!panel) return;

    toggle.addEventListener("click", () => {
      setExpanded(toggle, panel, toggle.getAttribute("aria-expanded") !== "true");
    });

    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        setExpanded(toggle, panel, toggle.getAttribute("aria-expanded") !== "true");
      }
    });
  });

  // Recalculate open panels' heights on resize so wrapping text doesn't clip
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('[data-expand-toggle][aria-expanded="true"]').forEach((toggle) => {
        const panel = document.getElementById(toggle.getAttribute("aria-controls"));
        if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
      });
    }, 150);
  });
});
