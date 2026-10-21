/**
 * The Mathematics problems of the AI Curriculum (frontend data until the backend serves them).
 * Each problem has its own content, and every algorithm in the sidebar has at least one problem.
 */

export const MATH_TOPICS = ["All Topics", "Algebra", "Functions", "Geometry", "Trigonometry", "Calculus", "Statistics"] as const;
export const MATH_LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"] as const;

export const MATH_ALGORITHMS = [
  "Linear Regression",
  "Logistic Regression",
  "Random Forest",
  "Support Vector Machine",
  "AdaBoost",
  "Decision Tree",
  "K-Nearest Neighbors",
  "Gradient Boosting",
  "Neural Network",
  "Naive Bayes",
  "CatBoost",
  "XGBoost",
  "LightGBM",
  "Quadratic Discriminant Analysis",
] as const;

export type MathTopic = Exclude<(typeof MATH_TOPICS)[number], "All Topics">;
export type MathLevel = Exclude<(typeof MATH_LEVELS)[number], "All Levels">;
export type MathAlgorithm = (typeof MATH_ALGORITHMS)[number];

export interface MathProblem {
  id: string;
  title: string;
  formula: string;
  level: MathLevel;
  topic: MathTopic;
  algorithm: MathAlgorithm;
  minutes: number;
  /** What the student will learn (3 points). */
  learn: string[];
  /** The worked solution, one step per line; the last step checks or states the answer. */
  steps: string[];
}

export const MATH_PROBLEMS: MathProblem[] = [
  {
    id: "solve-linear-equation",
    title: "Solve a Linear Equation",
    formula: "2x + 4 = 12",
    level: "Beginner",
    topic: "Algebra",
    algorithm: "Linear Regression",
    minutes: 10,
    learn: ["How to isolate the variable", "Doing the same thing to both sides", "Checking your answer"],
    steps: [
      "Write the equation: 2x + 4 = 12.",
      "Subtract 4 from both sides: 2x = 8.",
      "Divide both sides by 2: x = 4.",
      "Check: 2(4) + 4 = 12. ✓",
    ],
  },
  {
    id: "line-through-two-points",
    title: "Find the Line Through Two Points",
    formula: "y = mx + b",
    level: "Beginner",
    topic: "Algebra",
    algorithm: "Linear Regression",
    minutes: 12,
    learn: ["What the slope m means", "Finding the intercept b", "Writing the equation of a line"],
    steps: [
      "The line passes through (1, 3) and (3, 7).",
      "Slope: m = (7 − 3) / (3 − 1) = 4 / 2 = 2.",
      "Put (1, 3) in y = 2x + b: 3 = 2 + b, so b = 1.",
      "The line is y = 2x + 1. Check (3, 7): 2(3) + 1 = 7. ✓",
    ],
  },
  {
    id: "predict-with-a-line",
    title: "Predict a Value With a Line",
    formula: "y = 2x + 1, x = 5",
    level: "Beginner",
    topic: "Functions",
    algorithm: "Linear Regression",
    minutes: 8,
    learn: ["Reading a function", "Plugging a value into a model", "What a prediction is"],
    steps: [
      "The model is y = 2x + 1.",
      "Replace x with 5: y = 2(5) + 1.",
      "Multiply first: 2(5) = 10.",
      "Add: y = 10 + 1 = 11. The prediction is 11.",
    ],
  },
  {
    id: "least-squares-line",
    title: "Fit a Least Squares Line",
    formula: "m = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²",
    level: "Intermediate",
    topic: "Statistics",
    algorithm: "Linear Regression",
    minutes: 20,
    learn: ["Means of x and y", "The least squares slope", "Finding the best-fit intercept"],
    steps: [
      "Points: (1, 2), (2, 4), (3, 5).",
      "Means: x̄ = 6 / 3 = 2 and ȳ = 11 / 3 ≈ 3.67.",
      "Σ(x − x̄)(y − ȳ) = (−1)(−1.67) + 0 + (1)(1.33) = 3, and Σ(x − x̄)² = 1 + 0 + 1 = 2.",
      "Slope m = 3 / 2 = 1.5; intercept b = ȳ − m·x̄ = 3.67 − 3 ≈ 0.67.",
      "Best-fit line: y = 1.5x + 0.67.",
    ],
  },
  {
    id: "sigmoid-function",
    title: "Compute the Sigmoid Function",
    formula: "σ(z) = 1 / (1 + e⁻ᶻ)",
    level: "Intermediate",
    topic: "Functions",
    algorithm: "Logistic Regression",
    minutes: 12,
    learn: ["What the sigmoid function does", "Why its output is between 0 and 1", "Evaluating e⁻ᶻ"],
    steps: [
      "For z = 0: σ(0) = 1 / (1 + e⁰) = 1 / 2 = 0.5.",
      "For z = 2: e⁻² ≈ 0.135.",
      "σ(2) = 1 / (1 + 0.135) = 1 / 1.135 ≈ 0.88.",
      "Bigger z gives a value closer to 1, and smaller z a value closer to 0.",
    ],
  },
  {
    id: "logistic-decision-boundary",
    title: "Find a Decision Boundary",
    formula: "z = 2x − 4",
    level: "Intermediate",
    topic: "Functions",
    algorithm: "Logistic Regression",
    minutes: 15,
    learn: ["What a decision boundary is", "Probability 0.5 means z = 0", "Classifying a new point"],
    steps: [
      "The model predicts class 1 when σ(z) ≥ 0.5, which happens when z ≥ 0.",
      "Solve 2x − 4 = 0: x = 2. This is the decision boundary.",
      "For x = 3: z = 2(3) − 4 = 2, and σ(2) ≈ 0.88.",
      "0.88 ≥ 0.5, so x = 3 is class 1.",
    ],
  },
  {
    id: "majority-vote",
    title: "Combine Trees by Majority Vote",
    formula: "5 trees: Yes, No, Yes, Yes, No",
    level: "Beginner",
    topic: "Statistics",
    algorithm: "Random Forest",
    minutes: 8,
    learn: ["How a forest combines its trees", "Counting votes", "Turning votes into a probability"],
    steps: [
      "Count the votes: Yes = 3 and No = 2.",
      "The most votes win: the forest predicts Yes.",
      "Share of Yes votes: 3 / 5 = 0.6, so 60% of the trees agree.",
    ],
  },
  {
    id: "distance-to-hyperplane",
    title: "Distance From a Point to a Line",
    formula: "d = |w·x + b| / ‖w‖",
    level: "Advanced",
    topic: "Geometry",
    algorithm: "Support Vector Machine",
    minutes: 20,
    learn: ["The length of a vector", "Distance from a point to a line", "The margin of an SVM"],
    steps: [
      "The line is 3x₁ + 4x₂ − 5 = 0, so w = (3, 4) and b = −5.",
      "Length of w: ‖w‖ = √(3² + 4²) = √25 = 5.",
      "For the point (3, 4): |3·3 + 4·4 − 5| = |9 + 16 − 5| = 20.",
      "Distance d = 20 / 5 = 4.",
      "The SVM margin width is 2 / ‖w‖ = 2 / 5 = 0.4.",
    ],
  },
  {
    id: "adaboost-weight",
    title: "Compute a Classifier's Weight",
    formula: "α = ½ · ln((1 − ε) / ε)",
    level: "Advanced",
    topic: "Statistics",
    algorithm: "AdaBoost",
    minutes: 15,
    learn: ["What the error rate ε means", "Using the natural logarithm", "Why better classifiers get a bigger say"],
    steps: [
      "The classifier's error rate is ε = 0.2.",
      "(1 − ε) / ε = 0.8 / 0.2 = 4.",
      "ln(4) ≈ 1.386.",
      "α = ½ · 1.386 ≈ 0.693. A lower error would give a bigger α.",
    ],
  },
  {
    id: "gini-impurity",
    title: "Measure Gini Impurity",
    formula: "Gini = 1 − Σ pᵢ²",
    level: "Intermediate",
    topic: "Statistics",
    algorithm: "Decision Tree",
    minutes: 12,
    learn: ["Class proportions", "What impurity measures", "How a tree chooses a split"],
    steps: [
      "A node has 6 Yes and 4 No samples (10 in all).",
      "Proportions: p(Yes) = 0.6 and p(No) = 0.4.",
      "Squares: 0.6² = 0.36 and 0.4² = 0.16.",
      "Gini = 1 − (0.36 + 0.16) = 0.48. A pure node would have Gini = 0.",
    ],
  },
  {
    id: "euclidean-distance",
    title: "Find the Distance Between Two Points",
    formula: "d = √((x₂ − x₁)² + (y₂ − y₁)²)",
    level: "Beginner",
    topic: "Geometry",
    algorithm: "K-Nearest Neighbors",
    minutes: 10,
    learn: ["The distance formula", "The Pythagorean theorem", "How KNN finds the nearest neighbours"],
    steps: [
      "The points are (1, 2) and (4, 6).",
      "Differences: 4 − 1 = 3 and 6 − 2 = 4.",
      "Squares: 3² + 4² = 9 + 16 = 25.",
      "d = √25 = 5.",
    ],
  },
  {
    id: "angle-between-vectors",
    title: "Find the Angle Between Two Vectors",
    formula: "cos θ = (a · b) / (‖a‖ ‖b‖)",
    level: "Intermediate",
    topic: "Trigonometry",
    algorithm: "K-Nearest Neighbors",
    minutes: 15,
    learn: ["The dot product", "Cosine similarity", "Finding an angle from its cosine"],
    steps: [
      "The vectors are a = (1, 0) and b = (1, 1).",
      "Dot product: a · b = 1·1 + 0·1 = 1.",
      "Lengths: ‖a‖ = 1 and ‖b‖ = √2.",
      "cos θ = 1 / √2 ≈ 0.707, so θ = 45°.",
    ],
  },
  {
    id: "boosting-residuals",
    title: "Update a Prediction From Residuals",
    formula: "ŷ_new = ŷ + η · r",
    level: "Intermediate",
    topic: "Algebra",
    algorithm: "Gradient Boosting",
    minutes: 15,
    learn: ["What a residual is", "The learning rate η", "How boosting improves step by step"],
    steps: [
      "True values: 10 and 12. The model predicts 11 for both.",
      "Residuals r = true − predicted: −1 and +1.",
      "With learning rate η = 0.1 and a tree that predicts the residuals:",
      "New predictions: 11 + 0.1(−1) = 10.9 and 11 + 0.1(1) = 11.1, both closer to the truth.",
    ],
  },
  {
    id: "neuron-output",
    title: "Compute a Neuron's Output",
    formula: "y = ReLU(w₁x₁ + w₂x₂ + b)",
    level: "Beginner",
    topic: "Algebra",
    algorithm: "Neural Network",
    minutes: 10,
    learn: ["Weights and a bias", "The weighted sum", "The ReLU activation"],
    steps: [
      "Inputs x = (4, 1), weights w = (0.5, −1) and bias b = 1.",
      "Weighted sum: 0.5·4 + (−1)·1 + 1 = 2 − 1 + 1 = 2.",
      "ReLU keeps positive values and turns negative ones into 0.",
      "Output: ReLU(2) = 2.",
    ],
  },
  {
    id: "gradient-descent-step",
    title: "Take a Gradient Descent Step",
    formula: "w_new = w − η · f′(w)",
    level: "Intermediate",
    topic: "Calculus",
    algorithm: "Neural Network",
    minutes: 15,
    learn: ["The derivative as a slope", "The learning rate η", "Moving towards a minimum"],
    steps: [
      "The loss is f(w) = w², so its derivative is f′(w) = 2w.",
      "At w = 3: f′(3) = 6.",
      "With η = 0.1: w_new = 3 − 0.1·6 = 2.4.",
      "The loss drops from 9 to 2.4² = 5.76, closer to the minimum at w = 0.",
    ],
  },
  {
    id: "bayes-rule",
    title: "Apply Bayes' Rule",
    formula: "P(A|B) = P(B|A) · P(A) / P(B)",
    level: "Intermediate",
    topic: "Statistics",
    algorithm: "Naive Bayes",
    minutes: 15,
    learn: ["Conditional probability", "Bayes' rule", "How a spam filter decides"],
    steps: [
      "P(spam) = 0.3, P(word | spam) = 0.6 and P(word) = 0.25.",
      "Multiply: P(word | spam) · P(spam) = 0.6 · 0.3 = 0.18.",
      "Divide by P(word): 0.18 / 0.25 = 0.72.",
      "An email with this word is spam with probability 0.72.",
    ],
  },
  {
    id: "ordered-target-statistic",
    title: "Encode a Category With Target Statistics",
    formula: "(Σ previous targets + a·p) / (n + a)",
    level: "Advanced",
    topic: "Statistics",
    algorithm: "CatBoost",
    minutes: 20,
    learn: ["Turning a category into a number", "The prior p and its weight a", "Why only previous rows are used"],
    steps: [
      "Earlier rows with the category \"red\" have targets 1, 0 and 1 (n = 3, sum = 2).",
      "The prior is p = 0.5 with weight a = 1.",
      "Numerator: 2 + 1·0.5 = 2.5. Denominator: 3 + 1 = 4.",
      "Encoding: 2.5 / 4 = 0.625.",
    ],
  },
  {
    id: "optimal-leaf-weight",
    title: "Find the Optimal Leaf Weight",
    formula: "w* = −G / (H + λ)",
    level: "Advanced",
    topic: "Calculus",
    algorithm: "XGBoost",
    minutes: 20,
    learn: ["Gradients G and Hessians H", "Regularisation with λ", "Why the best weight minimises the loss"],
    steps: [
      "In the leaf, the sum of gradients is G = −4 and the sum of Hessians is H = 6.",
      "The regularisation is λ = 2, so H + λ = 8.",
      "w* = −(−4) / 8 = 0.5.",
      "A bigger λ would pull the weight closer to 0.",
    ],
  },
  {
    id: "histogram-bins",
    title: "Put Values Into Histogram Bins",
    formula: "bin = ⌊x / width⌋",
    level: "Beginner",
    topic: "Statistics",
    algorithm: "LightGBM",
    minutes: 10,
    learn: ["What a histogram bin is", "The floor function ⌊ ⌋", "Why binning makes training faster"],
    steps: [
      "Values from 0 to 100 are split into bins of width 10.",
      "For x = 37: 37 / 10 = 3.7.",
      "Floor: ⌊3.7⌋ = 3, so 37 goes in bin 3 (from 30 to 40).",
      "LightGBM then looks at 10 bins instead of every value.",
    ],
  },
  {
    id: "class-variance",
    title: "Compute a Class's Variance",
    formula: "σ² = Σ(x − μ)² / n",
    level: "Advanced",
    topic: "Statistics",
    algorithm: "Quadratic Discriminant Analysis",
    minutes: 15,
    learn: ["The mean of a class", "Variance as spread", "Why QDA keeps a variance for each class"],
    steps: [
      "A class has the values 2, 4 and 6.",
      "Mean: μ = (2 + 4 + 6) / 3 = 4.",
      "Squared differences: (2 − 4)² + (4 − 4)² + (6 − 4)² = 4 + 0 + 4 = 8.",
      "Variance: σ² = 8 / 3 ≈ 2.67. QDA uses a different variance for each class.",
    ],
  },
];

export const getMathProblem = (id: string) => MATH_PROBLEMS.find((p) => p.id === id);

/** Up to 3 other problems: the same algorithm first, then the same topic. */
export function relatedMathProblems(problem: MathProblem): MathProblem[] {
  const others = MATH_PROBLEMS.filter((p) => p.id !== problem.id);
  const sameAlgorithm = others.filter((p) => p.algorithm === problem.algorithm);
  const sameTopic = others.filter((p) => p.algorithm !== problem.algorithm && p.topic === problem.topic);
  return [...sameAlgorithm, ...sameTopic].slice(0, 3);
}
