/**
 * "Try it Yourself" for every Mathematics problem: sliders for the problem's numbers, the answer worked out live,
 * and the same calculation in Python (the Code button). Keyed by the problem id of lib/math-problems.ts.
 */
import { tk } from "@/lib/i18n/translate";

export interface SimInput {
  key: string;
  /** A math symbol or a short English label (translated with t()). */
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface SimOutput {
  /** English, translated with t(). */
  label: string;
  value: string;
}

export interface MathSim {
  inputs: SimInput[];
  outputs: (v: Record<string, number>) => SimOutput[];
  /** A Python version of the calculation, with the problem's own numbers. */
  code: string;
}

const n = (x: number, digits = 3) => (Number.isFinite(x) ? String(Number(x.toFixed(digits))) : "—");
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const input = (key: string, label: string, value: number, min: number, max: number, step = 1): SimInput => ({ key, label, value, min, max, step });

export const MATH_SIMS: Record<string, MathSim> = {
  "solve-linear-equation": {
    inputs: [input("a", "a", 2, 1, 10), input("b", "b", 4, -10, 10), input("c", "c", 12, -20, 30)],
    outputs: ({ a, b, c }) => [
      { label: tk("Equation"), value: `${a}x + ${b} = ${c}` },
      { label: tk("Subtract b"), value: `${a}x = ${n(c - b)}` },
      { label: tk("Answer"), value: `x = ${n((c - b) / a)}` },
    ],
    code: `a, b, c = 2, 4, 12          # a*x + b = c
x = (c - b) / a
print("x =", x)             # x = 4.0
print(a * x + b == c)       # True`,
  },
  "line-through-two-points": {
    inputs: [input("x1", "x₁", 1, -5, 5), input("y1", "y₁", 3, -10, 10), input("x2", "x₂", 3, -5, 5), input("y2", "y₂", 7, -10, 10)],
    outputs: ({ x1, y1, x2, y2 }) => {
      const m = (y2 - y1) / (x2 - x1);
      return [
        { label: tk("Slope m"), value: x1 === x2 ? tk("Undefined (vertical line)") : n(m) },
        { label: tk("Intercept b"), value: x1 === x2 ? "—" : n(y1 - m * x1) },
        { label: tk("Line"), value: x1 === x2 ? `x = ${x1}` : `y = ${n(m)}x + ${n(y1 - m * x1)}` },
      ];
    },
    code: `x1, y1 = 1, 3
x2, y2 = 3, 7
m = (y2 - y1) / (x2 - x1)   # slope
b = y1 - m * x1             # intercept
print(f"y = {m}x + {b}")    # y = 2.0x + 1.0`,
  },
  "predict-with-a-line": {
    inputs: [input("m", "m", 2, -5, 5, 0.5), input("b", "b", 1, -10, 10), input("x", "x", 5, -10, 10)],
    outputs: ({ m, b, x }) => [
      { label: tk("Model"), value: `y = ${m}x + ${b}` },
      { label: tk("Prediction"), value: `y = ${n(m * x + b)}` },
    ],
    code: `def predict(x, m=2, b=1):
    return m * x + b

print(predict(5))           # 11`,
  },
  "least-squares-line": {
    inputs: [input("y1", "y at x = 1", 2, 0, 10, 0.5), input("y2", "y at x = 2", 4, 0, 10, 0.5), input("y3", "y at x = 3", 5, 0, 10, 0.5)],
    outputs: ({ y1, y2, y3 }) => {
      const xs = [1, 2, 3];
      const ys = [y1, y2, y3];
      const mx = 2;
      const my = (y1 + y2 + y3) / 3;
      const m = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
      return [
        { label: tk("Mean of y"), value: n(my) },
        { label: tk("Slope m"), value: n(m) },
        { label: tk("Best-fit line"), value: `y = ${n(m)}x + ${n(my - m * mx)}` },
      ];
    },
    code: `xs = [1, 2, 3]
ys = [2, 4, 5]
mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
m = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
b = my - m * mx
print(f"y = {m:.2f}x + {b:.2f}")   # y = 1.50x + 0.67`,
  },
  "sigmoid-function": {
    inputs: [input("z", "z", 2, -8, 8, 0.5)],
    outputs: ({ z }) => [
      { label: "e⁻ᶻ", value: n(Math.exp(-z)) },
      { label: "σ(z)", value: n(sigmoid(z)) },
    ],
    code: `import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

print(sigmoid(0))           # 0.5
print(round(sigmoid(2), 2)) # 0.88`,
  },
  "logistic-decision-boundary": {
    inputs: [input("w", "w", 2, 0.5, 5, 0.5), input("b", "b", -4, -10, 10), input("x", "x", 3, -5, 10, 0.5)],
    outputs: ({ w, b, x }) => {
      const z = w * x + b;
      return [
        { label: tk("Decision boundary"), value: `x = ${n(-b / w)}` },
        { label: "z", value: n(z) },
        { label: "σ(z)", value: n(sigmoid(z)) },
        { label: tk("Class"), value: sigmoid(z) >= 0.5 ? "1" : "0" },
      ];
    },
    code: `import math

w, b = 2, -4
boundary = -b / w                       # x = 2.0
x = 3
p = 1 / (1 + math.exp(-(w * x + b)))
print(boundary, round(p, 2), int(p >= 0.5))   # 2.0 0.88 1`,
  },
  "majority-vote": {
    inputs: [input("yes", "Trees voting Yes", 3, 0, 9), input("no", "Trees voting No", 2, 0, 9)],
    outputs: ({ yes, no }) => [
      { label: tk("Forest prediction"), value: yes === no ? tk("Tie") : yes > no ? tk("Yes") : tk("No") },
      { label: tk("Share of Yes votes"), value: yes + no ? `${n((yes / (yes + no)) * 100, 1)}%` : "—" },
    ],
    code: `from collections import Counter

votes = ["Yes", "No", "Yes", "Yes", "No"]
winner, count = Counter(votes).most_common(1)[0]
print(winner, count / len(votes))   # Yes 0.6`,
  },
  "distance-to-hyperplane": {
    inputs: [input("w1", "w₁", 3, -5, 5), input("w2", "w₂", 4, -5, 5), input("b", "b", -5, -10, 10), input("x1", "x₁", 3, -5, 5), input("x2", "x₂", 4, -5, 5)],
    outputs: ({ w1, w2, b, x1, x2 }) => {
      const norm = Math.hypot(w1, w2);
      return [
        { label: "‖w‖", value: n(norm) },
        { label: tk("Distance d"), value: norm ? n(Math.abs(w1 * x1 + w2 * x2 + b) / norm) : "—" },
        { label: tk("Margin width"), value: norm ? n(2 / norm) : "—" },
      ];
    },
    code: `import math

w, b = (3, 4), -5
x = (3, 4)
norm = math.hypot(*w)
d = abs(w[0] * x[0] + w[1] * x[1] + b) / norm
print(d, 2 / norm)          # 4.0 0.4`,
  },
  "adaboost-weight": {
    inputs: [input("e", "ε", 0.2, 0.01, 0.99, 0.01)],
    outputs: ({ e }) => [
      { label: "(1 − ε) / ε", value: n((1 - e) / e) },
      { label: "α", value: n(0.5 * Math.log((1 - e) / e)) },
    ],
    code: `import math

eps = 0.2
alpha = 0.5 * math.log((1 - eps) / eps)
print(round(alpha, 3))      # 0.693`,
  },
  "gini-impurity": {
    inputs: [input("yes", "Yes samples", 6, 0, 20), input("no", "No samples", 4, 0, 20)],
    outputs: ({ yes, no }) => {
      const total = yes + no;
      if (!total) return [{ label: "Gini", value: "—" }];
      const p = yes / total;
      return [
        { label: "p(Yes)", value: n(p) },
        { label: "p(No)", value: n(1 - p) },
        { label: "Gini", value: n(1 - p * p - (1 - p) * (1 - p)) },
      ];
    },
    code: `def gini(counts):
    total = sum(counts)
    return 1 - sum((c / total) ** 2 for c in counts)

print(gini([6, 4]))         # 0.48`,
  },
  "euclidean-distance": {
    inputs: [input("x1", "x₁", 1, -10, 10), input("y1", "y₁", 2, -10, 10), input("x2", "x₂", 4, -10, 10), input("y2", "y₂", 6, -10, 10)],
    outputs: ({ x1, y1, x2, y2 }) => [
      { label: tk("Differences"), value: `${x2 - x1}, ${y2 - y1}` },
      { label: "d", value: n(Math.hypot(x2 - x1, y2 - y1)) },
    ],
    code: `import math

p, q = (1, 2), (4, 6)
print(math.dist(p, q))      # 5.0`,
  },
  "angle-between-vectors": {
    inputs: [input("a1", "a₁", 1, -5, 5), input("a2", "a₂", 0, -5, 5), input("b1", "b₁", 1, -5, 5), input("b2", "b₂", 1, -5, 5)],
    outputs: ({ a1, a2, b1, b2 }) => {
      const dot = a1 * b1 + a2 * b2;
      const len = Math.hypot(a1, a2) * Math.hypot(b1, b2);
      const cos = len ? Math.max(-1, Math.min(1, dot / len)) : NaN;
      return [
        { label: "a · b", value: n(dot) },
        { label: "cos θ", value: n(cos) },
        { label: "θ", value: Number.isFinite(cos) ? `${n((Math.acos(cos) * 180) / Math.PI, 1)}°` : "—" },
      ];
    },
    code: `import math

a, b = (1, 0), (1, 1)
dot = a[0] * b[0] + a[1] * b[1]
cos = dot / (math.hypot(*a) * math.hypot(*b))
print(round(math.degrees(math.acos(cos))))   # 45`,
  },
  "boosting-residuals": {
    inputs: [input("y", "True value", 10, 0, 20, 0.5), input("p", "Prediction ŷ", 11, 0, 20, 0.5), input("eta", "η", 0.1, 0.05, 1, 0.05)],
    outputs: ({ y, p, eta }) => [
      { label: tk("Residual r"), value: n(y - p) },
      { label: tk("New prediction"), value: n(p + eta * (y - p)) },
    ],
    code: `y_true = [10, 12]
y_pred = [11, 11]
eta = 0.1
residuals = [t - p for t, p in zip(y_true, y_pred)]   # [-1, 1]
y_new = [p + eta * r for p, r in zip(y_pred, residuals)]
print(y_new)                # [10.9, 11.1]`,
  },
  "neuron-output": {
    inputs: [input("x1", "x₁", 4, -5, 5), input("x2", "x₂", 1, -5, 5), input("w1", "w₁", 0.5, -2, 2, 0.5), input("w2", "w₂", -1, -2, 2, 0.5), input("b", "b", 1, -5, 5)],
    outputs: ({ x1, x2, w1, w2, b }) => {
      const sum = w1 * x1 + w2 * x2 + b;
      return [
        { label: tk("Weighted sum"), value: n(sum) },
        { label: "ReLU", value: n(Math.max(0, sum)) },
      ];
    },
    code: `x = [4, 1]
w = [0.5, -1]
b = 1
z = sum(wi * xi for wi, xi in zip(w, x)) + b
print(max(0, z))            # 2.0`,
  },
  "gradient-descent-step": {
    inputs: [input("w", "w", 3, -5, 5, 0.5), input("eta", "η", 0.1, 0.05, 1, 0.05)],
    outputs: ({ w, eta }) => {
      const next = w - eta * 2 * w;
      return [
        { label: "f′(w)", value: n(2 * w) },
        { label: tk("New w"), value: n(next) },
        { label: tk("Loss before → after"), value: `${n(w * w)} → ${n(next * next)}` },
      ];
    },
    code: `def grad(w):
    return 2 * w            # derivative of w**2

w, eta = 3, 0.1
for step in range(5):
    w = w - eta * grad(w)
    print(step + 1, round(w, 3), round(w ** 2, 3))`,
  },
  "bayes-rule": {
    inputs: [input("pa", "P(spam)", 0.3, 0.01, 0.99, 0.01), input("pba", "P(word | spam)", 0.6, 0.01, 1, 0.01), input("pb", "P(word)", 0.25, 0.01, 1, 0.01)],
    outputs: ({ pa, pba, pb }) => [
      { label: "P(word | spam) · P(spam)", value: n(pba * pa) },
      { label: "P(spam | word)", value: pba * pa > pb ? tk("More than 1: P(word) is too small") : n((pba * pa) / pb) },
    ],
    code: `p_spam = 0.3
p_word_given_spam = 0.6
p_word = 0.25
print(p_word_given_spam * p_spam / p_word)   # 0.72`,
  },
  "ordered-target-statistic": {
    inputs: [input("sum", "Sum of earlier targets", 2, 0, 10), input("count", "Earlier rows n", 3, 0, 10), input("a", "a", 1, 0, 5, 0.5), input("p", "p", 0.5, 0, 1, 0.05)],
    outputs: ({ sum, count, a, p }) => [
      { label: tk("Numerator"), value: n(sum + a * p) },
      { label: tk("Denominator"), value: n(count + a) },
      { label: tk("Encoding"), value: count + a ? n((sum + a * p) / (count + a)) : "—" },
    ],
    code: `targets = [1, 0, 1]         # earlier rows with "red"
a, prior = 1, 0.5
encoding = (sum(targets) + a * prior) / (len(targets) + a)
print(encoding)             # 0.625`,
  },
  "optimal-leaf-weight": {
    inputs: [input("g", "G", -4, -10, 10), input("h", "H", 6, 0, 20), input("l", "λ", 2, 0, 10)],
    outputs: ({ g, h, l }) => [
      { label: "H + λ", value: n(h + l) },
      { label: "w*", value: h + l ? n(-g / (h + l)) : "—" },
    ],
    code: `G, H, lam = -4, 6, 2
w_star = -G / (H + lam)
print(w_star)               # 0.5`,
  },
  "histogram-bins": {
    inputs: [input("x", "x", 37, 0, 100), input("width", "Bin width", 10, 1, 50)],
    outputs: ({ x, width }) => {
      const bin = Math.floor(x / width);
      return [
        { label: "x / width", value: n(x / width) },
        { label: tk("Bin"), value: String(bin) },
        { label: tk("Range"), value: `${bin * width} – ${(bin + 1) * width}` },
      ];
    },
    code: `values = [3, 37, 42, 58, 91]
width = 10
bins = [x // width for x in values]
print(bins)                 # [0, 3, 4, 5, 9]`,
  },
  "class-variance": {
    inputs: [input("v1", "x₁", 2, 0, 10), input("v2", "x₂", 4, 0, 10), input("v3", "x₃", 6, 0, 10)],
    outputs: ({ v1, v2, v3 }) => {
      const mean = (v1 + v2 + v3) / 3;
      const sq = [v1, v2, v3].reduce((s, v) => s + (v - mean) ** 2, 0);
      return [
        { label: "μ", value: n(mean) },
        { label: "Σ(x − μ)²", value: n(sq) },
        { label: "σ²", value: n(sq / 3) },
      ];
    },
    code: `values = [2, 4, 6]
mu = sum(values) / len(values)
var = sum((x - mu) ** 2 for x in values) / len(values)
print(mu, round(var, 2))    # 4.0 2.67`,
  },
};
