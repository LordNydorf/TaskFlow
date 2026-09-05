import { useState, useRef, useEffect } from "react";
import SubtaskList from "./SubtaskList";

function formatTimestamp(timestamp) {
  if (!timestamp) return "Recently";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TodoCard({
  todo,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onDelete,
  onChangePriority,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) {
  const isCompleted = Boolean(todo.completed);
  const priority = todo.priority || "medium";
  const subtasks = todo.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = subtasks.length;

  // Expand subtasks dropdown state
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  // Local draft state for inline editing
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(priority);
  const editInputRef = useRef(null);

  // Focus & sync when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditText(todo.text);
      setEditPriority(todo.priority || "medium");
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          editInputRef.current.select();
        }
      }, 50);
    }
  }, [isEditing, todo.text, todo.priority]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!editText.trim()) return;
    onSaveEdit(todo.id, editText.trim(), editPriority);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave(e);
    } else if (e.key === "Escape") {
      onCancelEdit();
    }
  };

  const fullDateString = todo.createdAt
    ? new Date(todo.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Recently created";

  // Cycle priority on badge click
  const handleCyclePriority = (e) => {
    e.stopPropagation();
    const cycle = { low: "medium", medium: "high", high: "low" };
    const nextPrio = cycle[priority] || "medium";
    if (onChangePriority) {
      onChangePriority(todo.id, nextPrio);
    }
  };

  return (
    <li
      className={`todo-card priority-${priority} ${isCompleted ? "completed" : ""} ${
        isEditing ? "is-editing" : ""
      }`}
    >
      {isEditing ? (
        /* Inline Edit Form */
        <form onSubmit={handleSave} className="inline-edit-form">
          <div className="inline-edit-row">
            <label htmlFor={`edit-task-input-${todo.id}`} className="sr-only">
              Edit task description
            </label>
            <input
              id={`edit-task-input-${todo.id}`}
              ref={editInputRef}
              type="text"
              className="inline-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Edit task description"
            />
          </div>

          <div className="inline-edit-controls">
            <div
              className="priority-selector inline-priority"
              role="radiogroup"
              aria-label="Select task priority"
            >
              <button
                type="button"
                role="radio"
                aria-checked={editPriority === "low"}
                className={`priority-opt-btn low ${editPriority === "low" ? "active" : ""}`}
                onClick={() => setEditPriority("low")}
              >
                Low
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={editPriority === "medium"}
                className={`priority-opt-btn medium ${editPriority === "medium" ? "active" : ""}`}
                onClick={() => setEditPriority("medium")}
              >
                Medium
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={editPriority === "high"}
                className={`priority-opt-btn high ${editPriority === "high" ? "active" : ""}`}
                onClick={() => setEditPriority("high")}
              >
                High
              </button>
            </div>

            <div className="inline-edit-buttons">
              <button
                type="button"
                className="inline-btn cancel"
                onClick={onCancelEdit}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-btn save"
                disabled={!editText.trim()}
                aria-label="Save changes"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Regular Card View */
        <div className="todo-card-main-content">
          <div className="todo-card-top-row">
            {/* Accessible Checkbox Toggle Button */}
            <button
              type="button"
              role="checkbox"
              aria-checked={isCompleted}
              className={`custom-checkbox-btn ${isCompleted ? "checked" : ""}`}
              onClick={() => onToggleComplete(todo.id)}
              aria-label={
                isCompleted
                  ? `Mark "${todo.text}" as active`
                  : `Mark "${todo.text}" as completed`
              }
              title={isCompleted ? "Mark as active" : "Mark as completed"}
            >
              {isCompleted && (
                <i className="fa-solid fa-check check-icon" aria-hidden="true" />
              )}
            </button>

            {/* Content Area */}
            <div
              className="todo-content-wrapper"
              onDoubleClick={() => onStartEdit(todo.id)}
              title="Double click to edit"
            >
              <span className="todo-text-line">{todo.text}</span>

              <div className="todo-meta-line">
                {/* Clickable Priority Badge to cycle/move */}
                <button
                  type="button"
                  className={`priority-badge-pill ${priority}`}
                  onClick={handleCyclePriority}
                  title={`Priority: ${priority}. Click to cycle priority.`}
                  aria-label={`Priority: ${priority}. Click to change priority.`}
                >
                  <span className="priority-dot" aria-hidden="true" />
                  {priority}
                </button>

                {/* Subtask Toggle Pill */}
                <button
                  type="button"
                  className={`subtasks-toggle-badge ${
                    totalSubtasksCount > 0 ? "has-subtasks" : ""
                  } ${isSubtasksExpanded ? "expanded" : ""}`}
                  onClick={() => setIsSubtasksExpanded((prev) => !prev)}
                  aria-expanded={isSubtasksExpanded}
                  aria-label={
                    totalSubtasksCount > 0
                      ? `${completedSubtasksCount} of ${totalSubtasksCount} subtasks completed. Click to toggle checklist.`
                      : "Add subtasks"
                  }
                  title="Toggle subtasks checklist"
                >
                  <i className="fa-solid fa-list-check" aria-hidden="true" />
                  <span>
                    {totalSubtasksCount > 0
                      ? `${completedSubtasksCount}/${totalSubtasksCount}`
                      : "+ Subtask"}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-down subtasks-caret ${
                      isSubtasksExpanded ? "open" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <span className="todo-timestamp" title={`Created: ${fullDateString}`}>
                  <i className="fa-regular fa-clock" aria-hidden="true" />
                  {formatTimestamp(todo.createdAt)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="todo-actions-group">
              <button
                type="button"
                className="action-icon-btn edit"
                onClick={() => onStartEdit(todo.id)}
                aria-label={`Edit task "${todo.text}"`}
                title="Edit task"
              >
                <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
              </button>

              <button
                type="button"
                className="action-icon-btn delete"
                onClick={() => onDelete(todo.id)}
                aria-label={`Delete task "${todo.text}"`}
                title="Delete task"
              >
                <i className="fa-regular fa-trash-can" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Expandable Subtasks Checklist */}
          {isSubtasksExpanded && (
            <SubtaskList
              todoId={todo.id}
              subtasks={subtasks}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
            />
          )}
        </div>
      )}
    </li>
  );
}
