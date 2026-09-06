import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  ListTodo,
  Columns3,
  Sun,
  Moon,
  Trash2,
  Download,
  PlusCircle,
  Sparkles,
} from "lucide-react";

export default function CommandPalette({
  isOpen,
  onClose,
  todos = [],
  setFilter,
  setViewMode,
  theme,
  toggleTheme,
  onOpenBackup,
  onFocusNewTask,
  onSelectTask,
  onClearCompleted,
  onTriggerCelebration,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Available Built-in Actions
  const staticActions = useMemo(
    () => [
      {
        id: "action-new-task",
        category: "Actions",
        title: "Create New Task",
        icon: PlusCircle,
        shortcut: "C",
        run: () => onFocusNewTask(),
      },
      {
        id: "action-view-board",
        category: "Views",
        title: "Switch to Board View (Kanban)",
        icon: Columns3,
        run: () => setViewMode("board"),
      },
      {
        id: "action-view-list",
        category: "Views",
        title: "Switch to List View",
        icon: ListTodo,
        run: () => setViewMode("list"),
      },
      {
        id: "action-theme-toggle",
        category: "Preferences",
        title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        icon: theme === "dark" ? Sun : Moon,
        run: () => toggleTheme(),
      },
      {
        id: "action-filter-all",
        category: "Filters",
        title: "Filter: Show All Tasks",
        icon: ListTodo,
        run: () => setFilter("all"),
      },
      {
        id: "action-filter-active",
        category: "Filters",
        title: "Filter: Show Active Only",
        icon: ListTodo,
        run: () => setFilter("active"),
      },
      {
        id: "action-filter-done",
        category: "Filters",
        title: "Filter: Show Completed Only",
        icon: CheckCircle2,
        run: () => setFilter("completed"),
      },
      {
        id: "action-backup",
        category: "Data",
        title: "Open Data Backup & Export...",
        icon: Download,
        shortcut: "?",
        run: () => onOpenBackup(),
      },
      {
        id: "action-clear-completed",
        category: "Data",
        title: "Clear Completed Tasks",
        icon: Trash2,
        run: () => onClearCompleted(),
      },
      {
        id: "action-celebration",
        category: "Fun",
        title: "Trigger Confetti Celebration 🎉",
        icon: Sparkles,
        run: () => onTriggerCelebration && onTriggerCelebration(),
      },
    ],
    [
      theme,
      toggleTheme,
      setViewMode,
      setFilter,
      onOpenBackup,
      onFocusNewTask,
      onClearCompleted,
      onTriggerCelebration,
    ]
  );

  // Filter actions & matching tasks
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedActions = staticActions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );

    const matchedTasks = q
      ? todos
          .filter((t) => t.text.toLowerCase().includes(q))
          .slice(0, 8)
          .map((t) => ({
            id: `task-${t.id}`,
            category: "Tasks",
            title: t.text,
            isTask: true,
            todo: t,
            icon: t.completed ? CheckCircle2 : ListTodo,
            run: () => {
              if (onSelectTask) onSelectTask(t.id);
            },
          }))
      : [];

    return [...matchedActions, ...matchedTasks];
  }, [query, staticActions, todos, onSelectTask]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + items.length) % Math.max(1, items.length)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].run();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop command-palette-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="command-palette-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Command Search Input Bar */}
        <div className="command-palette-input-wrapper">
          <Search className="command-search-icon" size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tasks..."
            aria-label="Search commands and tasks"
          />
          <kbd className="command-esc-badge" onClick={onClose}>
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="command-results-list" ref={listRef} role="listbox">
          {items.length > 0 ? (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`command-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="command-item-left">
                    <span className="command-item-icon-wrap">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="command-item-title">{item.title}</span>
                    {item.todo?.priority && (
                      <span className={`command-task-priority ${item.todo.priority}`}>
                        {item.todo.priority}
                      </span>
                    )}
                  </div>

                  <div className="command-item-right">
                    {item.shortcut && (
                      <kbd className="command-item-shortcut">{item.shortcut}</kbd>
                    )}
                    <span className="command-item-category">{item.category}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="command-empty-state">
              <p>No commands or tasks found matching &quot;{query}&quot;</p>
            </div>
          )}
        </div>

        {/* Palette Footer Hints */}
        <div className="command-palette-footer">
          <div className="command-footer-hints">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            </span>
            <span>
              <kbd>↵</kbd> to select
            </span>
            <span>
              <kbd>Esc</kbd> to close
            </span>
          </div>
          <span className="command-footer-branding">TaskFlow Command</span>
        </div>
      </div>
    </div>
  );
}
