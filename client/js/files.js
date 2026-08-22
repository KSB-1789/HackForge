const files = [];

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
            <strong>${file.name}</strong>
            <p>${file.type || "Unknown file type"} • ${formatFileSize(file.size)}</p>
        </div>
    `).join("");
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
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
    });

    fileInput.value = "";
    renderFiles();
});

renderFiles();