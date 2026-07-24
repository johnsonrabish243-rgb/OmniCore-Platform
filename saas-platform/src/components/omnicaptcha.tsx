"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { ChallengeType, ChallengeData } from "@/lib/omnicaptcha";
import {
  Loader2, Shield, RefreshCw, CheckCircle, XCircle, Zap, GripVertical, RotateCw
} from "lucide-react";

interface CaptchaPayload {
  id: string;
  type: ChallengeType;
  question: string;
  data: ChallengeData;
  token: string;
}

interface OmniCaptchaProps {
  onVerify: (verified: boolean, token?: string) => void;
  className?: string;
  invisible?: boolean;
  id?: string;
}

export function OmniCaptcha({ onVerify, className, invisible, id }: OmniCaptchaProps) {
  const t = useTranslations("omniCaptcha");
  const locale = useLocale();
  const [captcha, setCaptcha] = useState<CaptchaPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "valid" | "invalid">("loading");
  const [error, setError] = useState("");
  const verifiedRef = useRef(false);
  const [interactionKey, setInteractionKey] = useState(0);

  const generateChallenge = useCallback(async () => {
    setStatus("loading");
    setError("");
    verifiedRef.current = false;
    setInteractionKey(k => k + 1);
    try {
      const res = await fetch("/api/captcha/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!res.ok) throw new Error("Failed to generate captcha");
      const data = await res.json();
      setCaptcha(data);
      if (invisible) {
        setStatus("valid");
        onVerify(true, data.token);
        verifiedRef.current = true;
      } else {
        setStatus("ready");
      }
    } catch {
      setError(t("loadError"));
      setStatus("invalid");
    }
  }, [t, locale, invisible, onVerify]);

  useEffect(() => { generateChallenge(); }, [generateChallenge]);

  const submitAnswer = async (answer: string) => {
    if (!captcha || verifiedRef.current) return;
    setStatus("verifying");
    setError("");
    try {
      const res = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ token: captcha.token, answer }),
      });
      const result = await res.json();
      if (result.valid) {
        setStatus("valid");
        verifiedRef.current = true;
        onVerify(true, captcha.token);
      } else {
        setStatus("invalid");
        setError(t("incorrect"));
        onVerify(false);
        setTimeout(() => generateChallenge(), 1500);
      }
    } catch {
      setStatus("invalid");
      setError(t("verifyError"));
      onVerify(false);
    }
  };

  if (invisible) {
    if (status === "valid" || verifiedRef.current) return null;
    return (
      <div id={id} className={cn("flex items-center gap-2", className)}>
        {status === "loading" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>OmniCaptcha…</span>
          </div>
        )}
        {status === "invalid" && (
          <button type="button" onClick={generateChallenge}
            className="flex items-center gap-1 text-xs text-destructive hover:underline transition-colors"
          >
            <XCircle className="h-3 w-3" />
            {error || t("loadError")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-[14px] border border-border/50 bg-gradient-to-b from-muted/40 to-muted/20 p-4 space-y-3 transition-all duration-300",
      status === "valid" && "border-emerald-500/30 bg-emerald-500/5",
      status === "invalid" && "border-destructive/30 bg-destructive/5",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors duration-300",
            status === "valid" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
          )}>
            {status === "valid" ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {status === "valid" ? t("verified") : t("title")}
          </span>
        </div>
        {status === "ready" && (
          <button onClick={generateChallenge}
            className="flex h-7 w-7 items-center justify-center rounded-[8px] hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
            title={t("refresh")} type="button"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground animate-pulse">OmniCaptcha…</span>
          </div>
        </div>
      )}

      {status === "valid" && (
        <div className="flex items-center gap-2.5 py-3 transition-all duration-500 animate-fade-in-up">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t("verified")}</p>
            <p className="text-[10px] text-muted-foreground/60">{t("footer")}</p>
          </div>
        </div>
      )}

      {(status === "ready" || status === "invalid" || status === "verifying") && captcha && (
        <ChallengeRenderer
          key={interactionKey}
          type={captcha.type}
          data={captcha.data}
          status={status}
          onSubmit={submitAnswer}
          error={error}
          t={t}
        />
      )}

      <div className="flex items-center justify-center gap-1">
        <Shield className="h-3 w-3 text-muted-foreground/30" />
        <p className="text-[10px] text-muted-foreground/40 text-center">{t("footer")}</p>
      </div>
    </div>
  );
}

/* ─── Challenge Renderer ─── */

function ChallengeRenderer({
  type, data, status, onSubmit, error, t
}: {
  type: ChallengeType;
  data: ChallengeData;
  status: string;
  onSubmit: (answer: string) => void;
  error: string;
  t: (key: string) => string;
}) {
  switch (type) {
    case "puzzle-slider":
      return <PuzzleSlider data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "shape-select":
      return <ShapeSelect data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "drag-order":
      return <DragOrder data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "rotation":
      return <RotationChallenge data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "click-match":
      return <ClickMatch data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "pattern-complete":
      return <PatternComplete data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "puzzle-grid":
      return <PuzzleGrid data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "math":
      return <MathChallenge data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    case "count-shapes":
      return <CountShapes data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
    default:
      return <MathChallenge data={data as any} status={status} onSubmit={onSubmit} error={error} t={t} />;
  }
}

/* ─── Puzzle Slider ─── */
function PuzzleSlider({ data, status, onSubmit, error, t }: any) {
  const [value, setValue] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setValue(Math.round(pct));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointer(e.clientX);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-4xl">{data.emoji}</span>
      </div>
      <p className="text-sm text-center text-muted-foreground">{data.label}</p>
      <div
        ref={trackRef}
        className="relative h-10 bg-muted rounded-[10px] cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => { if (e.buttons > 0) handlePointer(e.clientX); }}
      >
        <div className="absolute inset-y-0 left-0 rounded-[10px] bg-primary/20 transition-[width] duration-75"
          style={{ width: `${value}%` }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary shadow-md border-2 border-background transition-[left] duration-75 flex items-center justify-center text-xs text-white font-bold"
          style={{ left: `calc(${value}% - 14px)` }}
        >
          {value}
        </div>
      </div>
      <SubmitButton status={status} onSubmit={() => onSubmit(value.toString())} t={t} error={error} />
    </div>
  );
}

/* ─── Shape Select ─── */
function ShapeSelect({ data, status, onSubmit, error, t }: any) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.description}</p>
      <div className="grid grid-cols-3 gap-2">
        {data.grid.map((cell: any) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => toggle(cell.id)}
            disabled={status === "verifying"}
            className={cn(
              "flex items-center justify-center h-14 rounded-[10px] border-2 text-xl transition-all duration-150",
              "hover:bg-accent active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30",
              selected.has(cell.id)
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border/50 bg-card"
            )}
          >
            <span role="img">{cell.emoji}</span>
          </button>
        ))}
      </div>
      <SubmitButton
        status={status}
        onSubmit={() => onSubmit([...selected].sort((a, b) => a - b).join(","))}
        disabled={selected.size === 0}
        t={t}
        error={error}
      />
    </div>
  );
}

/* ─── Drag Order ─── */
function DragOrder({ data, status, onSubmit, error, t }: any) {
  const [items, setItems] = useState(data.items);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => { setDragIdx(idx); };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setItems(next);
    setDragIdx(idx);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.description}</p>
      <div className="space-y-1.5">
        {items.map((item: any, idx: number) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={() => setDragIdx(null)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-[10px] border border-border/40 bg-card cursor-grab active:cursor-grabbing select-none transition-shadow",
              dragIdx === idx && "opacity-50 shadow-sm"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      <SubmitButton status={status} onSubmit={() => onSubmit(items.map((i: any) => i.id).join(","))} t={t} error={error} />
    </div>
  );
}

/* ─── Rotation ─── */
function RotationChallenge({ data, status, onSubmit, error, t }: any) {
  const [angle, setAngle] = useState(0);
  const dragging = useRef(false);

  const handlePointer = (clientX: number, clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const a = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    setAngle(Math.round(((a + 360) % 360)));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.directionLabel}</p>
      <div
        className="flex items-center justify-center py-4"
        onPointerDown={(e) => {
          dragging.current = true;
          handlePointer(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerMove={(e) => { if (dragging.current) handlePointer(e.clientX, e.clientY, e.currentTarget); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerLeave={() => { dragging.current = false; }}
      >
        <div className="relative w-24 h-24 rounded-full border-2 border-border flex items-center justify-center">
          <RotateCw className="absolute top-1 left-1/2 -translate-x-1/2 h-3 w-3 text-muted-foreground/50" />
          <div
            className="text-3xl transition-transform duration-75 cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {data.emoji}
          </div>
          <div className="absolute bottom-1 text-[10px] text-muted-foreground/60">{angle}°</div>
        </div>
      </div>
      <SubmitButton status={status} onSubmit={() => onSubmit(angle.toString())} t={t} error={error} />
    </div>
  );
}

/* ─── Click Match ─── */
function ClickMatch({ data, status, onSubmit, error, t }: any) {
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());

  const handleClick = (cell: any) => {
    if (matched.has(cell.id) || status === "verifying") return;
    const next = [...selected, cell.id];
    if (next.length === 2) {
      const a = data.grid.find((c: any) => c.id === next[0]);
      const b = data.grid.find((c: any) => c.id === next[1]);
      if (a && b && a.pairId === b.pairId && a.id !== b.id) {
        setMatched(prev => new Set([...prev, a.id, b.id]));
      }
      setSelected([]);
    } else {
      setSelected(next);
    }
  };

  const allMatched = matched.size === data.grid.length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{t("verify")}</p>
      <div className="grid grid-cols-3 gap-2">
        {data.grid.map((cell: any) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => handleClick(cell)}
            disabled={matched.has(cell.id) || status === "verifying"}
            className={cn(
              "flex items-center justify-center h-12 rounded-[10px] border-2 text-xl transition-all duration-150",
              "hover:bg-accent active:scale-95",
              matched.has(cell.id) && "border-emerald-500/50 bg-emerald-500/10 opacity-60",
              selected.includes(cell.id) && !matched.has(cell.id) && "border-primary bg-primary/10"
            )}
          >
            {cell.emoji}
          </button>
        ))}
      </div>
      {allMatched && (
        <SubmitButton status={status} onSubmit={() => onSubmit("matched")} t={t} error={error} />
      )}
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}

/* ─── Pattern Complete ─── */
function PatternComplete({ data, status, onSubmit, error, t }: any) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{t("verify")}</p>
      <div className="flex items-center justify-center gap-2 py-2">
        {data.sequence.map((emoji: string, i: number) => (
          <span key={i} className="text-2xl">{emoji}</span>
        ))}
        <span className="text-2xl text-muted-foreground/30">?</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.options.map((emoji: string, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelected(idx)}
            disabled={status === "verifying"}
            className={cn(
              "flex items-center justify-center h-14 rounded-[10px] border-2 text-xl transition-all",
              "hover:bg-accent active:scale-95",
              selected === idx ? "border-primary bg-primary/10" : "border-border/50 bg-card"
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
      <SubmitButton
        status={status}
        onSubmit={() => onSubmit(selected!.toString())}
        disabled={selected === null}
        t={t}
        error={error}
      />
    </div>
  );
}

/* ─── Puzzle Grid (Odd One Out) ─── */
function PuzzleGrid({ data, status, onSubmit, error, t }: any) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.description}</p>
      <div className="grid grid-cols-3 gap-2">
        {data.grid.map((cell: any) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => setSelected(cell.id)}
            disabled={status === "verifying"}
            className={cn(
              "flex items-center justify-center h-14 rounded-[10px] border-2 text-xl transition-all",
              "hover:bg-accent active:scale-95",
              selected === cell.id ? "border-primary bg-primary/10" : "border-border/50 bg-card"
            )}
          >
            {cell.emoji}
          </button>
        ))}
      </div>
      <SubmitButton
        status={status}
        onSubmit={() => onSubmit(selected!.toString())}
        disabled={selected === null}
        t={t}
        error={error}
      />
    </div>
  );
}

/* ─── Math Challenge ─── */
function MathChallenge({ data, status, onSubmit, error, t }: any) {
  const [answer, setAnswer] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (status === "ready") setTimeout(() => inputRef.current?.focus(), 100); }, [status]);

  return (
    <div className="space-y-3">
      <div className="px-4 py-3.5 text-center bg-card rounded-[12px] border border-border/40">
        <p className="text-base font-semibold tracking-tight">{data.question}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text" inputMode="numeric"
          placeholder={t("answerPlaceholder")}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSubmit(answer); }}
          disabled={status === "verifying"}
          autoComplete="off"
          className="w-full h-10 rounded-[10px] border border-border/50 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
        <button
          type="button"
          onClick={() => onSubmit(answer)}
          disabled={!answer.trim() || status === "verifying"}
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] disabled:opacity-40 shrink-0"
        >
          {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-3.5 w-3.5" />{t("verify")}</>}
        </button>
      </div>
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}

/* ─── Count Shapes ─── */
function CountShapes({ data, status, onSubmit, error, t }: any) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-sm text-center font-medium">{data.question}</p>
      <div className="flex items-center justify-center gap-1 flex-wrap py-2 text-2xl">
        {Array.from({ length: data.count }).map((_, i) => (
          <span key={i}>{data.emoji}</span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text" inputMode="numeric"
          placeholder={t("answerPlaceholder")}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSubmit(answer); }}
          disabled={status === "verifying"}
          autoComplete="off"
          className="w-full h-10 rounded-[10px] border border-border/50 bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
        <button
          type="button"
          onClick={() => onSubmit(answer)}
          disabled={!answer.trim() || status === "verifying"}
          className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] disabled:opacity-40 shrink-0"
        >
          {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-3.5 w-3.5" />{t("verify")}</>}
        </button>
      </div>
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}

/* ─── Shared UI ─── */

function SubmitButton({ status, onSubmit, disabled, t, error }: any) {
  return (
    <>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || status === "verifying"}
        className={cn(
          "w-full h-10 rounded-[10px] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5",
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {status === "verifying" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <><Zap className="h-3.5 w-3.5" />{t("verify")}</>
        )}
      </button>
      {error && <ErrorDisplay error={error} />}
    </>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in-up">
      <XCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
}
