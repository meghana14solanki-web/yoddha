import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Target, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { fetchLatestPlan, generatePlan } from "@/lib/ai.functions";

type Plan = {
  summary: string;
  weight_milestones: { month: number; target_weight_kg: number }[];
  weekly_workout_schedule: { day: string; focus: string; duration_min: number }[];
  nutrition_targets: { daily_calories: number; protein_g: number; carbs_g: number; fat_g: number };
  roadmap: string[];
};

export function GoalPlanner({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const fetchPlan = useServerFn(fetchLatestPlan);
  const generate = useServerFn(generatePlan);
  const { data: latest } = useQuery({
    queryKey: ["plan", userId],
    queryFn: () => fetchPlan(),
  });

  const [goal, setGoal] = useState("Lose 5kg in 3 months and build endurance");
  const [busy, setBusy] = useState(false);

  async function onGenerate() {
    if (!goal.trim()) return;
    setBusy(true);
    try {
      await generate({ data: { goal: goal.trim() } });
      await qc.invalidateQueries({ queryKey: ["plan", userId] });
      await qc.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Your warrior plan is ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate plan");
    } finally {
      setBusy(false);
    }
  }

  const plan = (latest?.plan as Plan | undefined) ?? null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface-elevated p-3">
        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground">
          Your goal
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
          className="input mt-1 resize-none"
          placeholder='e.g. "Lose 10kg in 6 months"'
        />
        <button
          onClick={onGenerate}
          disabled={busy}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Generate AI plan
        </button>
      </div>

      {plan && (
        <div className="space-y-3 text-sm">
          <p className="rounded-xl bg-primary/10 p-3 text-foreground">
            <Target className="mr-2 inline h-4 w-4 text-primary" />
            {plan.summary}
          </p>

          <Section title="Weight milestones">
            <ul className="grid grid-cols-2 gap-2">
              {plan.weight_milestones.map((m) => (
                <li key={m.month} className="rounded-lg bg-surface-elevated px-3 py-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Month {m.month}
                  </span>
                  <p className="font-display text-base font-bold text-primary">
                    {m.target_weight_kg} kg
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Weekly schedule">
            <ul className="divide-y divide-border">
              {plan.weekly_workout_schedule.map((d) => (
                <li key={d.day} className="flex items-center justify-between py-1.5">
                  <span className="font-medium">{d.day}</span>
                  <span className="text-muted-foreground">
                    {d.focus} · {d.duration_min}m
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Nutrition targets">
            <div className="grid grid-cols-4 gap-2 text-center">
              {(
                [
                  ["Cal", plan.nutrition_targets.daily_calories],
                  ["Protein", `${plan.nutrition_targets.protein_g}g`],
                  ["Carbs", `${plan.nutrition_targets.carbs_g}g`],
                  ["Fat", `${plan.nutrition_targets.fat_g}g`],
                ] as const
              ).map(([l, v]) => (
                <div key={l} className="rounded-lg bg-surface-elevated p-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
                  <p className="mt-0.5 font-display text-sm font-bold text-primary">{v}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Roadmap">
            <ol className="list-decimal space-y-1 pl-5 text-foreground/90">
              {plan.roadmap.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}
