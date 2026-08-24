const currentFileProjectId = JSON.parse(localStorage.getItem("currentProjectId"));
const filesUser = JSON.parse(localStorage.getItem("currentUser"));

function filesKey() {
    if (currentFileProjectId === null || currentFileProjectId === undefined) {
        return null;
    }
    return `hackforge_files_project_${currentFileProjectId}`;
}

let files = [];
const activeFilesKey = filesKey();
if (activeFilesKey) {
    files = JSON.parse(localStorage.getItem(activeFilesKey)) || [];
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function saveFiles() {
    const key = filesKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(files));
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExt(name) {
    const parts = String(name).split(".");
    return parts.length > 1 ? parts.pop().slice(0, 4) : "file";
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function setFileError(message) {
    const errorEl = document.getElementById("fileError");
    if (!errorEl) {
        return;
    }
    errorEl.textContent = message;
    clearTimeout(setFileError.timer);
    setFileError.timer = setTimeout(() => {
        errorEl.textContent = "";
    }, 5000);
}

function clearFileError() {
    const errorEl = document.getElementById("fileError");
    if (errorEl) {
        errorEl.textContent = "";
    }
}

function renderFiles() {
    const fileList = document.getElementById("fileList");

    if (files.length === 0) {
        fileList.innerHTML = "<p class='empty-state'>No files yet. Upload one above.</p>";
        return;
    }

    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <span class="file-ext">${escapeHtml(getFileExt(file.name))}</span>
            <div class="file-info">
                <strong>${escapeHtml(file.name)}</strong>
                <p>${formatFileSize(file.size)}${file.uploader ? " &bull; added by " + escapeHtml(file.uploader) : ""}</p>
            </div>
            <div class="file-actions">
                <button class="download-btn" data-file-id="${file.id}">Download</button>
                <button class="remove-file-btn" data-file-id="${file.id}" title="Remove file">&times;</button>
            </div>
        </div>
    `).join("");
}

function deleteFile(fileId) {
    const index = files.findIndex(file => file.id === fileId);
    if (index !== -1) {
        files.splice(index, 1);
    }
    saveFiles();
    renderFiles();
}

function downloadFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (!file) {
        return;
    }
    if (!file.data) {
        setFileError("This file has no stored content (it was uploaded before file saving was fixed). Re-upload it to enable download.");
        return;
    }
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

const fileForm = document.getElementById("fileForm");

fileForm.addEventListener("submit", event => {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const selectedFile = fileInput.files[0];

    if (!selectedFile) {
        return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError("File is too large. The browser storage limit is 2MB per file.");
        fileInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        files.push({
            id: Date.now(),
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            data: reader.result,
            uploader: filesUser ? filesUser.name : null
        });

        try {
            saveFiles();
        } catch (error) {
            files.pop();
            setFileError("Browser storage is full. Remove some files before uploading more.");
            return;
        }

        clearFileError();
        fileInput.value = "";
        renderFiles();
    };

    reader.onerror = () => {
        setFileError("Could not read the file. Please try again.");
    };

    reader.readAsDataURL(selectedFile);
});

document.getElementById("fileList").addEventListener("click", event => {
    const downloadBtn = event.target.closest(".download-btn");
    if (downloadBtn) {
        downloadFile(Number(downloadBtn.dataset.fileId));
        return;
    }

    const removeBtn = event.target.closest(".remove-file-btn");
    if (removeBtn) {
        deleteFile(Number(removeBtn.dataset.fileId));
    }
});

renderFiles();
