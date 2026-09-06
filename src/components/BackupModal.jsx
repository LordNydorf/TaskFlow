import { useState, useRef, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function BackupModal({ isOpen, onClose, todos = [], onImportTodos }) {
  const [importStatus, setImportStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen) {
      setImportStatus(null);
      setCopied(false);
      return;
    }

    const modalEl = modalRef.current;
    if (!modalEl) return;

    const focusableEls = modalEl.querySelectorAll(
      'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    firstEl?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1. Export JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(
        {
          version: "2.0",
          exportedAt: new Date().toISOString(),
          todos,
        },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `taskflow-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportStatus({
        type: "success",
        message: "JSON backup exported successfully!",
      });
    } catch (err) {
      console.error(err);
      setImportStatus({ type: "error", message: "Failed to export JSON backup." });
    }
  };

  // 2. Export CSV (Spreadsheet)
  const handleExportCSV = () => {
    try {
      const headers = [
        "Task",
        "Status",
        "Priority",
        "Due Date",
        "Tags",
        "Created Date",
        "Subtasks",
      ];
      const rows = todos.map((t) => {
        const subtasksStr = (t.subtasks || [])
          .map((s) => `${s.completed ? "[x]" : "[ ]"} ${s.text}`)
          .join(" | ");
        return [
          `"${(t.text || "").replace(/"/g, '""')}"`,
          t.completed ? "Completed" : "Active",
          t.priority || "medium",
          t.dueDate || "None",
          `"${(t.tags || []).join(", ")}"`,
          new Date(t.createdAt).toISOString().split("T")[0],
          `"${subtasksStr.replace(/"/g, '""')}"`,
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `taskflow-tasks-${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportStatus({
        type: "success",
        message: "Tasks exported as CSV spreadsheet!",
      });
    } catch (err) {
      console.error(err);
      setImportStatus({ type: "error", message: "Failed to export CSV." });
    }
  };

  // 3. Export Markdown (Obsidian / Notion format)
  const generateMarkdown = () => {
    let md = `# TaskFlow Export (${new Date().toLocaleDateString()})\n\n`;
    todos.forEach((t) => {
      const check = t.completed ? "[x]" : "[ ]";
      const tagsStr = (t.tags || []).length > 0 ? ` #${t.tags.join(" #")}` : "";
      const dueStr = t.dueDate ? ` (Due: ${t.dueDate})` : "";
      const prioStr = t.priority ? ` [${t.priority.toUpperCase()}]` : "";
      md += `- ${check} ${t.text}${prioStr}${dueStr}${tagsStr}\n`;

      if (t.subtasks && t.subtasks.length > 0) {
        t.subtasks.forEach((s) => {
          const sCheck = s.completed ? "[x]" : "[ ]";
          md += `  - ${sCheck} ${s.text}\n`;
        });
      }
    });
    return md;
  };

  const handleExportMarkdown = () => {
    try {
      const md = generateMarkdown();
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `taskflow-notes-${dateStr}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportStatus({
        type: "success",
        message: "Tasks exported as Markdown checklist!",
      });
    } catch (err) {
      console.error(err);
      setImportStatus({ type: "error", message: "Failed to export Markdown." });
    }
  };

  // 4. Copy to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const md = generateMarkdown();
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setImportStatus({
        type: "success",
        message: "Formatted checklist copied to clipboard!",
      });
    } catch (err) {
      console.error(err);
      setImportStatus({
        type: "error",
        message: "Failed to copy to clipboard.",
      });
    }
  };

  // 5. Import JSON file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || (!Array.isArray(parsed.todos) && !Array.isArray(parsed))) {
          throw new Error("Invalid format");
        }
        const rawList = Array.isArray(parsed.todos) ? parsed.todos : parsed;
        const count = onImportTodos(rawList);
        setImportStatus({
          type: "success",
          message: `Successfully imported ${count} tasks!`,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error(err);
        setImportStatus({
          type: "error",
          message: "Invalid backup JSON file. Please check format.",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog backup-modal-dialog"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Database size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="modal-title">
                Data Management & Backup
              </h2>
              <p className="modal-subtitle">
                Export your tasks or restore from a previously saved backup
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1: Export Options */}
          <div className="backup-section">
            <div className="backup-section-header">
              <span className="backup-section-tag">
                <Download size={14} aria-hidden="true" />
                Export Tasks ({todos.length})
              </span>
            </div>

            <div className="export-tiles-grid">
              {/* JSON Backup Tile */}
              <button
                type="button"
                className="export-tile"
                onClick={handleExportJSON}
                disabled={todos.length === 0}
              >
                <div className="export-tile-icon json">
                  <FileJson size={20} aria-hidden="true" />
                </div>
                <div className="export-tile-content">
                  <span className="export-tile-title">JSON Backup</span>
                  <span className="export-tile-desc">Full data & subtasks</span>
                </div>
                <span className="export-tile-ext">.json</span>
              </button>

              {/* CSV Spreadsheet Tile */}
              <button
                type="button"
                className="export-tile"
                onClick={handleExportCSV}
                disabled={todos.length === 0}
              >
                <div className="export-tile-icon csv">
                  <FileSpreadsheet size={20} aria-hidden="true" />
                </div>
                <div className="export-tile-content">
                  <span className="export-tile-title">CSV Table</span>
                  <span className="export-tile-desc">Excel & Google Sheets</span>
                </div>
                <span className="export-tile-ext">.csv</span>
              </button>

              {/* Markdown Tile */}
              <button
                type="button"
                className="export-tile"
                onClick={handleExportMarkdown}
                disabled={todos.length === 0}
              >
                <div className="export-tile-icon md">
                  <FileText size={20} aria-hidden="true" />
                </div>
                <div className="export-tile-content">
                  <span className="export-tile-title">Markdown</span>
                  <span className="export-tile-desc">Obsidian & Notion</span>
                </div>
                <span className="export-tile-ext">.md</span>
              </button>

              {/* Copy to Clipboard Tile */}
              <button
                type="button"
                className="export-tile"
                onClick={handleCopyClipboard}
                disabled={todos.length === 0}
              >
                <div className="export-tile-icon copy">
                  {copied ? (
                    <Check size={20} aria-hidden="true" />
                  ) : (
                    <Copy size={20} aria-hidden="true" />
                  )}
                </div>
                <div className="export-tile-content">
                  <span className="export-tile-title">
                    {copied ? "Copied!" : "Copy Text"}
                  </span>
                  <span className="export-tile-desc">Formatted checklist</span>
                </div>
                <span className="export-tile-ext">Clipboard</span>
              </button>
            </div>
          </div>

          {/* Section 2: Import Backup Dropzone */}
          <div className="backup-section">
            <div className="backup-section-header">
              <span className="backup-section-tag import">
                <Upload size={14} aria-hidden="true" />
                Import Backup
              </span>
            </div>

            <div
              className="import-dropzone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload JSON backup file"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                id="import-backup-file-input"
                className="sr-only"
              />
              <div className="import-dropzone-inner">
                <div className="import-dropzone-icon">
                  <Upload size={22} aria-hidden="true" />
                </div>
                <div className="import-dropzone-text">
                  <span className="import-main-prompt">
                    Click to browse or drop backup file
                  </span>
                  <span className="import-sub-prompt">
                    Accepts TaskFlow <code>.json</code> backup files
                  </span>
                </div>
                <span className="import-browse-pill">Browse File</span>
              </div>
            </div>
          </div>

          {/* Status Alert Banner */}
          {importStatus && (
            <div
              className={`modal-status-banner ${importStatus.type}`}
              role="alert"
            >
              {importStatus.type === "success" ? (
                <CheckCircle2 size={16} aria-hidden="true" />
              ) : (
                <AlertCircle size={16} aria-hidden="true" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span className="modal-footer-storage-note">
            Tasks are saved in browser storage
          </span>
          <button type="button" className="modal-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
