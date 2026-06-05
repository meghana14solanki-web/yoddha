export type League = {
  name: "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";
  emoji: string;
  min: number;
  color: string;
  next?: number;
};

export const LEAGUES: League[] = [
  { name: "Bronze", emoji: "🥉", min: 0, color: "#cd7f32", next: 500 },
  { name: "Silver", emoji: "🥈", min: 500, color: "#c0c0c0", next: 1500 },
  { name: "Gold", emoji: "🥇", min: 1500, color: "#ffd700", next: 3500 },
  { name: "Platinum", emoji: "💎", min: 3500, color: "#9adfff", next: 7500 },
  { name: "Elite", emoji: "👑", min: 7500, color: "#a78bfa" },
];

/** Score = workouts*10 + minutes + calories/10 */
export function calcScore(workouts: Array<{ duration_minutes: number; calories_burned: number }>) {
  return workouts.reduce((s, w) => s + 10 + w.duration_minutes + Math.round(w.calories_burned / 10), 0);
}

export function leagueFor(score: number): League {
  let current = LEAGUES[0];
  for (const l of LEAGUES) if (score >= l.min) current = l;
  return current;
}

export function progressToNext(score: number): number {
  const cur = leagueFor(score);
  if (!cur.next) return 1;
  const span = cur.next - cur.min;
  return Math.min(1, (score - cur.min) / span);
}
