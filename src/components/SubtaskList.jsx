import { useState, useRef } from "react";
import { Check, X, Plus, ListChecks } from "lucide-react";

export default function SubtaskList({
  todoId,
  subtasks = [],
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) {
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const inputRef = useRef(null);

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    if (!newSubtaskText.trim()) return;
    onAddSubtask(todoId, newSubtaskText.trim());
    setNewSubtaskText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAdd(e);
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="subtasks-container" aria-label="Nested subtasks checklist">
      {/* Mini Progress Bar if subtasks exist */}
      {totalCount > 0 && (
        <div className="subtask-progress-section">
          <div className="subtask-progress-header">
            <span className="subtask-progress-label">
              <ListChecks size={13} aria-hidden="true" />
              Subtasks ({completedCount}/{totalCount})
            </span>
            <span className="subtask-progress-pct">{percent}%</span>
          </div>
          <div
            className="subtask-progress-track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Subtasks completion progress"
          >
            <div
              className="subtask-progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks List */}
      {totalCount > 0 && (
        <ul className="subtasks-list" aria-label="Subtasks checklist">
          {subtasks.map((subtask) => (
            <li
              key={subtask.id}
              className={`subtask-item ${subtask.completed ? "completed" : ""}`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={Boolean(subtask.completed)}
                className={`subtask-checkbox ${
                  subtask.completed ? "checked" : ""
                }`}
                onClick={() => onToggleSubtask(todoId, subtask.id)}
                aria-label={
                  subtask.completed
                    ? `Mark subtask "${subtask.text}" as active`
                    : `Mark subtask "${subtask.text}" as completed`
                }
              >
                {subtask.completed && <Check size={11} aria-hidden="true" />}
              </button>

              <span className="subtask-text">{subtask.text}</span>

              <button
                type="button"
                className="subtask-delete-btn"
                onClick={() => onDeleteSubtask(todoId, subtask.id)}
                aria-label={`Delete subtask "${subtask.text}"`}
                title="Delete subtask"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add Subtask Form */}
      <form onSubmit={handleAdd} className="add-subtask-form">
        <label htmlFor={`add-subtask-input-${todoId}`} className="sr-only">
          Add a subtask
        </label>
        <div className="add-subtask-wrapper">
          <Plus className="add-subtask-icon" size={14} aria-hidden="true" />
          <input
            id={`add-subtask-input-${todoId}`}
            ref={inputRef}
            type="text"
            className="add-subtask-input"
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a subtask... (Enter to add)"
            aria-label="Add a subtask"
          />
          {newSubtaskText.trim() && (
            <button
              type="submit"
              className="add-subtask-submit-btn"
              aria-label="Submit subtask"
            >
              Add
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
