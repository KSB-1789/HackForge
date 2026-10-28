import { useEffect, useState } from 'react';
import { deleteFile, getFiles, uploadFile } from '../../api/files';
import FileItem from './FileItem';
import { useAuth } from '../../context/AuthContext';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function FilePanel({ projectId }) {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadedProjectId, setLoadedProjectId] = useState(null);
  const loading = loadedProjectId !== projectId;
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useAuth() || {};

  useEffect(() => {
    let active = true;

    getFiles(projectId)
      .then((results) => {
        if (active) {
          setFiles(Array.isArray(results) ? results : []);
          setError('');
          setLoadError('');
        }
      })
      .catch((err) => {
        if (active) setLoadError(err?.response?.data?.message || err?.message || 'Failed to load files');
      })
      .finally(() => {
        if (active) setLoadedProjectId(projectId);
      });

    return () => { active = false; };
  }, [projectId]);

  const handleChange = (e) => {
    setError('');
    const selected = e.target.files && e.target.files[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Invalid file type');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('File too large (max 5MB)');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadFile(file, projectId);
      setFiles((prev) => [uploaded, ...prev]);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section id="files">
      <h2>Project files</h2>
      <form id="fileForm" onSubmit={handleSubmit}>
        <input id="fileInput" type="file" onChange={handleChange} required />
        <button className="collab-action collab-action-primary" type="submit" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Add File'}
        </button>
      </form>
      {!loading && error && <div className="collab-error" role="alert">{error}</div>}
      {!loading && loadError && <div className="collab-error" role="alert">{loadError}</div>}
      <div id="fileList">
        {loading ? (
          <div className="collab-status" role="status">Loading files...</div>
        ) : loadError ? null : files.length === 0 ? (
          <div className="empty-state">No files have been added to this project.</div>
        ) : (
          files.map((f) => (
            <FileItem
              key={f.id}
              file={f}
              canDelete={f.uploadedBy === currentUser?.id}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
