import { useRef } from "react";

export default function TodoInput({
  todoValue,
  setTodoValue,
  priority,
  setPriority,
  handleAddTodo,
}) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!todoValue.trim()) return;
    handleAddTodo(todoValue.trim(), priority);
    setTodoValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setTodoValue("");
    }
  };

  const priorities = ["low", "medium", "high"];

  const handlePriorityKeyDown = (e, currentPrio) => {
    const currentIndex = priorities.indexOf(currentPrio);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextPrio = priorities[(currentIndex + 1) % priorities.length];
      setPriority(nextPrio);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevPrio =
        priorities[(currentIndex - 1 + priorities.length) % priorities.length];
      setPriority(prevPrio);
    }
  };

  return (
    <section className="input-card" aria-label="Create a new task section">
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="input-form-row">
        <div className="input-field-wrapper">
          <i
            className="fa-solid fa-plus-circle input-field-icon"
            aria-hidden="true"
          />
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
            placeholder="Add a new task... (e.g. Review Q3 roadmap)"
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
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="action-submit-btn"
          disabled={!todoValue.trim()}
          aria-label="Add task to list"
        >
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </form>

      {/* Priority Selector and Shortcut Tip */}
      <div className="input-extras-row">
        <div className="priority-selector-wrapper">
          <span id="priority-selector-label" className="priority-label">
            Priority:
          </span>
          <div
            className="priority-options"
            role="radiogroup"
            aria-labelledby="priority-selector-label"
          >
            {priorities.map((prio) => (
              <button
                key={prio}
                type="button"
                role="radio"
                aria-checked={priority === prio}
                tabIndex={priority === prio ? 0 : -1}
                className={`priority-opt-btn ${prio} ${
                  priority === prio ? "active" : ""
                }`}
                onClick={() => setPriority(prio)}
                onKeyDown={(e) => handlePriorityKeyDown(e, prio)}
                aria-label={`${prio.charAt(0).toUpperCase() + prio.slice(1)} priority`}
              >
                {prio.charAt(0).toUpperCase() + prio.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div id="shortcut-tip-text" className="shortcut-tip">
          <i className="fa-regular fa-keyboard" aria-hidden="true" />
          <span>
            Press <kbd>↵ Enter</kbd> to add • <kbd>/</kbd> to search
          </span>
        </div>
      </div>
    </section>
  );
}
