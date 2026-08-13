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

  // ---- Expandable project cards ----
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

  // ---- Journey master-detail tablist ----
  const journeyList = document.querySelector(".journey-list");
  if (journeyList) {
    const tabs = Array.from(journeyList.querySelectorAll(".journey-list-item"));
    const panels = document.querySelectorAll(".journey-detail-panel");
    const mobileQuery = window.matchMedia("(max-width: 880px)");

    const activateTab = (tab, { focusTab = false, scrollOnMobile = false } = {}) => {
      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", String(isActive));
        t.tabIndex = isActive ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === tab.dataset.journeyTarget);
      });
      if (focusTab) tab.focus();
      if (scrollOnMobile && mobileQuery.matches) {
        const panel = document.getElementById(tab.dataset.journeyTarget);
        if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activateTab(tab, { scrollOnMobile: true }));

      tab.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (i + 1) % tabs.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateTab(tab, { scrollOnMobile: true });
          return;
        }
        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(tabs[nextIndex], { focusTab: true });
        }
      });
    });
  }
});
