"use strict";

/* ============================================================
   CARD CLASH — game logic
   Scoring rule (locked with user):
     diff = actualTricks - bid
     0 <= diff <= 2  -> team scores  +bid   (made it, up to +2 tolerance)
     otherwise       -> team scores  -bid   (fell short, or overshot by 3+)
   ============================================================ */

const state = {
  teams: [],          // [{ name, color, players:[{name,score}, {name,score}] }, ...]
  numRounds: 5,
  round: 1,
  bids: [7, 7],
  cumulative: [0, 0],
  history: [],        // [{ round, bids:[a,b], actual:[a,b], points:[a,b], contributions:[[{name,score}..]] }]
};

/* ---------- tiny helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmt = (n) => (n > 0 ? "+" : "") + n;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

function showScreen(name) {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById("screen-" + name);
  el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function pop(el) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

function toast(msg, type = "info") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2800);
}

/* 3D pointer tilt for [data-tilt] elements */
function setupTilt() {
  $$("[data-tilt]").forEach((el) => {
    if (el._tilt) return;
    el._tilt = true;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(820px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateZ(6px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* ---------- the one scoring rule ---------- */
function computeTeamPoints(bid, actual) {
  const diff = actual - bid;
  if (diff >= 0 && diff <= 2) return bid;   // made the bid (0..+2 tolerance)
  return -bid;                              // fell short OR overshot by 3+
}

/* ============================================================
   SETUP
   ============================================================ */
function initSetup() {
  $("#rounds-value").textContent = state.numRounds;
  $("#rounds-minus").onclick = () => setRounds(state.numRounds - 1);
  $("#rounds-plus").onclick = () => setRounds(state.numRounds + 1);
  $$(".round-chip").forEach((c) => (c.onclick = () => setRounds(parseInt(c.dataset.rounds, 10))));
  $("#start-btn").onclick = startGame;
  $("#play-again-btn").onclick = () => showScreen("setup");
  setupTilt();
}

function setRounds(n) {
  state.numRounds = Math.max(1, Math.min(20, n));
  $("#rounds-value").textContent = state.numRounds;
  pop($("#rounds-value"));
  $$(".round-chip").forEach((c) =>
    c.classList.toggle("active", parseInt(c.dataset.rounds, 10) === state.numRounds)
  );
}

function startGame() {
  const val = (id, fallback) => ($("#" + id).value.trim() || fallback);
  state.teams = [
    {
      name: val("team1-name", "Team A"), color: "a",
      players: [{ name: val("player1-name", "Player 1"), score: 0 },
                { name: val("player2-name", "Player 2"), score: 0 }],
    },
    {
      name: val("team2-name", "Team B"), color: "b",
      players: [{ name: val("player3-name", "Player 3"), score: 0 },
                { name: val("player4-name", "Player 4"), score: 0 }],
    },
  ];
  state.round = 1;
  state.cumulative = [0, 0];
  state.history = [];
  renderBidding();
}

/* ============================================================
   BIDDING
   ============================================================ */
function renderBidding() {
  state.bids = [7, 7];
  $("#bidding-round").textContent = `Round ${state.round} of ${state.numRounds}`;

  const wrap = $("#bidding-teams");
  wrap.innerHTML = state.teams
    .map(
      (tm, i) => `
      <div class="bid-card team-${tm.color}" data-tilt>
        <div class="bid-card__glow"></div>
        <div class="bid-card__team">${escapeHtml(tm.name)}</div>
        <div class="bid-card__players">${tm.players.map((p) => escapeHtml(p.name)).join(" &amp; ")}</div>
        <div class="stepper">
          <button class="stepper__btn" data-bid-minus="${i}" aria-label="Lower bid">&minus;</button>
          <div class="stepper__value" id="bid-value-${i}">${state.bids[i]}</div>
          <button class="stepper__btn" data-bid-plus="${i}" aria-label="Raise bid">+</button>
        </div>
        <div class="bid-card__hint">Choose 5 &ndash; 13</div>
      </div>`
    )
    .join("");

  wrap.querySelectorAll("[data-bid-minus]").forEach((b) => (b.onclick = () => stepBid(+b.dataset.bidMinus, -1)));
  wrap.querySelectorAll("[data-bid-plus]").forEach((b) => (b.onclick = () => stepBid(+b.dataset.bidPlus, 1)));
  $("#confirm-bids-btn").onclick = confirmBids;

  setupTilt();
  showScreen("bidding");
}

function stepBid(i, d) {
  state.bids[i] = Math.max(5, Math.min(13, state.bids[i] + d));
  const el = $("#bid-value-" + i);
  el.textContent = state.bids[i];
  pop(el);
}

function confirmBids() {
  const [a, b] = state.bids;
  const restart = (a === 5 && b === 5) || (a === 5 && b === 6) || (a === 6 && b === 5);

  if (restart) {
    toast(`Bids too low (${a}\u2013${b}). Round restarts \u2014 re-bid!`, "warn");
    shake($("#bidding-teams"));
    return;
  }
  if (a === 6 && b === 6) {
    openSixSix();
    return;
  }
  renderScoring();
}

function openSixSix() {
  const m = $("#modal-backdrop");
  $("#modal-title").textContent = "Both teams bid 6";
  $("#modal-body").textContent = "Both teams committed to 6. Do you want to continue this round with 6\u20136?";
  const yes = $("#modal-yes"), no = $("#modal-no");
  yes.textContent = "Yes, continue";
  no.textContent = "No, re-bid";
  m.classList.add("show");
  yes.onclick = () => { m.classList.remove("show"); renderScoring(); };
  no.onclick = () => { m.classList.remove("show"); toast("Okay \u2014 re-bid your numbers.", "info"); };
}

/* ============================================================
   SCORING
   ============================================================ */
function renderScoring() {
  state.teams.forEach((tm) => tm.players.forEach((p) => (p.score = 0)));
  $("#scoring-round").textContent = `Round ${state.round} of ${state.numRounds}`;

  const wrap = $("#scoring-teams");
  wrap.innerHTML = state.teams
    .map(
      (tm, i) => `
      <div class="score-team team-${tm.color}">
        <div class="score-team__head">
          <span class="score-team__name">${escapeHtml(tm.name)}</span>
          <span class="score-team__bid">Bid <b>${state.bids[i]}</b></span>
        </div>
        <div class="score-team__players">
          ${tm.players
            .map(
              (p, j) => `
            <div class="player-card team-${tm.color}" data-tilt>
              <div class="player-card__name">${escapeHtml(p.name)}</div>
              <div class="player-card__score" id="ps-${i}-${j}">0</div>
              <div class="player-card__controls">
                <button class="round-btn minus" data-sc-minus="${i}-${j}" aria-label="Minus">&minus;</button>
                <button class="round-btn plus" data-sc-plus="${i}-${j}" aria-label="Plus">+</button>
              </div>
            </div>`
            )
            .join("")}
        </div>
        <div class="score-team__foot">
          <div class="stat"><span>Tricks won</span><b id="team-actual-${i}">0</b></div>
          <div class="stat proj"><span>Round points</span><b id="team-proj-${i}" class="neg">${fmt(computeTeamPoints(state.bids[i], 0))}</b></div>
        </div>
      </div>`
    )
    .join("");

  wrap.querySelectorAll("[data-sc-minus]").forEach((b) => {
    const [i, j] = b.dataset.scMinus.split("-").map(Number);
    b.onclick = () => stepScore(i, j, -1);
  });
  wrap.querySelectorAll("[data-sc-plus]").forEach((b) => {
    const [i, j] = b.dataset.scPlus.split("-").map(Number);
    b.onclick = () => stepScore(i, j, 1);
  });
  $("#end-round-btn").onclick = endRound;

  updateScoringTotals();
  setupTilt();
  showScreen("scoring");
}

function stepScore(i, j, d) {
  const p = state.teams[i].players[j];
  p.score = Math.max(0, Math.min(13, p.score + d));
  const el = $(`#ps-${i}-${j}`);
  el.textContent = p.score;
  pop(el);
  updateScoringTotals();
}

function updateScoringTotals() {
  let total = 0;
  state.teams.forEach((tm, i) => {
    const actual = tm.players.reduce((s, p) => s + p.score, 0);
    total += actual;
    $("#team-actual-" + i).textContent = actual;

    const pts = computeTeamPoints(state.bids[i], actual);
    const proj = $("#team-proj-" + i);
    proj.textContent = fmt(pts);
    proj.classList.toggle("pos", pts > 0);
    proj.classList.toggle("neg", pts <= 0);
  });

  const tc = $("#tricks-counter");
  tc.textContent = `Tricks in play: ${total} / 13`;
  tc.classList.toggle("warn", total !== 13);
}

/* ============================================================
   END ROUND -> SUMMARY
   ============================================================ */
function endRound() {
  const actual = state.teams.map((tm) => tm.players.reduce((s, p) => s + p.score, 0));
  const points = state.teams.map((tm, i) => computeTeamPoints(state.bids[i], actual[i]));

  state.cumulative = state.cumulative.map((c, i) => c + points[i]);
  state.history.push({
    round: state.round,
    bids: [...state.bids],
    actual,
    points,
    contributions: state.teams.map((tm) => tm.players.map((p) => ({ name: p.name, score: p.score }))),
  });

  renderSummary();
}

function renderSummary() {
  const h = state.history[state.history.length - 1];
  $("#summary-round").textContent = `Round ${h.round} of ${state.numRounds} complete`;

  const wrap = $("#summary-content");
  wrap.innerHTML = state.teams
    .map((tm, i) => {
      const made = h.points[i] > 0;
      return `
      <div class="summary-team team-${tm.color} ${made ? "made" : "missed"}" data-tilt>
        <div class="summary-team__head">
          <span class="summary-team__name">${escapeHtml(tm.name)}</span>
          <span class="badge ${made ? "badge-ok" : "badge-bad"}">${made ? "Made it" : "Missed"}</span>
        </div>
        <div class="summary-team__nums">
          <div class="numbox"><span>Bid</span><b>${h.bids[i]}</b></div>
          <div class="numbox"><span>Tricks</span><b>${h.actual[i]}</b></div>
          <div class="numbox big"><span>Round</span><b class="${h.points[i] < 0 ? "neg" : "pos"}">${fmt(h.points[i])}</b></div>
        </div>
        <div class="summary-team__contrib">
          ${h.contributions[i]
            .map((c) => `<div class="contrib"><span>${escapeHtml(c.name)}</span><b>${c.score}</b></div>`)
            .join("")}
        </div>
        <div class="summary-team__total">Total so far:<b>${fmt(state.cumulative[i])}</b></div>
      </div>`;
    })
    .join("");

  const btn = $("#next-round-btn");
  btn.textContent = state.round < state.numRounds ? `Start Round ${state.round + 1}` : "See Final Result";
  btn.onclick = nextRound;

  setupTilt();
  showScreen("summary");
}

function nextRound() {
  if (state.round < state.numRounds) {
    state.round++;
    renderBidding();
  } else {
    renderFinal();
  }
}

/* ============================================================
   FINAL
   ============================================================ */
function renderFinal() {
  const [c0, c1] = state.cumulative;
  const tie = c0 === c1;
  const winner = tie ? null : c0 > c1 ? 0 : 1;
  const heroClass = tie ? "" : "team-" + state.teams[winner].color;

  const trophy = `
    <svg class="trophy" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" fill="#ffd166"/>
      <path d="M18 5h2.5a1.5 1.5 0 0 1 0 3A3.5 3.5 0 0 1 18 8V5Zm-12 0v3a3.5 3.5 0 0 1-2.5-0A1.5 1.5 0 0 1 6 5Z" fill="#ffcf4d"/>
      <path d="M9 12h6l-.5 4h-5L9 12Z" fill="#f4b400"/>
      <rect x="8" y="18" width="8" height="2.4" rx="1" fill="#ffd166"/>
      <rect x="9.5" y="16" width="5" height="2.4" rx="1" fill="#f4b400"/>
    </svg>`;

  const cell = (h, i) =>
    `bid ${h.bids[i]} &middot; won ${h.actual[i]} &middot; <b class="${h.points[i] < 0 ? "neg" : "pos"}">${fmt(h.points[i])}</b>`;

  $("#final-content").innerHTML = `
    <div class="final-hero ${heroClass}">
      ${tie ? "" : trophy}
      <h1 class="final-title">${tie ? "It's a Tie!" : escapeHtml(state.teams[winner].name) + " Wins!"}</h1>
      <div class="final-scoreline">
        <span class="team-a">${escapeHtml(state.teams[0].name)} ${fmt(c0)}</span>
        <span class="dot">&bull;</span>
        <span class="team-b">${escapeHtml(state.teams[1].name)} ${fmt(c1)}</span>
      </div>
    </div>
    <div class="glass final-table-wrap">
      <table class="final-table">
        <thead>
          <tr>
            <th>Round</th>
            <th class="team-a">${escapeHtml(state.teams[0].name)}</th>
            <th class="team-b">${escapeHtml(state.teams[1].name)}</th>
          </tr>
        </thead>
        <tbody>
          ${state.history
            .map(
              (h) => `<tr>
                <td>${h.round}</td>
                <td class="team-a">${cell(h, 0)}</td>
                <td class="team-b">${cell(h, 1)}</td>
              </tr>`
            )
            .join("")}
          <tr class="total-row">
            <td>Total</td>
            <td class="team-a">${fmt(c0)}</td>
            <td class="team-b">${fmt(c1)}</td>
          </tr>
        </tbody>
      </table>
    </div>`;

  showScreen("final");
  if (!tie) launchConfetti();
}

/* ============================================================
   CONFETTI (no dependencies)
   ============================================================ */
function launchConfetti() {
  const canvas = $("#confetti");
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#22e0ff", "#ff3d9a", "#ffd166", "#7c5cff", "#38f9a7"];
  const parts = [];
  for (let i = 0; i < 170; i++) {
    parts.push({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.4,
      w: (6 + Math.random() * 8) * DPR,
      h: (8 + Math.random() * 10) * DPR,
      c: colors[i % colors.length],
      vy: (2 + Math.random() * 4) * DPR,
      vx: (-2 + Math.random() * 4) * DPR,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    });
  }

  let frame = 0;
  const MAX = 280;
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < MAX) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

/* ---------- go ---------- */
document.addEventListener("DOMContentLoaded", initSetup);
