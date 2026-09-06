import { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  ArrowRight,
  X,
  Calendar as CalendarIcon,
  Keyboard,
  Flame,
  Zap,
  Leaf,
} from "lucide-react";

export default function TodoInput({
  todoValue,
  setTodoValue,
  priority,
  setPriority,
  handleAddTodo,
}) {
  const [dueDate, setDueDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const inputRef = useRef(null);
  const datePickerRef = useRef(null);

  // Click outside listener for datepicker dropdown
  useEffect(() => {
    if (!isDatePickerOpen) return;
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDatePickerOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!todoValue.trim()) return;
    handleAddTodo(todoValue.trim(), priority, dueDate || null);
    setTodoValue("");
    setDueDate("");
    setIsDatePickerOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setTodoValue("");
      setIsDatePickerOpen(false);
    }
  };

  const priorities = [
    { id: "low", label: "Low", icon: Leaf },
    { id: "medium", label: "Medium", icon: Zap },
    { id: "high", label: "High", icon: Flame },
  ];

  const handlePriorityKeyDown = (e, currentPrio) => {
    const pIds = priorities.map((p) => p.id);
    const currentIndex = pIds.indexOf(currentPrio);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextPrio = pIds[(currentIndex + 1) % pIds.length];
      setPriority(nextPrio);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevPrio = pIds[(currentIndex - 1 + pIds.length) % pIds.length];
      setPriority(prevPrio);
    }
  };

  // Helper date preset buttons
  const setPresetDate = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const dateStr = d.toISOString().split("T")[0];
    setDueDate(dateStr);
    setIsDatePickerOpen(false);
  };

  const formatSelectedDueDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    if (diffDays === -1) return "Yesterday";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <section className="input-card" aria-label="Create a new task section">
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="input-form-row">
        <div className="input-field-wrapper">
          <PlusCircle className="input-field-icon" size={20} aria-hidden="true" />
          <label htmlFor="new-task-input" className="sr-only">
            Add a new task description
          </label>
          <input
            id="new-task-input"
            ref={inputRef}
            type="text"
            className="todo-input-field"
            value={todoValue}
            onChange={(e) => setTodoValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task... (Use #tag for tags, e.g. Review roadmap #dev)"
            aria-label="New task description"
            aria-describedby="shortcut-tip-text"
          />
          {todoValue && (
            <button
              type="button"
              className="input-clear-btn"
              onClick={() => setTodoValue("")}
              aria-label="Clear input text"
              title="Clear input"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="action-submit-btn"
          disabled={!todoValue.trim()}
          aria-label="Add task to list"
        >
          <ArrowRight size={18} aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </form>

      {/* Extras Row: Priority Selector, Due Date Picker, Shortcuts */}
      <div className="input-extras-row">
        <div className="input-extras-left">
          {/* Priority Options */}
          <div className="priority-selector-wrapper">
            <span id="priority-selector-label" className="priority-label">
              Priority:
            </span>
            <div
              className="priority-options"
              role="radiogroup"
              aria-labelledby="priority-selector-label"
            >
              {priorities.map((p) => {
                const Icon = p.icon;
                const isActive = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    tabIndex={isActive ? 0 : -1}
                    className={`priority-opt-btn ${p.id} ${isActive ? "active" : ""}`}
                    onClick={() => setPriority(p.id)}
                    onKeyDown={(e) => handlePriorityKeyDown(e, p.id)}
                    aria-label={`${p.label} priority`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date Picker Trigger & Popup */}
          <div className="due-date-picker-wrapper" ref={datePickerRef}>
            <button
              type="button"
              className={`due-date-trigger-btn ${dueDate ? "has-date" : ""}`}
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              aria-expanded={isDatePickerOpen}
              aria-label={dueDate ? `Due date: ${dueDate}` : "Set due date"}
              title="Set task deadline"
            >
              <CalendarIcon size={14} aria-hidden="true" />
              <span>{dueDate ? formatSelectedDueDate(dueDate) : "Due Date"}</span>
              {dueDate && (
                <span
                  role="button"
                  tabIndex={0}
                  className="due-date-clear-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDueDate("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      setDueDate("");
                    }
                  }}
                  aria-label="Remove due date"
                >
                  <X size={12} aria-hidden="true" />
                </span>
              )}
            </button>

            {isDatePickerOpen && (
              <div
                className="due-date-dropdown"
                role="dialog"
                aria-label="Due date presets"
              >
                <div className="due-date-presets-header">Quick Deadlines</div>
                <div className="due-date-presets">
                  <button
                    type="button"
                    className="due-date-preset-btn"
                    onClick={() => setPresetDate(0)}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="due-date-preset-btn"
                    onClick={() => setPresetDate(1)}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    className="due-date-preset-btn"
                    onClick={() => setPresetDate(3)}
                  >
                    In 3 Days
                  </button>
                  <button
                    type="button"
                    className="due-date-preset-btn"
                    onClick={() => setPresetDate(7)}
                  >
                    Next Week
                  </button>
                </div>
                <div className="due-date-custom-row">
                  <span className="due-date-custom-label">Custom Date:</span>
                  <input
                    id="custom-due-date-input"
                    type="date"
                    className="due-date-native-input"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      setIsDatePickerOpen(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div id="shortcut-tip-text" className="shortcut-tip">
          <Keyboard size={14} aria-hidden="true" />
          <span>
            <kbd>↵ Enter</kbd> to add • <kbd>Ctrl+K</kbd> palette • <kbd>/</kbd> search
          </span>
        </div>
      </div>
    </section>
  );
}
