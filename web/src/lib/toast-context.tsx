"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Check, Info, TriangleAlert, X } from "lucide-react";

/**
 * Minimal toast primitive — a top-right stack of dismissable cards.
 * Each toast auto-dismisses after `DEFAULT_DURATION_MS`; callers can
 * override per-toast. The provider mounts the renderer via portal so
 * it sits above every panel and dialog without participating in the
 * resizable-grid layout.
 */

export type ToastKind = "success" | "info" | "warning" | "error";

export type ToastInput = {
  kind?: ToastKind;
  title: string;
  description?: string;
  /** Milliseconds before auto-dismiss. Defaults to 3000 ms. */
  durationMs?: number;
};

type Toast = ToastInput & { id: string; kind: ToastKind };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3000;
const EXIT_ANIMATION_MS = 300;
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = `t-${nextId++}`;
    setToasts((prev) => [...prev, { kind: "info", ...input, id }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside a <ToastProvider>");
  }
  return ctx;
}

/* ──────────────────────────────────────────────────────────────────────
 * Renderer
 * ─────────────────────────────────────────────────────────────────────*/

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    // Bottom-left, above the 36px status bar with a small gap. flex-col
    // with the newest toast at the end of the array means the most
    // recent message sits closest to the status bar; older toasts get
    // pushed up as the stack grows.
    <div className="pointer-events-none fixed bottom-12 left-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <ToastView key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>,
    document.body
  );
}

const ICONS: Record<ToastKind, typeof Check> = {
  success: Check,
  info: Info,
  warning: TriangleAlert,
  error: AlertCircle,
};

const ACCENTS: Record<ToastKind, string> = {
  success: "border-buy/40 bg-buy-soft text-buy",
  info: "border-info/40 bg-info/15 text-info",
  warning: "border-warning/40 bg-warning/15 text-warning",
  error: "border-sell/40 bg-sell-soft text-sell",
};

function ToastView({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const duration = toast.durationMs ?? DEFAULT_DURATION_MS;
  // `exiting` flips when the auto-dismiss timer fires or the user
  // clicks the close button. We swap entry classes for exit classes,
  // then let `onDismiss` unmount the node after the fade-out runs.
  const [exiting, setExiting] = useState(false);

  const beginExit = useCallback(() => {
    setExiting((cur) => {
      if (cur) return cur;
      setTimeout(onDismiss, EXIT_ANIMATION_MS);
      return true;
    });
  }, [onDismiss]);

  useEffect(() => {
    const id = setTimeout(beginExit, duration);
    return () => clearTimeout(id);
  }, [duration, beginExit]);

  const Icon = ICONS[toast.kind];
  const accent = ACCENTS[toast.kind];

  return (
    <div
      role="status"
      // Distinct from `--surface`/`--surface-2`: a near-black base with
      // backdrop-blur so the toast reads as a layer floating above the
      // panels rather than another panel.
      //
      // Entry: longer duration + ease-out for a calm rise from below.
      // Exit: fade-only, fill-forwards so the node holds its faded
      // state until React unmounts it (otherwise CSS reverts to opacity
      // 1 for a frame and you get a flash).
      className={`pointer-events-auto flex items-start gap-2 rounded-md border border-border-strong bg-[#05080A]/90 p-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md ${
        exiting
          ? "animate-out fade-out duration-300 ease-in fill-mode-forwards"
          : "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${accent}`}
      >
        <Icon size={11} strokeWidth={3} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-text">{toast.title}</div>
        {toast.description && (
          <div className="mt-0.5 text-xs text-text-muted">
            {toast.description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={beginExit}
        aria-label="Dismiss"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-subtle hover:bg-surface-3 hover:text-text"
      >
        <X size={11} />
      </button>
    </div>
  );
}
