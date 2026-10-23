/* PIXELMIND v3 — Created By Shiv Yogi */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PM = window.PM;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const SIG_KEY = "pixelmind-signature";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Intro: name, then "Created By Shiv Yogi" (no skip) ---------- */
const splash = $("#splash");
$(".sp-name", splash).innerHTML = [..."PIXELMIND"].map((c, i) => `<span style="--i:${i}">${c}</span>`).join("");
setTimeout(() => { splash.classList.add("out"); setTimeout(() => splash.remove(), 900); }, 3400);

/* ---------- Sheets (pull up / pull down) ---------- */
function openSheet(id) { const s = $("#" + id); s.classList.remove("closing"); s.classList.add("open"); s.setAttribute("aria-hidden", "false"); }
function closeSheet(id) {
  const s = $("#" + id); if (!s.classList.contains("open") || s.classList.contains("closing")) return;
  s.classList.add("closing");
  setTimeout(() => { s.classList.remove("open", "closing"); s.setAttribute("aria-hidden", "true"); }, 420);
}
$$("[data-close-sheet]").forEach(b => b.addEventListener("click", () => closeSheet(b.closest(".sheet-wrap").id)));
$$(".gear-btn").forEach(b => b.addEventListener("click", () => { refreshSig(); openSheet("settingsSheet"); }));
$("#changeName").addEventListener("click", () => { closeSheet("settingsSheet"); setTimeout(() => $("#profileBtn").click(), 300); });

/* ---------- Signature ---------- */
let sigImg = null;
const pad = $("#sigPad"), pctx = pad.getContext("2d");
let inking = false, inkColor = "#171727";
const padPt = e => { const r = pad.getBoundingClientRect(); return { x: (e.clientX - r.left) * pad.width / r.width, y: (e.clientY - r.top) * pad.height / r.height }; };
pad.addEventListener("pointerdown", e => {
  inking = true; pad.setPointerCapture(e.pointerId); e.preventDefault();
  const p = padPt(e); pctx.strokeStyle = inkColor; pctx.lineWidth = 3.4; pctx.lineCap = pctx.lineJoin = "round";
  pctx.beginPath(); pctx.moveTo(p.x, p.y); pctx.lineTo(p.x + .1, p.y + .1); pctx.stroke();
});
pad.addEventListener("pointermove", e => { if (!inking) return; const p = padPt(e); pctx.lineTo(p.x, p.y); pctx.stroke(); });
["pointerup", "pointercancel"].forEach(t => pad.addEventListener(t, () => { inking = false; }));
$("#sigInk").addEventListener("input", e => { inkColor = e.target.value; });
$("#sigClear").addEventListener("click", () => pctx.clearRect(0, 0, pad.width, pad.height));
$("#sigType").addEventListener("click", async () => {
  const t = $("#sigText").value.trim(); if (!t) { PM.notify("Type your name first."); return; }
  try { await document.fonts.load('80px "Dancing Script"'); } catch (_) {}
  pctx.clearRect(0, 0, pad.width, pad.height); pctx.fillStyle = inkColor;
  let size = 96; pctx.font = `${size}px "Dancing Script", cursive`;
  while (pctx.measureText(t).width > pad.width - 40 && size > 24) { size -= 4; pctx.font = `${size}px "Dancing Script", cursive`; }
  pctx.textBaseline = "middle"; pctx.fillText(t, 20, pad.height / 2);
});
function trim(c) {
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const m = 6, w = x1 - x0 + 1 + m * 2, h = y1 - y0 + 1 + m * 2, o = document.createElement("canvas"); o.width = w; o.height = h;
  o.getContext("2d").drawImage(c, x0 - m, y0 - m, w, h, 0, 0, w, h); return o.toDataURL("image/png");
}
$("#sigSave").addEventListener("click", () => {
  const url = trim(pad); if (!url) { PM.notify("Draw or type a signature first."); return; }
  try { localStorage.setItem(SIG_KEY, url); } catch (_) { PM.notify("Could not store the signature in this browser."); return; }
  refreshSig(); PM.notify("Default signature saved");
});
$("#sigRemove").addEventListener("click", () => { localStorage.removeItem(SIG_KEY); refreshSig(); PM.notify("Default signature removed"); });
function refreshSig() {
  const s = localStorage.getItem(SIG_KEY), img = $("#sigSaved"), imgE = $("#expSigPrev");
  [img, imgE].forEach(i => { i.hidden = !s; if (s) i.src = s; });
  $("#sigNone").hidden = !!s; $("#expNone").hidden = !!s; $("#expSign").disabled = !s; $("#sigRemove").hidden = !s;
  if (!s) { sigImg = null; return; }
  const i = new Image(); i.onload = () => { sigImg = i; }; i.src = s;
}
function drawSig(ctx, cw, ch, pos, cx, cy) {
  const w = Math.min(cw * .22, 700), h = w * sigImg.height / sigImg.width, m = cw * .04; let x, y;
  if (cx != null) { x = cx - w / 2; y = cy - h / 2; }
  else { y = ch - h - m; x = pos === "left" ? m : pos === "center" ? (cw - w) / 2 : cw - w - m; }
  ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.drawImage(sigImg, x, y, w, h); ctx.restore();
}

/* sign tool: tap the canvas to place the default signature */
const activeTool = () => $(".tool-btn.active")?.dataset.tool;
PM.canvas.addEventListener("pointerdown", e => {
  if (activeTool() !== "sign") return;
  e.stopImmediatePropagation(); e.preventDefault();
  if (!sigImg) { PM.notify("Set your default signature in Settings first."); refreshSig(); openSheet("settingsSheet"); return; }
  const r = PM.canvas.getBoundingClientRect(), x = (e.clientX - r.left) * PM.canvas.width / r.width, y = (e.clientY - r.top) * PM.canvas.height / r.height;
  PM.pushHistory(); drawSig(PM.ctx, PM.canvas.width, PM.canvas.height, null, x, y); PM.scheduleSave(); PM.notify("Signature placed");
}, true);
$('.tool-btn[data-tool="sign"]').addEventListener("click", () => {
  $("#propertiesPanel").classList.add("closed");
  PM.notify(sigImg ? "Tap the canvas to place your signature" : "Set your default signature in Settings first");
});

/* export: ask about signature, then build the branded PDF */
$("#exportBtn").addEventListener("click", e => { e.stopImmediatePropagation(); refreshSig(); $("#expSign").checked = !!localStorage.getItem(SIG_KEY); openSheet("exportSheet"); }, true);
$("#expSetSig").addEventListener("click", () => { closeSheet("exportSheet"); setTimeout(() => { refreshSig(); openSheet("settingsSheet"); }, 350); });
$("#expGo").addEventListener("click", () => {
  const cur = PM.current; if (!cur) return;
  const c = PM.canvas, x = PM.ctx, keep = x.getImageData(0, 0, c.width, c.height), oldImg = cur.image;
  if ($("#expSign").checked && sigImg) drawSig(x, c.width, c.height, $("#expPos").value);
  cur.image = c.toDataURL("image/png");
  PM.exportPDF(cur);            // reads the image synchronously, so the canvas can be restored right away
  x.putImageData(keep, 0, 0); cur.image = oldImg;
  closeSheet("exportSheet");
});

/* ---------- Import image + background ---------- */
function loadFile(input, cb) {
  input.addEventListener("change", () => {
    const f = input.files[0]; input.value = ""; if (!f) return;
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => { cb(im); URL.revokeObjectURL(url); };
    im.onerror = () => { PM.notify("That file could not be opened as an image."); URL.revokeObjectURL(url); };
    im.src = url;
  });
}
$("#importBtn").addEventListener("click", () => { if (!PM.current) return; $("#importFile").click(); });
loadFile($("#importFile"), im => {
  const c = PM.canvas, s = Math.min(c.width * .9 / im.width, c.height * .9 / im.height, 1.5), w = im.width * s, h = im.height * s;
  PM.pushHistory(); PM.ctx.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h); PM.scheduleSave(); PM.notify("Image imported");
});
function paintBackground(fill) {
  const c = PM.canvas, x = PM.ctx; PM.pushHistory();
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) if (a[i + 3] > 0 && Math.abs(a[i] - 249) < 3 && Math.abs(a[i + 1] - 248) < 3 && Math.abs(a[i + 2] - 255) < 3) a[i + 3] = 0;
  x.putImageData(d, 0, 0); x.save(); x.globalCompositeOperation = "destination-over"; fill(x, c); x.restore(); PM.scheduleSave();
}
$("#applyBgColor").addEventListener("click", () => { if (!PM.current) return; const col = $("#bgColor").value; paintBackground((x, c) => { x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); }); PM.notify("Background color applied"); });
$("#bgPhotoBtn").addEventListener("click", () => { if (PM.current) $("#bgFile").click(); });
loadFile($("#bgFile"), im => {
  paintBackground((x, c) => { const s = Math.max(c.width / im.width, c.height / im.height), w = im.width * s, h = im.height * s; x.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h); });
  PM.notify("Photo set as background");
});
$$("#sizePresets button").forEach(b => b.addEventListener("click", () => {
  if (!PM.current) return;
  $("#canvasWidth").value = b.dataset.w; $("#canvasHeight").value = b.dataset.h;
  $("#canvasWidth").dispatchEvent(new Event("input")); $("#canvasHeight").dispatchEvent(new Event("input"));
  $("#applyCanvasSize").click();
}));

/* ---------- Pebble dock: drag, wobble, wave ---------- */
const dock = $("#toolDock"), wrap = $("#dockBubbleWrap"), bubble = $("#dockBubble");
const pos = { dock: null, bub: null };
const setPos = (el, p) => { const k = el === dock ? "d" : "b"; el.style.setProperty(`--${k}x`, p.x + "px"); el.style.setProperty(`--${k}y`, p.y + "px"); };
const fit = (el, p) => ({ x: clamp(p.x, 8, Math.max(8, innerWidth - el.offsetWidth - 8)), y: clamp(p.y, 56, Math.max(56, innerHeight - el.offsetHeight - 8)) });
function ripple(x, y) { if (reduce) return; const r = document.createElement("span"); r.className = "ripple"; r.style.left = x + "px"; r.style.top = y + "px"; document.body.append(r); setTimeout(() => r.remove(), 900); }

function drag(el, handle, key, deform, onTap) {
  let down = null, p = { x: 0, y: 0 }, t = { x: 0, y: 0 }, prev = { x: 0, y: 0 }, d = { sx: 1, sy: 1, vx: 0, vy: 0 }, ang = 0, raf = 0, suppress = false;
  const apply = () => { el.style.transform = `rotate(${ang}rad) scale(${d.sx},${d.sy}) rotate(${-ang}rad)`; };
  function frame() {
    p.x += (t.x - p.x) * .34; p.y += (t.y - p.y) * .34;
    const vx = p.x - prev.x, vy = p.y - prev.y, sp = Math.hypot(vx, vy);
    if (sp > .4) ang = Math.atan2(vy, vx);
    prev = { x: p.x, y: p.y };
    const stretch = clamp(sp * .02 * deform, 0, .3 * deform), tx = 1 + stretch, ty = 1 - stretch * .7;
    d.vx = (d.vx + (tx - d.sx) * .22) * .78; d.sx += d.vx; d.vy = (d.vy + (ty - d.sy) * .22) * .78; d.sy += d.vy;
    pos[key] = fit(el, p); setPos(el, pos[key]); apply();
    const settled = !down && sp < .05 && Math.abs(d.sx - 1) < .003 && Math.abs(d.sy - 1) < .003 && Math.abs(d.vx) < .002;
    if (settled) { el.style.transform = ""; raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  handle.addEventListener("pointerdown", e => {
    if (e.button > 0 || (handle.classList.contains("dock-top") && e.target.closest("button"))) return;
    const base = pos[key] || { x: 0, y: 0 };
    down = { id: e.pointerId, ox: e.clientX - base.x, oy: e.clientY - base.y, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false };
    p = { ...base }; t = { ...base }; prev = { ...base }; handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener("pointermove", e => {
    if (!down || e.pointerId !== down.id) return;
    if (!down.moved && Math.hypot(e.clientX - down.sx, e.clientY - down.sy) > 6) { down.moved = true; el.classList.add("dragging"); if (!raf) raf = requestAnimationFrame(frame); }
    if (down.moved) { t = { x: e.clientX - down.ox, y: e.clientY - down.oy }; }
  });
  const end = e => {
    if (!down || e.pointerId !== down.id) return;
    const was = down; down = null; el.classList.remove("dragging");
    if (was.moved) { suppress = true; setTimeout(() => { suppress = false; }, 60); d.vx += .06; ripple(e.clientX, e.clientY); if (!raf) raf = requestAnimationFrame(frame); }
    else if (onTap && performance.now() - was.t < 400) onTap();
  };
  handle.addEventListener("pointerup", end); handle.addEventListener("pointercancel", end);
  handle.addEventListener("click", e => { if (suppress) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
}
drag(wrap, bubble, "bub", 1, null);   // the wrapper deforms; the bubble keeps its own idle animation
drag(dock, $(".dock-top", dock), "dock", .35, null);

function bubbleDefault() { return fit(wrap, { x: 16, y: innerHeight - wrap.offsetHeight - 24 }); }
function initPositions() {
  if (!pos.bub) { pos.bub = bubbleDefault(); setPos(wrap, pos.bub); }
  else { pos.bub = fit(wrap, pos.bub); setPos(wrap, pos.bub); }
  if (pos.dock) { pos.dock = fit(dock, pos.dock); setPos(dock, pos.dock); }
}
/* pull up: dock rises out of the bubble */
bubble.addEventListener("click", () => {
  const b = pos.bub || bubbleDefault();
  const want = pos.dock || { x: b.x + wrap.offsetWidth - dock.offsetWidth, y: b.y + wrap.offsetHeight - dock.offsetHeight };
  pos.dock = fit(dock, want); setPos(dock, pos.dock);
  dock.style.setProperty("--ox", clamp(b.x + wrap.offsetWidth / 2 - pos.dock.x, 0, dock.offsetWidth) + "px");
  dock.style.setProperty("--oy", clamp(b.y + wrap.offsetHeight / 2 - pos.dock.y, 0, dock.offsetHeight) + "px");
});
/* pull down: dock drops, the bubble rolls to the nearest side like a water drop */
$("#collapseDock").addEventListener("click", () => {
  const dp = pos.dock || { x: 8, y: 80 }, bw = wrap.offsetWidth, bh = wrap.offsetHeight;
  const right = dp.x + dock.offsetWidth / 2 > innerWidth / 2;
  const end = fit(wrap, { x: right ? innerWidth - bw - 12 : 12, y: dp.y + dock.offsetHeight - bh });
  const start = { x: dp.x + dock.offsetWidth / 2 - bw / 2, y: dp.y + dock.offsetHeight - bh };
  pos.bub = end; setPos(wrap, end);
  if (reduce || !wrap.animate) return;
  const n = 28, frames = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n, e = 1 - Math.pow(1 - k, 3), amp = 30 * (1 - k), squash = .14 * Math.sin(k * 11) * (1 - k);
    frames.push({ translate: `${start.x + (end.x - start.x) * e}px ${start.y + (end.y - start.y) * e + Math.sin(k * Math.PI * 3) * amp}px`, scale: `${1 + squash} ${1 - squash}` });
  }
  wrap.animate(frames, { duration: 1100, easing: "linear" });
  setTimeout(() => ripple(end.x + bw / 2, end.y + bh / 2), 1000);
});
/* expanded mode: all tools in one view */
const expandBtn = $("#expandDock");
function setExpanded(on, persist = true) {
  dock.classList.toggle("expanded", on); expandBtn.classList.toggle("on", on); if (persist) localStorage.setItem("pixelmind-dock-expanded", on ? "1" : "0");
  requestAnimationFrame(() => { if (pos.dock) { pos.dock = fit(dock, pos.dock); setPos(dock, pos.dock); } });
}
expandBtn.addEventListener("click", () => setExpanded(!dock.classList.contains("expanded")));
/* on phones the wide grid would hide the tool settings, so picking a tool folds it back (setting is kept) */
$$(".tool-btn", dock).forEach(b => b.addEventListener("click", () => { if (innerWidth < 650 && dock.classList.contains("expanded")) setExpanded(false, false); }));
if (localStorage.getItem("pixelmind-dock-expanded") === "1") setExpanded(true);
addEventListener("resize", () => { if (!$("#studioView").classList.contains("hidden")) initPositions(); });

/* ---------- Enter animations on both screens ---------- */
["studioView", "homeView"].forEach(id => {
  const el = $("#" + id); let wasHidden = el.classList.contains("hidden");
  el.addEventListener("animationend", e => { if (e.target === el) el.classList.remove("enter"); });
  new MutationObserver(() => {
    const h = el.classList.contains("hidden");
    if (wasHidden && !h) { el.classList.add("enter"); if (id === "studioView") requestAnimationFrame(initPositions); }
    wasHidden = h;
  }).observe(el, { attributes: true, attributeFilter: ["class"] });
});
refreshSig();
})();
