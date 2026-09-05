import { useState, useEffect, useCallback } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import ToastNotification from "./components/ToastNotification";
import BackupModal from "./components/BackupModal";

// Helper to normalize data from legacy string format to rich task object with subtasks
function normalizeTodo(item, index) {
  if (typeof item === "string") {
    return {
      id: `legacy-${index}-${Date.now()}`,
      text: item,
      completed: false,
      priority: "medium",
      createdAt: Date.now(),
      subtasks: [],
    };
  }
  return {
    id: item.id || `todo-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: item.text || "",
    completed: Boolean(item.completed),
    priority: item.priority || "medium",
    createdAt: item.createdAt || Date.now(),
    subtasks: Array.isArray(item.subtasks)
      ? item.subtasks.map((s, sIdx) => ({
          id: s.id || `sub-${sIdx}-${Date.now()}`,
          text: s.text || "",
          completed: Boolean(s.completed),
        }))
      : [],
  };
}

function App() {
  const [todos, setTodos] = useState([]);
  const [todoValue, setTodoValue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Theme management ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("taskflow_theme");
      if (savedTheme) return savedTheme;
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  // Undo Toast state
  const [toast, setToast] = useState(null);

  // Backup modal state
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("taskflow_theme", theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Persist tasks to localStorage
  const persistData = useCallback((newList) => {
    try {
      localStorage.setItem("todos", JSON.stringify({ todos: newList }));
    } catch (e) {
      console.error("Failed to save todos to localStorage", e);
    }
  }, []);

  // Load initial tasks from localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !localStorage) return;
      const localData = localStorage.getItem("todos");
      if (!localData) return;
      const parsed = JSON.parse(localData);
      if (parsed && Array.isArray(parsed.todos)) {
        const normalized = parsed.todos.map((item, idx) =>
          normalizeTodo(item, idx)
        );
        setTodos(normalized);
      }
    } catch (e) {
      console.error("Failed to load todos from localStorage", e);
    }
  }, []);

  // Show Toast Helper
  const showToast = useCallback(({ message, actionLabel, onAction, type = "info", duration = 5000 }) => {
    setToast({
      id: Date.now(),
      message,
      actionLabel,
      onAction,
      type,
      duration,
    });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger shortcuts when typing inside form inputs or textareas
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") {
        if (e.key === "Escape") {
          document.activeElement?.blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchEl = document.getElementById("task-search-input");
        if (searchEl) {
          searchEl.focus();
          searchEl.select();
        }
      } else if (e.key === "c" || e.key === "C" || (e.altKey && e.key === "n")) {
        e.preventDefault();
        const inputEl = document.getElementById("new-task-input");
        if (inputEl) {
          inputEl.focus();
        }
      } else if (e.key === "?") {
        e.preventDefault();
        setIsBackupOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Add new task
  const handleAddTodo = (text, taskPriority = "medium") => {
    const newTodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text,
      completed: false,
      priority: taskPriority,
      createdAt: Date.now(),
      subtasks: [],
    };
    const newTodoList = [newTodoItem, ...todos];
    setTodos(newTodoList);
    persistData(newTodoList);
    setTodoValue("");
    setPriority("medium");
  };

  // Save inline edited task
  const handleSaveInlineEdit = (id, newText, newPriority) => {
    const updatedTodos = todos.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          text: newText,
          priority: newPriority,
        };
      }
      return item;
    });
    setTodos(updatedTodos);
    persistData(updatedTodos);
    setEditingId(null);
  };

  // Change priority (moves card between columns)
  const handleChangePriority = (id, newPriority) => {
    const updatedTodos = todos.map((item) => {
      if (item.id === id) {
        return { ...item, priority: newPriority };
      }
      return item;
    });
    setTodos(updatedTodos);
    persistData(updatedTodos);
  };

  // Quick Add for specific column
  const handleQuickAddPriority = (targetPriority) => {
    setPriority(targetPriority);
    const inputEl = document.getElementById("new-task-input");
    if (inputEl) {
      inputEl.focus();
      inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Toggle complete state
  const handleToggleComplete = (id) => {
    const targetTodo = todos.find((t) => t.id === id);
    const newTodoList = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    setTodos(newTodoList);
    persistData(newTodoList);

    if (targetTodo && !targetTodo.completed) {
      showToast({
        message: `Completed "${targetTodo.text.length > 25 ? targetTodo.text.substring(0, 25) + '...' : targetTodo.text}"!`,
        type: "success",
        duration: 3000,
      });
    }
  };

  // Delete single todo with Undo Toast
  const handleDeleteTodo = (id) => {
    const itemToDelete = todos.find((t) => t.id === id);
    const itemIndex = todos.findIndex((t) => t.id === id);
    if (!itemToDelete) return;

    const newTodoList = todos.filter((t) => t.id !== id);
    setTodos(newTodoList);
    persistData(newTodoList);

    if (editingId === id) {
      setEditingId(null);
    }

    // Trigger Undo Toast
    showToast({
      message: `Deleted "${itemToDelete.text.length > 22 ? itemToDelete.text.substring(0, 22) + '...' : itemToDelete.text}"`,
      actionLabel: "Undo",
      type: "delete",
      duration: 6000,
      onAction: () => {
        setTodos((currentTodos) => {
          const restored = [...currentTodos];
          restored.splice(itemIndex, 0, itemToDelete);
          persistData(restored);
          return restored;
        });
      },
    });
  };

  // Clear all completed tasks with Undo Toast
  const handleClearCompleted = () => {
    const completedTasks = todos.filter((todo) => todo.completed);
    if (completedTasks.length === 0) return;

    const snapshot = [...todos];
    const newTodoList = todos.filter((todo) => !todo.completed);
    setTodos(newTodoList);
    persistData(newTodoList);

    // Trigger Undo Toast
    showToast({
      message: `Cleared ${completedTasks.length} completed task${
        completedTasks.length === 1 ? "" : "s"
      }`,
      actionLabel: "Undo",
      type: "delete",
      duration: 7000,
      onAction: () => {
        setTodos(snapshot);
        persistData(snapshot);
      },
    });
  };

  // Toggle all visible tasks
  const handleToggleAll = (visibleTodos) => {
    const targetList = visibleTodos && visibleTodos.length > 0 ? visibleTodos : todos;
    const allCompleted = targetList.every((t) => t.completed);
    const targetIds = new Set(targetList.map((t) => t.id));

    const newTodoList = todos.map((t) => {
      if (targetIds.has(t.id)) {
        return { ...t, completed: !allCompleted };
      }
      return t;
    });

    setTodos(newTodoList);
    persistData(newTodoList);
  };

  // Subtask Handlers
  const handleAddSubtask = (todoId, subtaskText) => {
    const newSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: subtaskText,
      completed: false,
    };
    const updated = todos.map((item) => {
      if (item.id === todoId) {
        const prevSubs = Array.isArray(item.subtasks) ? item.subtasks : [];
        return { ...item, subtasks: [...prevSubs, newSubtask] };
      }
      return item;
    });
    setTodos(updated);
    persistData(updated);
  };

  const handleToggleSubtask = (todoId, subtaskId) => {
    const updated = todos.map((item) => {
      if (item.id === todoId) {
        const prevSubs = Array.isArray(item.subtasks) ? item.subtasks : [];
        const newSubs = prevSubs.map((s) => {
          if (s.id === subtaskId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...item, subtasks: newSubs };
      }
      return item;
    });
    setTodos(updated);
    persistData(updated);
  };

  const handleDeleteSubtask = (todoId, subtaskId) => {
    const updated = todos.map((item) => {
      if (item.id === todoId) {
        const prevSubs = Array.isArray(item.subtasks) ? item.subtasks : [];
        return {
          ...item,
          subtasks: prevSubs.filter((s) => s.id !== subtaskId),
        };
      }
      return item;
    });
    setTodos(updated);
    persistData(updated);
  };

  // Import tasks handler for BackupModal
  const handleImportTodos = (rawList) => {
    const normalized = rawList.map((item, idx) => normalizeTodo(item, idx));
    const merged = [...normalized, ...todos];
    // Deduplicate by ID
    const uniqueMap = new Map();
    merged.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    const finalTodos = Array.from(uniqueMap.values());
    setTodos(finalTodos);
    persistData(finalTodos);
    return normalized.length;
  };

  // Calculated statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const completionPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Formatted date
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      {/* Toast Notification Container */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Backup & Data Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        todos={todos}
        onImportTodos={handleImportTodos}
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
            <div className="date-pill" aria-label={`Today is ${todayFormatted}`}>
              <i className="fa-regular fa-calendar" aria-hidden="true" />
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
                <i className="fa-solid fa-sun" aria-hidden="true" />
              ) : (
                <i className="fa-solid fa-moon" aria-hidden="true" />
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
                <i
                  className="fa-solid fa-chart-pie"
                  style={{ color: "var(--accent-emerald)" }}
                  aria-hidden="true"
                />
                Today&apos;s Progress
              </span>
              <span className="stats-badge" aria-label={`${completedCount} of ${totalCount} tasks completed`}>
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
                {completionPercentage === 100
                  ? "Outstanding! You cleared all tasks 🚀"
                  : `${totalCount - completedCount} task${
                      totalCount - completedCount === 1 ? "" : "s"
                    } remaining`}
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
          handleAddTodo={handleAddTodo}
        />

        {/* Todo List and Priority Board */}
        <TodoList
          todos={todos}
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          editingId={editingId}
          setEditingId={setEditingId}
          onSaveEdit={handleSaveInlineEdit}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          onClearCompleted={handleClearCompleted}
          onToggleAll={handleToggleAll}
          onChangePriority={handleChangePriority}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onQuickAddPriority={handleQuickAddPriority}
          totalCount={totalCount}
          completedCount={completedCount}
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
            <i className="fa-solid fa-cloud-arrow-down" aria-hidden="true" />
            Backup & Export
          </button>
          <span className="footer-sep" aria-hidden="true">•</span>
          <span className="footer-tip">Stored locally in your browser</span>
        </div>
      </footer>
    </>
  );
}

export default App;
