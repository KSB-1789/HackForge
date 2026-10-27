import React from 'react';

export default function FileItem({ file }) {
  const ext = file.filename ? file.filename.split('.').pop().toUpperCase() : '';
  return (
    <div className="file-item">
      <div className="file-ext">{ext}</div>
      <div className="file-info">
        <strong>{file.originalName || file.filename}</strong>
        {file.size && <p>{Math.round(file.size / 1024)} KB</p>}
      </div>
      <div className="file-actions">
        {file.url && (
          <a className="download-btn" href={file.url} target="_blank" rel="noopener noreferrer">
            Download
          </a>
        )}
      </div>
    </div>
  );
}
