import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  Brain,
  Dumbbell,
  Flame,
  MessageCircleHeart,
  Target,
  Trophy,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";
import heroAthlete from "@/assets/hero-athlete.jpg";
import mealImg from "@/assets/meal.jpg";
import yogaImg from "@/assets/yoga.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yodha.ai — Train smarter. Forge stronger." },
      {
        name: "description",
        content:
          "Your AI fitness warrior. Personalized plans, meal recognition, habits, and a coach in your pocket.",
      },
      { property: "og:title", content: "Yodha.ai — Train smarter. Forge stronger." },
      {
        property: "og:description",
        content:
          "AI-powered training plans that adapt to your performance, sleep, and life.",
      },
    ],
  }),
  component: Landing,
});

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
      <Sparkles className="h-3 w-3" />
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
      {children}
    </p>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/40">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">
            Yodha<span className="text-primary">.ai</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#dashboard" className="transition hover:text-foreground">Dashboard</a>
          <a href="#leagues" className="transition hover:text-foreground">Leagues</a>
          <a href="#coach" className="transition hover:text-foreground">AI Coach</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow glow-primary"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <Pill>Awaken your inner warrior</Pill>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Train smarter.
            <br />
            <span className="text-gradient-primary">Forge stronger.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Yodha is your personal fitness warrior — turning every goal into a
            week-by-week plan, adapting to your performance, and recognizing the
            food on your plate. One app for body, mind, and momentum.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow glow-primary"
            >
              Build my plan
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-elevated"
            >
              <Play className="h-4 w-4" />
              Open dashboard
            </Link>
          </div>
          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
            {[
              ["2.4M", "Workouts logged"],
              ["98%", "Plan adherence"],
              ["4.9★", "App rating"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-2xl font-bold sm:text-3xl">{k}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-full bg-primary/20 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card-soft">
            <img
              src={heroAthlete}
              alt="Athlete in motion with AI fitness overlays"
              width={1280}
              height={1280}
              className="aspect-square w-full object-cover"
            />
          </div>
          <FloatingCard
            className="absolute -left-4 bottom-10 sm:-left-10"
            label="Heart rate"
            valueNode={
              <>
                <span className="font-display text-4xl font-bold text-primary">142</span>
                <span className="ml-1 text-sm text-muted-foreground">bpm</span>
              </>
            }
            footer="Zone 3 · Cardio"
          />
          <FloatingCard
            className="absolute -right-2 top-8 sm:-right-8"
            label="Today's goal"
            valueNode={
              <>
                <span className="font-display text-3xl font-bold">8,430</span>
                <span className="ml-1 text-sm text-muted-foreground">/ 10k</span>
              </>
            }
            footer={
              <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[84%] rounded-full bg-primary" />
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className = "",
  label,
  valueNode,
  footer,
}: {
  className?: string;
  label: string;
  valueNode: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface-elevated/95 p-4 shadow-card-soft backdrop-blur ${className}`}
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-baseline">{valueNode}</div>
      <div className="text-xs text-muted-foreground">{footer}</div>
    </div>
  );
}

const FEATURES = [
  { icon: Brain, title: "AI Fitness Coach", body: "Daily personalized workouts that adapt to your performance, recovery, and life. Miss 3 sessions? Your week reshapes itself." },
  { icon: Target, title: "Goal-to-Plan Generator", body: "Type 'Lose 10kg in 6 months'. Get weight milestones, weekly targets, workouts, and nutrition — instantly executable." },
  { icon: Apple, title: "Meal Recognition", body: "Snap your plate. AI identifies calories, protein, carbs, and fat — then logs the meal for you. No typing required." },
  { icon: Flame, title: "Smart Habit Tracking", body: "Water, sleep, steps, protein, meditation — tracked beautifully in one place with streaks that actually motivate." },
  { icon: Trophy, title: "Fitness Leagues", body: "Climb from Bronze to Elite. Earn shareable badges across WhatsApp, Instagram, and Facebook." },
  { icon: MessageCircleHeart, title: "Motivational Chat", body: "A coach in your pocket. Vent, plan, or ask 'what's next?' — your AI replies with empathy and a strategy." },
];

function Features() {
  return (
    <section id="features" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold sm:text-5xl">
          Every tool you need to{" "}
          <span className="text-gradient-primary">show up daily.</span>
        </h2>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition hover:border-primary/40 hover:bg-surface-elevated"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
              <div className="relative">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const bars = [40, 55, 38, 70, 62, 80, 58, 72, 88, 76, 92, 84];
  return (
    <section id="dashboard" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow>Your command center</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold sm:text-5xl">
          A dashboard that <span className="text-gradient-primary">tells the truth.</span>
        </h2>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Weekly performance */}
          <div className="rounded-3xl border border-border bg-surface p-6 lg:col-span-2 shadow-card-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Weekly performance</p>
                <p className="mt-2 font-display text-3xl font-bold">8,742 <span className="text-base font-normal text-muted-foreground">calories burned</span></p>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">+12.4%</span>
            </div>
            <div className="mt-8 flex h-44 items-end gap-2">
              {bars.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-md bg-primary/80"
                    style={{ height: `${h}%`, opacity: 0.4 + h / 200 }}
                  />
                  <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-6">
            {[
              { icon: Flame, label: "Streak", value: "24", unit: "days" },
              { icon: Activity, label: "Sleep", value: "7.4", unit: "hrs avg" },
              { icon: Dumbbell, label: "Steps", value: "11.2k", unit: "today" },
            ].map(({ icon: Icon, label, value, unit }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="font-display text-2xl font-bold">
                    {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Meal */}
          <div className="overflow-hidden rounded-3xl border border-border bg-surface lg:col-span-2">
            <div className="grid sm:grid-cols-2">
              <img src={mealImg} alt="Logged meal" loading="lazy" width={800} height={800} className="h-full w-full object-cover" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-primary">AI Detected · Lunch</p>
                <h3 className="mt-2 font-display text-2xl font-semibold">Grilled chicken quinoa bowl</h3>
                <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                  {[["Cal","542"],["Protein","38g"],["Carbs","52g"],["Fat","18g"]].map(([l,v])=>(
                    <div key={l} className="rounded-xl bg-surface-elevated p-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
                      <p className="mt-1 font-display text-lg font-bold text-primary">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coach */}
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6">
            <p className="text-xs uppercase tracking-widest text-primary">Coach suggests</p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug">
              Take a 20-min recovery walk tonight. Your HRV dropped 8%.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-glow">
              Add to plan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Leagues() {
  const tiers = [
    { name: "Bronze", members: "180k", color: "oklch(0.65 0.13 60)" },
    { name: "Silver", members: "92k", color: "oklch(0.80 0.02 240)" },
    { name: "Gold", members: "41k", color: "oklch(0.85 0.17 85)" },
    { name: "Platinum", members: "12k", color: "oklch(0.90 0.05 200)" },
    { name: "Elite", members: "2.1k", color: "oklch(0.87 0.24 142)" },
  ];
  return (
    <section id="leagues" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Fitness Leagues</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Climb your way to <span className="text-gradient-primary">Elite.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Earn badges as you progress. Share your wins on WhatsApp, Instagram, and Facebook.
            </p>
            <div className="mt-10 space-y-3">
              {tiers.map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full ring-2 ring-border"
                      style={{ background: t.color }}
                    >
                      <Trophy className="h-5 w-5 text-background" />
                    </span>
                    <span className="font-display text-lg font-semibold">{t.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{t.members} members</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-full bg-primary/15 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-border">
              <img src={yogaImg} alt="Person practicing yoga" loading="lazy" width={900} height={1200} className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-primary">Recovery suggested</p>
              <p className="mt-1 font-display text-base font-semibold">20-min yoga flow + 8 hrs sleep</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Coach() {
  return (
    <section id="coach" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Eyebrow>AI Coach</Eyebrow>
        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          Talk to a coach that <span className="text-gradient-primary">actually listens.</span>
        </h2>

        <div className="mt-12 space-y-4">
          <div className="ml-auto max-w-md rounded-2xl rounded-tr-md border border-border bg-surface-elevated p-4 text-sm">
            I skipped two leg days this week. Frustrated.
          </div>
          <div className="max-w-xl rounded-2xl rounded-tl-md border border-primary/30 bg-primary/10 p-5 text-sm leading-relaxed">
            <p>
              That's okay — life happens. Let's stack a 25-min lower-body session
              tomorrow morning and shift Sunday to a recovery walk. I'll reduce
              volume by 20% so you don't overload.
            </p>
            <p className="mt-3 text-muted-foreground">
              Also: your sleep is down 11%. Want me to push your alarm 30 mins later?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold sm:text-6xl">
          Your strongest year{" "}
          <span className="text-gradient-primary">starts today.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Join 2.4M people who let AI handle the planning so they can focus on
          showing up.
        </p>
        <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow glow-primary">
          Start free <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary">
            <Activity className="h-4 w-4" />
          </span>
          <span className="font-display font-semibold text-foreground">
            Yodha<span className="text-primary">.ai</span>
          </span>
        </div>
        <p>© {new Date().getFullYear()} Yodha. Forge stronger.</p>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Dashboard />
        <Leagues />
        <Coach />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
