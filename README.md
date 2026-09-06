# ⚡ TaskFlow — Sleek & Modern Task Manager

<div align="center">

**A high-performance, distraction-free productivity app designed with an Obsidian Dark aesthetic, titanium glassmorphism, and instant local persistence.**

[Features](#-key-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Architecture](#-project-structure)

</div>

---

## 📸 Overview

**TaskFlow** elevates everyday task management with a refined, tactile user interface. Built without bloated UI component libraries, it leverages modern CSS custom properties, smooth micro-interactions, priority tagging, live progress telemetry, and instant search to keep your daily workflow sharp and focused.

---

## ✨ Key Features

- 🌑 **Obsidian & Zinc Dark Aesthetic**: Deep dark backgrounds (`#0B0E14`), translucent frosted glass cards, hairline borders, and emerald/cyan accent glows with full Light Mode support.
- 🎯 **3-Column Kanban Priority Board & Single List View**: Switch smoothly between a 3-column Board (**High** / **Medium** / **Low**) and a streamlined single Feed.
- 🔀 **Accessible Drag & Drop**: Native drag and drop to reorder tasks or move between priority columns, with single-pointer and keyboard alternatives (**WCAG 2.2 AA**).
- 📅 **Due Dates & Deadlines**: Quick deadline presets (*Today*, *Tomorrow*, *This Weekend*, *Next Week*), custom dates, and visual urgency badges (**Overdue**, **Due Today**, **Upcoming**).
- 🏷️ **Color-Coded #Tags**: Automatic hashtag extraction, tag badges, and interactive filter bar.
- ⚡ **Command Palette (`Ctrl+K` / `Cmd+K`)**: Instant action launcher and task search with roving focus trap.
- 📊 **Real-time Progress Telemetry & Celebration**: Completion counter, glowing progress bar, and celebratory confetti on 100% daily task completion.
- 🔍 **Instant Search & Filter Tabs**: Multi-criteria filtering by text, subtasks, tags, and status (*All*, *Active*, *Done*).
- 🗂️ **Multi-Format Export & Import**: Export as **JSON backup**, **CSV spreadsheet**, or **Markdown checklist** (Obsidian/Notion), with 1-click clipboard copy.
- ⌨️ **Linear / Superhuman Keyboard Navigation**: `j`/`k` to navigate tasks, `x` to toggle, `e` to edit, `d` to delete, `1`/`2`/`3` to set priority.
- 📦 **Zero-Friction Offline Persistence**: Resilient `localStorage` synchronization with backward-compatible schema normalization.
- 🎨 **Tree-Shaken Vector SVG Icons**: Zero render-blocking FontAwesome CDN — powered natively by `lucide-react`.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Core Framework** | [React 18](https://react.dev/) |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) |
| **Styling** | Vanilla CSS3 (Custom Design System, Tokens, Glassmorphism, 8dp rhythm) |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| **Icons** | [Lucide React](https://lucide.dev/) (Tree-shaken SVG vector components) |
| **Micro-Interactions** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Storage** | Browser `localStorage` API |

---

## 🚀 Getting Started

Follow these steps to run TaskFlow locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18+ recommended) and `npm` installed.

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LordNydorf/Todolist.git
   cd Todolist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the URL provided in your terminal).

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Ctrl + K</kbd> / <kbd>⌘ + K</kbd> | Open Command Palette (search actions & tasks) |
| <kbd>/</kbd> | Focus task & tag search box |
| <kbd>c</kbd> / <kbd>Alt + N</kbd> | Focus new task input field |
| <kbd>↵ Enter</kbd> | Add new task or save edited task |
| <kbd>Esc</kbd> | Dismiss modals, clear input, or cancel editing |
| <kbd>j</kbd> / <kbd>↓</kbd> | Navigate to next task card |
| <kbd>k</kbd> / <kbd>↑</kbd> | Navigate to previous task card |
| <kbd>x</kbd> / <kbd>Space</kbd> | Toggle completed state of selected task |
| <kbd>e</kbd> | Edit selected task |
| <kbd>d</kbd> | Delete selected task (with Undo toast) |
| <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd> | Set selected task priority (Low / Medium / High) |
| <kbd>?</kbd> | Open Data Backup & Export modal |

---

## 📂 Project Structure

```text
TaskFlow/
├── public/
│   ├── favicon.svg              # Custom vector browser icon
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── BackupModal.jsx      # Multi-format export (JSON/CSV/MD), copy & import
│   │   ├── CommandPalette.jsx   # Spotlight command bar (Ctrl+K)
│   │   ├── SubtaskList.jsx       # Nested subtasks checklist with progress bar
│   │   ├── ToastNotification.jsx# Undo toast with countdown progress bar
│   │   ├── TodoCard.jsx         # Card with drag handle, due date, tags & actions
│   │   ├── TodoInput.jsx        # Input card with due date presets & priority selector
│   │   └── TodoList.jsx         # 3-col Kanban board, list view, tag filters & sort
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.js # Linear-style keyboard shortcut engine
│   │   ├── useLocalStorage.js   # Resilient localStorage synchronization
│   │   ├── useTheme.js          # Dark/Light theme manager & system preference sync
│   │   ├── useToast.js          # Notification and undo queue manager
│   │   └── useTodos.js          # Centralized task management engine
│   ├── App.jsx                  # Main application orchestrator & celebrations
│   ├── index.css                # Obsidian glassmorphism tokens & CSS styles
│   └── main.jsx                 # React DOM entry point
├── index.html                   # HTML5 shell & optimized web fonts
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite build configuration
└── README.md                    # Project documentation
```

---

## 🧭 Roadmap

- [x] Modern Obsidian Dark design system with emerald accents
- [x] Tree-shaken SVG icons (zero external CDN dependency)
- [x] Modular React hooks architecture (`useTodos`, `useTheme`, `useToast`, `useKeyboardShortcuts`)
- [x] Priority categorization & 3-column Kanban board
- [x] Task reordering and column assignment via Drag & Drop
- [x] Due dates with quick presets (*Today*, *Tomorrow*, *Next Week*) & Overdue badges
- [x] Color-coded `#tags` categorization & tag filter bar
- [x] Command Palette (`Ctrl+K` / `Cmd+K`)
- [x] Multi-format export (JSON, CSV, Markdown, Clipboard Copy)
- [x] Celebratory confetti on 100% completion milestone


