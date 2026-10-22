import { tNow } from "@/lib/i18n/translate";

export type Run = { output: string[]; error: string | null };

/** Prints of console.log, posted back by the worker; anything the code does stays inside it. */
const WORKER = `
const show = (v) => typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
onmessage = (e) => {
  const output = [];
  const print = (...args) => output.push(args.map(show).join(" "));
  console.log = print; console.info = print; console.warn = print; console.error = print;
  try { new Function(e.data)(); postMessage({ output, error: null }); }
  catch (err) { postMessage({ output, error: String(err) }); }
};`;

const TIME_LIMIT_MS = 2000;

/** Runs the student's JavaScript in a Web Worker in the browser (FR-LRN-05): nothing runs on the server. */
export function runCode(code: string): Promise<Run> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
    const worker = new Worker(url);
    const done = (run: Run) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(run);
    };
    const timer = setTimeout(
      () => done({ output: [], error: tNow("Your code took too long to finish. Check for a loop that never ends.") }),
      TIME_LIMIT_MS
    );
    worker.onmessage = (e: MessageEvent<Run>) => done(e.data);
    worker.onerror = (e) => {
      e.preventDefault();
      done({ output: [], error: e.message || tNow("Your code has an error.") });
    };
    worker.postMessage(code);
  });
}

/** True when the printed lines are exactly the expected output. */
export const sameOutput = (output: string[], expected: string) => output.join("\n").trim() === expected.trim();
