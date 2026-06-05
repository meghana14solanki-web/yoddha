import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { coachChat, fetchCoachHistory } from "@/lib/ai.functions";

export function CoachChat({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const fetchHistory = useServerFn(fetchCoachHistory);
  const sendChat = useServerFn(coachChat);
  const { data: history } = useQuery({
    queryKey: ["coach-history", userId],
    queryFn: () => fetchHistory(),
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [history, pending]);

  async function send() {
    const msg = input.trim();
    if (!msg || pending) return;
    setInput("");
    setPending(true);
    try {
      await sendChat({ data: { message: msg } });
      await qc.invalidateQueries({ queryKey: ["coach-history", userId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Coach is unavailable");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col">
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto pr-2">
        {(!history || history.length === 0) && !pending && (
          <div className="rounded-2xl bg-surface-elevated p-4 text-sm text-muted-foreground">
            <Sparkles className="mb-2 inline h-4 w-4 text-primary" /> Ask your coach anything — workout suggestions, recovery, motivation.
          </div>
        )}
        {history?.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-surface-elevated text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-surface-elevated px-3.5 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Coach is thinking…
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="What should I do today?"
          className="input flex-1"
          disabled={pending}
        />
        <button
          onClick={send}
          disabled={pending || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
