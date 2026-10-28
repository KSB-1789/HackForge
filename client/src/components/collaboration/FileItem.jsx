import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { downloadFile } from '../../api/files';

function FileDeleteModal({ filename, onConfirm, onCancel, deleting }) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deleting) {
        event.preventDefault();
        onCancel();
      }

      if (event.key !== 'Tab') return;
      const buttons = Array.from(dialogRef.current?.querySelectorAll('button:not(:disabled)') || []);
      if (buttons.length === 0) return;

      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleting, onCancel]);

  return createPortal(
    <div className="modal-overlay" onClick={deleting ? undefined : onCancel}>
      <div
        ref={dialogRef}
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="file-delete-title"
        aria-describedby="file-delete-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="file-delete-title">Delete file?</h3>
        <p id="file-delete-description">
          Delete <strong>{filename}</strong>? This permanently removes it from the project.
        </p>
        <div className="modal-actions">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete file'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function FileItem({ file, canDelete = false, onDelete }) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const deleteButtonRef = useRef(null);
  const ext = file.filename ? file.filename.split('.').pop().toUpperCase() : '';

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    window.requestAnimationFrame(() => deleteButtonRef.current?.focus());
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const blob = await downloadFile(file.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.originalName || file.filename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await onDelete(file.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'File could not be deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="file-item">
      <div className="file-ext">{ext}</div>
      <div className="file-info">
        <strong>{file.originalName || file.filename}</strong>
        {file.size && <p>{Math.round(file.size / 1024)} KB</p>}
      </div>
      <div className="file-actions">
        {file.id && (
          <button
            className="collab-action"
            type="button"
            onClick={handleDownload}
            disabled={downloading || deleting}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        )}
        {canDelete && onDelete && (
          <button
            className="close-form-button file-delete-button"
            ref={deleteButtonRef}
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={downloading || deleting}
            aria-label={`Delete file ${file.originalName || file.filename}`}
            title="Delete file"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>
      {error && <p className="file-item-error" role="alert">{error}</p>}
      {showDeleteConfirm && (
        <FileDeleteModal
          filename={file.originalName || file.filename}
          onConfirm={handleDelete}
          onCancel={closeDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
}
