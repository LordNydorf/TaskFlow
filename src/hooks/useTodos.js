import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

// Helper to extract #hashtags from text
export function extractTags(text = "") {
  const str = typeof text === "string" ? text : String(text ?? "");
  const matches = str.match(/#([a-zA-Z0-9_-]+)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((t) => t.substring(1).toLowerCase())));
}

// Normalize task objects across versions
export function normalizeTodo(item, index = 0) {
  if (typeof item === "string") {
    const text = item;
    const tags = extractTags(text);
    return {
      id: `legacy-${index}-${Date.now()}`,
      text: text.replace(/#([a-zA-Z0-9_-]+)/g, "").trim(),
      completed: false,
      priority: "medium",
      dueDate: null,
      tags,
      createdAt: Date.now(),
      subtasks: [],
    };
  }

  // Guard against null, undefined, or primitive values
  if (!item || typeof item !== "object") {
    return {
      id: `fallback-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: String(item ?? "").trim(),
      completed: false,
      priority: "medium",
      dueDate: null,
      tags: [],
      createdAt: Date.now(),
      subtasks: [],
    };
  }

  const rawText = typeof item.text === "string" ? item.text : String(item.text ?? "");
  const existingTags = Array.isArray(item.tags) ? item.tags.map(String) : [];
  const extracted = extractTags(rawText);
  const combinedTags = Array.from(new Set([...existingTags, ...extracted]));
  const validPriority = ["low", "medium", "high"].includes(item.priority)
    ? item.priority
    : "medium";

  return {
    id: typeof item.id === "string" && item.id.trim()
      ? item.id
      : `todo-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text: rawText,
    completed: Boolean(item.completed),
    priority: validPriority,
    dueDate: typeof item.dueDate === "string" ? item.dueDate : null,
    tags: combinedTags,
    createdAt: typeof item.createdAt === "number" && !Number.isNaN(item.createdAt)
      ? item.createdAt
      : Date.now(),
    subtasks: Array.isArray(item.subtasks)
      ? item.subtasks.map((s, sIdx) => ({
          id: s && typeof s.id === "string" ? s.id : `sub-${sIdx}-${Date.now()}`,
          text: s && typeof s.text === "string" ? s.text : String(s?.text ?? ""),
          completed: Boolean(s?.completed),
        }))
      : [],
  };
}

  // Priority mapping for sort
const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

export function useTodos(showToast) {
  const [storedData, setStoredData] = useLocalStorage("todos", { todos: [] });

  const [todos, setTodosState] = useState(() => {
    if (storedData && Array.isArray(storedData.todos)) {
      return storedData.todos.map((t, idx) => normalizeTodo(t, idx));
    }
    return [];
  });

  const persistTodos = useCallback(
    (newList) => {
      setTodosState(newList);
      setStoredData({ todos: newList });
    },
    [setStoredData]
  );

  // Filters & State
  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState("default"); // 'default' | 'dueDate' | 'priority' | 'created' | 'alpha'
  const [editingId, setEditingId] = useState(null);

  // Add new task
  const addTodo = useCallback(
    (text, taskPriority = "medium", dueDate = null, tags = []) => {
      const inlineTags = extractTags(text);
      const mergedTags = Array.from(new Set([...tags, ...inlineTags]));
      const cleanedText = text.replace(/#([a-zA-Z0-9_-]+)/g, "").trim();

      const newTodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text: cleanedText || text,
        completed: false,
        priority: taskPriority,
        dueDate: dueDate || null,
        tags: mergedTags,
        createdAt: Date.now(),
        subtasks: [],
      };

      const updated = [newTodoItem, ...todos];
      persistTodos(updated);
      return newTodoItem;
    },
    [todos, persistTodos]
  );

  // Edit task
  const editTodo = useCallback(
    (id, newText, newPriority, newDueDate = null, newTags = null) => {
      const inlineTags = extractTags(newText);
      const updated = todos.map((item) => {
        if (item.id === id) {
          const baseTags = newTags !== null ? newTags : item.tags || [];
          const mergedTags = Array.from(new Set([...baseTags, ...inlineTags]));
          const cleanedText = newText.replace(/#([a-zA-Z0-9_-]+)/g, "").trim();

          return {
            ...item,
            text: cleanedText || newText,
            priority: newPriority || item.priority,
            dueDate: newDueDate !== undefined ? newDueDate : item.dueDate,
            tags: mergedTags,
          };
        }
        return item;
      });
      persistTodos(updated);
      setEditingId(null);
    },
    [todos, persistTodos]
  );

  // Change priority (moves card between columns)
  const changePriority = useCallback(
    (id, newPriority) => {
      const updated = todos.map((item) => {
        if (item.id === id) {
          return { ...item, priority: newPriority };
        }
        return item;
      });
      persistTodos(updated);
    },
    [todos, persistTodos]
  );

  // Toggle complete state
  const toggleComplete = useCallback(
    (id) => {
      let completedItem = null;
      const updated = todos.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          if (nextCompleted) completedItem = item;
          return { ...item, completed: nextCompleted };
        }
        return item;
      });
      persistTodos(updated);

      if (completedItem && showToast) {
        showToast({
          message: `Completed "${
            completedItem.text.length > 25
              ? completedItem.text.substring(0, 25) + "..."
              : completedItem.text
          }"!`,
          type: "success",
          duration: 3000,
        });
      }
    },
    [todos, persistTodos, showToast]
  );

  // Delete task with Undo Toast
  const deleteTodo = useCallback(
    (id) => {
      const itemToDelete = todos.find((t) => t.id === id);
      const itemIndex = todos.findIndex((t) => t.id === id);
      if (!itemToDelete) return;

      const updated = todos.filter((t) => t.id !== id);
      persistTodos(updated);

      if (editingId === id) {
        setEditingId(null);
      }

      if (showToast) {
        showToast({
          message: `Deleted "${
            itemToDelete.text.length > 22
              ? itemToDelete.text.substring(0, 22) + "..."
              : itemToDelete.text
          }"`,
          actionLabel: "Undo",
          type: "delete",
          duration: 6000,
          onAction: () => {
            setTodosState((current) => {
              const restored = [...current];
              restored.splice(itemIndex, 0, itemToDelete);
              persistTodos(restored);
              return restored;
            });
          },
        });
      }
    },
    [todos, persistTodos, editingId, showToast]
  );

  // Clear completed with Undo Toast
  const clearCompleted = useCallback(() => {
    const completedTasks = todos.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    const snapshot = [...todos];
    const updated = todos.filter((t) => !t.completed);
    persistTodos(updated);

    if (showToast) {
      showToast({
        message: `Cleared ${completedTasks.length} completed task${
          completedTasks.length === 1 ? "" : "s"
        }`,
        actionLabel: "Undo",
        type: "delete",
        duration: 7000,
        onAction: () => {
          persistTodos(snapshot);
        },
      });
    }
  }, [todos, persistTodos, showToast]);

  // Toggle all visible tasks
  const toggleAll = useCallback(
    (visibleList) => {
      const targetList = visibleList && visibleList.length > 0 ? visibleList : todos;
      const allDone = targetList.every((t) => t.completed);
      const targetIds = new Set(targetList.map((t) => t.id));

      const updated = todos.map((t) => {
        if (targetIds.has(t.id)) {
          return { ...t, completed: !allDone };
        }
        return t;
      });

      persistTodos(updated);
    },
    [todos, persistTodos]
  );

  // Drag & drop reorder (within list)
  const reorderTodos = useCallback(
    (sourceId, targetId) => {
      const sourceIndex = todos.findIndex((t) => t.id === sourceId);
      const targetIndex = todos.findIndex((t) => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

      const newTodos = [...todos];
      const [moved] = newTodos.splice(sourceIndex, 1);
      newTodos.splice(targetIndex, 0, moved);
      persistTodos(newTodos);
    },
    [todos, persistTodos]
  );

  // Move todo to column / priority drop
  const moveTodoToPriority = useCallback(
    (todoId, targetPriority, targetTodoId = null) => {
      const todo = todos.find((t) => t.id === todoId);
      if (!todo) return;

      const newTodos = todos.filter((t) => t.id !== todoId);
      const updatedTodo = { ...todo, priority: targetPriority };

      if (targetTodoId) {
        const targetIndex = newTodos.findIndex((t) => t.id === targetTodoId);
        if (targetIndex !== -1) {
          newTodos.splice(targetIndex, 0, updatedTodo);
        } else {
          newTodos.push(updatedTodo);
        }
      } else {
        newTodos.push(updatedTodo);
      }

      persistTodos(newTodos);
    },
    [todos, persistTodos]
  );

  // Move todo position up/down
  const moveTodoStep = useCallback(
    (id, direction) => {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= todos.length) return;

      const newTodos = [...todos];
      const [item] = newTodos.splice(index, 1);
      newTodos.splice(targetIndex, 0, item);
      persistTodos(newTodos);
    },
    [todos, persistTodos]
  );

  // Subtasks
  const addSubtask = useCallback(
    (todoId, subtaskText) => {
      const newSubtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: subtaskText,
        completed: false,
      };
      const updated = todos.map((item) => {
        if (item.id === todoId) {
          const prev = Array.isArray(item.subtasks) ? item.subtasks : [];
          return { ...item, subtasks: [...prev, newSubtask] };
        }
        return item;
      });
      persistTodos(updated);
    },
    [todos, persistTodos]
  );

  const toggleSubtask = useCallback(
    (todoId, subtaskId) => {
      const updated = todos.map((item) => {
        if (item.id === todoId) {
          const prev = Array.isArray(item.subtasks) ? item.subtasks : [];
          return {
            ...item,
            subtasks: prev.map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          };
        }
        return item;
      });
      persistTodos(updated);
    },
    [todos, persistTodos]
  );

  const deleteSubtask = useCallback(
    (todoId, subtaskId) => {
      const updated = todos.map((item) => {
        if (item.id === todoId) {
          const prev = Array.isArray(item.subtasks) ? item.subtasks : [];
          return {
            ...item,
            subtasks: prev.filter((s) => s.id !== subtaskId),
          };
        }
        return item;
      });
      persistTodos(updated);
    },
    [todos, persistTodos]
  );

  // Backup Import
  const importTodos = useCallback(
    (rawList) => {
      const normalized = rawList.map((item, idx) => normalizeTodo(item, idx));
      const merged = [...normalized, ...todos];
      const uniqueMap = new Map();
      merged.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      const finalTodos = Array.from(uniqueMap.values());
      persistTodos(finalTodos);
      return normalized.length;
    },
    [todos, persistTodos]
  );

  // All extracted tags for filter bar
  const allTags = useMemo(() => {
    const tagSet = new Set();
    todos.forEach((t) => {
      if (Array.isArray(t.tags)) {
        t.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [todos]);

  // Filtered and Sorted list
  const filteredTodos = useMemo(() => {
    const list = todos.filter((item) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
          ? !item.completed
          : item.completed;

      const matchesSearch =
        !searchQuery ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtasks &&
          item.subtasks.some((s) =>
            s.text.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        (item.tags &&
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      const matchesTag =
        !selectedTag || (item.tags && item.tags.includes(selectedTag));

      return matchesFilter && matchesSearch && matchesTag;
    });

    if (sortBy === "priority") {
      return [...list].sort(
        (a, b) =>
          (PRIORITY_WEIGHT[b.priority] || 2) - (PRIORITY_WEIGHT[a.priority] || 2)
      );
    }
    if (sortBy === "dueDate") {
      return [...list].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }
    if (sortBy === "created") {
      return [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    if (sortBy === "alpha") {
      return [...list].sort((a, b) => a.text.localeCompare(b.text));
    }
    return list;
  }, [todos, filter, searchQuery, selectedTag, sortBy]);

  // Statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const completionPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
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
  };
}
