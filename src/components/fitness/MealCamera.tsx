import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { recognizeMeal } from "@/lib/ai.functions";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MealCamera({ userId }: { userId: string }) {
  const recognize = useServerFn(recognizeMeal);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    if (file.size > 6_000_000) {
      toast.error("Image too large (max 6MB)");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await recognize({ data: { imageBase64: base64, mimeType: file.type || "image/jpeg" } });
      toast.success(`Logged: ${result.name} (${result.calories} kcal)`);
      await qc.invalidateQueries({ queryKey: ["meals-today", userId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not recognize meal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-elevated p-6 text-sm transition hover:border-primary hover:bg-primary/5 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Analyzing your plate…</span>
          </>
        ) : (
          <>
            <Camera className="h-6 w-6 text-primary" />
            <span>Snap or upload a meal photo</span>
            <span className="text-xs text-muted-foreground">AI estimates macros and logs it</span>
          </>
        )}
      </button>
      {preview && (
        <img src={preview} alt="meal preview" className="mt-3 max-h-48 rounded-xl object-cover" />
      )}
    </div>
  );
}
