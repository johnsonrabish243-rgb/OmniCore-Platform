"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { ChallengeType, ChallengeData } from "@/lib/omnicaptcha";
import { Loader2, Shield, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface Payload {
  id: string; type: ChallengeType; question: string; data: ChallengeData; token: string;
}

interface Props {
  onVerify: (verified: boolean, token?: string) => void;
  className?: string; invisible?: boolean; id?: string;
}

const STORAGE_KEY = "omnicaptcha:verified";

export function OmniCaptcha({ onVerify, className, invisible, id }: Props) {
  const t = useTranslations("omniCaptcha");
  const locale = useLocale();
  const [captcha, setCaptcha] = useState<Payload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "valid" | "invalid">("loading");
  const [error, setError] = useState("");
  const verifiedRef = useRef(false);
  const keyRef = useRef(0);
  const restored = useRef(false);

  const gen = useCallback(async () => {
    setStatus("loading"); setError(""); verifiedRef.current = false;
    keyRef.current++;
    try {
      const res = await fetch("/api/captcha/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setCaptcha(data);
      if (invisible) { setStatus("valid"); onVerify(true, data.token); verifiedRef.current = true; }
      else setStatus("ready");
    } catch { setError(t("loadError")); setStatus("invalid"); }
  }, [t, locale, invisible, onVerify]);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(STORAGE_KEY)) {
      setStatus("valid"); verifiedRef.current = true; restored.current = true;
      onVerify(true);
      return;
    }
    gen();
  }, [gen, onVerify]);

  const submit = async (answer: string) => {
    if (!captcha || verifiedRef.current) return;
    setStatus("verifying"); setError("");
    try {
      const res = await fetch("/api/captcha/verify", {
        method: "POST", headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ token: captcha.token, answer }),
      });
      const r = await res.json();
      if (r.valid) {
        setStatus("valid"); verifiedRef.current = true;
        try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {}
        onVerify(true, captcha.token);
      } else { setStatus("invalid"); setError(t("incorrect")); onVerify(false); setTimeout(() => gen(), 1500); }
    } catch { setStatus("invalid"); setError(t("verifyError")); onVerify(false); }
  };

  if (invisible) {
    if (status === "valid" || verifiedRef.current) return null;
    return (
      <div id={id} className={cn("flex items-center gap-2", className)}>
        {status === "loading" && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        {status === "invalid" && (
          <button type="button" onClick={gen} className="flex items-center gap-1 text-xs text-destructive hover:underline">
            <XCircle className="h-3 w-3" />{error || t("loadError")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-[14px] border border-border/50 bg-muted/30 p-4 space-y-3 transition-all duration-300",
      status === "valid" && "border-emerald-500/30 bg-emerald-500/5",
      status === "invalid" && "border-destructive/30 bg-destructive/5",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors",
            status === "valid" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
          )}>
            {status === "valid" ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {status === "valid" ? t("verified") : t("title")}
          </span>
        </div>
        {status === "ready" && (
          <button type="button" onClick={gen}
            className="flex h-7 w-7 items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
            title={t("refresh")}
          ><RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /></button>
        )}
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {status === "valid" && (
        <div className="flex items-center gap-2.5 py-3 animate-fade-in-up">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t("verified")}</span>
        </div>
      )}

      {(status === "ready" || status === "invalid" || status === "verifying") && captcha && (
        <Renderer key={keyRef.current} type={captcha.type} data={captcha.data} status={status} onSubmit={submit} error={error} t={t} />
      )}

      <p className="text-[10px] text-muted-foreground/40 text-center">{t("footer")}</p>
    </div>
  );
}

/* ─── Challenge Renderer ─── */

function Renderer({ type, data, status, onSubmit, error, t }: {
  type: ChallengeType; data: ChallengeData; status: string; onSubmit: (a: string) => void; error: string; t: (k: string) => string;
}) {
  switch (type) {
    case "checkbox": return <CheckboxChallenge data={data as any} status={status} onSubmit={onSubmit} t={t} />;
    case "image-select": return <ImageSelect data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "puzzle-grid": return <PuzzleGrid data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "math": return <MathChallenge data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    default: return null;
  }
}

/* ─── 1. Checkbox (like hCaptcha main flow) ─── */

function CheckboxChallenge({ data, status, onSubmit, t }: any) {
  const [checked, setChecked] = useState(false);

  return (
    <label className={cn(
      "flex items-center gap-3 p-3 rounded-[10px] border-2 cursor-pointer transition-all select-none",
      "hover:bg-accent/50",
      checked ? "border-primary bg-primary/5" : "border-border/50",
      status === "verifying" && "opacity-50 pointer-events-none"
    )}>
      <div className={cn(
        "flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-all shrink-0",
        checked ? "bg-primary border-primary" : "border-muted-foreground/30"
      )}>
        {checked && <CheckCircle className="h-3.5 w-3.5 text-white" />}
      </div>
      <input type="checkbox" className="sr-only" checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          if (e.target.checked) onSubmit("confirmed");
        }}
      />
      <span className="text-sm text-foreground/80 font-medium">{data.label}</span>
      {status === "verifying" && <Loader2 className="h-4 w-4 animate-spin ml-auto shrink-0" />}
    </label>
  );
}

/* ─── 2. Image Select (like hCaptcha image challenges) ─── */

function ImageSelect({ data, status, onSubmit, error, t }: any) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    if (status === "verifying") return;
    setSelected(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.description}</p>
      <div className="grid grid-cols-3 gap-2">
        {data.grid.map((cell: any) => (
          <button key={cell.id} type="button" onClick={() => toggle(cell.id)}
            disabled={status === "verifying"}
            className={cn(
              "flex items-center justify-center h-14 rounded-[10px] border-2 text-xl transition-all duration-150",
              "hover:bg-accent active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30",
              selected.has(cell.id) ? "border-primary bg-primary/10" : "border-border/50 bg-card"
            )}
          >{cell.emoji}</button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      <button type="button" onClick={() => onSubmit([...selected].sort((a, b) => a - b).join(","))}
        disabled={selected.size === 0 || status === "verifying"}
        className="w-full h-10 rounded-[10px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-1.5"
      >
        {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verify")}
      </button>
    </div>
  );
}

/* ─── 3. Puzzle Grid (odd one out) ─── */

function PuzzleGrid({ data, status, onSubmit, error, t }: any) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.description}</p>
      <div className="grid grid-cols-3 gap-2">
        {data.grid.map((cell: any) => (
          <button key={cell.id} type="button" onClick={() => setSelected(cell.id)}
            disabled={status === "verifying"}
            className={cn(
              "flex items-center justify-center h-14 rounded-[10px] border-2 text-xl transition-all",
              "hover:bg-accent active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30",
              selected === cell.id ? "border-primary bg-primary/10" : "border-border/50 bg-card"
            )}
          >{cell.emoji}</button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      <button type="button" onClick={() => onSubmit(selected!.toString())}
        disabled={selected === null || status === "verifying"}
        className="w-full h-10 rounded-[10px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-1.5"
      >
        {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verify")}
      </button>
    </div>
  );
}

/* ─── 4. Math (text fallback) ─── */

function MathChallenge({ data, status, onSubmit, error, t }: any) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="space-y-3">
      <div className="px-4 py-3.5 text-center bg-card rounded-[12px] border border-border/40">
        <p className="text-base font-semibold">{data.question}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="text" inputMode="numeric" placeholder={t("answerPlaceholder")}
          value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSubmit(answer); }}
          disabled={status === "verifying"} autoComplete="off"
          className="w-full h-10 rounded-[10px] border border-border/50 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
        <button type="button" onClick={() => onSubmit(answer)}
          disabled={!answer.trim() || status === "verifying"}
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 shrink-0"
        >
          {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("verify")}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
