import React, { useState } from 'react';
import { uploadFile } from '../../api/files';
import FileItem from './FileItem';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function FilePanel() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

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
      const uploaded = await uploadFile(file);
      setFiles((prev) => [uploaded, ...prev]);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="files">
      <h2>Project Files</h2>
      <form id="fileForm" onSubmit={handleSubmit}>
        <input id="fileInput" type="file" onChange={handleChange} required />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Add File'}
        </button>
      </form>
      {error && <div id="fileError">{error}</div>}
      <div id="fileList">
        {files.map((f, idx) => (
          <FileItem key={f.filename || idx} file={f} />
        ))}
      </div>
    </section>
  );
}
