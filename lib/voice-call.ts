/**
 * The voice of the AI interview: Karima reads each question aloud and the student answers by talking.
 *
 * - Speaking: the AI service's audio when it sends some, otherwise the browser's speech synthesis.
 * - Listening: the browser's speech recognition, so the answer appears as the student talks and is sent as text
 *   once they stop. Without it (Firefox), the microphone is recorded until the student stops talking and the
 *   audio is sent for the AI service to transcribe.
 */

/** Arabic questions are read and heard in Egyptian Arabic, the rest in English. */
export function languageOf(text: string): string {
  return /[؀-ۿ]/.test(text) ? "ar-EG" : "en-US";
}

// Speech synthesis -----------------------------------------------------------------------------------------

/** Voices load asynchronously in Chrome; wait for them once. */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

/** Names of friendly female voices on common systems, best first. */
const PREFERRED = ["Samantha", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Zira", "Karen", "Moira", "Tessa", "Laila", "Salma", "Mariam", "Hoda", "Zariyah"];

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const base = lang.split("-")[0];
  const matching = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(base));
  return (
    PREFERRED.map((name) => matching.find((v) => v.name.includes(name))).find(Boolean) ??
    matching.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    matching[0]
  );
}

let currentAudio: HTMLAudioElement | null = null;

/** Stops whatever Karima is saying. */
export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  currentAudio?.pause();
  currentAudio = null;
}

/** Says the question and resolves when Karima has finished (or was stopped). */
export async function speak(text: string, audio?: { base64: string; mimeType: string | null }): Promise<void> {
  stopSpeaking();
  if (audio) {
    const a = new Audio(`data:${audio.mimeType ?? "audio/mpeg"};base64,${audio.base64}`);
    currentAudio = a;
    await new Promise<void>((resolve) => {
      a.onended = a.onpause = a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
    return;
  }
  if (!("speechSynthesis" in window)) return;
  const lang = languageOf(text);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = pickVoice(await loadVoices(), lang) ?? null;
  utterance.rate = 0.97;
  utterance.pitch = 1.15;
  await new Promise<void>((resolve) => {
    utterance.onend = utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// Speech recognition ---------------------------------------------------------------------------------------

interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const canTranscribe = () => recognitionConstructor() !== null;

/** How long the student is quiet before the answer is sent. */
export const SILENCE_MS = 1800;

export type Heard = { text: string } | { audio: Blob } | { error: "no-microphone" | "not-heard" };

export interface Listening {
  /** Resolves once the student has answered and gone quiet, or when stopped (nothing heard). */
  done: Promise<Heard | null>;
  /** Stops listening and sends nothing. */
  cancel(): void;
}

/**
 * Listens for one answer. onWords gets the answer so far while the student talks (live caption); onLevel the
 * microphone level from 0 to 1 when recording audio.
 */
export function listen(lang: string, onWords: (text: string) => void, onLevel?: (level: number) => void): Listening {
  const Ctor = recognitionConstructor();
  return Ctor ? listenWithRecognition(Ctor, lang, onWords) : recordUntilSilence(onLevel);
}

function listenWithRecognition(Ctor: RecognitionConstructor, lang: string, onWords: (text: string) => void): Listening {
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalText = "";
  let interim = "";
  let cancelled = false;
  let finished = false;
  let silence: ReturnType<typeof setTimeout> | undefined;
  let resolve!: (heard: Heard | null) => void;
  const done = new Promise<Heard | null>((r) => (resolve = r));

  const finish = (heard: Heard | null) => {
    if (finished) return;
    finished = true;
    clearTimeout(silence);
    recognition.onend = null;
    recognition.abort();
    resolve(heard);
  };
  const heardSoFar = () => `${finalText} ${interim}`.replace(/\s+/g, " ").trim();

  recognition.onresult = (e) => {
    interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += ` ${r[0].transcript}`;
      else interim += ` ${r[0].transcript}`;
    }
    onWords(heardSoFar());
    clearTimeout(silence);
    silence = setTimeout(() => {
      const text = heardSoFar();
      if (text) finish({ text });
    }, SILENCE_MS);
  };
  recognition.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") finish({ error: "no-microphone" });
    // "no-speech", "network", "aborted": onend restarts or finishes.
  };
  // Browsers end recognition after a pause; keep listening until the student has said something and gone quiet.
  recognition.onend = () => {
    if (cancelled || finished) return;
    const text = heardSoFar();
    if (text) finish({ text });
    else {
      try {
        recognition.start();
      } catch {
        finish({ error: "not-heard" });
      }
    }
  };

  try {
    recognition.start();
  } catch {
    finish({ error: "not-heard" });
  }
  return {
    done,
    cancel: () => {
      cancelled = true;
      finish(null);
    },
  };
}

/** Without speech recognition: record until the student has talked and then been quiet for SILENCE_MS. */
function recordUntilSilence(onLevel?: (level: number) => void): Listening {
  let cancelled = false;
  let stopNow: () => void = () => {};

  const done = (async (): Promise<Heard | null> => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      return { error: "no-microphone" };
    }
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const stopped = new Promise<void>((r) => (recorder.onstop = () => r()));
    recorder.start();

    let spoke = false;
    let quietSince = performance.now();
    await new Promise<void>((resolve) => {
      stopNow = resolve;
      const tick = () => {
        if (cancelled) return resolve();
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const s of samples) sum += ((s - 128) / 128) ** 2;
        const level = Math.min(1, Math.sqrt(sum / samples.length) * 6);
        onLevel?.(level);
        const now = performance.now();
        if (level > 0.12) {
          spoke = true;
          quietSince = now;
        }
        if (spoke && now - quietSince > SILENCE_MS) return resolve();
        requestAnimationFrame(tick);
      };
      tick();
    });

    recorder.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    void context.close();
    if (cancelled) return null;
    return spoke ? { audio: new Blob(chunks, { type: recorder.mimeType || "audio/webm" }) } : { error: "not-heard" };
  })();

  return {
    done,
    cancel: () => {
      cancelled = true;
      stopNow();
    },
  };
}
