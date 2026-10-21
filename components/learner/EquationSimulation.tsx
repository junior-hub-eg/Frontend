"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

const f = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const primaryBtn =
  "rounded-[0.8em] bg-[#12939b] px-[1.2em] py-[0.7em] text-[0.85em] font-semibold text-white transition hover:bg-[#0f7a81] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12939b]";
const ghostBtn =
  "flex items-center gap-[0.4em] rounded-[0.8em] border border-[#c9d3df] px-[1.2em] py-[0.7em] text-[0.85em] font-semibold text-[#14365a] transition hover:bg-[#f3f6f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12939b]";

/**
 * "Try it Yourself" for a linear equation a·x + b = c:
 * a balance scale you tilt with a slider, and a step-by-step solver.
 */
export default function EquationSimulation({ a = 2, b = 4, c = 12 }: { a?: number; b?: number; c?: number }) {
  const [x, setX] = useState(0);
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  const lhs = a * x + b;
  const diff = lhs - c;
  const balanced = Math.abs(diff) < 1e-9;
  // Left side heavier -> the left pan goes down (counter-clockwise).
  const angle = -Math.max(-14, Math.min(14, diff * 1.2));
  const solution = (c - b) / a;
  const panColor = balanced ? "#1f9d55" : "#12939b";

  const equation = [`${a}x + ${b} = ${c}`, `${a}x = ${f(c - b)}`, `x = ${f(solution)}`][stage];

  const Pan = ({ cx, label }: { cx: number; label: string }) => (
    <g transform={`translate(${cx} 40) rotate(${-angle})`}>
      <path d="M0 0 L-30 62 M0 0 L30 62" stroke="#14365a" strokeWidth="2" fill="none" />
      <rect x="-38" y="62" width="76" height="9" rx="4.5" fill={panColor} />
      <text x="0" y="90" textAnchor="middle" fontSize="15" fontWeight="700" fill="#14365a">
        {label}
      </text>
    </g>
  );

  return (
    <section aria-label="Equation balance simulation" className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
      <div className="grid gap-[1.8em] lg:grid-cols-[1.2fr_1fr]">
        {/* Balance */}
        <div>
          <h2 className="text-[1em] font-bold text-[#14365a]">Balance the equation</h2>
          <p className="mt-[0.3em] text-[0.8em] text-[#14365a]/70">
            Move the slider to try values for x until both sides are equal.
          </p>

          <svg
            viewBox="0 0 300 160"
            role="img"
            aria-label={`Balance scale: left side ${f(lhs)}, right side ${c}`}
            className="mx-auto mt-[0.8em] w-full max-w-[28em]"
          >
            <path d="M150 40 V140 M110 140 H190" stroke="#14365a" strokeWidth="5" strokeLinecap="round" fill="none" />
            <g transform={`rotate(${angle} 150 40)`} style={{ transition: "transform 0.35s ease" }}>
              <line x1="40" y1="40" x2="260" y2="40" stroke="#14365a" strokeWidth="5" strokeLinecap="round" />
              <Pan cx={40} label={f(lhs)} />
              <Pan cx={260} label={String(c)} />
            </g>
            <circle cx="150" cy="40" r="6" fill={panColor} />
          </svg>

          <label className="mt-[0.8em] block text-[0.85em] font-semibold text-[#14365a]">
            x = <span className="tabular-nums">{f(x)}</span>
            <input
              type="range"
              min={-10}
              max={10}
              step={0.5}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="mt-[0.4em] block w-full accent-[#12939b]"
            />
          </label>

          <p className="mt-[0.5em] text-[0.8em] tabular-nums text-[#14365a]">
            Left side: {a}({f(x)}) + {b} = {f(lhs)} &nbsp;|&nbsp; Right side: {c}
          </p>

          <p
            role="status"
            className={`mt-[0.8em] rounded-[0.8em] px-[1em] py-[0.7em] text-[0.85em] font-medium ${
              balanced ? "bg-[#d5f2de] text-[#1f7a45]" : "bg-[#f3f8fb] text-[#14365a]"
            }`}
          >
            {balanced
              ? `Balanced! x = ${f(x)} makes both sides equal.`
              : `The left side is ${diff > 0 ? "heavier" : "lighter"}. Try a ${diff > 0 ? "smaller" : "bigger"} x.`}
          </p>
        </div>

        {/* Step by step */}
        <div>
          <h2 className="text-[1em] font-bold text-[#14365a]">Solve it step by step</h2>
          <p className="mt-[0.3em] text-[0.8em] text-[#14365a]/70">
            Do the same thing to both sides until x is alone.
          </p>

          <p className="mt-[0.8em] rounded-[0.9em] bg-[#f3f8fb] px-[1em] py-[1em] text-center font-serif text-[1.6em] text-[#14365a]">
            {equation}
          </p>

          <div className="mt-[0.9em] flex flex-wrap items-center gap-[0.6em]">
            {stage === 0 && (
              <button type="button" onClick={() => setStage(1)} className={primaryBtn}>
                Subtract {b} from both sides
              </button>
            )}
            {stage === 1 && (
              <button type="button" onClick={() => setStage(2)} className={primaryBtn}>
                Divide both sides by {a}
              </button>
            )}
            {stage === 2 && (
              <>
                <p className="flex items-center gap-[0.5em] text-[0.85em] font-semibold text-[#1f7a45]">
                  <span className="grid h-[1.6em] w-[1.6em] place-items-center rounded-full bg-[#12939b] text-white">
                    <Check className="h-[1em] w-[1em]" strokeWidth={3} />
                  </span>
                  Solved: x = {f(solution)}
                </p>
                <button
                  type="button"
                  onClick={() => setX(Math.max(-10, Math.min(10, solution)))}
                  className={primaryBtn}
                >
                  Test it on the balance
                </button>
              </>
            )}
            {stage > 0 && (
              <button type="button" onClick={() => setStage(0)} className={ghostBtn}>
                <RotateCcw className="h-[1em] w-[1em]" /> Start over
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}