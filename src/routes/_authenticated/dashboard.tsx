import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { estimateMealFromText } from "@/lib/ai.functions";
import {
  Activity,
  Apple,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  Loader2,
  LogOut,
  Minus,
  Moon,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  addMeal,
  addWorkout,
  deleteMeal,
  deleteWorkout,
  fetchProfile,
  fetchTodayHabit,
  fetchTodaysMeals,
  fetchWorkouts,
  todayISO,
  upsertHabit,
  type Workout,
} from "@/lib/fitness";
import { CoachChat } from "@/components/fitness/CoachChat";
import { GoalPlanner } from "@/components/fitness/GoalPlanner";
import { MealCamera } from "@/components/fitness/MealCamera";
import { LeagueBadge } from "@/components/fitness/LeagueBadge";
import { ProfileSetup } from "@/components/fitness/ProfileSetup";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Yodha.ai" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const userId = user.id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const profileQ = useQuery({ queryKey: ["profile", userId], queryFn: () => fetchProfile(userId) });
  const workoutsQ = useQuery({ queryKey: ["workouts", userId], queryFn: () => fetchWorkouts(userId, 30) });
  const mealsQ = useQuery({ queryKey: ["meals-today", userId], queryFn: () => fetchTodaysMeals(userId) });
  const habitQ = useQuery({ queryKey: ["habit-today", userId], queryFn: () => fetchTodayHabit(userId) });

  // Realtime: re-fetch on any change to the user's rows
  useEffect(() => {
    void supabase.realtime.setAuth();
    const ch = supabase
      .channel(`user-${userId}`, { config: { private: true } })
      .on("postgres_changes", { event: "*", schema: "public", table: "workouts", filter: `user_id=eq.${userId}` }, () =>
        qc.invalidateQueries({ queryKey: ["workouts", userId] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "meals", filter: `user_id=eq.${userId}` }, () =>
        qc.invalidateQueries({ queryKey: ["meals-today", userId] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "habit_logs", filter: `user_id=eq.${userId}` }, () =>
        qc.invalidateQueries({ queryKey: ["habit-today", userId] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [userId, qc]);

  const profile = profileQ.data;
  const workouts = workoutsQ.data ?? [];
  const meals = mealsQ.data ?? [];
  const habit = habitQ.data;

  const mealsTotals = useMemo(
    () =>
      meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein_g,
          carbs: acc.carbs + m.carbs_g,
          fat: acc.fat + m.fat_g,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [meals],
  );

  const todayWorkouts = workouts.filter((w) => w.performed_on === todayISO());
  const caloriesBurnedToday = todayWorkouts.reduce((s, w) => s + w.calories_burned, 0);
  const minutesToday = todayWorkouts.reduce((s, w) => s + w.duration_minutes, 0);

  const stepGoal = profile?.step_goal ?? 10000;
  const calorieGoal = profile?.calorie_goal ?? 2200;

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function bumpHabit(field: "water_glasses" | "meditation_minutes", delta: number) {
    const current = habit?.[field] ?? 0;
    const next = Math.max(0, Number(current) + delta);
    try {
      await upsertHabit(userId, { [field]: next });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }
  async function setHabitNumber(
    field: "sleep_hours" | "steps",
    raw: string,
  ) {
    const value = Number(raw);
    if (Number.isNaN(value) || value < 0) return;
    try {
      await upsertHabit(userId, { [field]: value });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
              <Activity className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">
              Yodha<span className="text-primary">.ai</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profile?.display_name ?? user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-elevated"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero greeting */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">
            <Sparkles className="mr-1 inline h-3 w-3" /> {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Hey {profile?.display_name ?? "warrior"} — <span className="text-gradient-primary">let's earn today.</span>
          </h1>
        </div>

        {/* Profile setup (top) */}
        <div className="mb-8">
          <Card title="Your profile & goals" eyebrow="Setup">
            <ProfileSetup userId={userId} profile={profile ?? null} />
          </Card>
        </div>

        {/* Top stat strip */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Flame} label="Burned today" value={caloriesBurnedToday} unit="kcal" accent />
          <StatCard icon={Dumbbell} label="Active minutes" value={minutesToday} unit="min" />
          <StatCard
            icon={Footprints}
            label="Steps"
            value={habit?.steps ?? 0}
            unit={`/ ${stepGoal.toLocaleString()}`}
            progress={Math.min(1, (habit?.steps ?? 0) / stepGoal)}
          />
          <StatCard
            icon={Apple}
            label="Eaten"
            value={mealsTotals.calories}
            unit={`/ ${calorieGoal} kcal`}
            progress={Math.min(1, mealsTotals.calories / calorieGoal)}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Habits */}
          <Card title="Today's habits" eyebrow="Live tracking">
            <div className="space-y-5">
              <HabitCounter
                icon={Droplet}
                label="Water"
                value={habit?.water_glasses ?? 0}
                unit="glasses"
                onInc={() => bumpHabit("water_glasses", 1)}
                onDec={() => bumpHabit("water_glasses", -1)}
              />
              <HabitCounter
                icon={Moon}
                label="Meditation"
                value={habit?.meditation_minutes ?? 0}
                unit="min"
                onInc={() => bumpHabit("meditation_minutes", 5)}
                onDec={() => bumpHabit("meditation_minutes", -5)}
              />
              <HabitInput
                icon={Moon}
                label="Sleep last night"
                value={Number(habit?.sleep_hours ?? 0)}
                unit="hrs"
                step="0.5"
                onCommit={(v) => setHabitNumber("sleep_hours", v)}
              />
              <HabitInput
                icon={Footprints}
                label="Steps"
                value={habit?.steps ?? 0}
                unit="steps"
                step="100"
                onCommit={(v) => setHabitNumber("steps", v)}
              />
            </div>
          </Card>

          {/* Add workout */}
          <Card title="Log a workout" eyebrow="Training">
            <WorkoutForm userId={userId} />
            <div className="mt-6 border-t border-border pt-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Today
              </h4>
              {todayWorkouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workouts logged yet. Move!</p>
              ) : (
                <ul className="space-y-2">
                  {todayWorkouts.map((w) => (
                    <WorkoutRow key={w.id} w={w} />
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Add meal */}
          <Card title="Log a meal" eyebrow="Nutrition">
            <MealForm userId={userId} />
            <div className="mt-6 grid grid-cols-4 gap-2 text-center">
              {[
                ["Cal", mealsTotals.calories],
                ["Protein", `${mealsTotals.protein}g`],
                ["Carbs", `${mealsTotals.carbs}g`],
                ["Fat", `${mealsTotals.fat}g`],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-xl bg-surface-elevated p-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
                  <p className="mt-0.5 font-display text-base font-bold text-primary">{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weekly chart + lists */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card title="Last 7 days" eyebrow="Weekly performance">
              <WeeklyChart workouts={workouts} />
            </Card>
          </div>
          <Card title="Today's meals" eyebrow="Plate log">
            {meals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Snap or log your first meal today.</p>
            ) : (
              <ul className="space-y-3">
                {meals.map((m) => (
                  <li key={m.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-elevated p-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.meal_type} · {m.calories} kcal · P{m.protein_g} C{m.carbs_g} F{m.fat_g}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMeal(m.id).catch((e) => toast.error(e.message))}
                      className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive"
                      aria-label="Delete meal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* AI Coach + Goal Planner */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card title="AI Fitness Coach" eyebrow="Talk to Yodha">
            <CoachChat userId={userId} />
          </Card>
          <Card title="Goal-to-Plan Generator" eyebrow="Your roadmap">
            <GoalPlanner userId={userId} />
          </Card>
        </div>

        {/* Meal Camera + League */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card title="Snap a meal" eyebrow="AI meal recognition">
            <MealCamera userId={userId} />
          </Card>
          <Card title="Fitness League" eyebrow="Rank & share">
            <LeagueBadge workouts={workouts} displayName={profile?.display_name} />
          </Card>
        </div>

        {/* Recent workouts */}
        <div className="mt-8">
          <Card title="Recent workouts" eyebrow="History">
            {workouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your training history will appear here.</p>
            ) : (
              <ul className="divide-y divide-border">
                {workouts.slice(0, 12).map((w) => (
                  <li key={w.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
                        <Trophy className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">{w.workout_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.performed_on).toLocaleDateString()} · {w.duration_minutes} min · {w.calories_burned} kcal
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteWorkout(w.id).catch((e) => toast.error(e.message))}
                      className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive"
                      aria-label="Delete workout"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>

      <style>{`
        .input {
          width: 100%;
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input::placeholder { color: var(--muted-foreground); }
        .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px oklch(0.87 0.24 142 / 0.2); }
      `}</style>
    </div>
  );
}

/* ---------- helpers / sub-components ---------- */

function Card({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-card-soft">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 font-display text-xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  progress,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit: string;
  progress?: number;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border p-5 ${accent ? "bg-gradient-to-br from-primary/15 to-transparent" : "bg-surface"}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold">
        {value.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}

function HabitCounter({
  icon: Icon,
  label,
  value,
  unit,
  onInc,
  onDec,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit: string;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {value} {unit}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconBtn onClick={onDec} aria="Decrease">
          <Minus className="h-3.5 w-3.5" />
        </IconBtn>
        <IconBtn onClick={onInc} aria="Increase">
          <Plus className="h-3.5 w-3.5" />
        </IconBtn>
      </div>
    </div>
  );
}

function HabitInput({
  icon: Icon,
  label,
  value,
  unit,
  step,
  onCommit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit: string;
  step: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => setLocal(String(value)), [value]);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </div>
      <input
        type="number"
        step={step}
        min="0"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onCommit(local)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="input !w-28 text-right"
      />
    </div>
  );
}

function IconBtn({ children, onClick, aria }: { children: React.ReactNode; onClick: () => void; aria: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground transition hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </button>
  );
}

function WorkoutForm({ userId }: { userId: string }) {
  const [type, setType] = useState("Run");
  const [minutes, setMinutes] = useState("30");
  const [calories, setCalories] = useState("250");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const dur = Number(minutes);
    const cal = Number(calories);
    if (!type.trim() || !Number.isFinite(dur) || dur <= 0) {
      toast.error("Enter a workout type and a positive duration.");
      return;
    }
    setSubmitting(true);
    try {
      await addWorkout({
        user_id: userId,
        workout_type: type.trim(),
        duration_minutes: dur,
        calories_burned: Number.isFinite(cal) ? cal : 0,
      });
      toast.success("Workout logged");
      setMinutes("30");
      setCalories("250");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select value={type} onChange={(e) => setType(e.target.value)} className="input">
        {["Run", "Strength", "HIIT", "Cycling", "Yoga", "Walk", "Swim"].map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Minutes</span>
          <input type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Calories</span>
          <input type="number" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} className="input" />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
      >
        Add workout
      </button>
    </form>
  );
}

function MealForm({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  } | null>(null);
  const estimate = useServerFn(estimateMealFromText);
  const qc = useQueryClient();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Describe what you ate.");
    setBusy(true);
    setPreview(null);
    try {
      const est = await estimate({ data: { description: name.trim(), meal_type: mealType } });
      await addMeal({
        user_id: userId,
        name: est.name,
        meal_type: est.meal_type,
        calories: est.calories,
        protein_g: est.protein_g,
        carbs_g: est.carbs_g,
        fat_g: est.fat_g,
      });
      setPreview({
        calories: est.calories,
        protein_g: est.protein_g,
        carbs_g: est.carbs_g,
        fat_g: est.fat_g,
      });
      toast.success(`Logged ${est.name} · ${est.calories} kcal`);
      setName("");
      await qc.invalidateQueries({ queryKey: ["meals-today", userId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not estimate");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. 2 chapatis with dal and salad"
        className="input"
      />
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value as typeof mealType)}
        className="input"
      >
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Estimating with AI…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Log with AI
          </>
        )}
      </button>
      <p className="text-[11px] text-muted-foreground">
        Just type what you ate — AI calculates calories, protein, carbs and fat.
      </p>
      {preview && (
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {[
            ["Cal", preview.calories],
            ["P", `${preview.protein_g}g`],
            ["C", `${preview.carbs_g}g`],
            ["F", `${preview.fat_g}g`],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-lg bg-surface-elevated p-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
              <p className="font-display text-sm font-bold text-primary">{v}</p>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

function WorkoutRow({ w }: { w: Workout }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-2 text-sm">
      <span className="truncate">
        <strong className="font-medium">{w.workout_type}</strong>
        <span className="ml-2 text-muted-foreground">{w.duration_minutes}m · {w.calories_burned} kcal</span>
      </span>
      <button
        onClick={() => deleteWorkout(w.id).catch((e) => toast.error(e.message))}
        className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive"
        aria-label="Delete workout"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function WeeklyChart({ workouts }: { workouts: Workout[] }) {
  const days = useMemo(() => {
    const out: { date: string; label: string; cal: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      out.push({
        date: iso,
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        cal: 0,
      });
    }
    const map = new Map(out.map((d) => [d.date, d] as const));
    for (const w of workouts) {
      const day = map.get(w.performed_on);
      if (day) day.cal += w.calories_burned;
    }
    return out;
  }, [workouts]);

  const max = Math.max(100, ...days.map((d) => d.cal));
  const total = days.reduce((s, d) => s + d.cal, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-3xl font-bold">
          {total.toLocaleString()} <span className="text-base font-normal text-muted-foreground">kcal this week</span>
        </p>
      </div>
      <div className="mt-6 flex h-44 items-end gap-3">
        {days.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-md bg-primary/80 transition-all"
              style={{ height: `${(d.cal / max) * 100}%`, minHeight: "4px", opacity: 0.45 + (d.cal / max) * 0.55 }}
              title={`${d.cal} kcal`}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
