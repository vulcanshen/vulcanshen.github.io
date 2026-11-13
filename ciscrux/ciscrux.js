/* Ciscrux promo pages: draws Cistercian numerals the way the screen saver does.
   Geometry, layout and timing are ported from the app's sources: CistercianNumeral,
   CistercianSymbolLayer, CistercianScreenSaverView, MoonPhase, MoonPhaseLayer and
   WeekdayBadgeLayer. The app works with y pointing up; here y points down. */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const ASPECT = 2 / 3;
  const DURATIONS = { none: [0, 0], fade: [0.45, 0.45], stroke: [0.3, 0.6] }; // [retract, draw]
  const DEFAULTS = {
    showYear: true, showMonthDay: true, showSeconds: true, showHint: false,
    layout: "horizontal", animation: "stroke", lineWidthRatio: 0.05,
    background: "#000000", stroke: "#ffffff", hint: "#616161",
    symbolSizeFraction: 0.55, gapFraction: 0.35,
  };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  const r2 = n => Math.round(n * 100) / 100;

  // CAMediaTimingFunction(name: .easeInEaseOut) is cubic-bezier(0.42, 0, 0.58, 1).
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const err = sx(t) - x;
        const d = dx(t);
        if (Math.abs(err) < 1e-6 || Math.abs(d) < 1e-6) break;
        t -= err / d;
      }
      return sy(Math.min(1, Math.max(0, t)));
    };
  }
  const ease = cubicBezier(0.42, 0, 0.58, 1);

  /* ---- geometry (CistercianNumeral) ---- */

  // ones, tens, hundreds, thousands, with y pointing up as in the app
  const SIGNS = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  // Each digit is one continuous path from the stave outwards (A stave-top, B outer-top,
  // C stave-mid, D outer-mid).
  const ROUTES = { 1: "AB", 2: "CD", 3: "AD", 4: "CB", 5: "ABC", 6: "DB", 7: "ABD", 8: "CDB", 9: "ABDC" };

  function layoutIn(b) {
    let w = 0, h = 0;
    if (b.h > 0 && b.w / b.h > ASPECT) { h = b.h; w = h * ASPECT; }
    else if (b.h > 0) { w = b.w; h = w / ASPECT; }
    return { ox: b.x + b.w / 2, oy: b.y + b.h / 2, halfH: h / 2, halfW: w / 2 };
  }

  // The path of a digit and its length, which the stroke animation needs in absolute units
  // (pathLength with stroke-dasharray isn't safe to rely on in every browser).
  function digitPath(digit, L, q) {
    if (!L || !(digit >= 1 && digit <= 9)) return null;
    const [xs, ys] = SIGNS[q];
    const qH = L.halfH, qW = L.halfW, qB = qH / 3;
    const pt = (x, y) => [L.ox + x * xs, L.oy - y * ys];
    const c = { A: pt(0, qH), B: pt(qW, qH), C: pt(0, qB), D: pt(qW, qB) };
    const points = ROUTES[digit].split("").map(k => c[k]);
    let len = 0;
    for (let i = 1; i < points.length; i++) len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    return { d: points.map((p, i) => (i ? "L" : "M") + r2(p[0]) + " " + r2(p[1])).join(""), len };
  }

  const stavePath = L => `M${r2(L.ox)} ${r2(L.oy + L.halfH)}L${r2(L.ox)} ${r2(L.oy - L.halfH)}`;

  const digitsOf = v => {
    v = Math.max(0, Math.min(9999, v | 0));
    return [v % 10, ((v / 10) | 0) % 10, ((v / 100) | 0) % 10, ((v / 1000) | 0) % 10];
  };

  /* ---- moon phase and weekday (MoonPhase, MoonPhaseLayer, WeekdayBadgeLayer) ---- */

  function moonPhase(date) {
    const synodic = 29.530588853;
    const days = (date.getTime() - 947182440000) / 86400000; // new moon 2000-01-06 18:14 UTC
    let age = days % synodic;
    if (age < 0) age += synodic;
    const segment = synodic / 8;
    return Math.floor(((age + segment / 2) % synodic) / segment) + 1;
  }

  // Draws phase 1–8 into group g, in a square frame of side `edge` at (x, y).
  function drawMoon(g, phase, x, y, edge) {
    g.textContent = "";
    if (!(phase >= 1 && phase <= 8) || edge <= 0) return;
    const pad = edge * 0.06, r = (edge - 2 * pad) / 2, cx = x + edge / 2, cy = y + edge / 2;
    if (phase === 5) { el("circle", { cx: r2(cx), cy: r2(cy), r: r2(r), stroke: "none" }, g); return; }
    el("circle", { cx: r2(cx), cy: r2(cy), r: r2(r), fill: "none", "stroke-width": r2(edge * 0.06) }, g);
    if (phase === 1) return;
    const litRight = phase <= 4;
    const semi = litRight ? phase : 10 - phase;
    const h = semi === 2 ? 0.6 : semi === 3 ? 0 : -0.6;
    let d = `M${r2(cx)} ${r2(cy - r)}A${r2(r)} ${r2(r)} 0 0 ${litRight ? 1 : 0} ${r2(cx)} ${r2(cy + r)}`;
    if (h === 0) d += "Z";
    else {
      const sx = h * (litRight ? 1 : -1); // > 0 bows right
      d += `A${r2(Math.abs(sx) * r)} ${r2(r)} 0 0 ${sx > 0 ? 0 : 1} ${r2(cx)} ${r2(cy - r)}Z`;
    }
    el("path", { d, stroke: "none" }, g);
  }

  // The planet of the day for ISO weekday 1 (Monday) to 7 (Sunday), after the
  // traditional planetary days: 1 Moon ☽, 2 Mars ♂, 3 Mercury ☿, 4 Jupiter ♃, 5 Venus ♀,
  // 6 Saturn ♄, 7 Sun ☉. Unit space has y down with the square at -0.9…0.9. Pieces:
  // ["circle", x, y, r], ["line", [x, y], …], ["arc", x, y, r, fromDeg, toDeg, newSubpath]
  // (otherwise a straight line joins the arc's start), ["to", x, y] and ["close"].
  const PLANETS = (() => {
    const rad = a => a * Math.PI / 180;
    const moon = (() => { // outer arc r 0.9 with tips at ±115°; inner arc through both tips
      const R = 0.9, k = 0.3, th = 115, cosT = Math.cos(rad(th));
      const c = R * (1 - k * k) / (2 * (cosT - k));
      const a2 = Math.atan2(R * Math.sin(rad(th)), R * cosT - c) * 180 / Math.PI;
      return [["arc", 0, 0, R, -th, th, true], ["arc", c, 0, k * R - c, a2, -a2], ["close"]];
    })();
    const e = 0.55 * 0.7071;
    return {
      1: moon,
      2: [["circle", -0.35, 0.35, 0.55], ["line", [-0.35 + e, 0.35 - e], [0.9, -0.9]],
          ["line", [0.4, -0.9], [0.9, -0.9], [0.9, -0.4]]],
      3: [["circle", 0, -0.1, 0.5], ["arc", 0, -0.9, 0.3, 0, 180, true],
          ["line", [0, 0.4], [0, 0.9]], ["line", [-0.32, 0.67], [0.32, 0.67]]],
      4: [["arc", -0.4, -0.57, 0.33, 180, 390, true], ["to", -0.75, 0.35], ["to", 0.75, 0.35],
          ["line", [0.35, -0.55], [0.35, 0.9]]],
      5: [["circle", 0, -0.4, 0.5], ["line", [0, 0.1], [0, 0.9]], ["line", [-0.32, 0.55], [0.32, 0.55]]],
      6: [["line", [-0.45, -0.9], [-0.45, 0.6]], ["line", [-0.85, -0.55], [-0.05, -0.55]],
          ["arc", 0.05, 0.22, 0.5, 180, 360, true], ["to", 0.55, 0.55], ["arc", 0.3, 0.55, 0.25, 0, 150]],
      7: [["circle", 0, 0, 0.9]],
    };
  })();

  // Centre of a glyph's bounding box, curves sampled finely, like boundingBoxOfPath.
  function planetCentre(pieces) {
    const xs = [], ys = [];
    const add = (x, y) => { xs.push(x); ys.push(y); };
    for (const [kind, ...a] of pieces) {
      if (kind === "circle") { add(a[0] - a[2], a[1] - a[2]); add(a[0] + a[2], a[1] + a[2]); }
      else if (kind === "line") a.forEach(([x, y]) => add(x, y));
      else if (kind === "to") add(a[0], a[1]);
      else if (kind === "arc") {
        const [x, y, r, a0, a1] = a;
        for (let i = 0; i <= 720; i++) {
          const t = (a0 + (a1 - a0) * i / 720) * Math.PI / 180;
          add(x + r * Math.cos(t), y + r * Math.sin(t));
        }
      }
    }
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }

  // Draws the weekday's planet into group g, in a square frame of side `edge` at (x, y).
  // The Sun's circle fills the square inside a 6% pad, like the moon disc; every glyph is
  // centred on its own bounding box. Only the Sun's centre dot is filled.
  function drawPlanet(g, day, x, y, edge) {
    g.textContent = "";
    const pieces = PLANETS[day];
    if (!pieces || edge <= 0) return;
    const s = (edge - 2 * edge * 0.06) / 1.8, c = pieces.centre || (pieces.centre = planetCentre(pieces));
    const X = u => r2(x + edge / 2 + (u - c.x) * s), Y = v => r2(y + edge / 2 + (v - c.y) * s);
    const at = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
    // Arcs go in pieces of at most 90°: once the numbers are rounded, an SVG arc of 180°
    // can land its centre most of a pixel away from where it should be.
    const arc = (cx, cy, r, a0, a1) => {
      const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90)), R = r2(r * s);
      let out = "";
      for (let i = 1; i <= n; i++) {
        const [px, py] = at(cx, cy, r, a0 + (a1 - a0) * i / n);
        out += `A${R} ${R} 0 0 ${a1 > a0 ? 1 : 0} ${X(px)} ${Y(py)}`;
      }
      return out;
    };
    let d = "";
    for (const [kind, ...a] of pieces) {
      if (kind === "circle") {
        const [cx, cy, r] = a;
        d += `M${X(cx + r)} ${Y(cy)}${arc(cx, cy, r, 0, 360)}Z`;
      } else if (kind === "line") {
        d += a.map(([px, py], i) => `${i ? "L" : "M"}${X(px)} ${Y(py)}`).join("");
      } else if (kind === "to") {
        d += `L${X(a[0])} ${Y(a[1])}`;
      } else if (kind === "arc") {
        const [cx, cy, r, a0, a1, fresh] = a, [x0, y0] = at(cx, cy, r, a0);
        d += `${fresh ? "M" : "L"}${X(x0)} ${Y(y0)}${arc(cx, cy, r, a0, a1)}`;
      } else d += "Z";
    }
    el("path", { d, fill: "none", "stroke-width": r2(edge * 0.06) }, g);
    if (day === 7) el("circle", { cx: X(0), cy: Y(0), r: r2(0.17 * s), stroke: "none" }, g);
  }

  /* ---- animation: strokeEnd and opacity, like the app's CABasicAnimations ---- */

  const running = new Set();
  let frame = 0;

  function paint(p) {
    const s = p._s;
    if (s.end <= 0.0005 || s.opacity <= 0.0005) { p.style.visibility = "hidden"; return; }
    p.style.visibility = "";
    p.style.strokeDasharray = s.end >= 1 ? "" : `${r2(s.end * p._len)} ${r2(p._len * 2 + 1)}`;
    p.style.opacity = s.opacity >= 1 ? "" : String(s.opacity);
  }

  function setState(p, end, opacity) { p._s.end = end; p._s.opacity = opacity; paint(p); }

  function setPath(p, geometry) {
    if (geometry) { p.setAttribute("d", geometry.d); p._len = geometry.len; }
    else { p.removeAttribute("d"); p._len = 0; }
  }

  function cancel(p) { for (const a of running) if (a.p === p) running.delete(a); }

  function animate(p, key, from, to, seconds, done) {
    cancel(p);
    p._s[key] = from;
    paint(p);
    running.add({ p, key, from, to, ms: seconds * 1000, t0: performance.now(), done });
    if (!frame) frame = requestAnimationFrame(step);
  }

  function step(now) {
    frame = 0;
    for (const a of running) {
      const k = Math.min(1, Math.max(0, (now - a.t0) / a.ms));
      a.p._s[a.key] = a.from + (a.to - a.from) * ease(k);
      paint(a.p);
      if (k >= 1) { running.delete(a); if (a.done) a.done(); }
    }
    if (running.size) frame = requestAnimationFrame(step);
  }

  /* ---- one figure (CistercianSymbolLayer) ---- */

  class Figure {
    constructor(parent) {
      this.g = el("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
      this.stave = el("path", {}, this.g);
      this.quads = [0, 1, 2, 3].map(() => [0, 1].map(() => {
        const p = el("path", {}, this.g);
        p._s = { end: 0, opacity: 0 };
        p._len = 0;
        paint(p);
        return p;
      }));
      this.active = [0, 0, 0, 0];
      this.value = -1;
      this.hint = el("g", { class: "cx-hint" }, this.g);
      this.text = el("text", { "text-anchor": "middle", "dominant-baseline": "text-before-edge", stroke: "none" }, this.hint);
      this.moon = el("g", {}, this.hint);
      this.planet = el("g", {}, this.hint);
      this.label = { text: "", weekday: -1, moon: 0, visible: false };
    }

    show(on) { this.g.style.display = on ? "" : "none"; }

    // Colours go in style, not attributes, so CSS variables work too.
    colors(stroke, hint, quads) {
      this.g.style.stroke = stroke;
      this.hint.style.stroke = hint;
      this.hint.style.fill = hint;
      this.quads.forEach((pair, q) => pair.forEach(p => { p.style.stroke = (quads && quads[q]) || ""; }));
    }

    place(box, lineWidthRatio, labelTop = 0, fontSize = 12) {
      this.box = box;
      this.L = layoutIn(box);
      this.stave.setAttribute("d", stavePath(this.L));
      this.g.setAttribute("stroke-width", r2(Math.max(0.5, box.h * lineWidthRatio)));
      if (this.value >= 0) {
        digitsOf(this.value).forEach((digit, q) => {
          const p = this.quads[q][this.active[q]];
          setPath(p, digitPath(digit, this.L, q));
          paint(p);
        });
      }
      this.labelTop = labelTop;
      this.fontSize = fontSize;
      this.drawLabel();
    }

    setLabel(text, weekday, moon, visible) {
      this.label = { text, weekday, moon, visible };
      this.drawLabel();
    }

    drawLabel() {
      const { text, weekday, moon, visible } = this.label;
      this.hint.style.display = visible ? "" : "none";
      if (!visible || !this.box) return;
      const f = this.fontSize, lineHeight = f * 1.3, mid = this.box.x + this.box.w / 2;
      this.text.setAttribute("x", r2(mid));
      this.text.setAttribute("y", r2(this.labelTop));
      this.text.setAttribute("font-size", r2(f));
      if (this.text.textContent !== text) this.text.textContent = text;
      const w = this.text.getComputedTextLength();
      const gap = f * 0.45, glyph = f, y = this.labelTop + (lineHeight - glyph) / 2;
      drawMoon(this.moon, moon, mid - w / 2 - gap - glyph * 0.94, y, glyph);
      drawPlanet(this.planet, weekday, mid + w / 2 + gap - glyph * 0.06, y, glyph);
    }

    reset() {
      this.value = -1;
      this.quads.forEach(pair => pair.forEach(p => { cancel(p); setPath(p, null); setState(p, 0, 0); }));
      this.active = [0, 0, 0, 0];
    }

    setValue(value, style) {
      if (value === this.value) return;
      const oldDigits = this.value >= 0 ? digitsOf(this.value) : [0, 0, 0, 0];
      const newDigits = digitsOf(value);
      const effective = this.value < 0 ? "none" : style; // the first paint snaps
      const [retract, draw] = DURATIONS[effective];
      for (let q = 0; q < 4; q++) {
        if (oldDigits[q] === newDigits[q]) continue;
        this.swap(q, oldDigits[q] === 0, newDigits[q] === 0, digitPath(newDigits[q], this.L, q), effective, retract, draw);
      }
      this.value = value;
    }

    // The old digit retracts on one path while the new one is drawn on the other.
    swap(q, oldWasZero, newIsZero, geometry, style, retract, draw) {
      const i = this.active[q], active = this.quads[q][i], back = this.quads[q][1 - i];
      this.active[q] = 1 - i;
      if (style === "none") {
        cancel(active);
        setState(active, 0, 0);
        cancel(back);
        setPath(back, geometry);
        setState(back, newIsZero ? 0 : 1, newIsZero ? 0 : 1);
        return;
      }
      const key = style === "stroke" ? "end" : "opacity";
      if (!oldWasZero) {
        if (key === "opacity") active._s.end = 1;
        animate(active, key, 1, 0, retract, () => setState(active, 0, 0));
      }
      if (!newIsZero) {
        cancel(back);
        setPath(back, geometry);
        if (key === "end") setState(back, 0, 1); else setState(back, 1, 0);
        animate(back, key, 0, 1, draw);
      }
    }
  }

  /* ---- the screen saver (CistercianScreenSaverView) ---- */

  const pad2 = n => String(n).padStart(2, "0");

  function clockData(now, o) {
    const values = [], labels = [];
    const y = now.getFullYear(), mo = now.getMonth() + 1, d = now.getDate();
    const h = now.getHours(), mi = now.getMinutes(), s = now.getSeconds();
    if (o.showYear) { values.push(y); labels.push(String(y).padStart(4, "0")); }
    if (o.showMonthDay) { values.push(mo * 100 + d); labels.push(pad2(mo) + pad2(d)); }
    values.push(h * 100 + mi);
    labels.push(pad2(h) + pad2(mi));
    let moon = 0, weekday = -1;
    if (o.showSeconds) {
      weekday = now.getDay() === 0 ? 7 : now.getDay(); // ISO 8601: 1 Monday … 7 Sunday
      moon = moonPhase(now);
      values.push(moon * 1000 + weekday * 100 + s);
      labels.push(pad2(s));
    }
    return { values, labels, moon, weekday };
  }

  class Screen {
    constructor(svg, options) {
      this.svg = svg;
      this.o = Object.assign({}, DEFAULTS, options);
      this.bg = el("rect", { x: 0, y: 0, width: "100%", height: "100%" }, svg);
      this.figures = [0, 1, 2, 3].map(() => new Figure(svg));
      this.shown = "";
      this.visible = true;
      new ResizeObserver(() => this.arrange()).observe(svg);
      new IntersectionObserver(entries => {
        this.visible = entries[entries.length - 1].isIntersecting;
        if (this.visible) this.redraw();
      }).observe(svg);
      this.arrange();
      this.redraw();
      const loop = () => {
        if (this.visible && !document.hidden) this.tick();
        setTimeout(loop, 1000 - (Date.now() % 1000) + 8);
      };
      loop();
    }

    // With Reduce Motion on, figures change instantly, except in a preview whose Animation
    // the visitor picks themselves.
    get style() { return this.o.followReducedMotion !== false && reducedMotion.matches ? "none" : this.o.animation; }

    set(options) {
      Object.assign(this.o, options);
      this.arrange();
      this.redraw();
    }

    redraw() {
      this.figures.forEach(f => f.reset());
      this.shown = "";
      this.tick();
    }

    tick() {
      const data = clockData(new Date(), this.o);
      const key = data.values.join(",") + (this.o.showHint ? "h" : "");
      if (key === this.shown) return;
      this.shown = key;
      const n = data.values.length;
      this.figures.forEach((f, i) => {
        if (i >= n) return;
        const isSeconds = this.o.showSeconds && i === n - 1;
        f.setLabel(data.labels[i], isSeconds ? data.weekday : -1, isSeconds ? data.moon : 0, this.o.showHint);
        f.setValue(data.values[i], this.style);
      });
    }

    arrange() {
      const W = this.svg.clientWidth, H = this.svg.clientHeight;
      if (!W || !H) return;
      const o = this.o;
      this.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      this.bg.setAttribute("fill", o.background);
      const count = 1 + o.showYear + o.showMonthDay + o.showSeconds;
      const stacked = o.layout === "stacked" && count >= 2;
      const grid = stacked && count === 4;
      const timeOnTop = stacked && (count === 2 || count === 3);
      const cols = timeOnTop ? (count === 2 ? 1 : 3) : grid ? 2 : count;
      const rows = timeOnTop || grid ? 2 : 1;
      const fontRatio = 0.14, labelGapRatio = 0.1;
      const block = o.showHint ? fontRatio + labelGapRatio : 0;
      const gapRatio = stacked ? 0.3 : o.gapFraction;
      const symH = Math.min(
        (W * 0.9) / (cols * ASPECT + (cols - 1) * gapRatio),
        (H * (stacked ? 0.76 : 0.9)) / (rows * (1 + block) + (rows - 1) * gapRatio),
        Math.min(W, H) * o.symbolSizeFraction);
      const symW = symH * ASPECT, gap = symH * gapRatio, rowFull = symH + symH * block;
      const left = W / 2 - (cols * symW + (cols - 1) * gap) / 2;
      const top = H / 2 - (rows * rowFull + (rows - 1) * gap) / 2;
      const timeIndex = (o.showYear ? 1 : 0) + (o.showMonthDay ? 1 : 0);
      const font = symH * fontRatio, labelGap = symH * labelGapRatio, lineHeight = font * 1.3;
      this.figures.forEach((f, i) => {
        f.show(i < count);
        if (i >= count) return;
        let col = i, row = 0;
        if (timeOnTop) {
          if (i === timeIndex) { row = 0; col = count === 2 ? 0 : 1; }
          else { row = 1; col = count === 2 ? 0 : ((i < timeIndex ? i : i - 1) === 0 ? 0 : 2); }
        } else if (grid) { col = i % 2; row = (i / 2) | 0; }
        const labelAbove = o.showHint && stacked && row === 0;
        const rowTop = top + row * (rowFull + gap);
        const symTop = labelAbove ? rowTop + lineHeight + labelGap : rowTop;
        const labelTop = labelAbove ? rowTop : symTop + symH + labelGap;
        f.colors(o.stroke, o.hint);
        f.place({ x: left + col * (symW + gap), y: symTop, w: symW, h: symH }, o.lineWidthRatio, labelTop, font);
      });
    }
  }

  /* ---- static figures for legends ---- */

  const viewBoxOf = svg => svg.getAttribute("viewBox").split(/\s+/).map(Number);

  // A figure filling a small svg, kept one line width away from its edges so the round
  // caps aren't cut off (the app keeps a margin round its figures too).
  function insetBox(W, H, ratio) {
    const m = H * ratio;
    return { x: m, y: m, w: W - 2 * m, h: H - 2 * m };
  }

  function staticFigure(svg, value, { lineWidthRatio = 0.05, quads } = {}) {
    const [, , W, H] = viewBoxOf(svg);
    const f = new Figure(svg);
    f.colors("currentColor", "currentColor", quads);
    f.place(insetBox(W, H, lineWidthRatio), lineWidthRatio);
    f.setValue(value, "none");
    return f;
  }

  /* ---- page wiring ---- */

  document.querySelectorAll("svg[data-screen]").forEach(svg => {
    svg._screen = new Screen(svg, JSON.parse(svg.dataset.screen || "{}"));
  });

  document.querySelectorAll("svg[data-figure]").forEach(svg => {
    staticFigure(svg, Number(svg.dataset.figure), JSON.parse(svg.dataset.options || "{}"));
  });

  // Legend glyphs: a moon phase or a weekday's planet, the way the hint draws them.
  document.querySelectorAll("svg[data-moon]").forEach(svg => {
    const [, , W] = viewBoxOf(svg);
    drawMoon(el("g", { style: "fill: currentColor; stroke: currentColor" }, svg), Number(svg.dataset.moon), 0, 0, W);
  });
  document.querySelectorAll("svg[data-planet]").forEach(svg => {
    const [, , W] = viewBoxOf(svg);
    const g = el("g", { style: "fill: currentColor; stroke: currentColor",
      "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    drawPlanet(g, Number(svg.dataset.planet), 0, 0, W);
  });

  // How to read: type a number and watch its figure, each corner in its own colour.
  document.querySelectorAll("[data-reader]").forEach(root => {
    const svg = root.querySelector("svg");
    const input = root.querySelector("input");
    const quads = ["var(--ones)", "var(--tens)", "var(--hundreds)", "var(--thousands)"];
    const f = new Figure(svg);
    const [, , W, H] = viewBoxOf(svg);
    f.colors("currentColor", "currentColor", quads);
    f.place(insetBox(W, H, 0.05), 0.05);
    const outs = [...root.querySelectorAll("[data-place]")];
    // Full-width digits from a Chinese or Japanese keyboard count too; anything after the
    // first run of digits is ignored, so 12.5 reads as 12.
    const show = () => {
      const digits = (input.value.normalize("NFKC").match(/\d+/) || ["0"])[0];
      const v = Math.min(9999, Number(digits.slice(0, 4)));
      f.setValue(v, reducedMotion.matches ? "none" : "stroke");
      const ds = digitsOf(v);
      outs.forEach(o => { o.textContent = ds[Number(o.dataset.place)]; });
    };
    input.addEventListener("input", show);
    // This year, today and now, read when the button is pressed.
    const tryValue = kind => {
      const now = new Date();
      return kind === "year" ? String(now.getFullYear())
        : kind === "date" ? pad2(now.getMonth() + 1) + pad2(now.getDate())
        : pad2(now.getHours()) + pad2(now.getMinutes());
    };
    const buttons = [...root.querySelectorAll("[data-try]")];
    const refresh = b => (b.querySelector("b").textContent = tryValue(b.dataset.try));
    buttons.forEach(b => {
      refresh(b);
      b.addEventListener("click", () => { input.value = refresh(b); show(); });
    });
    setInterval(() => buttons.forEach(refresh), 15000);
    show();
  });

  // The seconds figure on its own, with the moon and the planet under it; today's
  // weekday and moon phase are marked in the legends.
  document.querySelectorAll("svg[data-seconds]").forEach(svg => {
    const [, , W, H] = viewBoxOf(svg);
    const m = H * 0.03, symH = (H - 2 * m) / (1 + 0.1 + 0.14 * 1.3), font = symH * 0.14;
    const box = { x: (W - symH * ASPECT) / 2, y: m, w: symH * ASPECT, h: symH };
    const f = new Figure(svg);
    f.colors("currentColor", "var(--hint-strong)", [null, null, "var(--hundreds)", "var(--thousands)"]);
    f.place(box, 0.05, m + symH * 1.1, font);
    const tick = () => {
      const now = new Date();
      const day = now.getDay() === 0 ? 7 : now.getDay(), moon = moonPhase(now), s = now.getSeconds();
      f.setLabel(pad2(s), day, moon, true);
      f.setValue(moon * 1000 + day * 100 + s, reducedMotion.matches ? "none" : "stroke");
      document.querySelectorAll("li[data-weekday]").forEach(li => li.classList.toggle("now", Number(li.dataset.weekday) === day));
      document.querySelectorAll("li[data-moon]").forEach(li => li.classList.toggle("now", Number(li.dataset.moon) === moon));
      setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };
    tick();
  });

  // The options panel next to a live preview.
  document.querySelectorAll("form[data-options]").forEach(form => {
    const screen = document.getElementById(form.dataset.options)._screen;
    const read = () => {
      const v = Object.fromEntries(new FormData(form));
      return {
        layout: v.layout, animation: v.animation,
        showHint: "showHint" in v, showYear: "showYear" in v, showMonthDay: "showMonthDay" in v, showSeconds: "showSeconds" in v,
        lineWidthRatio: Number(v.lineWidth) / 100, background: v.background, stroke: v.stroke, hint: v.hint,
      };
    };
    const out = form.querySelector("output");
    const apply = () => { const o = read(); out.textContent = Math.round(o.lineWidthRatio * 100) + "%"; screen.set(o); };
    form.addEventListener("input", apply);
    form.addEventListener("reset", () => setTimeout(apply));
    form.addEventListener("submit", e => e.preventDefault());
    apply();
  });

  // Close the language menu on a click outside it, or on Esc.
  const langs = document.querySelector(".langs");
  if (langs) {
    document.addEventListener("click", e => { if (!langs.contains(e.target)) langs.open = false; });
    document.addEventListener("keydown", e => { if (e.key === "Escape") langs.open = false; });
  }
})();
