import { useEffect, useState } from "react";

export function useKeyboardShortcuts({
  todos,
  onOpenCommandPalette,
  onOpenBackupModal,
  onToggleComplete,
  onDeleteTodo,
  onStartEdit,
  onChangePriority,
}) {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const tagName = activeEl?.tagName?.toLowerCase();
      const isInput =
        tagName === "input" ||
        tagName === "textarea" ||
        activeEl?.isContentEditable;

      // Handle Command Palette (Ctrl+K or Cmd+K) anywhere
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // If typing in input/textarea, only handle Escape
      if (isInput) {
        if (e.key === "Escape") {
          activeEl?.blur();
        }
        return;
      }

      // Shortcuts when NOT focused in an input
      if (e.key === "/") {
        e.preventDefault();
        const searchEl = document.getElementById("task-search-input");
        if (searchEl) {
          searchEl.focus();
          searchEl.select();
        }
      } else if (e.key === "c" || e.key === "C" || (e.altKey && (e.key === "n" || e.key === "N"))) {
        e.preventDefault();
        const inputEl = document.getElementById("new-task-input");
        if (inputEl) {
          inputEl.focus();
          inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (e.key === "?") {
        e.preventDefault();
        onOpenBackupModal();
      } else if (todos && todos.length > 0) {
        // Vim / Linear style card navigation
        const currentIndex = todos.findIndex((t) => t.id === selectedTaskId);

        if (e.key === "j" || e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex =
            currentIndex === -1 ? 0 : Math.min(currentIndex + 1, todos.length - 1);
          setSelectedTaskId(todos[nextIndex]?.id || null);
        } else if (e.key === "k" || e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            currentIndex === -1
              ? todos.length - 1
              : Math.max(currentIndex - 1, 0);
          setSelectedTaskId(todos[prevIndex]?.id || null);
        } else if (selectedTaskId) {
          if (e.key === "x" || e.key === " ") {
            e.preventDefault();
            onToggleComplete(selectedTaskId);
          } else if (e.key === "e") {
            e.preventDefault();
            onStartEdit(selectedTaskId);
          } else if (e.key === "d" || e.key === "Delete") {
            e.preventDefault();
            onDeleteTodo(selectedTaskId);
          } else if (e.key === "1") {
            e.preventDefault();
            onChangePriority(selectedTaskId, "low");
          } else if (e.key === "2") {
            e.preventDefault();
            onChangePriority(selectedTaskId, "medium");
          } else if (e.key === "3") {
            e.preventDefault();
            onChangePriority(selectedTaskId, "high");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    todos,
    selectedTaskId,
    onOpenCommandPalette,
    onOpenBackupModal,
    onToggleComplete,
    onDeleteTodo,
    onStartEdit,
    onChangePriority,
  ]);

  return { selectedTaskId, setSelectedTaskId };
}
