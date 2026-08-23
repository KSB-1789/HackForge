let files = JSON.parse(localStorage.getItem("files")) || [];

function saveFiles() {
    localStorage.setItem("files", JSON.stringify(files));
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

function renderFiles() {
    const fileList = document.getElementById("fileList");

    if (files.length === 0) {
        fileList.innerHTML = "<p>No files added yet.</p>";
        return;
    }

    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <strong>${file.name}</strong>
                <p>${file.type || "Unknown file type"} • ${formatFileSize(file.size)}</p>
            </div>
            <button class="remove-file-btn" data-file-id="${file.id}" title="Remove file">&times;</button>
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

const fileForm = document.getElementById("fileForm");

fileForm.addEventListener("submit", event => {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const selectedFile = fileInput.files[0];

    if (!selectedFile) {
        return;
    }

    files.push({
        id: Date.now(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
    });

    saveFiles();
    fileInput.value = "";
    renderFiles();
});

document.getElementById("fileList").addEventListener("click", event => {
    const btn = event.target.closest(".remove-file-btn");
    if (!btn) {
        return;
    }
    deleteFile(Number(btn.dataset.fileId));
});

renderFiles();