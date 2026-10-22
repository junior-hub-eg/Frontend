"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  LogOut,
  Medal,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { changeAvatar, setGender } from "@/lib/auth/api-auth";
import { useAuth } from "@/lib/auth/auth-context";
import { PASSWORD_RULES } from "@/lib/auth/password-rules";
import { avatarOrDefault, mentorAvatar } from "@/lib/avatars";
import { getHub, type Hub } from "@/lib/hub-api";
import { getAchievements, getTracks, selectTrack, type Achievements, type TrackSummary } from "@/lib/learning-api";
import { getMyMentor, type MyMentor } from "@/lib/mentorship-api";
import { changePassword, getMe, type Me } from "@/lib/profile-api";
import { getMyCertificates, type Certificate } from "@/lib/recruitment-api";
import { AvatarPicker } from "./learner-shell";
import { RecruitmentFrame } from "./recruitment-ui";
import TaskCalendar from "./TaskCalendar";

const card = "rounded-[1.4em] border border-[#e3e9f0] bg-white p-[1.4em]";
const primaryBtn =
  "inline-flex items-center justify-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1.2em] py-[0.65em] text-[0.85em] font-semibold text-white transition hover:bg-[#0f2a47] disabled:opacity-50";
const ghostBtn =
  "inline-flex items-center justify-center gap-[0.4em] rounded-[0.8em] border border-[#c9d3df] px-[1.1em] py-[0.6em] text-[0.85em] font-semibold text-[#14365a] transition hover:bg-[#f3f6f9] disabled:opacity-50";

interface ProfileData {
  me: Me;
  hub: Hub;
  tracks: TrackSummary[];
  mentors: MyMentor;
  achievements: Achievements;
  certificates: Certificate[];
}

/** A failed part says which one, so "Something went wrong" never hides where. */
class ProfilePartError extends Error {
  constructor(part: string, cause: unknown) {
    super(`We couldn't load ${part}. ${errorMessage(cause)}`);
  }
}

const part = <T,>(name: string, request: Promise<T>) => request.catch((e: unknown) => Promise.reject(new ProfilePartError(name, e)));

async function loadProfile(): Promise<ProfileData> {
  const [me, hub, tracks, mentors, achievements, certificates] = await Promise.all([
    part("your profile", getMe()),
    part("your dashboard", getHub()),
    part("your tracks", getTracks()),
    part("your mentors", getMyMentor()),
    part("your achievements", getAchievements()),
    part("your certificates", getMyCertificates()),
  ]);
  return { me, hub, tracks, mentors, achievements, certificates };
}

function Section({ title, icon: Icon, action, children }: { title: string; icon: typeof Star; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={card}>
      <div className="mb-[1em] flex flex-wrap items-center gap-[0.6em]">
        <span className="grid h-[2.2em] w-[2.2em] place-items-center rounded-full bg-[#e4f7f4] text-[#0f7a81]">
          <Icon className="h-[1.1em] w-[1.1em]" />
        </span>
        <h2 className="flex-1 text-[1.15em] font-extrabold text-[#14365a]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, value, label, color }: { icon: typeof Star; value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-[0.6em] rounded-[1em] bg-[#f6f9fc] px-[0.9em] py-[0.7em]">
      <Icon className="h-[1.3em] w-[1.3em] shrink-0" style={{ color }} />
      <span>
        <span className="block text-[1.15em] font-extrabold leading-none text-[#14365a]">{value}</span>
        <span className="text-[0.75em] text-[#14365a]/65">{label}</span>
      </span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.75em] text-[#14365a]/60">{label}</dt>
      <dd className="text-[0.9em] font-semibold text-[#14365a]">{value}</dd>
    </div>
  );
}

/** Change the password with the current one. Other devices are signed out. */
function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const rulesOk = PASSWORD_RULES.every((r) => r.test(next));
  const canSave = current.length > 0 && rulesOk && next === confirm && !saving;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      await changePassword(current, next, confirm);
      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, "We couldn't change your password. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-[0.8em] border border-[#e1e8f0] bg-white px-[0.9em] py-[0.6em] text-[0.9em] text-[#14365a] outline-none focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20";

  return (
    <form onSubmit={submit} className="grid gap-[0.8em]">
      <label className="grid gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]">
        Current password
        <input type={show ? "text" : "password"} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={input} />
      </label>
      <div className="grid gap-[0.8em] sm:grid-cols-2">
        <label className="grid gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]">
          New password
          <input type={show ? "text" : "password"} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={input} />
        </label>
        <label className="grid gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]">
          Confirm new password
          <input type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
        </label>
      </div>

      <ul className="flex flex-wrap gap-x-[1.2em] gap-y-[0.3em] text-[0.75em]">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(next);
          return (
            <li key={r.id} className={`flex items-center gap-[0.3em] ${ok ? "text-[#1f7a43]" : "text-[#14365a]/55"}`}>
              <Check className="h-[1em] w-[1em]" /> {r.label}
            </li>
          );
        })}
        {confirm.length > 0 && next !== confirm && <li className="font-semibold text-[#b83232]">Passwords don&apos;t match</li>}
      </ul>

      {error && (
        <p role="alert" className="rounded-[0.8em] bg-[#fdecec] px-[0.9em] py-[0.5em] text-[0.8em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="rounded-[0.8em] bg-[#d8f0df] px-[0.9em] py-[0.5em] text-[0.8em] font-semibold text-[#1f7a43]">
          Your password was changed. Other devices were signed out.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-[0.8em]">
        <button type="submit" disabled={!canSave} className={primaryBtn}>
          {saving ? <LoaderCircle className="h-[1.1em] w-[1.1em] animate-spin" /> : <KeyRound className="h-[1.1em] w-[1.1em]" />} Change password
        </button>
        <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]/70 hover:underline">
          {show ? <EyeOff className="h-[1em] w-[1em]" /> : <Eye className="h-[1em] w-[1em]" />} {show ? "Hide passwords" : "Show passwords"}
        </button>
      </div>
    </form>
  );
}

/** Profile and settings: who the student is, what they learn, their mentors and achievements, and their account. */
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [focusing, setFocusing] = useState<string | null>(null);
  const [focusError, setFocusError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadProfile().then(
      (d) => active && setData(d),
      (e) => active && setError(e instanceof ProfilePartError ? e.message : errorMessage(e, "We couldn't load your profile. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, []);

  async function makeFocus(code: string) {
    setFocusing(code);
    setFocusError(null);
    try {
      await selectTrack(code);
      setData(await loadProfile());
    } catch (e) {
      setFocusError(errorMessage(e, "We couldn't change your track in focus. Please try again."));
    } finally {
      setFocusing(null);
    }
  }

  function signOut() {
    logout();
    router.replace("/login");
  }

  const gender = user?.gender ?? data?.me.gender ?? null;
  const avatar = avatarOrDefault(user?.photoUrl ?? data?.me.photoUrl ?? null, 0, gender);
  const learning = data?.tracks.filter((t) => t.isLearning) ?? [];

  return (
    <RecruitmentFrame>
      <h1 className="text-[2.3em] font-extrabold leading-tight text-[#14365a]">Profile & settings</h1>

      {error && (
        <p role="alert" className="mt-[1.5em] rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-[0.9em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}
      {!data && !error && <LoaderCircle className="mx-auto my-[4em] h-[2em] w-[2em] animate-spin text-[#12939b]" aria-label="Loading" />}

      {data && (
        <div className="mt-[1.2em] grid items-start gap-[1em] xl:grid-cols-[1.25fr_1fr]">
          <div className="grid gap-[1em]">
            {/* Who I am */}
            <section className={`${card} flex flex-wrap items-center gap-[1.4em]`}>
              <div className="relative">
                <span className="relative block h-[6.5em] w-[6.5em] overflow-hidden rounded-full" style={{ backgroundColor: avatar.bg }}>
                  <Image src={avatar.src} alt="Your avatar" fill sizes="120px" className="object-cover" />
                </span>
                <button
                  type="button"
                  onClick={() => setPickingAvatar(true)}
                  aria-label="Change avatar"
                  className="absolute -bottom-[0.2em] -right-[0.2em] grid h-[2.2em] w-[2.2em] place-items-center rounded-full bg-[#14365a] text-white ring-[0.2em] ring-white hover:bg-[#0f2a47]"
                >
                  <Pencil className="h-[1em] w-[1em]" />
                </button>
              </div>
              <div className="min-w-[14em] flex-1">
                <p className="text-[1.6em] font-extrabold leading-tight text-[#14365a]">{data.me.fullName}</p>
                <p className="text-[0.9em] text-[#14365a]/70">{data.me.email}</p>
                <dl className="mt-[0.8em] grid grid-cols-2 gap-[0.6em] sm:grid-cols-3">
                  <Field label="School" value={data.me.school?.name ?? "Not linked to a school"} />
                  <Field
                    label="Grade"
                    value={data.me.grade ? `Grade ${data.me.grade}${data.me.className ? ` · ${data.me.className}` : ""}` : "—"}
                  />
                  <Field label="I am a" value={gender === "Female" ? "Girl" : gender === "Male" ? "Boy" : "—"} />
                </dl>
              </div>
              <div className="grid w-full grid-cols-2 gap-[0.6em] sm:grid-cols-4">
                <Stat icon={Sparkles} value={data.me.totalXp} label="Total XP" color="#7c4dff" />
                <Stat icon={Flame} value={data.me.streakDays} label="Day streak" color="#f08a00" />
                <Stat icon={Award} value={data.certificates.length} label="Certificates" color="#12939b" />
                <Stat icon={Medal} value={data.achievements.badges.length} label="Badges" color="#d4a017" />
              </div>
              <p className="w-full text-[0.75em] text-[#14365a]/60">Your name, school and grade come from your school. Ask your teacher to change them.</p>
            </section>

            {/* What I learn */}
            <Section
              title="My tracks"
              icon={GraduationCap}
              action={
                <Link href={"/learner/courses" as Route} className={ghostBtn}>
                  <Plus className="h-[1em] w-[1em]" /> Add a track
                </Link>
              }
            >
              {learning.length === 0 ? (
                <p className="text-[0.85em] text-[#14365a]/70">You are not learning a track yet.</p>
              ) : (
                <ul className="grid gap-[0.6em]">
                  {learning.map((t) => (
                    <li key={t.code} className="flex flex-wrap items-center gap-[0.8em] rounded-[1em] border border-[#e8eef5] px-[1em] py-[0.8em]">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.95em] font-bold text-[#14365a]">{t.name}</span>
                        <span className="text-[0.8em] text-[#14365a]/65">
                          {t.isFocus ? `In focus${data.hub.courses.level ? ` · ${data.hub.courses.level}` : ""}` : "Learning"}
                        </span>
                      </span>
                      {t.isFocus ? (
                        <span className="rounded-full bg-[#e4f7f4] px-[0.8em] py-[0.25em] text-[0.75em] font-bold text-[#0f7a81]">In focus</span>
                      ) : (
                        <button type="button" onClick={() => makeFocus(t.code)} disabled={focusing !== null} className={ghostBtn}>
                          {focusing === t.code && <LoaderCircle className="h-[1em] w-[1em] animate-spin" />} Put in focus
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {focusError && (
                <p role="alert" className="mt-[0.6em] text-[0.8em] font-semibold text-[#b83232]">
                  {focusError}
                </p>
              )}
              <Link href={"/learner/ai-interview" as Route} className="mt-[0.9em] inline-flex items-center gap-[0.3em] text-[0.8em] font-semibold text-[#0f7a81] hover:underline">
                <RotateCcw className="h-[1em] w-[1em]" /> Take the AI interview again to discover new tracks
              </Link>
            </Section>

            {/* My mentors */}
            <Section
              title="My mentors"
              icon={UserRound}
              action={
                <Link href={"/learner/mentorship" as Route} className={ghostBtn}>
                  Change mentor <ArrowRight className="h-[1em] w-[1em]" />
                </Link>
              }
            >
              {data.mentors.currents.length === 0 ? (
                <p className="text-[0.85em] text-[#14365a]/70">You don&apos;t have a mentor yet.</p>
              ) : (
                <ul className="grid gap-[0.6em] sm:grid-cols-2">
                  {data.mentors.currents.map(({ mentor }) => {
                    const a = mentorAvatar(mentor);
                    return (
                      <li key={mentor.id} className="flex items-center gap-[0.8em] rounded-[1em] border border-[#e8eef5] p-[0.8em]">
                        <span className="relative h-[3em] w-[3em] shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: a.bg }}>
                          <Image src={a.src} alt="" fill sizes="60px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[0.9em] font-bold text-[#14365a]">{mentor.fullName}</span>
                          <span className="block truncate text-[0.75em] text-[#14365a]/65">{mentor.title}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>

            {/* Task calendar */}
            <Section title="Task calendar" icon={CalendarDays}>
              <TaskCalendar />
            </Section>
          </div>

          <div className="grid gap-[1em]">
            {/* Achievements */}
            <Section
              title="Achievements"
              icon={Award}
              action={
                <Link href={"/learner/certification" as Route} className={ghostBtn}>
                  See all <ArrowRight className="h-[1em] w-[1em]" />
                </Link>
              }
            >
              {data.certificates.length === 0 && data.achievements.badges.length === 0 ? (
                <p className="text-[0.85em] text-[#14365a]/70">
                  No certificates or badges yet. Pass a practice interview or a lesson linked to school to earn one.
                </p>
              ) : (
                <ul className="grid gap-[0.5em]">
                  {data.certificates.slice(0, 3).map((c) => (
                    <li key={c.code} className="flex items-center gap-[0.6em] text-[0.85em] text-[#14365a]">
                      <Award className="h-[1.2em] w-[1.2em] shrink-0 text-[#f5a623]" />
                      <span className="min-w-0 flex-1 truncate font-semibold">{c.role}</span>
                      <span className="text-[0.85em] text-[#14365a]/60">{c.scorePercent}%</span>
                    </li>
                  ))}
                  {data.achievements.badges.slice(0, 3).map((b) => (
                    <li key={b.code} className="flex items-center gap-[0.6em] text-[0.85em] text-[#14365a]">
                      <Medal className="h-[1.2em] w-[1.2em] shrink-0 text-[#d4a017]" />
                      <span className="min-w-0 flex-1 truncate font-semibold">{b.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Account */}
            <Section title="Password" icon={KeyRound}>
              <PasswordForm />
            </Section>

            <Section title="Privacy" icon={ShieldCheck}>
              <ul className="grid gap-[0.4em] text-[0.85em] leading-relaxed text-[#14365a]/85">
                <li>• Your voice in the AI interview is never saved.</li>
                <li>• The AI never gets your name, only a reference number.</li>
                <li>• Recruitment Practice is a simulation. Its certificates are not job offers.</li>
              </ul>
            </Section>

            <button type="button" onClick={signOut} className={`${ghostBtn} justify-self-start border-[#f2c4c4] text-[#b83232] hover:bg-[#fdecec]`}>
              <LogOut className="h-[1.1em] w-[1.1em]" /> Sign out
            </button>
          </div>
        </div>
      )}

      {pickingAvatar && (
        <AvatarPicker current={avatar} gender={gender} onClose={() => setPickingAvatar(false)} onChoose={changeAvatar} onSetGender={setGender} />
      )}
    </RecruitmentFrame>
  );
}
