/* Gengar Slot — Spicy + Cascading + Autospin Stops
   NOTE: Replace this whole file. Works with the last index.html + style.css.
*/

const el = (id) => document.getElementById(id);

const reelsEl = el("reels");
const balanceEl = el("balance");
const currencyEl = el("currency");
const betEl = el("bet");
const spinBtn = el("spin");
const resetBtn = el("reset");
const msgEl = el("message");
const payoutsEl = el("payouts");
const freeSpinsEl = el("freespins");
const bonusEl = el("bonus");
const coinsFxEl = el("coins");
const bannerEl = el("banner");

const autoBtn = el("autoplay");
const autoCountEl = el("autospins");
const autoSpeedEl = el("autospeed");
const soundBtn = el("sound");

const stopBigWinEl = el("stopBigWin");
const stopBonusEl = el("stopBonus");

// --- Safety: show JS errors on screen (super hilfreich fürs Debuggen)
window.addEventListener("error", (e) => {
  const text = `JS-Error: ${e.message}`;
  if (msgEl) msgEl.textContent = text;
  console.error(e.error || e.message);
});

// --- Economy ---
const START_COINS = 1200;

const FX = {
  EUR: { symbol: "€", rate: 1.0 },
  USD: { symbol: "$", rate: 1.08 },
  JPY: { symbol: "¥", rate: 160.0 }
};

// --- Original SVGs (kein offizielles Pokémon-Artwork) ---
function svgGhost() {
  return `
  <svg width="54" height="54" viewBox="0 0 64 64" aria-label="Ghost">
    <defs>
      <linearGradient id="g1a" x1="0" x2="1">
        <stop offset="0" stop-color="#b06cff"/>
        <stop offset="1" stop-color="#ff5bd6"/>
      </linearGradient>
    </defs>
    <path d="M14 40c0-15 9-26 18-26s18 11 18 26c0 7-2 12-6 16-2 2-3 4-4 6-2-2-4-4-8-4s-6 2-8 4c-1-2-2-4-4-6-4-4-6-9-6-16z"
      fill="url(#g1a)" opacity="0.96"/>
    <path d="M22 30c3-5 8-8 10-8s7 3 10 8" stroke="rgba(255,255,255,0.35)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="26" cy="36" r="3.2" fill="rgba(0,0,0,0.55)"/>
    <circle cx="38" cy="36" r="3.2" fill="rgba(0,0,0,0.55)"/>
    <path d="M26 44c3 2 9 2 12 0" stroke="rgba(0,0,0,0.45)" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}
function svgGem() {
  return `
  <svg width="54" height="54" viewBox="0 0 64 64" aria-label="Gem">
    <defs>
      <linearGradient id="g2a" x1="0" x2="1">
        <stop offset="0" stop-color="#41ffb2"/>
        <stop offset="1" stop-color="#b06cff"/>
      </linearGradient>
    </defs>
    <path d="M20 14h24l8 12-20 28L12 26l8-12z" fill="url(#g2a)" opacity="0.95"/>
    <path d="M20 14l12 40 12-40" stroke="rgba(255,255,255,0.25)" stroke-width="3" fill="none"/>
    <path d="M12 26h40" stroke="rgba(0,0,0,0.15)" stroke-width="3" />
  </svg>`;
}
function svgBat() {
  return `
  <svg width="54" height="54" viewBox="0 0 64 64" aria-label="Bat">
    <path d="M10 34c6 0 10-7 10-7s4 7 12 7 12-7 12-7 4 7 10 7c-2 10-10 18-22 18S12 44 10 34z"
      fill="rgba(255,91,214,0.85)"/>
    <circle cx="26" cy="38" r="2.3" fill="rgba(0,0,0,0.55)"/>
    <circle cx="38" cy="38" r="2.3" fill="rgba(0,0,0,0.55)"/>
  </svg>`;
}
function svgOrb() {
  return `
  <svg width="54" height="54" viewBox="0 0 64 64" aria-label="Orb">
    <defs>
      <radialGradient id="g3a" cx="35%" cy="35%" r="60%">
        <stop offset="0" stop-color="rgba(255,255,255,0.7)"/>
        <stop offset="0.35" stop-color="rgba(176,108,255,0.9)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0.2)"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="20" fill="url(#g3a)"/>
    <path d="M22 24c6-7 16-7 20 0" stroke="rgba(255,255,255,0.35)" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// --- Symbols ---
const SYMBOLS = [
  { key: "SCATTER", label: "Ghost (Scatter)", html: svgGhost(), weight: 10, pay: {3: 2, 4: 5, 5: 12} },
  { key: "BONUS",   label: "Gem (Bonus)",     html: svgGem(),   weight: 7,  pay: {3: 0, 4: 0, 5: 0} },
  { key: "WILD",    label: "Orb (Wild)",      html: svgOrb(),   weight: 8,  pay: {3: 4, 4: 10, 5: 30} },
  { key: "BAT",     label: "Bat",             html: svgBat(),   weight: 18, pay: {3: 2, 4: 6, 5: 16} },
  { key: "STAR",    label: "Star",            html: "⭐",        weight: 22, pay: {3: 2, 4: 5, 5: 12} },
  { key: "BERRY",   label: "Berry",           html: "🍇",        weight: 26, pay: {3: 1, 4: 3, 5: 8}  },
  { key: "COIN",    label: "Coin",            html: "🪙",        weight: 30, pay: {3: 1, 4: 2, 5: 6}  }
];

const PAYLINES = [
  { name: "Top", idx: 0 },
  { name: "Mid", idx: 1 },
  { name: "Bottom", idx: 2 }
];

// --- State ---
let coins = START_COINS;
let spinning = false;
let freeSpins = 0;

let bonusMode = false;
let bonusSpinsLeft = 0;
let bonusMultiplier = 1;
let stickyWildMask = [false, false, false, false, false];

let autoOn = false;
let autoLeft = 0;
let autoTimer = null;

let soundOn = true;
let audioCtx = null;

// --- Helpers ---
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function formatBalance(c, curr) {
  const { symbol, rate } = FX[curr];
  const digits = curr === "JPY" ? 0 : 2;
  return `${(c * rate).toFixed(digits)} ${symbol} (Coins: ${c})`;
}

function setMessage(text, mood = "neutral") {
  msgEl.textContent = text;
  msgEl.style.color = mood === "win" ? "var(--good)" : mood === "lose" ? "var(--bad)" : "var(--text)";
}

function showBanner(text) {
  bannerEl.textContent = text;
  bannerEl.classList.remove("show");
  void bannerEl.offsetWidth;
  bannerEl.classList.add("show");
}

function updateHud() {
  balanceEl.textContent = formatBalance(coins, currencyEl.value);
  freeSpinsEl.textContent = String(freeSpins);
  bonusEl.textContent = bonusMode ? `${bonusSpinsLeft} Spins • x${bonusMultiplier}` : "—";
}

function getCells() {
  const reels = [...reelsEl.querySelectorAll(".reel")];
  return reels.map(r => [...r.querySelectorAll(".cell")]); // [reel][row]
}

function setCell(cell, sym, animate = false) {
  cell.innerHTML = sym?.html ?? "";
  if (typeof sym?.html === "string" && sym.html.length <= 3) cell.style.fontSize = "44px";
  else cell.style.fontSize = "42px";
  if (animate) {
    cell.classList.remove("pop");
    void cell.offsetWidth;
    cell.classList.add("pop");
  }
}

function clearHighlights() {
  reelsEl.querySelectorAll(".cell").forEach(c => c.classList.remove("winGlow", "lineGlow", "superWin", "explode"));
  reelsEl.classList.remove("bigWinScreen");
}

function spawnCoinBurst(count = 16) {
  coinsFxEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "coin";
    d.textContent = "🪙";
    d.style.left = `${20 + Math.random() * 60}%`;
    d.style.top = `${55 + Math.random() * 30}%`;
    d.style.setProperty("--dx", `${(Math.random() * 180 - 90).toFixed(0)}px`);
    coinsFxEl.appendChild(d);
  }
  setTimeout(() => (coinsFxEl.innerHTML = ""), 950);
}

// --- Weighted pick
function weightedPick(items, { bonus } = { bonus: false }) {
  let pool = items.map(s => ({ ...s }));
  if (bonus) {
    pool = pool.map(s => {
      let w = s.weight;
      if (s.key === "WILD") w *= 1.45;
      if (s.key === "BAT") w *= 1.20;
      if (s.key === "STAR") w *= 1.10;
      if (s.key === "COIN") w *= 0.75;
      return { ...s, weight: w };
    });
  }
  const total = pool.reduce((sum, it) => sum + it.weight, 0);
  let r = Math.random() * total;
  for (const it of pool) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return pool[pool.length - 1];
}

function randomSymbol() {
  return weightedPick(SYMBOLS, { bonus: bonusMode });
}

// --- Sound (WebAudio)
function ensureAudio() {
  if (!soundOn) return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function beep({ freq = 440, duration = 0.10, type = "sine", gain = 0.06 } = {}) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  o.connect(g); g.connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + duration + 0.02);
}
function spinClickSound() { beep({ freq: 330, duration: 0.05, type: "square", gain: 0.025 }); }
function loseSound() { beep({ freq: 196, duration: 0.12, type: "sawtooth", gain: 0.035 }); }
function winSound(level = "small") {
  if (level === "big") {
    beep({ freq: 523, duration: 0.12, type: "triangle", gain: 0.07 });
    setTimeout(() => beep({ freq: 659, duration: 0.12, type: "triangle", gain: 0.07 }), 110);
    setTimeout(() => beep({ freq: 784, duration: 0.14, type: "triangle", gain: 0.08 }), 220);
    setTimeout(() => beep({ freq: 988, duration: 0.16, type: "triangle", gain: 0.08 }), 360);
  } else {
    beep({ freq: 784, duration: 0.11, type: "sine", gain: 0.06 });
    setTimeout(() => beep({ freq: 988, duration: 0.12, type: "sine", gain: 0.05 }), 120);
  }
}

// --- Payouts UI
function renderPayouts() {
  payoutsEl.innerHTML = "";
  for (const s of SYMBOLS) {
    const li = document.createElement("li");
    if (s.key === "BONUS") li.textContent = `💎 Bonus: 3× irgendwo → Bonusmode`;
    else if (s.key === "SCATTER") li.textContent = `👻 Scatter: 3/4/5 → 5/8/12 Freispiele + ScatterWin`;
    else li.textContent = `${s.label}: 3/4/5 → Einsatz × ${s.pay[3]}/${s.pay[4]}/${s.pay[5]}`;
    payoutsEl.appendChild(li);
  }
}

// --- Grid helpers
function makeGrid() {
  const grid = Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => null));
  for (let r = 0; r < 5; r++) {
    for (let row = 0; row < 3; row++) {
      if (bonusMode && row === 1 && stickyWildMask[r]) {
        grid[r][row] = SYMBOLS.find(s => s.key === "WILD");
      } else {
        grid[r][row] = randomSymbol();
      }
    }
  }
  return grid;
}

function applyGrid(grid, cells, animate = true) {
  for (let r = 0; r < 5; r++) {
    for (let row = 0; row < 3; row++) {
      setCell(cells[r][row], grid[r][row], animate);
    }
  }
}

function randomizeAllVisible(cells) {
  for (let r = 0; r < 5; r++) for (let row = 0; row < 3; row++) {
    if (bonusMode && row === 1 && stickyWildMask[r]) continue;
    setCell(cells[r][row], randomSymbol(), false);
  }
}

function countSymbols(grid, key) {
  let c = 0;
  for (const reel of grid) for (const s of reel) if (s?.key === key) c++;
  return c;
}

// line evaluation: left→right consecutive, wild substitutes, scatter/bonus break
function evalLine(lineSyms) {
  const isSpecial = (k) => k === "SCATTER" || k === "BONUS";
  let base = null;
  for (const s of lineSyms) {
    if (!s) break;
    if (s.key === "WILD") continue;
    if (isSpecial(s.key)) continue;
    base = s;
    break;
  }
  if (!base) return { count: 0, symbol: null };
  let count = 0;
  for (const s of lineSyms) {
    if (!s) break;
    if (isSpecial(s.key)) break;
    if (s.key === base.key || s.key === "WILD") count++;
    else break;
  }
  return { count, symbol: base };
}

// --- Triggers (only once per spin, before cascades)
function applyTriggers(grid) {
  let bonusTriggered = false;
  const scatters = countSymbols(grid, "SCATTER");
  if (scatters >= 3) {
    const add = scatters === 3 ? 5 : scatters === 4 ? 8 : 12;
    freeSpins += add;
    showBanner(`👻 ${scatters} Scatter → +${add} Freispiele!`);
  }

  const bonuses = countSymbols(grid, "BONUS");
  if (bonuses >= 3) {
    bonusTriggered = true;
    bonusMode = true;
    bonusSpinsLeft += 6;
    bonusMultiplier = Math.min(8, bonusMultiplier + 1);
    showBanner(`💎 BONUS! +6 Bonus-Spins • x${bonusMultiplier}`);
  }

  return { bonusTriggered, scatters, bonuses };
}

function maybeUpdateStickyWilds(grid) {
  if (!bonusMode) return;
  for (let r = 0; r < 5; r++) {
    const mid = grid[r][1];
    if (mid?.key === "WILD" && Math.random() < 0.30) stickyWildMask[r] = true;
    if (stickyWildMask[r] && Math.random() < 0.15) stickyWildMask[r] = false;
  }
}

// --- Win calc + cascading positions (ONLY line wins cascade)
function evaluateLineWins(grid, bet) {
  const winPositions = new Set(); // "r,row"
  let win = 0;

  for (const line of PAYLINES) {
    const row = line.idx;
    const lineSyms = [grid[0][row], grid[1][row], grid[2][row], grid[3][row], grid[4][row]];
    const { count, symbol } = evalLine(lineSyms);
    if (count >= 3 && symbol) {
      const mult = symbol.pay[count] ?? 0;
      win += bet * mult * (bonusMode ? bonusMultiplier : 1);
      for (let r = 0; r < count; r++) winPositions.add(`${r},${row}`);
    }
  }

  return { win, winPositions };
}

function scatterWinAmount(grid, bet) {
  const scatters = countSymbols(grid, "SCATTER");
  if (scatters < 3) return 0;
  const scatter = SYMBOLS.find(s => s.key === "SCATTER");
  const mult = scatter.pay[scatters] ?? 0;
  return bet * mult * (bonusMode ? bonusMultiplier : 1);
}

// --- Cascading: remove win positions, drop down, refill
function cascade(grid, winPositions) {
  // remove
  for (const key of winPositions) {
    const [r, row] = key.split(",").map(Number);
    grid[r][row] = null;
  }

  // drop each reel
  for (let r = 0; r < 5; r++) {
    const col = grid[r]; // [top,mid,bot]
    const kept = col.filter(x => x !== null); // keep order top->bot
    // We want gravity to bottom, so fill from bottom
    const newCol = [null, null, null];
    let write = 2;
    for (let i = kept.length - 1; i >= 0; i--) {
      newCol[write--] = kept[i];
    }
    while (write >= 0) {
      // new symbol from top
      newCol[write--] = randomSymbol();
    }
    grid[r] = newCol;
  }

  return grid;
}

// --- Autospin
function updateAutoBtn() {
  autoBtn.textContent = autoOn ? `AUTO: AN (${autoLeft === 999 ? "∞" : autoLeft})` : "AUTO: AUS";
}
function stopAuto(reason = "") {
  autoOn = false;
  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = null;
  updateAutoBtn();
  if (reason) showBanner(reason);
}
async function autoLoop() {
  if (!autoOn) return;

  if (spinning) {
    autoTimer = setTimeout(autoLoop, 120);
    return;
  }

  const cost = costForSpin();
  if (cost > 0 && coins < cost) {
    stopAuto("Auto gestoppt: zu wenig Coins 💀");
    setMessage("Auto gestoppt: zu wenig Coins 💀", "lose");
    return;
  }

  if (autoLeft !== 999 && autoLeft <= 0) {
    stopAuto("Auto fertig ✅");
    return;
  }

  await spin();

  if (autoLeft !== 999) autoLeft--;
  updateAutoBtn();

  const delay = Number(autoSpeedEl?.value ?? 450);
  autoTimer = setTimeout(autoLoop, delay);
}

// --- Spin cost
function costForSpin() {
  if (bonusMode && bonusSpinsLeft > 0) return 0;
  if (freeSpins > 0) return 0;
  return Number(betEl.value);
}

// --- MAIN SPIN (with cascading)
async function spin() {
  if (spinning) return;
  spinning = true;

  ensureAudio();
  spinClickSound();
  clearHighlights();

  const bet = Number(betEl.value);
  const cost = costForSpin();

  if (cost > 0 && coins < cost) {
    setMessage("Zu wenig Coins 😭 Reset oder kleiner Einsatz.", "lose");
    spinning = false;
    return;
  }

  // pay / consume spin type
  let spinType = "PAID";
  if (bonusMode && bonusSpinsLeft > 0) {
    bonusSpinsLeft--;
    spinType = "BONUS";
  } else if (freeSpins > 0) {
    freeSpins--;
    spinType = "FREE";
  } else {
    coins -= cost;
  }

  updateHud();
  setMessage(spinType === "PAID" ? "Spin… 😈" : spinType === "FREE" ? "Freispiel! 🌀" : "BONUS Spin! 💎");

  // roll animation
  reelsEl.classList.add("spinShake");
  spinBtn.disabled = true;

  const cells = getCells();
  const rollMs = 650;
  const t0 = performance.now();
  const roll = () => {
    randomizeAllVisible(cells);
    if (performance.now() - t0 < rollMs) requestAnimationFrame(roll);
  };
  requestAnimationFrame(roll);

  await sleep(rollMs);
  reelsEl.classList.remove("spinShake");

  // final grid
  let grid = makeGrid();
  applyGrid(grid, cells, true);

  // triggers (once)
  const { bonusTriggered } = applyTriggers(grid);

  // stop auto on bonus trigger (if checked)
  if (bonusTriggered && autoOn && stopBonusEl?.checked) {
    stopAuto("Auto stop: Bonus getriggert 💎✋");
  }

  // total win accumulator (including cascades)
  let totalWin = 0;

  // scatter payout is once per spin (not per cascade)
  const scatterWin = scatterWinAmount(grid, bet);
  if (scatterWin > 0) totalWin += scatterWin;

  // Cascading loop: only LINE wins cause cascade
  const MAX_CASCADES = 10;
  let cascadeCount = 0;

  while (cascadeCount < MAX_CASCADES) {
    clearHighlights();

    const { win, winPositions } = evaluateLineWins(grid, bet);

    if (win <= 0 || winPositions.size === 0) break;

    totalWin += win;

    // highlight & explode
    for (const key of winPositions) {
      const [r, row] = key.split(",").map(Number);
      cells[r][row].classList.add("winGlow", "superWin", "explode");
    }

    await sleep(240);

    // cascade & redraw
    grid = cascade(grid, winPositions);
    applyGrid(grid, cells, true);

    cascadeCount++;
    await sleep(180);
  }

  // Apply win result
  if (totalWin > 0) {
    coins += totalWin;

    const bigWin = totalWin >= bet * 25;
    if (bigWin) reelsEl.classList.add("bigWinScreen");

    spawnCoinBurst(Math.min(30, 12 + Math.floor(totalWin / 50)));
    setMessage(`WIN 🥳 +${totalWin} Coins`, "win");
    showBanner(`+${totalWin} Coins 🔥`);
    winSound(bigWin ? "big" : "small");

    updateHud();

    // stop auto on big win (if checked)
    if (bigWin && autoOn && stopBigWinEl?.checked) {
      stopAuto("Auto stop: Big Win 💥✋");
    }
  } else {
    setMessage("Nada 🙃 Noch ein Spin?", "lose");
    loseSound();
  }

  // sticky wild updates in bonus
  maybeUpdateStickyWilds(grid);

  // end bonus
  if (bonusMode && bonusSpinsLeft <= 0) {
    bonusMode = false;
    bonusMultiplier = 1;
    stickyWildMask = [false, false, false, false, false];
    showBanner("Bonus vorbei. Back to normal 😌");
    updateHud();
  }

  spinBtn.disabled = false;
  spinning = false;
}

// --- Reset
function resetGame() {
  spinning = false;
  coins = START_COINS;
  freeSpins = 0;
  bonusMode = false;
  bonusSpinsLeft = 0;
  bonusMultiplier = 1;
  stickyWildMask = [false, false, false, false, false];

  stopAuto();
  clearHighlights();
  setMessage("Reset. Wieder ready 😈");
  showBanner("Reset ✅");
  updateHud();

  // show random starting symbols
  const cells = getCells();
  for (let r = 0; r < 5; r++) for (let row = 0; row < 3; row++) setCell(cells[r][row], randomSymbol(), true);
}

// --- Init
renderPayouts();
updateHud();
resetGame();

// events
spinBtn.addEventListener("click", () => spin());
resetBtn.addEventListener("click", resetGame);
currencyEl.addEventListener("change", updateHud);

autoBtn?.addEventListener("click", () => {
  ensureAudio();
  if (!autoOn) {
    autoOn = true;
    autoLeft = Number(autoCountEl.value);
    updateAutoBtn();
    showBanner("Autospin gestartet 🌀");
    autoLoop();
  } else {
    stopAuto("Autospin gestoppt ✋");
  }
});

soundBtn?.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "SOUND: AN" : "SOUND: AUS";
  if (soundOn) ensureAudio();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    spin();
  }
});
