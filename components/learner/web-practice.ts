import { tk } from "@/lib/i18n/translate";

/**
 * Practice for the web lessons that have no JavaScript Try it (HTML, CSS, Bootstrap, Tailwind):
 * the student edits a page, sees it live, and the checks read the page they wrote.
 */
export type WebCheck = { label: string; pass: (doc: Document, css: string) => boolean };

export type WebPractice = {
  task: string;
  starter: string;
  /** Loaded in the preview before the student's code. */
  kit?: "bootstrap" | "tailwind";
  checks: WebCheck[];
};

const has = (doc: Document, selector: string) => !!doc.querySelector(selector);
const count = (doc: Document, selector: string) => doc.querySelectorAll(selector).length;

/** The declarations of the first CSS rule whose selector list contains `selector`. */
function rule(css: string, selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|[},\\s])${esc}\\s*(?:,[^{]*)?\\{([^}]*)\\}`, "i"));
  return m ? m[1].toLowerCase() : "";
}

const classes = (doc: Document) =>
  Array.from(doc.querySelectorAll("[class]")).flatMap((el) => (el.getAttribute("class") ?? "").split(/\s+/));

const PRACTICE: Record<string, WebPractice> = {
  "Elements and tags": {
    task: tk("Build a tiny profile page: a main heading with your name and a paragraph about you."),
    starter: "<!-- Write your HTML here -->\n\n",
    checks: [
      { label: tk("Add an <h1> heading"), pass: (d) => !!d.querySelector("h1")?.textContent?.trim() },
      { label: tk("Add a <p> paragraph"), pass: (d) => !!d.querySelector("p")?.textContent?.trim() },
    ],
  },
  "Links, images and lists": {
    task: tk("Make a list of your 3 favourite websites, each one a link."),
    starter: "<h2>My favourite sites</h2>\n\n<!-- Add a <ul> with 3 links -->\n",
    checks: [
      { label: tk("Add a <ul> list"), pass: (d) => has(d, "ul") },
      { label: tk("Put 3 items <li> in the list"), pass: (d) => count(d, "ul > li") >= 3 },
      { label: tk("Each item has a link <a href>"), pass: (d) => count(d, "ul > li a[href]") >= 3 },
    ],
  },
  "Forms and semantic HTML": {
    task: tk("Inside a <main>, build a sign-up form with a labelled email field and a submit button."),
    starter: "<main>\n  <!-- Your form here -->\n</main>\n",
    checks: [
      { label: tk("Use a <main> element"), pass: (d) => has(d, "main") },
      { label: tk("Add a <form> inside <main>"), pass: (d) => has(d, "main form") },
      { label: tk("Add an email <input type=\"email\">"), pass: (d) => has(d, 'form input[type="email"]') },
      { label: tk("Give the field a <label>"), pass: (d) => has(d, "form label") },
      { label: tk("Add a submit <button>"), pass: (d) => has(d, "form button") },
    ],
  },
  "Selectors and colours": {
    task: tk("Colour every paragraph, and give the .note class a background colour."),
    starter:
      "<style>\n  /* Write your CSS here */\n\n</style>\n\n<p>A normal paragraph.</p>\n<p class=\"note\">An important note.</p>\n",
    checks: [
      { label: tk("Give p a color"), pass: (_, css) => /(^|;|\s)color\s*:/.test(rule(css, "p")) },
      { label: tk("Give .note a background"), pass: (_, css) => /background(-color)?\s*:/.test(rule(css, ".note")) },
    ],
  },
  "The box model": {
    task: tk("Turn the .card into a real card: add padding, a border and a margin."),
    starter: "<style>\n  .card {\n\n  }\n</style>\n\n<div class=\"card\">I am a card.</div>\n",
    checks: [
      { label: tk("Add padding to .card"), pass: (_, css) => /padding/.test(rule(css, ".card")) },
      { label: tk("Add a border to .card"), pass: (_, css) => /border(-\w+)?\s*:/.test(rule(css, ".card")) },
      { label: tk("Add a margin to .card"), pass: (_, css) => /margin/.test(rule(css, ".card")) },
    ],
  },
  "Flexbox and responsive design": {
    task: tk("Place the three boxes in one row with flexbox, with a gap between them."),
    starter:
      "<style>\n  .row {\n\n  }\n  .box { background: #12939b; color: white; padding: 16px; }\n</style>\n\n<div class=\"row\">\n  <div class=\"box\">1</div>\n  <div class=\"box\">2</div>\n  <div class=\"box\">3</div>\n</div>\n",
    checks: [
      { label: tk("Set .row to display: flex"), pass: (_, css) => /display\s*:\s*flex/.test(rule(css, ".row")) },
      { label: tk("Add a gap to .row"), pass: (_, css) => /gap\s*:/.test(rule(css, ".row")) },
    ],
  },
  "Classes and components": {
    kit: "bootstrap",
    task: tk("Use Bootstrap classes to add a blue primary button and an alert box."),
    starter: "<div class=\"container py-3\">\n  <!-- Add a button and an alert -->\n\n</div>\n",
    checks: [
      { label: tk("Add a button with btn btn-primary"), pass: (d) => has(d, ".btn.btn-primary") },
      { label: tk("Add an alert (alert alert-…)"), pass: (d) => classes(d).some((c) => /^alert-\w+/.test(c)) && has(d, ".alert") },
    ],
  },
  "The grid system": {
    kit: "bootstrap",
    task: tk("Make a row with three equal columns that sit side by side on medium screens."),
    starter: "<div class=\"container py-3\">\n  <!-- A .row with 3 .col-md-4 -->\n\n</div>\n",
    checks: [
      { label: tk("Add a .row"), pass: (d) => has(d, ".row") },
      { label: tk("Put 3 .col-md-4 columns in it"), pass: (d) => count(d, ".row > .col-md-4") >= 3 },
    ],
  },
  "Utilities and customising": {
    kit: "bootstrap",
    task: tk("Without writing CSS, centre the text and add spacing with Bootstrap utilities."),
    starter: "<div class=\"container\">\n  <h2>Welcome</h2>\n  <p>Style me with utility classes.</p>\n</div>\n",
    checks: [
      { label: tk("Use text-center"), pass: (d) => has(d, ".text-center") },
      { label: tk("Use a spacing class like mt-3 or p-4"), pass: (d) => classes(d).some((c) => /^[mp][tbsexy]?-\d$/.test(c)) },
    ],
  },
  "Utility classes": {
    kit: "tailwind",
    task: tk("Style the button with Tailwind: a background colour, white text, padding and rounded corners."),
    starter: "<div class=\"p-6\">\n  <button class=\"\">Start learning</button>\n</div>\n",
    checks: [
      { label: tk("A background like bg-teal-600"), pass: (d) => classes(d).some((c) => /^bg-\w+-\d{2,3}$/.test(c)) },
      { label: tk("White text: text-white"), pass: (d) => has(d, ".text-white") },
      { label: tk("Padding like px-4 py-2"), pass: (d) => classes(d).some((c) => /^p[xy]?-\d+$/.test(c) && c !== "p-6") },
      { label: tk("Rounded corners: rounded…"), pass: (d) => classes(d).some((c) => /^rounded/.test(c)) },
    ],
  },
  "Responsive and states": {
    kit: "tailwind",
    task: tk("Make the card change colour on hover and get bigger text on medium screens."),
    starter: "<div class=\"p-6\">\n  <div class=\"rounded-xl bg-sky-100 p-4\">\n    Hover me and resize the window\n  </div>\n</div>\n",
    checks: [
      { label: tk("A hover: class, like hover:bg-sky-200"), pass: (d) => classes(d).some((c) => c.startsWith("hover:")) },
      { label: tk("A md: class, like md:text-2xl"), pass: (d) => classes(d).some((c) => c.startsWith("md:")) },
    ],
  },
  "Theme and components": {
    kit: "tailwind",
    task: tk("Add a brand colour to the Tailwind theme and use it as bg-brand."),
    starter:
      "<script>\n  tailwind.config = {\n    theme: {\n      extend: {\n        colors: {\n          // brand: \"#12939b\",\n        },\n      },\n    },\n  };\n</script>\n\n<div class=\"p-6\">\n  <button class=\"rounded-lg px-4 py-2 text-white\">Brand button</button>\n</div>\n",
    checks: [
      {
        label: tk("Define brand in tailwind.config"),
        pass: (d) => Array.from(d.querySelectorAll("script")).some((s) => /^\s*brand\s*:/m.test(s.textContent ?? "")),
      },
      { label: tk("Use bg-brand"), pass: (d) => has(d, ".bg-brand") },
    ],
  },
};

export const webPractice = (lessonTitle: string): WebPractice | null => PRACTICE[lessonTitle] ?? null;

const KITS = {
  bootstrap: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">',
  tailwind: '<script src="https://cdn.tailwindcss.com/3.4.16"></script>',
} as const;

/** The page shown in the live preview. */
export function previewDoc(practice: WebPractice, source: string): string {
  const kit = practice.kit ? KITS[practice.kit] : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${kit}<style>body{font-family:system-ui,sans-serif;margin:12px;color:#14365a}</style></head><body>${source}</body></html>`;
}

/** Runs the checks of a web practice on the student's code. */
export function checkWeb(practice: WebPractice, source: string) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  const css = Array.from(doc.querySelectorAll("style"))
    .map((s) => s.textContent ?? "")
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  return practice.checks.map((c) => ({ label: c.label, pass: c.pass(doc, css) }));
}
