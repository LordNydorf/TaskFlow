import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    ({
      message,
      actionLabel,
      onAction,
      type = "info",
      duration = 5000,
    }) => {
      setToast({
        id: Date.now(),
        message,
        actionLabel,
        onAction,
        type,
        duration,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
