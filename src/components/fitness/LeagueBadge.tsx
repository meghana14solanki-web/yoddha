import { Share2 } from "lucide-react";
import { calcScore, leagueFor, LEAGUES, progressToNext } from "@/lib/leagues";

type Props = {
  workouts: Array<{ duration_minutes: number; calories_burned: number }>;
  displayName?: string | null;
};

export function LeagueBadge({ workouts, displayName }: Props) {
  const score = calcScore(workouts);
  const league = leagueFor(score);
  const progress = progressToNext(score);

  const shareText = `🔥 I'm in the ${league.name} league on Yodha.ai with ${score} warrior points! Join me: ${typeof window !== "undefined" ? window.location.origin : ""}`;

  function share(target: "whatsapp" | "facebook" | "twitter" | "native") {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const enc = encodeURIComponent(shareText);
    if (target === "native" && typeof navigator !== "undefined" && "share" in navigator) {
      void (navigator as Navigator).share({ title: "Yodha.ai", text: shareText, url });
      return;
    }
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${enc}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${enc}`,
      twitter: `https://twitter.com/intent/tweet?text=${enc}`,
    };
    window.open(links[target], "_blank", "noopener,noreferrer");
  }

  function copyForInstagram() {
    void navigator.clipboard.writeText(shareText);
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${league.color}33, transparent)`,
          border: `1px solid ${league.color}55`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-3xl"
            style={{ background: `${league.color}22`, border: `1px solid ${league.color}88` }}
          >
            {league.emoji}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Current league</p>
            <p className="font-display text-2xl font-bold" style={{ color: league.color }}>
              {league.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {score.toLocaleString()} warrior points
            </p>
          </div>
        </div>
        {league.next && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress * 100}%`, background: league.color }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {Math.max(0, league.next - score)} pts to{" "}
              {LEAGUES[LEAGUES.findIndex((l) => l.name === league.name) + 1]?.name}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Share badge
        </p>
        <div className="flex flex-wrap gap-2">
          <ShareBtn label="WhatsApp" onClick={() => share("whatsapp")} color="#25d366" />
          <ShareBtn label="Facebook" onClick={() => share("facebook")} color="#1877f2" />
          <ShareBtn label="X" onClick={() => share("twitter")} color="#1d9bf0" />
          <ShareBtn label="Copy for Instagram" onClick={copyForInstagram} color="#e1306c" />
          <ShareBtn label="More…" onClick={() => share("native")} color="oklch(var(--primary))" icon />
        </div>
        {displayName && (
          <p className="mt-2 text-xs text-muted-foreground">Earned by {displayName}</p>
        )}
      </div>
    </div>
  );
}

function ShareBtn({ label, onClick, color, icon }: { label: string; onClick: () => void; color: string; icon?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
      style={{ borderColor: `${color}88`, color, background: `${color}10` }}
    >
      {icon && <Share2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
