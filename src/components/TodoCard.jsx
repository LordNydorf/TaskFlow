import { useState, useRef, useEffect } from "react";
import SubtaskList from "./SubtaskList";
import {
  Check,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  GripVertical,
  ChevronDown,
  Tag as TagIcon,
  MoreHorizontal,
  Flame,
  Zap,
  Leaf,
  ArrowUp,
  ArrowDown,
  ListChecks,
} from "lucide-react";

// Format created timestamp
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

// Compute Due Date Status
function getDueDateStatus(dueDateString) {
  if (!dueDateString) return null;
  const [year, month, day] = dueDateString.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      type: "overdue",
      label: absDays === 1 ? "Overdue (Yesterday)" : `Overdue (${absDays}d)`,
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return {
      type: "today",
      label: "Due Today",
      isDueToday: true,
    };
  }
  if (diffDays === 1) {
    return {
      type: "tomorrow",
      label: "Due Tomorrow",
      isDueSoon: true,
    };
  }
  return {
    type: "upcoming",
    label: target.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    isUpcoming: true,
  };
}

export default function TodoCard({
  todo,
  viewMode = "board", // 'board' or 'list'
  isSelected,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onDelete,
  onChangePriority,
  onMoveStep,
  onFilterByTag,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const isCompleted = Boolean(todo.completed);
  const priority = todo.priority || "medium";
  const subtasks = todo.subtasks || [];
  const tags = Array.isArray(todo.tags) ? todo.tags : [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = subtasks.length;

  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Local draft state for inline editing
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(priority);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || "");
  const editInputRef = useRef(null);
  const menuRef = useRef(null);

  // Due Date status
  const dueStatus = getDueDateStatus(todo.dueDate);

  // Sync draft on edit start
  useEffect(() => {
    if (isEditing) {
      setEditText(todo.text);
      setEditPriority(todo.priority || "medium");
      setEditDueDate(todo.dueDate || "");
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          editInputRef.current.select();
        }
      }, 50);
    }
  }, [isEditing, todo.text, todo.priority, todo.dueDate]);

  // Click outside to close accessible menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!editText.trim()) return;
    onSaveEdit(todo.id, editText.trim(), editPriority, editDueDate || null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave(e);
    } else if (e.key === "Escape") {
      onCancelEdit();
    }
  };

  // Priority cycle helper
  const handleCyclePriority = (e) => {
    e.stopPropagation();
    const cycle = { low: "medium", medium: "high", high: "low" };
    const nextPrio = cycle[priority] || "medium";
    if (onChangePriority) {
      onChangePriority(todo.id, nextPrio);
    }
  };

  const handleCardDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", todo.id);
    if (onDragStart) onDragStart(e, todo);
  };

  const handleCardDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <li
      id={`todo-card-${todo.id}`}
      draggable={!isEditing}
      onDragStart={handleCardDragStart}
      onDragEnd={handleCardDragEnd}
      onDragOver={(e) => onDragOver && onDragOver(e, todo.id)}
      onDrop={(e) => onDrop && onDrop(e, todo.id)}
      className={`todo-card priority-${priority} ${isCompleted ? "completed" : ""} ${
        isEditing ? "is-editing" : ""
      } ${isSelected ? "is-selected" : ""} ${isDragging ? "is-dragging" : ""}`}
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
            <div className="inline-edit-extras">
              <div
                className="priority-selector inline-priority"
                role="radiogroup"
                aria-label="Select task priority"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={editPriority === "low"}
                  className={`priority-opt-btn low ${
                    editPriority === "low" ? "active" : ""
                  }`}
                  onClick={() => setEditPriority("low")}
                >
                  Low
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={editPriority === "medium"}
                  className={`priority-opt-btn medium ${
                    editPriority === "medium" ? "active" : ""
                  }`}
                  onClick={() => setEditPriority("medium")}
                >
                  Medium
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={editPriority === "high"}
                  className={`priority-opt-btn high ${
                    editPriority === "high" ? "active" : ""
                  }`}
                  onClick={() => setEditPriority("high")}
                >
                  High
                </button>
              </div>

              {/* Edit Due Date */}
              <div className="inline-due-date-wrapper">
                <input
                  type="date"
                  className="due-date-native-input small"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  aria-label="Edit due date"
                />
              </div>
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
        /* Regular Card View - Clean & Spacious */
        <div className="todo-card-main-content">
          <div className="todo-card-header-row">
            <div className="todo-card-lead">
              {/* Drag Handle */}
              <div
                className="card-drag-handle"
                title="Drag to reorder or move column"
                aria-hidden="true"
              >
                <GripVertical size={14} />
              </div>

              {/* Checkbox */}
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
                {isCompleted && <Check size={13} className="check-icon" />}
              </button>
            </div>

            {/* Task Title (Takes 100% of available space) */}
            <div
              className="todo-title-area"
              onDoubleClick={() => onStartEdit(todo.id)}
              title="Double click to edit"
            >
              <span className="todo-text-line">{todo.text}</span>
            </div>

            {/* Action Buttons (Hover-Revealed) */}
            <div className="todo-actions-group" ref={menuRef}>
              <button
                type="button"
                className="action-icon-btn edit"
                onClick={() => onStartEdit(todo.id)}
                aria-label={`Edit task "${todo.text}"`}
                title="Edit task (E)"
              >
                <Edit3 size={14} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="action-icon-btn delete"
                onClick={() => onDelete(todo.id)}
                aria-label={`Delete task "${todo.text}"`}
                title="Delete task (D)"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>

              {/* Accessible Reorder & Priority Menu */}
              <button
                type="button"
                className="action-icon-btn more"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-label="More task actions"
                title="More actions"
              >
                <MoreHorizontal size={14} aria-hidden="true" />
              </button>

              {isMenuOpen && (
                <div className="card-context-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="menu-item"
                    onClick={() => {
                      if (onMoveStep) onMoveStep(todo.id, "up");
                      setIsMenuOpen(false);
                    }}
                  >
                    <ArrowUp size={13} aria-hidden="true" />
                    Move Up
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="menu-item"
                    onClick={() => {
                      if (onMoveStep) onMoveStep(todo.id, "down");
                      setIsMenuOpen(false);
                    }}
                  >
                    <ArrowDown size={13} aria-hidden="true" />
                    Move Down
                  </button>
                  <div className="menu-divider" />
                  <span className="menu-header-label">Change Priority</span>
                  <button
                    type="button"
                    role="menuitem"
                    className={`menu-item priority-opt low ${
                      priority === "low" ? "selected" : ""
                    }`}
                    onClick={() => {
                      onChangePriority(todo.id, "low");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Leaf size={13} aria-hidden="true" /> Low Priority
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`menu-item priority-opt medium ${
                      priority === "medium" ? "selected" : ""
                    }`}
                    onClick={() => {
                      onChangePriority(todo.id, "medium");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Zap size={13} aria-hidden="true" /> Medium Priority
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`menu-item priority-opt high ${
                      priority === "high" ? "selected" : ""
                    }`}
                    onClick={() => {
                      onChangePriority(todo.id, "high");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Flame size={13} aria-hidden="true" /> High Priority
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Clean Horizontal Metadata Footer */}
          <div className="todo-card-footer-meta">
            {/* Show priority pill only in List view (in Board view, the column defines it) */}
            {viewMode === "list" && (
              <button
                type="button"
                className={`priority-badge-pill ${priority}`}
                onClick={handleCyclePriority}
                title={`Priority: ${priority}. Click to cycle.`}
                aria-label={`Priority: ${priority}`}
              >
                <span className="priority-dot" aria-hidden="true" />
                {priority}
              </button>
            )}

            {/* Due Date Badge */}
            {dueStatus && (
              <span
                className={`due-date-badge-pill ${dueStatus.type} ${
                  isCompleted ? "completed-due" : ""
                }`}
                title={`Due: ${todo.dueDate}`}
              >
                {dueStatus.isOverdue ? (
                  <AlertCircle size={11} aria-hidden="true" />
                ) : (
                  <Calendar size={11} aria-hidden="true" />
                )}
                <span>{dueStatus.label}</span>
              </span>
            )}

            {/* Tag Pills */}
            {tags.length > 0 &&
              tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="task-tag-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onFilterByTag) onFilterByTag(tag);
                  }}
                  title={`Filter by tag #${tag}`}
                  aria-label={`Filter by #${tag}`}
                >
                  <TagIcon size={10} aria-hidden="true" />
                  <span>#{tag}</span>
                </button>
              ))}

            {/* Subtasks Toggle Pill */}
            {(totalSubtasksCount > 0 || isSubtasksExpanded) && (
              <button
                type="button"
                className={`subtasks-toggle-badge ${
                  totalSubtasksCount > 0 ? "has-subtasks" : ""
                } ${isSubtasksExpanded ? "expanded" : ""}`}
                onClick={() => setIsSubtasksExpanded((prev) => !prev)}
                aria-expanded={isSubtasksExpanded}
                aria-label={`${completedSubtasksCount} of ${totalSubtasksCount} subtasks completed`}
                title="Toggle subtasks checklist"
              >
                <ListChecks size={11} aria-hidden="true" />
                <span>
                  {completedSubtasksCount}/{totalSubtasksCount}
                </span>
                <ChevronDown
                  size={11}
                  className={`subtasks-caret ${
                    isSubtasksExpanded ? "open" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* Quick Add Subtask Trigger (when 0 subtasks exist) */}
            {totalSubtasksCount === 0 && !isSubtasksExpanded && (
              <button
                type="button"
                className="add-subtask-quick-trigger"
                onClick={() => setIsSubtasksExpanded(true)}
                title="Add a subtask to this card"
                aria-label="Add subtask"
              >
                + Subtask
              </button>
            )}

            {/* Relative Timestamp */}
            <span
              className="todo-timestamp"
              title={`Created: ${new Date(todo.createdAt).toLocaleString()}`}
            >
              <Clock size={10} aria-hidden="true" />
              {formatTimestamp(todo.createdAt)}
            </span>
          </div>

          {/* Subtasks Accordion */}
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
