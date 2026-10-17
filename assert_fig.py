"""Check every number a Week 11 figure prints against a freshly computed one.

Two kinds of drift are caught here:
  1. fig11_data.json drifting away from kp.py;
  2. a figure drifting away from the CARD PRINTED BESIDE IT, which is the one a
     student would actually notice.

    python3 assert_fig.py          # exit 0 and a tick list, or exit 1
"""
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "wk11", "src"))
import kp
import tsp

FIG = json.load(open(os.path.join(HERE, "fig11_data.json")))
NUM = json.load(open(os.path.join(HERE, "..", "..", "wk11", "src", "numbers.json")))
DATA = open(os.path.join(HERE, "data11.js")).read()
PAGE = open(os.path.join(HERE, "..", "index.html")).read()

ok, bad = [], []


def check(name, got, want):
    (ok if got == want else bad).append((name, got, want))


# ---- 1. the headline constants ---------------------------------------------
OPTPLAN, OPT = kp.exact_best()
check("optimum is 149", FIG["opt"], OPT)
check("optimum agrees with numbers.json", FIG["opt"], NUM["optimum"])
check("search space is 2**20", FIG["space"], 1 << kp.N)
check("local optima count", FIG["n_local"], NUM["n_local"])
check("capacity", FIG["cap"], kp.CAPACITY)
check("penalty", FIG["penalty"], kp.PENALTY)

# ---- 2. the cliff: every dot is a real plan --------------------------------
C = FIG["cliff"]
worst = max(abs(kp.value([(h, v)]) if False else 0) for h, v in [(0, 0)])  # keep flake8 quiet
mism = 0
for h, v in C["pts"]:
    #   value is risk minus the penalty; risk is not stored, so re-derive what
    #   it must have been and confirm the penalty was applied consistently
    if h > kp.CAPACITY:
        risk = v + kp.PENALTY * (h - kp.CAPACITY)
    else:
        risk = v
    if risk < 0 or risk > int(kp.RISK.sum()):
        mism += 1
check("cliff: every dot implies a possible risk total", mism, 0)
check("cliff: the marked optimum is the real one", (C["opt_hours"], C["opt_val"]),
      (int(OPTPLAN @ kp.HOURS), float(OPT)))
check("cliff: hours never exceed the sum of all jobs", C["hmax"] <= int(kp.HOURS.sum()), True)

# ---- 3. the ridge: the cut really is a neighbour path ----------------------
R = FIG["ridge"]
VARY = [17, 12, 2, 11, 6, 13, 5]
gray = [(k ^ (k >> 1)) for k in range(1 << len(VARY))]
cut_plans, cut = [], []
for g in gray:
    p = OPTPLAN.copy()
    for b, j in enumerate(VARY):
        p[j] = (g >> b) & 1
    cut_plans.append(p)
    cut.append(kp.value(p))
check("ridge: values are the real values", [round(float(v), 1) for v in cut], R["v"])
check("ridge: consecutive plans differ in exactly one job",
      all(int(np.abs(cut_plans[i] - cut_plans[i + 1]).sum()) == 1 for i in range(len(cut) - 1)), True)
check("ridge: red dots are genuine local optima",
      all(kp.is_local_optimum(cut_plans[i]) for i in R["true_local"]), True)
check("ridge: grey dots really are peaks along the line",
      all(cut[i] > cut[i - 1] and cut[i] > cut[i + 1] for i in R["peaks"]), True)
check("ridge: no red dot is missing from the peaks",
      set(R["true_local"]) <= set(R["peaks"]), True)
check("ridge: the green dot is 149", R["best"], float(OPT))

# ---- 4. the climb: a real run of the real algorithm ------------------------
CL = FIG["climb"]
_, cv, hist = kp.hill_climb(kp.random_plan(np.random.default_rng(CL["seed"])))
check("climb: the trace is the real history", [round(float(v), 1) for v in hist], CL["v"])
check("climb: it finishes where it says", CL["end"], round(float(cv), 1))
check("climb: the step count matches", CL["steps"], len(hist) - 1)
check("climb: the gap to 149 is right", CL["gap"], round(float(OPT - cv), 1))
check("climb: this is the longest of the 300 starts the page quotes",
      len(hist), max(len(kp.hill_climb(kp.random_plan(np.random.default_rng(s)))[2])
                     for s in range(300)))

# ---- 5. the trap: twenty real neighbours, none better ----------------------
T = FIG["trap"]
stuck, sv, _ = kp.hill_climb(kp.random_plan(np.random.default_rng(T["seed"])))
nb = [round(float(kp.value(n)), 1) for n in kp.all_neighbours(stuck)]
check("trap: the twenty neighbour values are real", T["nb"], nb)
check("trap: there are exactly twenty of them", len(T["nb"]), kp.N)
check("trap: the centre is where the climb stopped", T["here"], round(float(sv), 1))
check("trap: none of them is better", T["n_better"], 0)
check("trap: the best neighbour is as stated", T["best_nb"], max(nb))
check("trap: the centre really is a local optimum", kp.is_local_optimum(stuck), True)
check("trap: the card's claim 'the best of them is only 140' is true",
      "only %d" % round(T["best_nb"]) in DATA, True)

# ---- 6. the race: 300 climbs and 150 annealings ----------------------------
RC = FIG["race"]
hc = np.array([kp.hill_climb(kp.random_plan(np.random.default_rng(s)))[1] for s in range(300)])
sa = []
for s in range(150):
    rng = np.random.default_rng(s)
    sa.append(kp.simulated_annealing(kp.random_plan(rng), rng, steps=30000, t0=40.0, alpha=0.9999)[1])
sa = np.array(sa)
check("race: hill-climbing mean", RC["hc_mean"], round(float(hc.mean()), 1))
check("race: annealing mean", RC["sa_mean"], round(float(sa.mean()), 1))
check("race: hill-climbing mean agrees with the page", RC["hc_mean"], NUM["hc_mean"])
check("race: annealing mean agrees with the page", RC["sa_mean"], NUM["sa_mean"])
check("race: annealing hit rate agrees with the page", RC["sa_hit_pc"], NUM["sa_hit"])
check("race: hill climbing never reached 149", RC["hc_hit"], 0)
check("race: annealing's worst run", RC["sa_worst"], round(float(sa.min()), 1))
check("race: the bars add up to 300 climbs", sum(c for _, c in RC["hc"]), 300)
check("race: the bars add up to 150 annealings", sum(c for _, c in RC["sa"]), 150)
for v, c in RC["hc"]:
    if int((hc == v).sum()) != c:
        bad.append(("race: hill-climbing bar at %d" % v, c, int((hc == v).sum())))
for v, c in RC["sa"]:
    if int((sa == v).sum()) != c:
        bad.append(("race: annealing bar at %d" % v, c, int((sa == v).sum())))
ok.append(("race: every bar height checked one by one", len(RC["hc"]) + len(RC["sa"]), "bars"))

# ---- 7. the cooling curve --------------------------------------------------
CO = FIG["cool"]
check("cool: T starts at 40", CO["t0"], 40.0)
check("cool: the schedule is T * alpha each step",
      CO["T"], [round(40.0 * 0.9999 ** k, 2) for k in CO["k"]])
check("cool: the acceptance curve is exp(-dE/T)",
      CO["p4"], [round(float(np.exp(-4.0 / t)), 2) for t in [40.0 * 0.9999 ** k for k in CO["k"]]])
check("cool: a 12-point-worse move is always less likely than a 4-point one",
      all(a <= b for a, b in zip(CO["p12"], CO["p4"])), True)
check("cool: the card's claim '4 points worse accepted 90 times in 100'",
      round(CO["p4"][0] * 100), 90)
check("cool: exercise 2.3, 4 points worse at T = 10", [r for d, t, r in FIG["ptab"]
      if (d, t) == (4, 10.0)][0], round(float(np.exp(-4.0 / 10.0)), 2))

# ---- 8. restarts -----------------------------------------------------------
M = FIG["restarts"]
for k, (mean, hit) in NUM["multi"].items():
    check("restarts: k = %s mean agrees with the page" % k, M[k][0], mean)
    check("restarts: k = %s hit rate agrees with the page" % k, M[k][1], hit)
check("restarts: fifty climbs buy 5.0 points", round(M["50"][0] - M["1"][0], 1), 5.0)
check("restarts: the card says 149 in only 2% of runs", M["50"][1], 2)
check("restarts: the card's 2% claim is in data11.js", "only 2%" in DATA, True)

# ---- 9. the plant map ------------------------------------------------------
P = FIG["plant"]
nn_order, nn_len = tsp.nearest_neighbour()
check("plant: the coordinates are the real ones",
      P["xy"], [[int(x), int(y)] for x, y in tsp.XY])
check("plant: the greedy round is the real greedy round", P["nn"], [int(i) for i in nn_order])
check("plant: the greedy length", P["nn_len"], round(float(nn_len), 1))
check("plant: the best length", P["best_len"], round(float(tsp.tour_length(P["best"])), 1))
check("plant: both rounds visit all ten stops once",
      (sorted(P["nn"]), sorted(P["best"])), (list(range(10)), list(range(10))))
check("plant: both rounds start at the workshop", (P["nn"][0], P["best"][0]), (0, 0))
check("plant: the card's 761 against 630 claim still holds",
      (round(P["nn_len"]), round(P["best_len"])), (761, 630))

# ---- 10. the page itself ---------------------------------------------------
#   One file means one file: nothing fetched from disk beside it and nothing
#   fetched from the network either, so it works from a memory stick, offline,
#   and from GitHub Pages. ${...} is a template placeholder, not a reference.
check("page: nothing is loaded from a file beside it",
      re.findall(r'(?:src|href)\s*=\s*"(?!data:|#|\$\{)([^"]+)"', PAGE), [])
check("page: nothing is loaded from the network",
      re.findall(r'(?:src|href)\s*=\s*"(https?:[^"]+)"', PAGE), [])
check("page: no <script src> and no <link rel=stylesheet>",
      bool(re.search(r'<script[^>]*\ssrc=|<link[^>]*stylesheet', PAGE, re.I)), False)
check("page: all eleven drawn figures are placed",
      len(set(re.findall(r'(?:fig|visual):"(\w+)"', DATA))), 11)
check("page: all three picture slots are placed",
      sorted(set(re.findall(r'photo:"(\w+)"', DATA))), ["anneal", "crew", "landscape"])
check("page: a supplied diagram is marked as a drawing",
      len(re.findall(r'drawn:true', DATA)), 2)
check("page: no figure is referenced that fig11.js cannot draw",
      sorted(set(re.findall(r'(?:fig|visual):"(\w+)"', DATA))
             - set(re.findall(r"^(\w+)\(\) \{", open(os.path.join(HERE, "fig11.js")).read(), re.M))),
      [])

# ---- report ----------------------------------------------------------------
for name, got, want in ok:
    print("  ok   %s" % name)
print()
if bad:
    for name, got, want in bad:
        print("  FAIL %s\n         got  %r\n         want %r" % (name, got, want))
    print("\n%d checks passed, %d FAILED" % (len(ok), len(bad)))
    sys.exit(1)
print("%d checks passed, 0 failed." % len(ok))
