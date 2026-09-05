import { useState, useRef, useEffect } from "react";

export default function BackupModal({ isOpen, onClose, todos, onImportTodos }) {
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen) {
      setImportStatus(null);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Export JSON file
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), todos }, null, 2);
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
      setImportStatus({ type: "success", message: "Tasks exported successfully!" });
    } catch (err) {
      console.error(err);
      setImportStatus({ type: "error", message: "Failed to export tasks." });
    }
  };

  // Import JSON file
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
        setImportStatus({ type: "success", message: `Successfully imported ${count} tasks!` });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error(err);
        setImportStatus({ type: "error", message: "Invalid backup JSON file. Please check the file format." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <i className="fa-solid fa-database modal-header-icon" aria-hidden="true" />
            <h2 id="backup-modal-title" className="modal-title">
              Data Management & Backup
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Your tasks are stored in your browser&apos;s local storage. Export a backup to preserve your data or restore tasks from a previously saved JSON file.
          </p>

          <div className="backup-actions-grid">
            <div className="backup-card">
              <div className="backup-card-header">
                <i className="fa-solid fa-download backup-card-icon export" aria-hidden="true" />
                <div>
                  <h3 className="backup-card-title">Export Tasks</h3>
                  <p className="backup-card-text">Download all {todos.length} tasks as a JSON file.</p>
                </div>
              </div>
              <button
                type="button"
                className="backup-btn export"
                onClick={handleExport}
                disabled={todos.length === 0}
              >
                <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
                Export JSON Backup
              </button>
            </div>

            <div className="backup-card">
              <div className="backup-card-header">
                <i className="fa-solid fa-upload backup-card-icon import" aria-hidden="true" />
                <div>
                  <h3 className="backup-card-title">Import Tasks</h3>
                  <p className="backup-card-text">Restore tasks from a backup file.</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                id="import-backup-file-input"
                className="sr-only"
              />
              <button
                type="button"
                className="backup-btn import"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-file-arrow-up" aria-hidden="true" />
                Choose Backup File
              </button>
            </div>
          </div>

          {importStatus && (
            <div className={`modal-status-banner ${importStatus.type}`} role="alert">
              <i
                className={
                  importStatus.type === "success"
                    ? "fa-solid fa-circle-check"
                    : "fa-solid fa-circle-exclamation"
                }
                aria-hidden="true"
              />
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
