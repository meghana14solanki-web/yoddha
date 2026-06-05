import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/fitness";

export function ProfileSetup({ userId, profile }: { userId: string; profile: Profile | null }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    display_name: "",
    height_cm: "",
    weight_kg: "",
    weight_goal_kg: "",
    target_months: "",
    water_goal_ml: "2500",
    protein_goal_g: "120",
    step_goal: "10000",
    calorie_goal: "2200",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      height_cm: profile.height_cm?.toString() ?? "",
      weight_kg: profile.weight_kg?.toString() ?? "",
      weight_goal_kg: profile.weight_goal_kg?.toString() ?? "",
      target_months: profile.target_months?.toString() ?? "",
      water_goal_ml: profile.water_goal_ml?.toString() ?? "2500",
      protein_goal_g: profile.protein_goal_g?.toString() ?? "120",
      step_goal: profile.step_goal?.toString() ?? "10000",
      calorie_goal: profile.calorie_goal?.toString() ?? "2200",
      phone: profile.phone ?? "",
    });
  }, [profile]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const num = (v: string) => (v === "" ? null : Number(v));
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: form.display_name || null,
          height_cm: num(form.height_cm),
          weight_kg: num(form.weight_kg),
          weight_goal_kg: num(form.weight_goal_kg),
          target_months: num(form.target_months),
          water_goal_ml: Number(form.water_goal_ml) || 2500,
          protein_goal_g: Number(form.protein_goal_g) || 120,
          step_goal: Number(form.step_goal) || 10000,
          calorie_goal: Number(form.calorie_goal) || 2200,
          phone: form.phone || null,
        })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile saved");
      await qc.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm">
      <Field label="Display name">
        <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="input" placeholder="Warrior" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)"><input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} className="input" /></Field>
        <Field label="Weight (kg)"><input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} className="input" /></Field>
        <Field label="Goal weight (kg)"><input type="number" value={form.weight_goal_kg} onChange={(e) => setForm({ ...form, weight_goal_kg: e.target.value })} className="input" /></Field>
        <Field label="Target months"><input type="number" value={form.target_months} onChange={(e) => setForm({ ...form, target_months: e.target.value })} className="input" /></Field>
        <Field label="Water goal (ml)"><input type="number" value={form.water_goal_ml} onChange={(e) => setForm({ ...form, water_goal_ml: e.target.value })} className="input" /></Field>
        <Field label="Protein goal (g)"><input type="number" value={form.protein_goal_g} onChange={(e) => setForm({ ...form, protein_goal_g: e.target.value })} className="input" /></Field>
        <Field label="Step goal"><input type="number" value={form.step_goal} onChange={(e) => setForm({ ...form, step_goal: e.target.value })} className="input" /></Field>
        <Field label="Calorie goal"><input type="number" value={form.calorie_goal} onChange={(e) => setForm({ ...form, calorie_goal: e.target.value })} className="input" /></Field>
      </Field>
      <Field label="Phone (optional)">
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+1 555 123 4567" />
      </Field>
      <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
