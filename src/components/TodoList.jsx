import { useState } from "react";
import TodoCard from "./TodoCard";

export default function TodoList({
  todos,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  editingId,
  setEditingId,
  onSaveEdit,
  onToggleComplete,
  onDelete,
  onClearCompleted,
  onToggleAll,
  onChangePriority,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onQuickAddPriority,
  totalCount,
  completedCount,
}) {
  const [viewMode, setViewMode] = useState("board"); // 'board' (3-columns) or 'list'
  const activeCount = totalCount - completedCount;

  // Filter tasks based on current tab and search query
  const filteredTodos = todos.filter((item) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? !item.completed
        : item.completed;

    const matchesSearch =
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtasks &&
        item.subtasks.some((s) =>
          s.text.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    return matchesFilter && matchesSearch;
  });

  const allFilteredCompleted =
    filteredTodos.length > 0 && filteredTodos.every((t) => t.completed);

  // Split tasks by priority for the 3-column Board view
  const highTodos = filteredTodos.filter((t) => (t.priority || "medium") === "high");
  const mediumTodos = filteredTodos.filter((t) => (t.priority || "medium") === "medium");
  const lowTodos = filteredTodos.filter((t) => (t.priority || "medium") === "low");

  const priorityColumns = [
    {
      id: "high",
      label: "High",
      icon: "fa-solid fa-fire",
      items: highTodos,
      colorVar: "var(--priority-high)",
      bgVar: "var(--priority-high-bg)",
      borderVar: "var(--priority-high-border)",
    },
    {
      id: "medium",
      label: "Medium",
      icon: "fa-solid fa-bolt",
      items: mediumTodos,
      colorVar: "var(--priority-medium)",
      bgVar: "var(--priority-medium-bg)",
      borderVar: "var(--priority-medium-border)",
    },
    {
      id: "low",
      label: "Low",
      icon: "fa-solid fa-leaf",
      items: lowTodos,
      colorVar: "var(--priority-low)",
      bgVar: "var(--priority-low-bg)",
      borderVar: "var(--priority-low-border)",
    },
  ];

  return (
    <section aria-label="Task Management and Board">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {searchQuery
          ? `Found ${filteredTodos.length} matching task${
              filteredTodos.length === 1 ? "" : "s"
            } for "${searchQuery}"`
          : `Showing ${filteredTodos.length} ${filter} task${
              filteredTodos.length === 1 ? "" : "s"
            } in ${viewMode} view`}
      </div>

      {/* Search, Filter & View Switcher Toolbar */}
      {totalCount > 0 && (
        <div className="toolbar-section">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <i
              className="fa-solid fa-magnifying-glass search-icon"
              aria-hidden="true"
            />
            <label htmlFor="task-search-input" className="sr-only">
              Filter tasks by keyword
            </label>
            <input
              id="task-search-input"
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks & subtasks... (Press / to focus)"
              aria-label="Search and filter tasks"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search filter"
                title="Clear search"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="toolbar-right-controls">
            {/* Filter Tabs */}
            <div
              className="filter-pills-group"
              role="tablist"
              aria-label="Filter tasks by status"
            >
              <button
                type="button"
                role="tab"
                id="tab-all"
                aria-selected={filter === "all"}
                aria-controls="tasks-display-area"
                className={`filter-pill-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                role="tab"
                id="tab-active"
                aria-selected={filter === "active"}
                aria-controls="tasks-display-area"
                className={`filter-pill-btn ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                role="tab"
                id="tab-completed"
                aria-selected={filter === "completed"}
                aria-controls="tasks-display-area"
                className={`filter-pill-btn ${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Done ({completedCount})
              </button>
            </div>

            {/* View Mode Switcher (Board vs List) */}
            <div
              className="view-mode-toggle"
              role="radiogroup"
              aria-label="Select layout view mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "board"}
                className={`view-toggle-btn ${viewMode === "board" ? "active" : ""}`}
                onClick={() => setViewMode("board")}
                title="Board View (3 Priority Columns)"
                aria-label="Board View (3 Priority Columns)"
              >
                <i className="fa-solid fa-table-columns" aria-hidden="true" />
                <span className="view-toggle-label">Board</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "list"}
                className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View (Single Feed)"
                aria-label="List View (Single Feed)"
              >
                <i className="fa-solid fa-list-ul" aria-hidden="true" />
                <span className="view-toggle-label">List</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Header */}
      {totalCount > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-actions-status">
            {activeCount === 0 ? (
              <>
                <i
                  className="fa-solid fa-trophy"
                  style={{ color: "var(--accent-emerald)", marginRight: "6px" }}
                  aria-hidden="true"
                />
                All tasks finished!
              </>
            ) : (
              `${activeCount} task${activeCount === 1 ? "" : "s"} remaining`
            )}
          </span>

          <div className="bulk-actions-buttons">
            <button
              type="button"
              className="bulk-action-btn"
              onClick={() => onToggleAll(filteredTodos)}
              title={
                allFilteredCompleted
                  ? "Mark visible tasks as active"
                  : "Mark visible tasks as completed"
              }
              aria-label={
                allFilteredCompleted
                  ? "Mark visible tasks as active"
                  : "Mark visible tasks as completed"
              }
            >
              <i
                className={
                  allFilteredCompleted
                    ? "fa-regular fa-circle"
                    : "fa-regular fa-circle-check"
                }
                aria-hidden="true"
              />
              {allFilteredCompleted
                ? searchQuery
                  ? "Reset Visible"
                  : "Reset All"
                : searchQuery
                ? "Complete Visible"
                : "Complete All"}
            </button>

            {completedCount > 0 && (
              <button
                type="button"
                className="bulk-action-btn danger"
                onClick={onClearCompleted}
                title="Remove all completed tasks"
                aria-label={`Clear all ${completedCount} completed tasks`}
              >
                <i className="fa-regular fa-trash-can" aria-hidden="true" />
                Clear Done ({completedCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Display Area: Board View or List View */}
      <div id="tasks-display-area">
        {filteredTodos.length > 0 ? (
          viewMode === "board" ? (
            /* 3-Column Priority Board Layout */
            <div className="priority-board-grid" aria-label="Priority Columns Board">
              {priorityColumns.map((col) => (
                <div
                  key={col.id}
                  className={`priority-column priority-col-${col.id}`}
                  aria-label={`${col.label} Priority column with ${col.items.length} tasks`}
                >
                  {/* Column Header */}
                  <div className="column-header">
                    <div className="column-title-group">
                      <span className={`column-dot ${col.id}`} aria-hidden="true" />
                      <h3 className="column-title">{col.label}</h3>
                      <span className="column-count-badge">
                        {col.items.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="column-quick-add-btn"
                      onClick={() => onQuickAddPriority(col.id)}
                      title={`Add new ${col.label} priority task`}
                      aria-label={`Add new ${col.label} priority task`}
                    >
                      <i className="fa-solid fa-plus" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Column Task Cards */}
                  {col.items.length > 0 ? (
                    <ul className="column-cards-list" aria-label={`${col.label} tasks`}>
                      {col.items.map((todo) => (
                        <TodoCard
                          key={todo.id}
                          todo={todo}
                          isEditing={editingId === todo.id}
                          onStartEdit={(id) => setEditingId(id)}
                          onSaveEdit={onSaveEdit}
                          onCancelEdit={() => setEditingId(null)}
                          onToggleComplete={onToggleComplete}
                          onDelete={onDelete}
                          onChangePriority={onChangePriority}
                          onAddSubtask={onAddSubtask}
                          onToggleSubtask={onToggleSubtask}
                          onDeleteSubtask={onDeleteSubtask}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="column-empty-placeholder">
                      <span className="column-empty-text">No {col.label.toLowerCase()} tasks</span>
                      <button
                        type="button"
                        className="column-add-empty-btn"
                        onClick={() => onQuickAddPriority(col.id)}
                      >
                        + Add {col.label} task
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Single Column List View */
            <ul
              id="todo-items-list"
              className="todo-list-container"
              aria-label="List of tasks"
            >
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  isEditing={editingId === todo.id}
                  onStartEdit={(id) => setEditingId(id)}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onChangePriority={onChangePriority}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                />
              ))}
            </ul>
          )
        ) : (
          /* Empty State */
          <div className="empty-state-card" role="region" aria-label="Empty state">
            <div className="empty-state-icon" aria-hidden="true">
              {searchQuery ? (
                <i className="fa-solid fa-magnifying-glass" />
              ) : filter === "completed" ? (
                <i className="fa-solid fa-list-check" />
              ) : (
                <i className="fa-solid fa-clipboard-check" />
              )}
            </div>

            <h3 className="empty-state-title">
              {searchQuery
                ? "No matching tasks found"
                : filter === "completed"
                ? "No completed tasks yet"
                : totalCount === 0
                ? "All clear! You're on track."
                : "No active tasks in this view"}
            </h3>

            <p className="empty-state-description">
              {searchQuery
                ? `No task matches "${searchQuery}". Try searching with a different term.`
                : filter === "completed"
                ? "Check off tasks as you finish them to see them archived here."
                : totalCount === 0
                ? "Add your top priorities above to organize your day with clarity."
                : "Switch filter tabs or create a new task to continue."}
            </p>

            {searchQuery && (
              <button
                type="button"
                className="empty-state-action-btn"
                onClick={() => setSearchQuery("")}
              >
                <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true" />
                Clear search filter
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
