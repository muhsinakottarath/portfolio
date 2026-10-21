// Colourful cursor illustration: moving the mouse sprinkles soft blobs, rings, squiggles and
// little shapes that drift and fade; a click sends out a burst. Mouse only, and skipped for
// people who prefer reduced motion.
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "fx-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const COLORS = [
    [255, 107, 107], // coral
    [255, 183, 3],   // amber
    [6, 214, 160],   // mint
    [76, 201, 240],  // sky
    [123, 97, 255],  // violet
    [255, 122, 198], // pink
    [15, 110, 106],  // brand teal
  ];
  const TYPES = ["blob", "blob", "ring", "tri", "plus", "squiggle", "dot"];
  const MAX_PARTICLES = 240;

  const particles = [];
  let raf = 0;
  let lastTime = 0;
  let lastX = null;
  let lastY = null;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const spawn = (x, y, vx, vy, boost = 1) => {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push({
      x,
      y,
      vx: vx * 0.12 + rand(-0.5, 0.5) * boost,
      vy: vy * 0.12 + rand(-0.5, 0.5) * boost - 0.15,
      size: rand(12, 40),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.04, 0.04),
      age: 0,
      life: rand(900, 1500),
      color: pick(COLORS),
      type: pick(TYPES),
    });
  };

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const draw = (p, k) => {
    const fade = Math.pow(1 - k, 1.4);
    const s = p.size * (0.7 + 0.5 * k);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (p.type === "blob") {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, rgba(p.color, 0.5 * fade));
      g.addColorStop(1, rgba(p.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "ring") {
      ctx.strokeStyle = rgba(p.color, 0.8 * fade);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === "tri") {
      ctx.fillStyle = rgba(p.color, 0.75 * fade);
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(s * 0.45, s * 0.35);
      ctx.lineTo(-s * 0.45, s * 0.35);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === "plus") {
      ctx.strokeStyle = rgba(p.color, 0.85 * fade);
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, 0);
      ctx.lineTo(s * 0.4, 0);
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(0, s * 0.4);
      ctx.stroke();
    } else if (p.type === "squiggle") {
      ctx.strokeStyle = rgba(p.color, 0.8 * fade);
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = (t - 0.5) * s * 1.4;
        const y = Math.sin(t * Math.PI * 3) * s * 0.18;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = rgba(p.color, 0.85 * fade);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const frame = (time) => {
    const dt = Math.min(time - lastTime, 40);
    lastTime = time;
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      p.x += (p.vx * dt) / 16;
      p.y += (p.vy * dt) / 16;
      p.rot += p.spin;
      draw(p, p.age / p.life);
    }

    raf = particles.length ? requestAnimationFrame(frame) : 0;
  };

  const start = () => {
    if (!raf) {
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      const x = event.clientX;
      const y = event.clientY;
      if (lastX === null) {
        lastX = x;
        lastY = y;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      if (dist < 18) return;
      lastX = x;
      lastY = y;
      spawn(x, y, dx, dy);
      if (dist > 60) spawn(x - dx / 2, y - dy / 2, dx, dy);
      start();
    },
    { passive: true }
  );

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + rand(-0.2, 0.2);
      const speed = rand(2, 5);
      spawn(event.clientX, event.clientY, Math.cos(angle) * speed * 8, Math.sin(angle) * speed * 8, 2);
    }
    start();
  });
})();
