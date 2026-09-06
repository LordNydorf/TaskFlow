import { useEffect, useState } from "react";
import { Trash2, CheckCircle2, Bell, AlertCircle, X } from "lucide-react";

export default function ToastNotification({ toast, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const duration = toast.duration || 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const renderIcon = () => {
    if (toast.type === "delete") {
      return <Trash2 size={16} aria-hidden="true" />;
    }
    if (toast.type === "success") {
      return <CheckCircle2 size={16} aria-hidden="true" />;
    }
    if (toast.type === "error") {
      return <AlertCircle size={16} aria-hidden="true" />;
    }
    return <Bell size={16} aria-hidden="true" />;
  };

  return (
    <aside
      className="toast-container"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`toast-card ${toast.type || "info"}`}>
        <div className="toast-content">
          <span className="toast-icon-wrap">{renderIcon()}</span>
          <span className="toast-message">{toast.message}</span>
        </div>

        <div className="toast-actions">
          {toast.onAction && (
            <button
              type="button"
              className="toast-action-btn"
              onClick={() => {
                toast.onAction();
                onClose();
              }}
              aria-label={toast.actionLabel || "Undo action"}
            >
              {toast.actionLabel || "Undo"}
            </button>
          )}

          <button
            type="button"
            className="toast-close-btn"
            onClick={onClose}
            aria-label="Dismiss notification"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Dynamic visual timeout progress bar */}
        <div
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}
