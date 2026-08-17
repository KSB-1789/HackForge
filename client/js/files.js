const files = [];

function renderFiles() {
    const fileList = document.getElementById("fileList");

    if (files.length === 0) {
        fileList.innerHTML = "<p>No files added yet.</p>";
        return;
    }

    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <strong>${file.name}</strong>
            <p>${file.type || "Unknown file type"}</p>
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
        type: selectedFile.type
    });

    fileInput.value = "";
    renderFiles();
});

renderFiles();