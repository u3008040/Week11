/* Week 11 content. Every number here came out of src/experiment.py. */

const DATA = {
week: { n: 11, label: "Week 11", brand: "Week 11",
  title: "Searching when you cannot try everything",
  sub: "Two sessions: climb to the top of a hill, then learn why that is not enough",
  lead: "A maintenance crew has <b>40 hours</b> and <b>20 jobs</b> waiting. There are <b>1,048,576</b> possible plans, so you cannot look at them all. This week you write a program that searches instead. <b>The factory is the setting; <code>for</code> loops, <code>if</code> statements and functions are the content.</b> No formula here is examined.",
  lesson_label: "Why:" },

sessions: {
 1: { title: "One plan, one value, one climb",
   goal: "Write the objective function, write the neighbourhood, and watch hill climbing walk uphill until it cannot.",
   two: ["a <b>plan</b> is twenty 0s and 1s, and a function scores it",
         "a <b>neighbour</b> is one change away, and there are exactly twenty"],
   recap: "Before we start: this week there is no new Python. Everything is <code>for</code>, <code>if</code>, functions and lists &mdash; the parts you already have.",
   demos: ["Demo 1: scoring one plan, including the penalty",
           "Demo 2: the climb, one best change at a time"],
   notebooks: ["week11_session1_hill_climbing.ipynb"] },
 2: { title: "Escaping a local optimum",
   goal: "Prove the climber is trapped, then change one line of the acceptance rule so it can get out.",
   two: ["a <b>local optimum</b> is a plan where no single change helps",
         "<b>simulated annealing</b> sometimes accepts a worse plan, less and less often"],
   recap: "Last session: your climber stopped at about <b>141.8</b> on average. The best possible is <b>149</b>. Today we find out why, and fix it.",
   demos: ["Demo 3: twenty neighbours, all worse",
           "Demo 4: the acceptance rule, hot and cold"],
   notebooks: ["week11_session2_annealing.ipynb"] }
},

exercises: {
 "week11_session1_hill_climbing.ipynb": [
  {id:"1.1", kind:"Write it", title:"How many hours?", star:false,
   task:"Write <code>total_hours(plan)</code>. One line, if you use <code>plan @ HOURS</code>."},
  {id:"1.2", kind:"Write it", title:"How good is a plan?", star:false,
   task:"Write <code>plan_value(plan)</code>: the risk it removes, minus a penalty for every hour over 40."},
  {id:"1.3", kind:"Predict", title:"Score it by hand first", star:false,
   task:"<b>Predict first:</b> work out the value of one given plan with a pen, then run the check."},
  {id:"1.4", kind:"Write it", title:"One small change", star:false,
   task:"Write <code>flip(plan, i)</code> returning a <b>new</b> plan with job <code>i</code> switched. The original must not change."},
  {id:"1.5", kind:"Fill in", title:"Look at all twenty", star:false,
   task:"Write <code>best_neighbour(plan)</code>, returning the best of the twenty one-change plans <b>and</b> its value."},
  {id:"1.6", kind:"Fill in", title:"The climb", star:false,
   task:"Finish <code>hill_climb</code>: keep taking the best change, and <code>break</code> when none of them helps."},
  {id:"1.7", kind:"Write it", title:"Does the start matter?", star:true,
   task:"Climb from twenty different random starts. How many different answers do you get, and why?"}
 ],
 "week11_session2_annealing.ipynb": [
  {id:"2.1", kind:"Write it", title:"Is this a dead end?", star:false,
   task:"Write <code>is_local_optimum(plan)</code>: <code>True</code> when no single change improves it."},
  {id:"2.2", kind:"Fill in", title:"Try again from somewhere else", star:false,
   task:"Write <code>multistart(n_starts, seed)</code>: climb <code>n_starts</code> times, keep the best."},
  {id:"2.3", kind:"Predict", title:"Work out the probability", star:false,
   task:"<b>Predict first:</b> a move is 4 points worse and the temperature is 10. What is the chance it is accepted?"},
  {id:"2.4", kind:"Write it", title:"The acceptance rule", star:false,
   task:"Write <code>accept(delta, T, rng)</code>. Better moves always pass; worse ones pass with probability <code>exp(delta/T)</code>."},
  {id:"2.5", kind:"Fill in", title:"Simulated annealing", star:false,
   task:"Finish the loop: random flip, work out <code>delta</code>, ask <code>accept</code>, keep the best seen, then cool down."},
  {id:"2.6", kind:"Write it", title:"A fair comparison", star:false,
   task:"Run both algorithms from the same twenty starts. Report mean, worst and best for each."},
  {id:"2.7", kind:"Write it", title:"Does the cooling rate matter?", star:true,
   task:"Try four values of <code>alpha</code>. One is much worse than the others &mdash; say which, and why."}
 ]
},

blocks: [
/* ================= SESSION 1 ================= */
{session:1, id:"A0", short:"The wall", title:"Why not just try them all?", cards:[
 {kind:"idea", tag:"IDEA", title:"Exact methods are still the right answer \u2014 until they are not",
  points:["In Weeks 3 to 5 you solved transportation and assignment problems with PuLP, and the solver gave you the <b>provably best</b> answer.",
   "That is better than anything this week will give you. <b>When an exact method works, use it.</b>",
   "But some problems have too many possible answers, or rules a solver cannot express, or need an answer before lunch.",
   "<b>Near-optimal in seconds beats optimal next Tuesday</b> when the crew is standing in the workshop waiting for the list."],
  note:"<b>This week is not a replacement for Week 3.</b> It is what you reach for when the model stops fitting in a solver.",
  visual:"exact_vs_search"},

 {kind:"photo", photo:"crew", title:"The people waiting for the answer",
  alt:"A maintenance crew on a factory shop floor.",
  credit:"",
  notice:"what they are doing: standing still. <b>Forty hours of crew time, twenty jobs, one week.</b> The whole of this week's Python exists to hand these people a list before they start, and a list that is nearly best today beats a perfect list on Tuesday."},

 {kind:"live", mode:"explode", title:"How big is the pile you are not going to look at?",
  tasks:["Drag to <b>20 jobs</b>. How long would checking every plan take?",
         "Now <b>50</b>. And <b>100</b>. Does a faster computer fix this?",
         "Switch to <b>what order</b> and drag to 20 stops. Which of the two grows faster?"]},

 {kind:"predict", question:"A plant has 60 machines to inspect. How many possible orders are there?",
  code:"import math\nprint(math.factorial(59) // 2)",
  options:["about 3,600","about 10 million","a 80-digit number","an error: too big"],
  answer:2, output:"69108319... (80 digits)",
  explain:"<b>Python will happily compute it</b> &mdash; it handles whole numbers of any size. The number has eighty digits, which is more than the atoms in the visible universe. <b>Nothing is wrong with the arithmetic; the plan of checking them all is what is wrong.</b>"}
]},

{session:1, id:"A1", short:"The plan", title:"What one answer looks like", cards:[
 {kind:"idea", tag:"PYTHON", title:"A plan is twenty decisions, written as 0s and 1s",
  points:[
   "Twenty jobs are waiting. For each one you either do it or you do not. That is <b>one decision per job</b>.",
   "Write it as a list: <code>[1, 0, 1, 0, 0, ...]</code>. A <code>1</code> means do that job.",
   "This is called the <b>encoding</b>. Choosing it is the first thing you do in any search problem, and a good one makes everything else easy.",
   "<b>Why a list of 0s and 1s and not twenty variables?</b> Because a list can be looped over, copied and changed by index. Twenty separate variables cannot."],
  note:"<b>There are 2<sup>20</sup> = 1,048,576 plans.</b> That is small enough that we checked every one of them by brute force, so we know the best possible answer is <b>149</b>. Remember that number; it is the only reason we can mark our own homework this week."},

 {kind:"live", mode:"plan", title:"Build a plan and watch it score",
  tasks:["Press <b>Everything</b>. Why is the value so bad when the risk removed is so high?",
         "Press <b>Nothing</b>, then add jobs one at a time. How close to 149 can you get by hand?",
         "Find a plan that uses exactly 40 hours. Is it the best one?"]},

 {kind:"predict", question:"Every job takes 132 hours in total. What does the penalty do to a plan that does them all?",
  code:"hours = 132\nrisk  = 475\nvalue = risk - 6 * (hours - 40)\nprint(value)",
  options:["475","-77","yes, it is over budget","an error"],
  answer:1, output:"-77",
  explain:"<b>132 hours is 92 hours over the 40 you have.</b> At 6 points an hour that is a 552-point penalty against 475 points of risk removed, so the plan scores &minus;77. The search is allowed to look at plans like this, but it will never want one."}
]},

{session:1, id:"A2", short:"The score", title:"The objective function", cards:[
 {kind:"idea", tag:"PYTHON", title:"One number that says how good a plan is",
  points:[
   "A search cannot compare two plans until something turns each one into a <b>number</b>. That function is the <b>objective</b>.",
   "Here, bigger is better: we are removing risk.",
   "<b>Over budget is allowed, but it costs.</b> Six risk points for every hour over. This is a <i>penalty</i>, and it is one of the three ways to deal with a broken constraint &mdash; repair it, refuse it, or charge for it.",
   "Why allow it at all? Because a fence makes the search work harder. Letting it step briefly over the line lets it cross from one good region to another."],
  code:"def plan_value(plan):\n    risk  = plan @ RISK\n    hours = plan @ HOURS\n\n    if hours <= CAPACITY:\n        return risk\n\n    return risk - PENALTY * (hours - CAPACITY)",
  note:"<b>The penalty has to be big enough.</b> The greediest job here removes 4.5 risk points per hour. We charge 6. If we charged 4, the search would happily run over budget for ever, because breaking the rule would pay.",
  visual:"cliff"},

 {kind:"classify", title:"Sort these plans", bins:["fits in 40 hours","over budget","the best possible"],
  task:"Four plans. Put each in the right box.",
  items:["every job: 132 hours, 475 risk",
         "nothing at all: 0 hours, 0 risk",
         "8 jobs: 40 hours, 149 risk",
         "10 jobs: 44 hours, 158 risk"],
  answers:[1,0,2,1],
  after:"<b>Doing nothing fits.</b> It is feasible and completely useless, which is a good reminder that feasibility is not quality. <b>The 44-hour plan removes more risk</b> than the best one &mdash; 158 against 149 &mdash; but it scores 158 &minus; 24 = 134 once the penalty lands. Only the 40-hour plan is both legal and best."},

 {kind:"idea", tag:"PYTHON", title:"A neighbour is one change away",
  points:[
   "To <i>search</i>, you need a way to step from one plan to a nearby one. That step is called a <b>move</b>, and the set of plans you can reach in one move is the <b>neighbourhood</b>.",
   "Here the natural move is: <b>change your mind about exactly one job</b>.",
   "So every plan has exactly <b>twenty</b> neighbours &mdash; one per job.",
   "<b>This choice matters more than the algorithm.</b> The neighbourhood decides what the search is able to find at all."],
  code:"def flip(plan, i):\n    new_plan = plan.copy()      # copy first\n    new_plan[i] = 1 - new_plan[i]\n    return new_plan",
  note:"<b>Why <code>.copy()</code>?</b> Without it you change the plan you were given, and the caller's plan changes underneath them. This is the single most common bug in this week's notebook."}
]},

{session:1, id:"A3", short:"The climb", title:"Hill climbing", cards:[
 {kind:"idea", tag:"PYTHON", title:"The whole algorithm, in one sentence",
  points:["<b>Keep taking the best single change. Stop when no single change helps.</b>",
   "That is hill climbing. There is nothing else to it.",
   "It has <b>no parameters</b> &mdash; nothing to tune, nothing to get wrong.",
   "And it is <b>deterministic</b>: the same starting plan always ends in the same place."],
  code:"while True:\n    candidate, candidate_value = best_neighbour(current)\n\n    if candidate_value <= current_value:\n        break               # nothing helps: we are at the top\n\n    current, current_value = candidate, candidate_value"},

 {kind:"live", mode:"climb", title:"Climb it yourself",
  tasks:["Press <b>Take the best change</b> until it stops. How many steps did it take?",
         "Press <b>New random start</b> and climb again. Did you finish at the same value?",
         "Do that five times. Write down the five answers. <b>How many are 149?</b>"]},

 {kind:"predict", question:"Hill climbing is run 300 times from 300 random starts. How often does it find the best plan, 149?",
  code:"results = [hill_climb(random_plan(seed))\n           for seed in range(300)]\n\nprint(sum(r == 149 for r in results))",
  options:["about 150 times","about 30 times","0 times","300 times"],
  answer:2, output:"0",
  explain:"<b>Not once in 300 tries.</b> It averages 141.8 and its best ever run reached 148. The reason is on the next card, and it is not that the algorithm is broken &mdash; every single run did exactly what it was told."},

 {kind:"figure", fig:"climb", title:"One real run, from the random start to the stop",
  notice:"the shape. It rises fast, then it stops dead. Nothing is wrong with the program. It stopped because <b>no single change helped any more</b>, which is exactly what you told it to do."},

 {kind:"figure", fig:"hill", title:"Why a program that works can still give you the wrong answer",
  notice:"the gap between the two peaks. To walk from the lower one to the higher one, the climber would have to <b>go downhill first</b> &mdash; and it is not allowed to. This is a local optimum, and it is the whole subject of Session 2."}
]},

{session:1, id:"A4", short:"A second problem", title:"The same four ingredients, a different shape", cards:[
 {kind:"idea", tag:"IDEA", title:"The same four ingredients, a different problem",
  points:["The crew now has its list. <b>In what order should the technician walk to the machines?</b> Start at the workshop, visit all nine, come back.",
   "<b>Encoding:</b> not 0s and 1s any more &mdash; an <b>order</b>, like <code>[0, 3, 7, 1, ...]</code>. Every stop appears exactly once.",
   "<b>Objective:</b> the total walking distance. Smaller is better, so this one we <i>minimise</i>.",
   "<b>Neighbourhood:</b> now there is a choice. <b>Swap</b> two stops, or <b>reverse</b> a whole stretch of the round."],
  formulas:[["which jobs","a list of 0s and 1s"],["what order","a permutation"],["flip one job","swap two stops"],["maximise risk removed","minimise metres walked"]],
  fhead:["Session 1 so far","this problem"],
  note:"<b>Nothing about hill climbing changes.</b> Propose a change, score it, take it if it helps. Only the three problem parts are different, which is the whole reason meta-heuristics are worth learning once.",
  visual:"plant"},

 {kind:"live", mode:"tsp", title:"Walk the round yourself",
  tasks:["Click <b>two stops</b>, then <b>Swap the two</b>. Did the round get shorter or longer?",
         "Press <b>Best swap</b> over and over until it says none helps. What length did you stop at?",
         "Now press <b>Best reverse</b>. <b>Does a move the other neighbourhood could not see still help?</b>",
         "Press <b>Greedy start</b>. The obvious rule gives 761 m against a best of 630 m."]},

 {kind:"predict", question:"Same algorithm, same problem, 200 random starts. Only the move is different. Which finds the best round more often?",
  code:"swap    two stops trade places\nreverse turn a stretch of the round around",
  options:["swap, because it is simpler","they are the same","reverse, by a long way","neither ever finds it"],
  answer:2, output:"swap     41%\nreverse  76%",
  explain:"<b>41% against 76%, from changing nothing but the definition of a small move.</b> Reversing a stretch can undo a crossing in the route in one go; swapping two stops usually cannot. <b>The neighbourhood decides what the search is able to see</b>, and it matters more here than the choice of algorithm."},

 {kind:"classify", title:"Which encoding would you use?", bins:["a list of 0s and 1s","an order","neither"],
  task:"Four IE decisions. Which encoding fits each one naturally?",
  items:["Which of 30 maintenance jobs to do this week",
         "The sequence 12 jobs go through one machine",
         "Which 5 of 40 sites to open a depot on",
         "How much to set a furnace temperature to"],
  answers:[0,1,0,2],
  after:"<b>The furnace is neither</b> &mdash; it is a real number, so the encoding is a decimal and the move is a small nudge up or down. <b>Choosing the encoding is the first decision you make</b>, and it quietly decides what the rest of the design can look like."},

]},

{session:1, id:"A5", short:"Your turn", title:"Your turn, and what is examinable", cards:[
 {kind:"yourturn", minutes:12, notebook:"week11_session1_hill_climbing.ipynb",
  sub:"In Colab, in <code>week11_session1_hill_climbing.ipynb</code>. <b>Start now and finish at home.</b> Exercises 1.1 to 1.6 build the algorithm one function at a time; 1.7 runs it twenty times.",
  chat:"Get to 1.2 before you leave. If a check says NOT YET, read the sentence after it \u2014 it tells you which case failed."},

 {kind:"table", title:"What is examinable from Session 1",
  rows:[["Writing a function that returns a number","Why 149 is the optimum"],
        ["<code>if</code> / <code>else</code> inside a function","The penalty value of 6"],
        ["<code>.copy()</code> before changing a list","Knapsack theory"],
        ["A <code>for</code> loop that keeps the best of several","How many local optima exist"],
        ["Returning two things from a function","NP-hardness"],
        ["Reading a <code>while</code> loop with a <code>break</code>",""]],
  note:"<b>Next session:</b> why it stops early, and the one line that fixes it."}
]},

/* ================= SESSION 2 ================= */
{session:2, id:"B1", short:"Stuck", title:"Why it stops early", cards:[
 {kind:"idea", tag:"PYTHON", title:"A local optimum is a plan with no better neighbour",
  points:["Hill climbing did not give up. It stopped because <b>all twenty</b> of its neighbours were worse.",
   "A plan like that is called a <b>local optimum</b>: the best thing in its own neighbourhood, and nothing more.",
   "The best plan overall is the <b>global</b> optimum. There is only one of those.",
   "<b>This problem has 14,148 local optima</b> out of 1,048,576 plans &mdash; about one in seventy-four. Only four of them reach 149."],
  note:"So a random climb has roughly four chances in fourteen thousand of landing on a plan worth 149. <b>In 300 attempts it never did.</b> That is not bad luck; it is arithmetic.",
  visual:"ridge"},

 {kind:"photo", photo:"landscape", title:"This is what a local optimum looks like", drawn:true,
  alt:"A multi-modal landscape, with a local optimum and a deeper global optimum marked.",
  credit:"",
  notice:"the dip marked <b>Local Optimum</b>. The search walked downhill all the way into it and then stopped, because from inside it every direction goes up. <b>It is at the bottom of something. It is not at the bottom.</b> <i>This picture is drawn upside down from ours: it hunts for the lowest point, we hunt for the highest. The trap is the same shape either way.</i> Our plan is sitting in that dip right now, at 142."},

 {kind:"figure", fig:"trap", title:"The plan it stopped on, and every plan one change away",
  notice:"the twenty numbers around the outside. <b>Every one of them is smaller than the middle.</b> The best of them is only 140. So the rule says stop &mdash; and the rule is right, from where it is standing."},

 {kind:"live", mode:"climb", title:"Reach the top, then look around",
  tasks:["Press <b>Climb to the top</b>. The box turns red when nothing helps any more.",
         "Look at the hours bar. Is the plan using all 40 hours?",
         "<b>The hard question:</b> you can see the plan is not worth 149. Why can the algorithm not see that?"]},

 {kind:"classify", title:"Stuck, or just slow?", bins:["still has a better neighbour","is a local optimum","cannot tell without looking"],
  task:"Four situations. Which of them means hill climbing will stop?",
  items:["one of the twenty changes gains 3 points",
         "all twenty changes lose points",
         "the plan uses exactly 40 hours",
         "the plan scores 148, one short of the best"],
  answers:[0,1,2,2],
  after:"<b>Using all 40 hours tells you nothing</b> &mdash; plenty of full plans still have a better neighbour, and the optimum happens to be one of them. <b>Scoring 148 tells you nothing either.</b> Being stuck is about the <i>neighbours</i>, never about the plan's own number."},

 {kind:"predict", question:"The climber is stuck at 141. What happens if you just let it keep running?",
  code:"for step in range(1000000):\n    candidate, value = best_neighbour(current)\n    if value <= current_value:\n        break\n    ...",
  options:["it eventually escapes","it stops immediately","it loops for ever","it crashes"],
  answer:1, output:"",
  explain:"<b>It stops on the very first pass of the loop.</b> More time cannot help, because the rule itself forbids the only move that would get it out: a step downhill. The fix has to change the <i>rule</i>, not the budget."}
]},

{session:2, id:"B2", short:"Try again", title:"The cheap fix, and why it is not enough", cards:[
 {kind:"idea", tag:"PYTHON", title:"Multistart: climb many times, keep the best",
  points:["If one start lands badly, start again somewhere else and keep the better answer.",
   "This is a <b>for loop around the whole algorithm</b> &mdash; no new ideas needed.",
   "It genuinely helps: one start averages 141.6, fifty starts average 146.6.",
   "But fifty starts cost fifty times as much, and <b>still reach 149 in only 2% of runs</b>."],
  code:"best = -1e9\n\nfor _ in range(n_starts):\n    value = hill_climb(random_plan(rng))\n\n    if value > best:\n        best = value",
  formulas:[["1 start","141.6"],["2 starts","143.1"],["5 starts","144.4"],["10 starts","145.3"],["20 starts","146.0"],["50 starts","146.6"]],
  fhead:["how many climbs","mean value"],
  note:"<b>Look at the shape of that table.</b> Each doubling buys less than the one before. Throwing more restarts at it is paying more and more for less and less.",
  visual:"restarts"},

 {kind:"live", mode:"restarts", title:"Press restart, and watch the gain shrink",
  tasks:["Press <b>One more restart</b> ten times. Watch the red line, which is the best you have kept.",
         "Now press <b>Ten more</b> three times. <b>How much did thirty extra restarts buy you?</b>",
         "Does the red line ever reach the green one?"]},

 {kind:"bug", title:"One word, and multistart stops working",
  code:"best = -1e9\n\nfor _ in range(n_starts):\n    best = hill_climb(random_plan(rng))\n\nprint(best)",
  expected:"the best of the restarts",
  got:"whatever the last restart happened to give",
  line:4,
  cause:"<b>It overwrites instead of comparing.</b> Every pass throws away what came before, so the answer is just the final climb &mdash; and all those other runs were for nothing. You need <code>if value &gt; best:</code> before assigning. The result still looks plausible, which is what makes this one dangerous."}
]},

{session:2, id:"B3", short:"Annealing", title:"Allowing a step downhill", cards:[
 {kind:"photo", photo:"anneal", title:"Annealing is a real thing that real metal does", drawn:true,
  alt:"Hot, cooling and cold metal, with the acceptance rule P = exp(-dE/T) beside it.",
  credit:"",
  notice:"the left column, top to bottom. <b>Hot: the atoms move anywhere. Cold: they are locked in place.</b> Now look right: the ball does the same thing. Early on it is allowed to jump out of a dip. Later it is not. That is the whole algorithm, and the next card writes it in Python. <i>Here too the ball looks for the lowest point; ours looks for the highest.</i>"},

 {kind:"idea", tag:"PYTHON", title:"Sometimes accept a worse plan",
  points:["Hill climbing refuses to ever go down. That is exactly what traps it.",
   "<b>Simulated annealing changes one line:</b> a worse plan is sometimes accepted anyway.",
   "How often depends on <b>how much worse</b> it is, and on a number called the <b>temperature</b>.",
   "The temperature starts high and falls. So the search wanders early and settles later &mdash; and by the end it <i>is</i> hill climbing again."],
  formulas:[["P(accept a worse move)","exp(delta / T)"],["delta","how much worse, a negative number"],["T","the temperature, falling"]],
  fhead:["idea","in Python"],
  note:"<b>The name comes from metal.</b> Cool steel too fast and it sets with flaws locked in; cool it slowly and the atoms have time to settle properly. The analogy is where the name comes from, and nothing more &mdash; the algorithm stands on its own."},

 {kind:"figure", fig:"cool", title:"What the temperature actually does to the program",
  notice:"the start of the red line. Early on, a change that makes the plan <b>4 points worse</b> is accepted 90 times in 100. By the end it is almost never accepted. The algorithm has turned itself back into hill climbing, and nobody wrote an <code>if</code> to do that."},

 {kind:"live", mode:"anneal", title:"The acceptance rule, hot and cold",
  tasks:["Set the move to <b>4 points worse</b> and T to <b>10</b>. What is the probability? (This is exercise 2.3.)",
         "Hold the move at 6 points worse and drag T down to 1. What has the algorithm become?",
         "Drag T up to 100. Is the search still searching, or just wandering?"]},

 {kind:"error", code:"T = 0\ndelta = -4\n\np = math.exp(delta / T)",
  etype:"ZeroDivisionError", msg:"float division by zero", line:4,
  cause:"<b>The temperature can approach zero but must never reach it.</b> Geometric cooling, <code>T = T * alpha</code> with <code>alpha</code> just under 1, never gets there &mdash; which is exactly why it is written that way instead of subtracting a fixed amount each step."},

 {kind:"predict", question:"Same twenty starting plans, both algorithms. What does the comparison look like?",
  code:"hill climbing   mean 141.8   reached 149:  0 of 300\nannealing       mean 148.5   reached 149: 49%",
  options:["annealing is slightly better","annealing is much better and always wins","annealing is better on average",'annealing is worse but faster'],
  answer:2, output:"",
  explain:"<b>Better on average is the honest claim.</b> Annealing averaged 148.5 against 141.8, and found the best plan about half the time &mdash; but its own worst run was 147, not 149. It is a stochastic algorithm: it has good days and bad days, which is precisely why you must run it more than once before believing anything."},

 {kind:"live", mode:"race", title:"Both algorithms, the same starting plan",
  tasks:["Press <b>Step both</b> a few times. Which one stops first, and after how many evaluations?",
         "Press <b>Spend the whole budget</b>. Both have now had 600 evaluations. Who is ahead?",
         "Look at <b>worse moves taken</b>. Annealing climbed down that many times on purpose.",
         "Press <b>Ten times the budget</b>. <b>Hill climbing does not move. Why not?</b>",
         "Press <b>New start</b> and do it again. <b>Does annealing win every single time?</b>"]},

 {kind:"figure", fig:"race", title:"Where 300 climbs and 150 annealings finished",
  notice:"the two piles. The blue pile is wide, and it is in the wrong place. The red pile is narrow, and it sits against the green line. <b>One run of either program tells you nothing.</b> You need the whole pile before you may say which is better."},

 {kind:"table", title:"The two algorithms, side by side",
  rows:[["accepts only better plans","accepts better plans, and sometimes worse ones"],
        ["tries all twenty neighbours, takes the best","tries one neighbour at random"],
        ["the last plan is the best plan","keeps a separate best, because current can get worse"],
        ["no parameters","starting temperature, cooling rate, number of steps"],
        ["mean 141.8, never reached 149","mean 148.5, reached 149 about half the time"],
        ["stops by itself","runs until the step budget is gone"]],
  heads:["hill climbing","simulated annealing"],
  note:"<b>Four of those six rows are the price of the fifth.</b> Annealing is better on average and it costs you three parameters, a longer run, and a result that changes from run to run."}
]},

{session:2, id:"B4", short:"Back to the round", title:"The same fix, on the other problem", cards:[
 {kind:"idea", tag:"IDEA", title:"Nothing about the algorithm changes",
  points:["The round of ten stops has the same trouble: hill climbing stops at a round that no single move improves.",
   "With the <b>swap</b> move it finds the shortest round 41% of the time. With <b>reverse</b>, 76%.",
   "<b>Annealing does not care which problem it is on.</b> Propose a change, score it, accept it with probability <code>exp(delta/T)</code>, cool down.",
   "That is the point of a <i>meta</i>-heuristic: the search strategy is reusable, and only the three problem parts are rewritten."],
  note:"<b>Watch the picture, not the number.</b> On the round you can see the search untangle a crossing, which is the same thing the knapsack search was doing invisibly.",
  visual:"metaloop"},

 {kind:"live", mode:"tsp", anneal:true, title:"Anneal the round",
  tasks:["Press <b>Random round</b>, then <b>Best reverse</b> until it is stuck. Write the length down.",
         "Now press <b>Anneal it</b>. <b>How many longer rounds did it accept on the way?</b>",
         "Do that three times from three random rounds. Does annealing reach 630 m every time?"]},

 {kind:"predict", question:"Which of these would make the biggest difference to how good an answer you get?",
  code:"a. run hill climbing 10 times instead of once\nb. change the move from swap to reverse\nc. buy a computer twice as fast",
  options:["a","b","c","they are about equal"],
  answer:1, output:"swap 41%   reverse 76%",
  explain:"<b>Changing the move nearly doubled the success rate, for free.</b> Ten restarts helps less than that, and a faster computer helps not at all &mdash; hill climbing stops because it is stuck, not because it ran out of time. <b>Design beats hardware.</b>"}
]},

{session:2, id:"B5", short:"Your turn", title:"Your turn, and what is examinable", cards:[
 {kind:"yourturn", minutes:12, notebook:"week11_session2_annealing.ipynb",
  sub:"In Colab, in <code>week11_session2_annealing.ipynb</code>. <b>Start now and finish at home.</b> The first code cell gives you last session's functions, so nobody is blocked. <b>2.5 is the one that matters</b>; 2.7 is the star.",
  chat:"Get to 2.4 before you leave. In 2.7 one of the four cooling rates is much worse than the rest \u2014 work out which before you run it."},

 {kind:"table", title:"What is examinable from Session 2",
  rows:[["A <code>for</code> loop that keeps a running best","The physics of annealing"],
        ["<code>if</code> with two conditions joined by <code>or</code>","Why exp() is the right curve"],
        ["Calling a function you wrote from inside another","Proving convergence"],
        ["Comparing two lists of results","The value 0.9999"],
        ["Reading a <code>ZeroDivisionError</code>","Which algorithm is best in general"],
        ["Knowing why one run proves nothing",""]],
  note:"<b>Next week:</b> instead of improving one plan, keep a whole population of them and let the good ones combine."}
]}
],

summary: [
 ["plan = [1, 0, 1, ...]","one candidate answer, as 0s and 1s"],
 ["plan_value(plan)","the objective: one number saying how good it is"],
 ["flip(plan, i)","one move: change your mind about job i"],
 ["best_neighbour(plan)","the best of the twenty plans one change away"],
 ["hill_climb(start)","keep taking the best change; stop when none helps"],
 ["is_local_optimum(plan)","True when no single change improves it"],
 ["multistart(k, seed)","climb k times, keep the best"],
 ["accept(delta, T, rng)","better always; worse with probability exp(delta/T)"],
 ["T = T * alpha","cooling: explore early, settle later"]
],
summary_title: "Week 11: everything you wrote",
summary_heads: ["you wrote","what it does"],
summary_note: "<b>Nine functions, and not one new piece of Python.</b> Loops, <code>if</code>, functions and lists &mdash; all of it was already yours. What was new this week is the <i>shape</i>: propose a change, score it, decide whether to take it, repeat. <b>To revise:</b> run both notebooks again from a blank page, and make sure you can say in one sentence why hill climbing stops."
};
