import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  Sun,
  Moon,
  PieChart,
  CloudDownload,
  Command,
  Sparkles,
} from "lucide-react";

import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useTodos } from "./hooks/useTodos";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import ToastNotification from "./components/ToastNotification";
import BackupModal from "./components/BackupModal";
import CommandPalette from "./components/CommandPalette";

function App() {
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast, hideToast } = useToast();

  const {
    todos,
    filteredTodos,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    allTags,
    sortBy,
    setSortBy,
    editingId,
    setEditingId,
    addTodo,
    editTodo,
    changePriority,
    toggleComplete,
    deleteTodo,
    clearCompleted,
    toggleAll,
    reorderTodos,
    moveTodoToPriority,
    moveTodoStep,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    importTodos,
    totalCount,
    completedCount,
    activeCount,
    completionPercentage,
  } = useTodos(showToast);

  // Input states
  const [todoValue, setTodoValue] = useState("");
  const [priority, setPriority] = useState("medium");

  // Modal dialog states
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Previous completed count tracker to detect 100% milestone
  const prevCompletedCount = useRef(completedCount);

  // Trigger Confetti Celebration
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00D2B4", "#38BDF8", "#FFA502", "#FF4757", "#A855F7"],
      });
    } catch {
      // Ignore if canvas-confetti is not available
    }
  }, []);

  // Check for 100% completion milestone
  useEffect(() => {
    if (
      totalCount > 0 &&
      completedCount === totalCount &&
      prevCompletedCount.current < totalCount
    ) {
      triggerCelebration();
      showToast({
        message: "Outstanding! All tasks cleared! 🚀🎉",
        type: "success",
        duration: 4000,
      });
    }
    prevCompletedCount.current = completedCount;
  }, [completedCount, totalCount, triggerCelebration, showToast]);

  // Quick Add for specific priority column
  const handleQuickAddPriority = (targetPriority) => {
    setPriority(targetPriority);
    const inputEl = document.getElementById("new-task-input");
    if (inputEl) {
      inputEl.focus();
      inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Keyboard Shortcuts Hook
  const { selectedTaskId, setSelectedTaskId } = useKeyboardShortcuts({
    todos: filteredTodos,
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onOpenBackupModal: () => setIsBackupOpen(true),
    onToggleComplete: toggleComplete,
    onDeleteTodo: deleteTodo,
    onStartEdit: (id) => setEditingId(id),
    onChangePriority: changePriority,
  });

  // Formatted date string
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={hideToast} />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        todos={todos}
        filter={filter}
        setFilter={setFilter}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenBackup={() => {
          setIsCommandPaletteOpen(false);
          setIsBackupOpen(true);
        }}
        onFocusNewTask={() => {
          const inputEl = document.getElementById("new-task-input");
          inputEl?.focus();
          inputEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        onToggleComplete={toggleComplete}
        onSelectTask={(id) => {
          setSelectedTaskId(id);
          const el = document.getElementById(`todo-card-${id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        onClearCompleted={clearCompleted}
        onTriggerCelebration={triggerCelebration}
      />

      {/* Backup & Data Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        todos={todos}
        onImportTodos={importTodos}
      />

      {/* App Header & Branding */}
      <header className="app-header" role="banner">
        <div className="brand-section">
          <div className="brand-logo-title">
            <img
              src="/favicon.svg"
              alt="TaskFlow Logo"
              className="brand-icon-img"
              width="44"
              height="44"
            />
            <div className="brand-info">
              <h1>TaskFlow</h1>
              <p className="tagline">Streamlined Productivity & Focus</p>
            </div>
          </div>

          <div className="header-controls">
            {/* Command Palette Shortcut Trigger */}
            <button
              type="button"
              className="command-trigger-btn"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open Command Palette (Ctrl+K)"
              title="Open Command Palette (Ctrl+K)"
            >
              <Command size={14} aria-hidden="true" />
              <span className="command-trigger-text">Commands</span>
              <kbd className="command-key-badge">Ctrl K</kbd>
            </button>

            {/* Date Pill */}
            <div className="date-pill" aria-label={`Today is ${todayFormatted}`}>
              <CalendarIcon size={14} aria-hidden="true" />
              <span>{todayFormatted}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Productivity Progress Bar & Stats */}
        {totalCount > 0 && (
          <div
            className="stats-card"
            role="region"
            aria-label="Daily Progress Statistics"
          >
            <div className="stats-header">
              <span className="stats-title">
                <PieChart
                  size={16}
                  style={{ color: "var(--accent-emerald)" }}
                  aria-hidden="true"
                />
                Today&apos;s Progress
              </span>
              <span
                className="stats-badge"
                aria-label={`${completedCount} of ${totalCount} tasks completed`}
              >
                {completedCount}/{totalCount} Completed ({completionPercentage}%)
              </span>
            </div>

            {/* Semantic Progress Bar */}
            <div
              className="progress-bar-track"
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task completion progress"
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="stats-footer">
              <span>
                {completionPercentage === 100 ? (
                  <span className="stats-all-done">
                    <Sparkles size={14} aria-hidden="true" />
                    Outstanding! You cleared all tasks 🚀
                  </span>
                ) : (
                  `${activeCount} task${activeCount === 1 ? "" : "s"} remaining`
                )}
              </span>
              <span>{completionPercentage}% complete</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="main-content" role="main">
        {/* Input Section */}
        <TodoInput
          todoValue={todoValue}
          setTodoValue={setTodoValue}
          priority={priority}
          setPriority={setPriority}
          handleAddTodo={addTodo}
        />

        {/* Todo List and Priority Board */}
        <TodoList
          todos={todos}
          filteredTodos={filteredTodos}
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          allTags={allTags}
          sortBy={sortBy}
          setSortBy={setSortBy}
          editingId={editingId}
          setEditingId={setEditingId}
          selectedTaskId={selectedTaskId}
          onSaveEdit={editTodo}
          onToggleComplete={toggleComplete}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
          onToggleAll={toggleAll}
          onChangePriority={changePriority}
          onReorderTodos={reorderTodos}
          onMoveTodoToPriority={moveTodoToPriority}
          onMoveStep={moveTodoStep}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
          onQuickAddPriority={handleQuickAddPriority}
          totalCount={totalCount}
          completedCount={completedCount}
          activeCount={activeCount}
        />
      </main>

      {/* Footer & Data Tools */}
      <footer className="app-footer" role="contentinfo">
        <div className="footer-links">
          <button
            type="button"
            className="footer-action-btn"
            onClick={() => setIsBackupOpen(true)}
          >
            <CloudDownload size={15} aria-hidden="true" />
            Backup & Export
          </button>
          <span className="footer-sep" aria-hidden="true">
            •
          </span>
          <button
            type="button"
            className="footer-action-btn"
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            <Command size={13} aria-hidden="true" />
            Command Palette (Ctrl+K)
          </button>
          <span className="footer-sep" aria-hidden="true">
            •
          </span>
          <span className="footer-tip">Stored locally in your browser</span>
        </div>
      </footer>
    </>
  );
}

export default App;
