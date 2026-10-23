import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { ToastContext } from "./contexts";

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((toast) => toast.id !== id)), []);

  const show = useCallback(
    (message, type = "success") => {
      const id = nextId++;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ success: (m) => show(m, "success"), error: (m) => show(m, "error") }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 z-[60] flex flex-col items-center gap-2 sm:left-auto sm:items-end" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex w-full max-w-sm items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          >
            {t.type === "error" ? (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            )}
            <p className="flex-1 text-sm text-gray-800">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
