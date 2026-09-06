import { useState } from "react";
import TodoCard from "./TodoCard";
import {
  Search,
  X,
  Columns3,
  ListTodo,
  CheckCircle2,
  Trash2,
  Plus,
  Flame,
  Zap,
  Leaf,
  ArrowUpDown,
  Tag as TagIcon,
  RotateCcw,
  ClipboardList,
} from "lucide-react";

export default function TodoList({
  filteredTodos,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  allTags = [],
  sortBy,
  setSortBy,
  editingId,
  setEditingId,
  selectedTaskId,
  onSaveEdit,
  onToggleComplete,
  onDelete,
  onClearCompleted,
  onToggleAll,
  onChangePriority,
  onReorderTodos,
  onMoveTodoToPriority,
  onMoveStep,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onQuickAddPriority,
  totalCount,
  completedCount,
  activeCount,
}) {
  const [viewMode, setViewMode] = useState("board"); // 'board' or 'list'
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const allFilteredCompleted =
    filteredTodos.length > 0 && filteredTodos.every((t) => t.completed);

  // Split tasks by priority for the 3-column Board view
  const highTodos = filteredTodos.filter(
    (t) => (t.priority || "medium") === "high"
  );
  const mediumTodos = filteredTodos.filter(
    (t) => (t.priority || "medium") === "medium"
  );
  const lowTodos = filteredTodos.filter(
    (t) => (t.priority || "medium") === "low"
  );

  const priorityColumns = [
    {
      id: "high",
      label: "High Priority",
      shortLabel: "High",
      icon: Flame,
      items: highTodos,
      colorVar: "var(--priority-high)",
      bgVar: "var(--priority-high-bg)",
      borderVar: "var(--priority-high-border)",
    },
    {
      id: "medium",
      label: "Medium Priority",
      shortLabel: "Medium",
      icon: Zap,
      items: mediumTodos,
      colorVar: "var(--priority-medium)",
      bgVar: "var(--priority-medium-bg)",
      borderVar: "var(--priority-medium-border)",
    },
    {
      id: "low",
      label: "Low Priority",
      shortLabel: "Low",
      icon: Leaf,
      items: lowTodos,
      colorVar: "var(--priority-low)",
      bgVar: "var(--priority-low-bg)",
      borderVar: "var(--priority-low-border)",
    },
  ];

  // Drag and drop handlers
  const handleDragOverColumn = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeaveColumn = (e, columnId) => {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDropOnColumn = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const todoId = e.dataTransfer.getData("text/plain");
    if (todoId && onMoveTodoToPriority) {
      onMoveTodoToPriority(todoId, columnId);
    }
  };

  const handleDropOnCard = (e, targetTodoId) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceTodoId = e.dataTransfer.getData("text/plain");
    if (!sourceTodoId || sourceTodoId === targetTodoId) return;

    if (viewMode === "list" && onReorderTodos) {
      onReorderTodos(sourceTodoId, targetTodoId);
    }
  };

  return (
    <section aria-label="Task Management and Board" className="tasks-board-section">
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

      {/* Unified Compact Control Strip */}
      {totalCount > 0 && (
        <div className="unified-toolbar">
          {/* Left: Search Bar */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} aria-hidden="true" />
            <label htmlFor="task-search-input" className="sr-only">
              Filter tasks by keyword or tag
            </label>
            <input
              id="task-search-input"
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, #tags... ( / )"
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
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Center/Right: Filter Pills, Tags, Sort, View Toggle */}
          <div className="toolbar-actions-cluster">
            {/* Filter Pills */}
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
                className={`filter-pill-btn ${
                  filter === "completed" ? "active" : ""
                }`}
                onClick={() => setFilter("completed")}
              >
                Done ({completedCount})
              </button>
            </div>

            {/* Tag Filter Chips (if tags exist) */}
            {allTags.length > 0 && (
              <div className="inline-tags-group">
                <TagIcon size={12} className="inline-tag-icon" aria-hidden="true" />
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`inline-tag-pill ${selectedTag === tag ? "active" : ""}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    title={`Filter by #${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Sort Selector */}
            <div className="sort-select-inner">
              <ArrowUpDown size={13} className="sort-icon" aria-hidden="true" />
              <select
                id="task-sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort tasks by criteria"
              >
                <option value="default">Default</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Recent</option>
                <option value="alpha">A-Z</option>
              </select>
            </div>

            {/* View Mode Toggle (Board vs List) */}
            <div
              className="view-mode-toggle"
              role="radiogroup"
              aria-label="Select layout view mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "board"}
                className={`view-toggle-btn ${
                  viewMode === "board" ? "active" : ""
                }`}
                onClick={() => setViewMode("board")}
                title="Board View (Kanban)"
                aria-label="Board View (Kanban)"
              >
                <Columns3 size={14} aria-hidden="true" />
                <span className="view-toggle-label">Board</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "list"}
                className={`view-toggle-btn ${
                  viewMode === "list" ? "active" : ""
                }`}
                onClick={() => setViewMode("list")}
                title="List View"
                aria-label="List View"
              >
                <ListTodo size={14} aria-hidden="true" />
                <span className="view-toggle-label">List</span>
              </button>
            </div>

            {/* Bulk Quick Actions */}
            <div className="bulk-quick-actions">
              <button
                type="button"
                className="bulk-quick-btn"
                onClick={() => onToggleAll(filteredTodos)}
                title={allFilteredCompleted ? "Reset all tasks" : "Complete all tasks"}
                aria-label={allFilteredCompleted ? "Reset all" : "Complete all"}
              >
                <CheckCircle2 size={14} aria-hidden="true" />
              </button>

              {completedCount > 0 && (
                <button
                  type="button"
                  className="bulk-quick-btn danger"
                  onClick={onClearCompleted}
                  title={`Clear ${completedCount} completed tasks`}
                  aria-label={`Clear ${completedCount} completed tasks`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Banner (Only shown if filtering by tag or search) */}
      {(selectedTag || searchQuery) && (
        <div className="active-filter-indicator">
          <span>
            Filtering by: {searchQuery && `"${searchQuery}"`} {selectedTag && `#${selectedTag}`} ({filteredTodos.length} results)
          </span>
          <button
            type="button"
            className="filter-reset-link"
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Display Area: Board View or List View */}
      <div id="tasks-display-area">
        {filteredTodos.length > 0 ? (
          viewMode === "board" ? (
            /* 3-Column Kanban Priority Board */
            <div
              className="priority-board-grid"
              aria-label="Priority Columns Board"
            >
              {priorityColumns.map((col) => {
                const ColIcon = col.icon;
                const isOver = dragOverColumn === col.id;
                return (
                  <div
                    key={col.id}
                    className={`priority-column priority-col-${col.id} ${
                      isOver ? "drag-over" : ""
                    }`}
                    onDragOver={(e) => handleDragOverColumn(e, col.id)}
                    onDragLeave={(e) => handleDragLeaveColumn(e, col.id)}
                    onDrop={(e) => handleDropOnColumn(e, col.id)}
                    aria-label={`${col.label} column with ${col.items.length} tasks`}
                  >
                    {/* Column Header */}
                    <div className="column-header">
                      <div className="column-title-group">
                        <ColIcon
                          size={15}
                          style={{ color: col.colorVar }}
                          aria-hidden="true"
                        />
                        <h3 className="column-title">{col.label}</h3>
                        <span className="column-count-badge">
                          {col.items.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="column-quick-add-btn"
                        onClick={() => onQuickAddPriority(col.id)}
                        title={`Add new ${col.shortLabel} priority task`}
                        aria-label={`Add new ${col.shortLabel} priority task`}
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Column Tasks */}
                    {col.items.length > 0 ? (
                      <ul
                        className="column-cards-list"
                        aria-label={`${col.label} tasks`}
                      >
                        {col.items.map((todo) => (
                          <TodoCard
                            key={todo.id}
                            todo={todo}
                            viewMode="board"
                            isSelected={selectedTaskId === todo.id}
                            isEditing={editingId === todo.id}
                            onStartEdit={(id) => setEditingId(id)}
                            onSaveEdit={onSaveEdit}
                            onCancelEdit={() => setEditingId(null)}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            onChangePriority={onChangePriority}
                            onMoveStep={onMoveStep}
                            onFilterByTag={(tag) => setSelectedTag(tag)}
                            onAddSubtask={onAddSubtask}
                            onToggleSubtask={onToggleSubtask}
                            onDeleteSubtask={onDeleteSubtask}
                            onDrop={handleDropOnCard}
                          />
                        ))}
                      </ul>
                    ) : (
                      <div className="column-empty-placeholder">
                        <span className="column-empty-text">No tasks</span>
                        <button
                          type="button"
                          className="column-add-empty-btn"
                          onClick={() => onQuickAddPriority(col.id)}
                        >
                          + Add task
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
                  viewMode="list"
                  isSelected={selectedTaskId === todo.id}
                  isEditing={editingId === todo.id}
                  onStartEdit={(id) => setEditingId(id)}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onChangePriority={onChangePriority}
                  onMoveStep={onMoveStep}
                  onFilterByTag={(tag) => setSelectedTag(tag)}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onDrop={handleDropOnCard}
                />
              ))}
            </ul>
          )
        ) : (
          /* Empty State */
          <div
            className="empty-state-card"
            role="region"
            aria-label="Empty state"
          >
            <div className="empty-state-icon" aria-hidden="true">
              {searchQuery || selectedTag ? (
                <Search size={32} />
              ) : filter === "completed" ? (
                <CheckCircle2 size={32} />
              ) : (
                <ClipboardList size={32} />
              )}
            </div>

            <h3 className="empty-state-title">
              {searchQuery || selectedTag
                ? "No matching tasks found"
                : filter === "completed"
                ? "No completed tasks yet"
                : totalCount === 0
                ? "All clear! You're on track."
                : "No active tasks in this view"}
            </h3>

            <p className="empty-state-description">
              {searchQuery
                ? `No task matches "${searchQuery}". Try searching with another keyword.`
                : selectedTag
                ? `No task matches tag #${selectedTag}.`
                : filter === "completed"
                ? "Check off tasks as you finish them to see them archived here."
                : totalCount === 0
                ? "Add your top priorities above to organize your day with clarity."
                : "Switch filter tabs or create a new task to continue."}
            </p>

            {(searchQuery || selectedTag) && (
              <button
                type="button"
                className="empty-state-action-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
