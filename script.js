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
