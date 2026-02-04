// African Proverbs Page: Scratch Reveal
const PROVERBS = [
    { mood: "patience", proverb: "Haraka haraka haina baraka.", meaning: "Hurry, hurry has no blessing: rushing usually creates mistakes.", origin: "Kenya (Swahili)" },
    { mood: "wisdom", proverb: "Haba na haba hujaza kibaba.", meaning: "Little by little fills the measure: small steps add up over time.", origin: "Kenya (Swahili)" },
    { mood: "community", proverb: "Umuvandimwe wa kure arutwa n’umuturanyi.", meaning: "A distant brother is less valuable than a neighbor: closeness matters.", origin: "Rwanda (Kinyarwanda)" },
    { mood: "courage", proverb: "Injunga y’urulimi inesha injunga z’igihugu.", meaning: "The sharpness of the tongue defeats weapons: words can be stronger than force.", origin: "Rwanda (Kinyarwanda)" },
    { mood: "community", proverb: "Umuntu ngumuntu ngabantu.", meaning: "A person is a person through other people: your humanity is tied to others.", origin: "South Africa (isiZulu / Ubuntu)" },
  ];
  
  const els = {
    moodLabel: document.getElementById("moodLabel"),
    proverbText: document.getElementById("proverbText"),
    meaningText: document.getElementById("meaningText"),
    originText: document.getElementById("originText"),
    scratchCanvas: document.getElementById("scratchCanvas"),
    scratchHint: document.getElementById("scratchHint"),
    newBtn: document.getElementById("newProverbBtn"),
    resetBtn: document.getElementById("resetScratchBtn"),
    moodButtons: Array.from(document.querySelectorAll(".proverb-mood")),
    reflection: document.getElementById("reflection"),
    saveReflectionBtn: document.getElementById("saveReflectionBtn"),
    clearReflectionBtn: document.getElementById("clearReflectionBtn"),
    savedMsg: document.getElementById("savedMsg"),
    savedList: document.getElementById("savedList"),
    revealContent: document.getElementById("revealContent"),
  };
  
  let currentMood = "wisdom";
  let currentProverb = null;
  
  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }
  
  function moodTitle(mood) {
    return mood.charAt(0).toUpperCase() + mood.slice(1);
  }
  
  function getProverbsForMood(mood) {
    return PROVERBS.filter((p) => p.mood === mood);
  }
  
  function hideReveal() {
    els.revealContent.classList.add("is-hidden");
  }
  
  function showReveal() {
    els.revealContent.classList.remove("is-hidden");
    els.scratchCanvas.style.pointerEvents = "none";
  }
  
  
  /* -------------------------
     Proverb UI
  ------------------------- */
  function setProverb(p) {
    currentProverb = p;
  
    els.moodLabel.textContent = moodTitle(p.mood);
    els.proverbText.textContent = `“${p.proverb}”`;
    els.meaningText.textContent = p.meaning;
    els.originText.textContent = p.origin ? `Country/Language: ${p.origin}` : "";
  
    const saved = loadSaved();
    const match = saved.find((x) => x.proverb === p.proverb);
    els.reflection.value = match?.note ?? "";
  
    hideReveal();
    resetScratch();
  
    els.savedMsg.hidden = true;
  }
  
  function setMood(mood) {
    currentMood = mood;
  
    els.moodButtons.forEach((btn) => {
      const isActive = btn.dataset.mood === mood;
      btn.classList.toggle("is-active", isActive);
      btn.classList.toggle("button--secondary", !isActive);
    });
  
    const pool = getProverbsForMood(mood);
    const next = pool.length ? pickRandom(pool) : pickRandom(PROVERBS);
    setProverb(next);
  }
  
  /* -------------------------
     Scratch (Africa mask)
  ------------------------- */
  const canvas = els.scratchCanvas;
  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;
  
  const maskImg = new Image();
  maskImg.src = "../img/africa-mask.png";
  
  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d");
  
  let isScratching = false;
  let canvasReady = false;
  let lastProgressCheck = 0;
  
  const BRUSH_SIZE = 26;
  const REVEAL_THRESHOLD = 0.35;
  
  function resizeCanvasToElement() {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
  
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  
  function drawOverlay() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
  
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
  
    // overlay "paint"
    ctx.fillStyle = "rgba(30, 20, 38, 0.96)";
    ctx.fillRect(0, 0, w, h);
  }
  
  function drawMaskGuide() {
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  
    const maxW = maskCanvas.width * 0.55;
    const maxH = maskCanvas.height * 0.75;
    const ratio = Math.min(maxW / maskImg.width, maxH / maskImg.height);
  
    const w = maskImg.width * ratio;
    const h = maskImg.height * ratio;
    const x = (maskCanvas.width - w) / 2;
    const y = (maskCanvas.height - h) / 2;
  
    maskCtx.drawImage(maskImg, x, y, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.18;
    ctx.drawImage(
      maskCanvas,
      0,
      0,
      maskCanvas.width,
      maskCanvas.height,
      0,
      0,
      canvas.clientWidth,
      canvas.clientHeight,
    );
    ctx.restore();
  }
  
  function getPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
  
  function isInsideMask(x, y) {
    const rect = canvas.getBoundingClientRect();
    const dx = Math.floor((x / rect.width) * maskCanvas.width);
    const dy = Math.floor((y / rect.height) * maskCanvas.height);
  
    const pixel = maskCtx.getImageData(dx, dy, 1, 1).data;
    return pixel[3] > 10;
  }
  
  function scratchAt(x, y) {
    if (!isInsideMask(x, y)) return;
  
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  
    els.scratchHint.classList.add("is-hidden");
    maybeReveal();
  }
  
  function maybeReveal() {
    const now = Date.now();
    if (now - lastProgressCheck < 350) return;
    lastProgressCheck = now;
  
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
  
    const overlayData = ctx.getImageData(
      0,
      0,
      Math.floor(rect.width * dpr),
      Math.floor(rect.height * dpr),
    ).data;
  
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
  
    let maskPixels = 0;
    let clearedPixels = 0;
  
    for (let i = 0; i < maskData.length; i += 4) {
      const maskAlpha = maskData[i + 3];
      if (maskAlpha > 10) {
        maskPixels++;
        const overlayAlpha = overlayData[i + 3];
        if (overlayAlpha < 60) clearedPixels++;
      }
    }
  
    const pct = maskPixels === 0 ? 0 : clearedPixels / maskPixels;
    if (pct > REVEAL_THRESHOLD) showReveal();
  }
  
  function resetScratch() {
    if (!canvasReady) return;
    hideReveal();
    drawOverlay();
    drawMaskGuide();
    els.scratchHint.classList.remove("is-hidden");
    els.scratchCanvas.style.pointerEvents = "auto";
  }
  
  
  function initScratch() {
    resizeCanvasToElement();
    drawOverlay();
    drawMaskGuide();
  
    canvasReady = true;
  
    const start = (e) => {
      isScratching = true;
      const { x, y } = getPoint(e);
      scratchAt(x, y);
      e.preventDefault();
    };
  
    const move = (e) => {
      if (!isScratching) return;
      const { x, y } = getPoint(e);
      scratchAt(x, y);
      e.preventDefault();
    };
  
    const end = () => {
      isScratching = false;
    };
  
    canvas.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
  
    canvas.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
  
    window.addEventListener("resize", () => {
      resizeCanvasToElement();
      resetScratch();
    });
  }
  
  /* -------------------------
     Saved notes 
  ------------------------- */
  const STORAGE_KEY = "soni_proverb_notes_v1";
  
  function loadSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }
  
  function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  
  function renderSavedList() {
    const items = loadSaved();
    els.savedList.innerHTML = "";
  
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = "No saved notes yet.";
      els.savedList.appendChild(li);
      return;
    }
  
    items
      .slice()
      .reverse()
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = "saved-item";
  
        const title = document.createElement("p");
        title.className = "saved-item__proverb";
        title.textContent = `“${item.proverb}”`;
  
        const meta = document.createElement("p");
        meta.className = "muted";
        meta.textContent = `${moodTitle(item.mood)} • ${new Date(item.ts).toLocaleString()}`;
  
        const note = document.createElement("p");
        note.className = "saved-item__note";
        note.textContent = item.note;
  
        li.appendChild(title);
        li.appendChild(meta);
        li.appendChild(note);
  
        els.savedList.appendChild(li);
      });
  }
  
  /* -------------------------
     Events
  ------------------------- */
  els.moodButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMood(btn.dataset.mood));
  });
  
  els.newBtn.addEventListener("click", () => {
    const pool = getProverbsForMood(currentMood);
    const next = pool.length ? pickRandom(pool) : pickRandom(PROVERBS);
    setProverb(next);
  });
  
  els.resetBtn.addEventListener("click", resetScratch);
  
  els.saveReflectionBtn.addEventListener("click", () => {
    if (!currentProverb) return;
  
    const note = els.reflection.value.trim();
    if (!note) return;
  
    const items = loadSaved();
    const idx = items.findIndex((x) => x.proverb === currentProverb.proverb);
  
    const payload = {
      proverb: currentProverb.proverb,
      mood: currentProverb.mood,
      note,
      ts: Date.now(),
    };
  
    if (idx >= 0) items[idx] = payload;
    else items.push(payload);
  
    saveAll(items);
    renderSavedList();
  
    els.savedMsg.hidden = false;
    setTimeout(() => (els.savedMsg.hidden = true), 1200);
  });
  
  els.clearReflectionBtn.addEventListener("click", () => {
    els.reflection.value = "";
    els.savedMsg.hidden = true;
  });
  
  /* -------------------------
     Init
  ------------------------- */
  renderSavedList();
  setMood(currentMood);
  
  maskImg.onload = () => {
    initScratch();
    resetScratch();
  };
  
