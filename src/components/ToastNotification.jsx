import { useEffect, useState } from "react";

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

  return (
    <aside
      className="toast-container"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`toast-card ${toast.type || "info"}`}>
        <div className="toast-content">
          <i
            className={`toast-icon ${
              toast.type === "delete"
                ? "fa-solid fa-trash-can"
                : toast.type === "success"
                ? "fa-solid fa-circle-check"
                : "fa-solid fa-bell"
            }`}
            aria-hidden="true"
          />
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
            <i className="fa-solid fa-xmark" aria-hidden="true" />
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
