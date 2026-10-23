import { AlertCircle, Loader2 } from "lucide-react";

export function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-gray-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}

export function Alert({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
