import { createServerFn } from "@tanstack/react-start";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "google/gemini-2.5-flash";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return createLovableAiGatewayProvider(key);
}

/* ---------------- AI Coach Chat ---------------- */
export const coachChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ message: z.string().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // load profile + recent history for context
    const [{ data: profile }, { data: history }, { data: workouts }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("coach_messages")
        .select("role,content")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(20),
      supabase
        .from("workouts")
        .select("workout_type,duration_minutes,calories_burned,performed_on")
        .eq("user_id", userId)
        .order("performed_on", { ascending: false })
        .limit(7),
    ]);

    const systemPrompt = `You are Yodha — a motivational, no-nonsense AI fitness coach.
Tone: warrior, encouraging, concise (under 120 words).
User profile: ${JSON.stringify(profile ?? {})}
Recent workouts (last 7): ${JSON.stringify(workouts ?? [])}
Coach the user toward their goals. If they missed workouts, redesign the week.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(history ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: data.message },
    ];

    const { text } = await generateText({
      model: gateway()(MODEL),
      messages,
    });

    await supabase.from("coach_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: text },
    ]);

    return { reply: text };
  });

/* ---------------- Goal-to-Plan Generator ---------------- */
const PlanSchema = z.object({
  summary: z.string(),
  weight_milestones: z.array(z.object({ month: z.number(), target_weight_kg: z.number() })),
  weekly_workout_schedule: z.array(z.object({ day: z.string(), focus: z.string(), duration_min: z.number() })),
  nutrition_targets: z.object({
    daily_calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  roadmap: z.array(z.string()),
});

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ goal: z.string().min(3).max(300) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

    const { object } = await generateObject({
      model: gateway()(MODEL),
      schema: PlanSchema,
      prompt: `Generate a realistic fitness plan for this user.
Goal: "${data.goal}"
Profile: ${JSON.stringify(profile ?? {})}
Make weekly_workout_schedule cover Mon-Sun. Make weight_milestones cover the full target period (one per month).`,
    });

    await supabase.from("goal_plans").insert({ user_id: userId, goal: data.goal, plan: object });

    // Auto-adjust nutrition + step goal on the profile
    await supabase
      .from("profiles")
      .update({
        calorie_goal: object.nutrition_targets.daily_calories,
        protein_goal_g: object.nutrition_targets.protein_g,
      })
      .eq("id", userId);

    return object;
  });

export const fetchLatestPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("goal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });

export const fetchCoachHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("coach_messages")
      .select("id,role,content,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);
    return data ?? [];
  });

/* ---------------- Meal Recognition ---------------- */
const MealSchema = z.object({
  name: z.string(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().int().min(0).max(5000),
  protein_g: z.number().int().min(0).max(500),
  carbs_g: z.number().int().min(0).max(500),
  fat_g: z.number().int().min(0).max(500),
});

export const recognizeMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      imageBase64: z.string().min(20).max(8_000_000),
      mimeType: z.string().default("image/jpeg"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { object } = await generateObject({
      model: gateway()(MODEL),
      schema: MealSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this meal and estimate calories and macros. Pick the most appropriate meal_type for the current time of day.",
            },
            {
              type: "image",
              image: `data:${data.mimeType};base64,${data.imageBase64}`,
            },
          ],
        },
      ],
    });

    await supabase.from("meals").insert({ user_id: userId, ...object });
    return object;
  });

/* ---------------- Meal Estimation from Text ---------------- */
const MealEstimateSchema = z.object({
  name: z.string(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().int().min(0).max(5000),
  protein_g: z.number().int().min(0).max(500),
  carbs_g: z.number().int().min(0).max(500),
  fat_g: z.number().int().min(0).max(500),
});

export const estimateMealFromText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      description: z.string().min(2).max(300),
      meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const hour = new Date().getHours();
    const defaultType =
      data.meal_type ??
      (hour < 11 ? "breakfast" : hour < 16 ? "lunch" : hour < 21 ? "dinner" : "snack");
    const { object } = await generateObject({
      model: gateway()(MODEL),
      schema: MealEstimateSchema,
      prompt: `Estimate realistic nutrition for a single serving of: "${data.description}".
Return calories (kcal) and grams of protein, carbs, fat. Normalize the name to a clean title.
Use meal_type "${defaultType}" unless the description clearly implies another type.`,
    });
    return object;
  });
