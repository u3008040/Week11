/* Week 11 figures.
   Every chart here is drawn from FIG, which mkfig.py produced by running the
   same kp.py the notebooks use. Nothing is typed in by hand. The two drawings
   that are drawings and not data say so on their own face.
   Everything is SVG with CSS-variable colours, so it is sharp at any zoom and
   correct in both the light and the dark theme. */

const FG = {
  /* a small axis helper: returns scale functions and the frame markup */
  frame(W, H, pad, xr, yr, opt) {
    opt = opt || {};
    const L = pad.l, R = W - pad.r, T = pad.t, B = H - pad.b;
    const sx = v => L + (R - L) * (v - xr[0]) / (xr[1] - xr[0] || 1);
    const sy = v => B - (B - T) * (v - yr[0]) / (yr[1] - yr[0] || 1);
    let g = "";
    (opt.yticks || []).forEach(v => {
      g += `<line class="gr" x1="${L}" y1="${sy(v).toFixed(1)}" x2="${R}" y2="${sy(v).toFixed(1)}"/>`
        + `<text class="ti" x="${L - 7}" y="${(sy(v) + 4).toFixed(1)}" text-anchor="end">${v}</text>`;
    });
    (opt.xticks || []).forEach(v => {
      g += `<text class="ti" x="${sx(v).toFixed(1)}" y="${B + 16}" text-anchor="middle">${v}</text>`;
    });
    g += `<line class="ax" x1="${L}" y1="${T}" x2="${L}" y2="${B}"/>`
      + `<line class="ax" x1="${L}" y1="${B}" x2="${R}" y2="${B}"/>`;
    /* the axis labels sit inside the padding, so whatever a figure writes at the
       foot of the picture can never land on top of them */
    if (opt.xlab) g += `<text class="al" x="${((L + R) / 2).toFixed(0)}" y="${B + 34}" text-anchor="middle">${opt.xlab}</text>`;
    if (opt.ylab) g += `<text class="al" transform="translate(11,${((T + B) / 2).toFixed(0)}) rotate(-90)" text-anchor="middle">${opt.ylab}</text>`;
    return { sx, sy, L, R, T, B, g };
  },
  open(W, H, cls) { return `<svg class="dg ${cls || ""}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`; },
  note(x, y, t, anchor) { return `<text class="fn" x="${x}" y="${y}" text-anchor="${anchor || "start"}">${t}</text>`; },
  drawn(W) { return `<text class="drawn" x="${W - 6}" y="13" text-anchor="end">a drawing, not data</text>`; },
};

const W11FIG = {

/* ---------- 1. the whole pile, against a search ---------------------------- */
exact_vs_search() {
  const W = 680, H = 250;
  let s = FG.open(W, H);
  s += `<text class="h" x="20" y="22">Look at every plan</text>`;
  s += `<text class="h b" x="370" y="22">Search</text>`;
  /* left: a dense field of dots. 40 x 22 = 880 dots stands for 1,048,576. */
  for (let r = 0; r < 22; r++) for (let c = 0; c < 40; c++) {
    s += `<circle class="pile" cx="${20 + c * 7.6}" cy="${38 + r * 7.2}" r="2.1"/>`;
  }
  s += FG.note(20, 215, `${FIG.space.toLocaleString("en-US")} plans. Every one of them scored.`);
  s += FG.note(20, 233, `Twenty jobs is fine. Sixty machines is not: see the next card.`);
  /* right: a path of a few dots */
  const path = [[390, 170], [432, 140], [470, 115], [515, 98], [562, 86], [604, 80]];
  for (let r = 0; r < 22; r++) for (let c = 0; c < 20; c++) {
    s += `<circle class="pile faint" cx="${370 + c * 15.2}" cy="${38 + r * 7.2}" r="1.8"/>`;
  }
  s += `<polyline class="ln hot" points="${path.map(p => p.join(",")).join(" ")}"/>`;
  path.forEach((p, i) => { s += `<circle class="dot hot" cx="${p[0]}" cy="${p[1]}" r="${i === path.length - 1 ? 6 : 4}"/>`; });
  s += `<text class="tx" x="604" y="70" text-anchor="end">stop here</text>`;
  s += FG.note(370, 215, `Six plans scored. Each one chosen by the one before.`);
  s += FG.note(370, 233, `No promise it is the best. A good plan, quickly.`);
  return s + `</svg>`;
},

/* ---------- 2. the textbook hill (a drawing) ------------------------------- */
hill() {
  const W = 680, H = 296;
  const f = FG.frame(W, H, { l: 30, r: 20, t: 40, b: 52 }, [0, 100], [0, 110],
    { xlab: "every possible plan, lined up", ylab: "value" });
  let s = FG.open(W, H) + f.g;
  /* three humps: a small one, a middle one, the tall one */
  const y = x => 26 + 34 * Math.exp(-((x - 18) ** 2) / 90) + 52 * Math.exp(-((x - 50) ** 2) / 150)
    + 78 * Math.exp(-((x - 82) ** 2) / 120) - 10 * Math.exp(-((x - 66) ** 2) / 40);
  let pts = [];
  for (let x = 0; x <= 100; x += 0.5) pts.push([f.sx(x).toFixed(1), f.sy(y(x)).toFixed(1)]);
  s += `<polygon class="area" points="${f.sx(0)},${f.B} ${pts.map(p => p.join(",")).join(" ")} ${f.sx(100)},${f.B}"/>`;
  s += `<polyline class="ln" points="${pts.map(p => p.join(",")).join(" ")}"/>`;
  /* the climber, stuck on the middle hump */
  const peak = [50, y(50)], top = [82, y(82)];
  s += `<circle class="dot hot" cx="${f.sx(peak[0])}" cy="${f.sy(peak[1])}" r="7"/>`;
  s += `<text class="tx hot" x="${f.sx(peak[0])}" y="${f.sy(peak[1]) - 28}" text-anchor="middle">it stops here</text>`;
  s += `<text class="sm" x="${f.sx(peak[0])}" y="${f.sy(peak[1]) - 14}" text-anchor="middle">no single change helps</text>`;
  s += `<circle class="dot ok" cx="${f.sx(top[0])}" cy="${f.sy(top[1])}" r="7"/>`;
  s += `<text class="tx ok" x="${f.sx(top[0])}" y="${f.sy(top[1]) - 14}" text-anchor="middle">the best plan</text>`;
  /* the valley it will not cross */
  s += `<path class="brace" d="M${f.sx(57)},${f.sy(y(57)) + 12} Q${f.sx(66)},${f.sy(y(66)) + 30} ${f.sx(75)},${f.sy(y(75)) + 12}"/>`;
  s += `<text class="sm" x="${f.sx(66)}" y="${f.sy(y(66)) + 46}" text-anchor="middle">to get there it must first go down</text>`;
  s += FG.drawn(W);
  return s + `</svg>`;
},

/* ---------- 3. the real cut through the landscape -------------------------- */
ridge() {
  const R = FIG.ridge, n = R.v.length;
  const W = 680, H = 272;
  const lo = Math.floor(R.vmin / 10) * 10 - 4, hi = 154;
  const f = FG.frame(W, H, { l: 50, r: 16, t: 40, b: 46 }, [0, n - 1], [lo, hi],
    { yticks: [100, 110, 120, 130, 140, 149], ylab: "value",
      xlab: `${n} plans, side by side. One step along this line changes exactly one job.` });
  let s = FG.open(W, H) + f.g;
  const pts = R.v.map((v, i) => `${f.sx(i).toFixed(1)},${f.sy(v).toFixed(1)}`).join(" ");
  s += `<polygon class="area" points="${f.sx(0)},${f.B} ${pts} ${f.sx(n - 1)},${f.B}"/>`;
  s += `<polyline class="ln" points="${pts}"/>`;
  s += `<line class="lim" x1="${f.L}" y1="${f.sy(FIG.opt)}" x2="${f.R}" y2="${f.sy(FIG.opt)}"/>`;
  R.peaks.forEach(i => { s += `<circle class="dot pk" cx="${f.sx(i).toFixed(1)}" cy="${f.sy(R.v[i]).toFixed(1)}" r="2.6"/>`; });
  R.true_local.forEach(i => { s += `<circle class="dot hot" cx="${f.sx(i).toFixed(1)}" cy="${f.sy(R.v[i]).toFixed(1)}" r="5"/>`; });
  s += `<circle class="dot ok" cx="${f.sx(R.best_at).toFixed(1)}" cy="${f.sy(R.best).toFixed(1)}" r="6.5"/>`;
  s += `<text class="h" x="4" y="16">The real landscape, along one line through it</text>`;
  s += `<text class="k" x="4" y="32">`
    + `<tspan class="kpk">grey dot</tspan> looks like a peak on this line`
    + ` &#183; <tspan class="khot">red</tspan> really is a peak in all 20 directions`
    + ` &#183; <tspan class="kok">green</tspan> 149, the best plan there is</text>`;
  return s + `</svg>`;
},

/* ---------- 4. the penalty, drawn by the data ------------------------------ */
cliff() {
  const C = FIG.cliff;
  const W = 680, H = 296;
  const f = FG.frame(W, H, { l: 48, r: 16, t: 48, b: 44 }, [0, C.hmax], [-90, 162],
    { yticks: [-60, 0, 60, 120, 149], xticks: [0, 20, 40, 60, 80, 100, 120],
      ylab: "value of the plan", xlab: "hours the plan asks for" });
  let s = FG.open(W, H) + f.g;
  C.pts.forEach(([h, v]) => {
    s += `<circle class="sct${h <= FIG.cap ? " in" : ""}" cx="${f.sx(h).toFixed(1)}" cy="${f.sy(v).toFixed(1)}" r="1.5"/>`;
  });
  s += `<line class="lim" x1="${f.sx(FIG.cap)}" y1="${f.T}" x2="${f.sx(FIG.cap)}" y2="${f.B}"/>`;
  s += `<text class="lim-t" x="${f.sx(FIG.cap) + 7}" y="${f.B - 8}">the crew has ${FIG.cap} hours</text>`;
  s += `<circle class="dot ok" cx="${f.sx(C.opt_hours)}" cy="${f.sy(C.opt_val)}" r="6"/>`;
  s += `<text class="tx ok" x="${f.sx(C.opt_hours) - 11}" y="${f.sy(C.opt_val) + 4}" text-anchor="end">149, using exactly ${C.opt_hours} hours</text>`;
  s += FG.note(f.sx(72), f.sy(26), `every hour over costs ${FIG.penalty} points,`);
  s += FG.note(f.sx(72), f.sy(26) + 16, `so the whole field slides downhill`);
  s += `<text class="h" x="4" y="18">Every plan, scored. The rule draws its own cliff.</text>`;
  s += `<text class="k" x="4" y="34">one dot is one real plan &#183; ${C.pts.length.toLocaleString("en-US")} of the ${FIG.space.toLocaleString("en-US")} drawn &#183; <tspan class="kb">blue</tspan> fits in the ${FIG.cap} hours</text>`;
  return s + `</svg>`;
},

/* ---------- 5. one real climb ---------------------------------------------- */
climb() {
  const C = FIG.climb, n = C.v.length;
  const W = 680, H = 268;
  const f = FG.frame(W, H, { l: 58, r: 176, t: 38, b: 46 }, [0, n - 1], [Math.min(-70, C.v[0] - 10), 162],
    { yticks: [-60, 0, 60, 120, 149], xticks: C.v.map((_, i) => i),
      ylab: "value", xlab: "improving steps taken" });
  let s = FG.open(W, H) + f.g;
  s += `<line class="lim" x1="${f.L}" y1="${f.sy(FIG.opt)}" x2="${f.R}" y2="${f.sy(FIG.opt)}"/>`;
  s += `<text class="lim-t" x="${f.L + 52}" y="${f.sy(FIG.opt) - 7}">149, the best plan there is</text>`;
  const pts = C.v.map((v, i) => `${f.sx(i).toFixed(1)},${f.sy(v).toFixed(1)}`).join(" ");
  s += `<polyline class="ln hot step" points="${pts}"/>`;
  C.v.forEach((v, i) => {
    s += `<circle class="dot ${i === n - 1 ? "hot" : "pk"}" cx="${f.sx(i).toFixed(1)}" cy="${f.sy(v).toFixed(1)}" r="${i === n - 1 ? 6 : 3.4}"/>`;
  });
  s += `<text class="sm" x="${f.sx(0) + 6}" y="${f.sy(C.v[0]) + 18}">a random start: ${C.v[0]}</text>`;
  s += `<text class="tx hot" x="${f.sx(n - 1) + 11}" y="${f.sy(C.end) + 4}">${C.end}, and it stops</text>`;
  s += `<text class="sm" x="${f.sx(n - 1) + 11}" y="${f.sy(C.end) + 21}">${C.gap} short of 149</text>`;
  s += `<text class="h" x="4" y="16">One real run, start to stop</text>`;
  s += `<text class="k" x="4" y="31">random start number ${C.seed} &#183; ${C.steps} improving steps &#183; then no single change helped any more</text>`;
  return s + `</svg>`;
},

/* ---------- 6. twenty neighbours, all worse -------------------------------- */
trap() {
  const T = FIG.trap, nb = T.nb;
  const W = 680, H = 364, cx = 340, cy = 178, r1 = 122;
  let s = FG.open(W, H);
  s += `<text class="k" x="20" y="16">The plan the climber stopped on, and all ${nb.length} plans that are one change away.</text>`;
  nb.forEach((v, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / nb.length;
    const x = cx + Math.cos(a) * r1, y = cy + Math.sin(a) * r1;
    s += `<line class="spoke" x1="${(cx + Math.cos(a) * 34).toFixed(1)}" y1="${(cy + Math.sin(a) * 34).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    s += `<circle class="dot ${v > T.here ? "ok" : "low"}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"/>`;
    s += `<text class="nbv" x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle">${Math.round(v)}</text>`;
  });
  s += `<circle class="dot hot" cx="${cx}" cy="${cy}" r="34"/>`;
  s += `<text class="ctr" x="${cx}" y="${cy + 7}" text-anchor="middle">${Math.round(T.here)}</text>`;
  s += `<text class="tx hot" x="${cx}" y="${cy + 52}" text-anchor="middle">you are here</text>`;
  s += FG.note(20, H - 26, `Best of the twenty: ${Math.round(T.best_nb)}. That is worse than ${Math.round(T.here)}, so hill climbing stops.`);
  s += FG.note(20, H - 8, `The best plan in the whole problem is 149. The climber cannot see it from here.`);
  return s + `</svg>`;
},

/* ---------- 7. the loop every one of these algorithms runs ----------------- */
metaloop() {
  const W = 680, H = 230;
  let s = FG.open(W, H);
  s += `<defs><marker id="mh" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">`
    + `<path d="M0,0 L9,4.5 L0,9 z" fill="var(--ink-3)"/></marker></defs>`;
  const box = (x, y, w, h, t, sub, cls) =>
    `<rect class="bx ${cls || ""}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>`
    + `<text class="tx" x="${x + w / 2}" y="${y + 23}" text-anchor="middle">${t}</text>`
    + `<text class="sm" x="${x + w / 2}" y="${y + 41}" text-anchor="middle">${sub}</text>`;
  s += box(20, 86, 120, 56, "Start", "any plan at all", "");
  s += box(178, 86, 136, 56, "Change one thing", "flip one job", "b2");
  s += box(352, 86, 126, 56, "Score it", "plan_value", "b2");
  s += box(516, 86, 144, 56, "Keep it?", "the one line that differs", "acc");
  [[140, 178], [314, 352], [478, 516]].forEach(([a, b]) =>
    s += `<path class="ar2" d="M${a},114 L${b - 8},114"/>`);
  s += `<path class="ar2" d="M588,142 L588,180 L246,180 L246,142"/>`;
  s += `<text class="sm" x="417" y="196" text-anchor="middle">and again, thousands of times</text>`;
  s += `<text class="h" x="20" y="36">Hill climbing and annealing are the same four boxes</text>`;
  s += `<text class="sm" x="20" y="56">Only the last box differs. Hill climbing keeps a change when it is better.`
    + ` Annealing sometimes keeps one that is worse.</text>`;
  s += `<text class="fn" x="660" y="218" text-anchor="end">This is why you learned <tspan class="mono">for</tspan>, <tspan class="mono">if</tspan> and functions first.</text>`;
  return s + `</svg>`;
},

/* ---------- 8. the physical picture behind annealing (a drawing) ----------- */
anneal_physics() {
  const W = 680, H = 265;
  let s = FG.open(W, H);
  s += `<text class="h" x="20" y="22">Where the name comes from</text>`;
  s += `<text class="sm" x="20" y="42">Cool hot metal fast and it is brittle. Cool it slowly and the atoms settle into a strong pattern.</text>`;
  const panels = [["Hot", "T is large", 20, 7, "hotp"], ["Cooling", "T is falling", 240, 3.2, "warmp"], ["Cold", "T is small", 460, 0.7, "coldp"]];
  panels.forEach(([t, sub, x, jit, cls]) => {
    s += `<rect class="pan ${cls}" x="${x}" y="58" width="200" height="118" rx="14"/>`;
    s += `<text class="tx" x="${x + 100}" y="${80}" text-anchor="middle">${t}</text>`;
    s += `<text class="sm" x="${x + 100}" y="${97}" text-anchor="middle">${sub}</text>`;
    /* a lattice of atoms, pushed off the grid by the temperature */
    let k = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
      /* fixed, repeatable offsets so the picture never changes between runs */
      const o1 = Math.sin((k + 1) * 12.9898) , o2 = Math.sin((k + 1) * 78.233);
      const px = x + 30 + c * 23 + o1 * jit, py = 118 + r * 19 + o2 * jit;
      s += `<circle class="atom" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.6"/>`;
      k++;
    }
  });
  s += `<text class="form" x="340" y="208" text-anchor="middle">P = exp( &#8722;&#916;E / T )</text>`;
  s += `<text class="sm" x="340" y="229" text-anchor="middle">the chance of accepting a step that makes things worse</text>`;
  s += `<text class="sm" x="340" y="248" text-anchor="middle">&#916;E is how much worse &#183; T is the temperature &#183; the rule is <tspan class="giv">[GIVEN]</tspan>, the Python is yours</text>`;
  s += FG.drawn(W);
  return s + `</svg>`;
},

/* ---------- 9. the real cooling schedule ---------------------------------- */
cool() {
  const C = FIG.cool;
  const W = 680, H = 262;
  const f = FG.frame(W, H, { l: 58, r: 152, t: 34, b: 46 }, [0, C.steps], [0, 1.04],
    { yticks: [0, 0.25, 0.5, 0.75, 1], xticks: [0, 10000, 20000, 30000],
      ylab: "chance it is accepted", xlab: "steps taken" });
  let s = FG.open(W, H) + f.g;
  const line = (arr, cls) => `<polyline class="ln ${cls}" points="${
    arr.map((p, i) => `${f.sx(C.k[i]).toFixed(1)},${f.sy(p).toFixed(1)}`).join(" ")}"/>`;
  s += line(C.p4, "hot");
  s += line(C.p12, "b2l");
  const last = C.p4.length - 1;
  s += `<text class="tx hot" x="${f.R + 8}" y="${f.sy(C.p4[last]) - 9}">4 points worse</text>`;
  /* the two curves meet at the right-hand edge, so the blue one is labelled
     where it is still on its own, part way along */
  const mid = Math.round(last * 0.42);
  s += `<text class="tx b2t" x="${f.sx(C.k[mid]).toFixed(1)}" y="${(f.sy(C.p12[mid]) - 12).toFixed(1)}" text-anchor="middle">12 points worse</text>`;
  s += `<text class="sm" x="${f.R + 8}" y="${f.sy(C.p4[0]) + 4}">at the start it says</text>`;
  s += `<text class="sm" x="${f.R + 8}" y="${f.sy(C.p4[0]) + 20}">yes ${Math.round(C.p4[0] * 100)}% of the time</text>`;
  s += `<text class="h" x="4" y="16">What the temperature is doing while the program runs</text>`;
  s += `<text class="k" x="4" y="31">T starts at ${C.t0} and is multiplied by ${C.alpha} every step. After ${C.steps.toLocaleString("en-US")} steps T is down to ${C.T[C.T.length - 1]}.</text>`;
  return s + `</svg>`;
},

/* ---------- 10. where 300 climbs and 150 annealings actually finish -------- */
race() {
  const R = FIG.race;
  const W = 680, H = 294, lo = 133, hi = FIG.opt;
  const maxc = Math.max(...R.hc.map(x => x[1]), ...R.sa.map(x => x[1]));
  const f = FG.frame(W, H, { l: 48, r: 16, t: 50, b: 60 }, [lo - 0.6, hi + 0.6], [0, maxc * 1.08],
    { xticks: [134, 137, 140, 143, 146, 149], ylab: "how many runs", xlab: "the value the run finished on" });
  let s = FG.open(W, H) + f.g;
  const bw = (f.R - f.L) / (hi - lo + 1.2) / 2 - 1.2;
  const bars = (tal, cls, off) => tal.filter(x => x[0] >= lo).forEach(([v, c]) => {
    if (!c) return;
    const x = f.sx(v) + off * (bw + 1.2) - bw / 2;
    s += `<rect class="bar ${cls}" x="${x.toFixed(1)}" y="${f.sy(c).toFixed(1)}" width="${bw.toFixed(1)}" height="${(f.B - f.sy(c)).toFixed(1)}" rx="2"/>`;
  });
  bars(R.hc, "hcb", -0.5); bars(R.sa, "sab", 0.5);
  s += `<line class="lim" x1="${f.sx(FIG.opt)}" y1="${f.T}" x2="${f.sx(FIG.opt)}" y2="${f.B}"/>`;
  s += `<text class="h" x="4" y="20">Same problem, same twenty jobs, same budget of work</text>`;
  s += `<text class="k" x="4" y="38">`
    + `<tspan class="khc">&#9644;</tspan> hill climbing, ${R.n_hc} runs: mean ${R.hc_mean}, reached 149 <tspan class="bold">${R.hc_hit} times</tspan>`
    + `   <tspan class="ksa">&#9644;</tspan> annealing, ${R.n_sa} runs: mean ${R.sa_mean}, reached 149 <tspan class="bold">${R.sa_hit_pc}% of the time</tspan></text>`;
  s += FG.note(4, H - 6, `Annealing is better on average. Its own worst run was still only ${Math.round(R.sa_worst)}, so one run proves nothing.`);
  return s + `</svg>`;
},

/* ---------- 11. restarts: real, and with a real ceiling ------------------- */
restarts() {
  const M = FIG.restarts, ks = Object.keys(M).map(Number).sort((a, b) => a - b);
  const W = 680, H = 252;
  const f = FG.frame(W, H, { l: 58, r: 158, t: 34, b: 46 }, [0, ks.length - 1], [140, 150],
    { yticks: [141, 143, 145, 147, 149], ylab: "mean value reached", xlab: "how many climbs you pay for" });
  let s = FG.open(W, H) + f.g;
  ks.forEach((k, i) => s += `<text class="ti" x="${f.sx(i).toFixed(1)}" y="${f.B + 16}" text-anchor="middle">${k}</text>`);
  s += `<line class="lim" x1="${f.L}" y1="${f.sy(FIG.opt)}" x2="${f.R}" y2="${f.sy(FIG.opt)}"/>`;
  s += `<text class="lim-t" x="${f.R}" y="${f.sy(FIG.opt) - 6}" text-anchor="end">149</text>`;
  const pts = ks.map((k, i) => `${f.sx(i).toFixed(1)},${f.sy(M[k][0]).toFixed(1)}`).join(" ");
  s += `<polyline class="ln hot" points="${pts}"/>`;
  const lastK = ks[ks.length - 1];
  ks.forEach((k, i) => {
    s += `<circle class="dot hot" cx="${f.sx(i).toFixed(1)}" cy="${f.sy(M[k][0]).toFixed(1)}" r="4.5"/>`;
    if (k !== lastK)
      s += `<text class="sm" x="${f.sx(i).toFixed(1)}" y="${(f.sy(M[k][0]) - 11).toFixed(1)}" text-anchor="middle">${M[k][0]}</text>`;
  });
  s += `<text class="tx hot" x="${f.R + 8}" y="${f.sy(M[lastK][0]) + 4}">${lastK} climbs: ${M[lastK][0]}</text>`;
  s += `<text class="sm" x="${f.R + 8}" y="${f.sy(M[lastK][0]) + 20}">and 149 in only</text>`;
  s += `<text class="sm" x="${f.R + 8}" y="${f.sy(M[lastK][0]) + 35}">${M[lastK][1]}% of runs</text>`;
  s += `<text class="h" x="4" y="16">Fifty times the work, for ${(M[lastK][0] - M[ks[0]][0]).toFixed(1)} points</text>`;
  s += `<text class="k" x="4" y="31">Each doubling buys less than the one before it. Restarting is not the answer; a better rule is.</text>`;
  return s + `</svg>`;
},

/* ---------- 12. the real plant, the greedy round and the best round ------- */
plant() {
  const P = FIG.plant;
  const W = 680, H = 352;
  const xs = P.xy.map(p => p[0]), ys = P.xy.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = 46, sc = Math.min((W / 2 - pad - 20) / (x1 - x0), (H - 186) / (y1 - y0));
  let s = FG.open(W, H);
  const panel = (ox, order, len, title, cls) => {
    const X = i => ox + (P.xy[i][0] - x0) * sc, Y = i => 84 + (y1 - P.xy[i][1]) * sc;
    let g = `<text class="h ${cls === "hot" ? "" : "b"}" x="${ox - 16}" y="30">${title}</text>`;
    g += `<text class="big ${cls}" x="${ox - 16}" y="60">${len} m</text>`;
    const pts = order.map(i => `${X(i).toFixed(1)},${Y(i).toFixed(1)}`).join(" ");
    g += `<polygon class="tour ${cls}" points="${pts}"/>`;
    order.forEach(i => {
      g += `<circle class="stop${i === 0 ? " shop" : ""}" cx="${X(i).toFixed(1)}" cy="${Y(i).toFixed(1)}" r="${i === 0 ? 7 : 4.6}"/>`;
    });
    g += `<text class="sm" x="${X(0).toFixed(1)}" y="${(Y(0) + 20).toFixed(1)}" text-anchor="middle">${P.names[0]}</text>`;
    return g;
  };
  s += panel(pad, P.nn, P.nn_len, "Always walk to the nearest machine", "b2l");
  s += panel(W / 2 + pad - 20, P.best, P.best_len, "The best round there is", "hot");
  s += FG.note(4, H - 26, `The greedy rule is easy to write and ${(P.nn_len - P.best_len).toFixed(1)} m worse. Ten stops, and already you cannot guess the answer.`);
  s += FG.note(4, H - 8, `Same four boxes as the maintenance plan. Only the move changed: swap two stops instead of changing your mind about a job.`);
  return s + `</svg>`;
},

};

/* a figure is its own card: a title, the picture, and one line to notice */
R.figure = (e, card) => {
  const c = card.c;
  e.classList.add("figcard");
  e.innerHTML = head(card, esc(c.title)) +
    `<div class="vis big">${W11FIG[c.fig]()}</div>` +
    (c.notice ? `<div class="notice"><span class="nl">Look at</span>${c.notice}</div>` : "");
};

/* ---------------------------------------------------------------------------
   Photographs. The page is one file, so a photograph has to live inside it as
   a data URI. build.js injects PHOTOS from photos.json, which embed_photos.py
   writes from whatever JPEGs are sitting in the photos/ folder.

   With no photograph the card still works: it draws its own panel and keeps
   the sentence. So the page is never broken by a missing file, and the lecture
   never depends on one.                                                      */
const PHOTOSLOTS = {
  crew:      ["photo-crew.jpg",      "a maintenance crew or a factory shop floor"],
  landscape: ["photo-landscape.jpg", "a landscape with a local and a global optimum"],
  anneal:    ["photo-anneal.jpg",    "the hot, cooling and cold picture of annealing"],
};

R.photo = (e, card) => {
  const c = card.c;
  const have = (typeof PHOTOS === "object") && PHOTOS[c.photo];
  const slot = PHOTOSLOTS[c.photo] || ["", ""];
  e.classList.add("figcard");
  const inner = have
    ? `<img class="ph" src="${PHOTOS[c.photo]}" alt="${esc(c.alt || "")}">`
    : `<div class="ph empty"><div><b>${slot[1]}</b><span>drop <code>${slot[0]}</code> into the <code>photos</code> folder and run <code>embed_photos.py</code></span></div></div>`;
  e.innerHTML = head(card, esc(c.title)) +
    `<div class="phwrap">${inner}${c.drawn ? `<div class="dm">a drawing, not data</div>` : ""}` +
    `${c.credit ? `<div class="cr">${c.credit}</div>` : ""}</div>` +
    (c.notice ? `<div class="notice"><span class="nl">Look at</span>${c.notice}</div>` : "");
};
