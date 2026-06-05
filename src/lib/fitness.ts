import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Workout = Tables<"workouts">;
export type Meal = Tables<"meals">;
export type HabitLog = Tables<"habit_logs">;
export type Profile = Tables<"profiles">;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function fetchWorkouts(userId: string, days = 30): Promise<Workout[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .gte("performed_on", since.toISOString().slice(0, 10))
    .order("performed_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTodaysMeals(userId: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("eaten_on", todayISO())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTodayHabit(userId: string): Promise<HabitLog | null> {
  const { data } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", todayISO())
    .maybeSingle();
  return data;
}

export async function upsertHabit(
  userId: string,
  patch: Partial<Pick<HabitLog, "water_glasses" | "sleep_hours" | "meditation_minutes" | "steps">>,
) {
  const existing = await fetchTodayHabit(userId);
  const payload: TablesInsert<"habit_logs"> = {
    user_id: userId,
    log_date: todayISO(),
    water_glasses: existing?.water_glasses ?? 0,
    sleep_hours: existing?.sleep_hours ?? 0,
    meditation_minutes: existing?.meditation_minutes ?? 0,
    steps: existing?.steps ?? 0,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("habit_logs")
    .upsert(payload, { onConflict: "user_id,log_date" });
  if (error) throw error;
}

export async function addWorkout(payload: TablesInsert<"workouts">) {
  const { error } = await supabase.from("workouts").insert(payload);
  if (error) throw error;
}

export async function addMeal(payload: TablesInsert<"meals">) {
  const { error } = await supabase.from("meals").insert(payload);
  if (error) throw error;
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteMeal(id: string) {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}
