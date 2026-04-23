window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('save_status');
    
    let lastSavedText = '';
    let currentFilePath = null;  // NEW - tracks tyhe current file 

    // ... rest of the code

    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;
    let lastSavedText = textarea.value;

    // Manual save
    saveBtn.addEventListener('click', async () => {
        try {
            await window.electronAPI.saveNote(textarea.value);
            lastSavedText = textarea.value;
            statusEl.textContent = 'Manually saved!';
            alert('Note saved successfully!');
        } catch (err) {
            console.error('Manual save failed:', err);
            statusEl.textContent = 'Manual save failed';
        }
    });

    // NEW: Save As button
const saveAsBtn = document.getElementById('save-as');

saveAsBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.saveAs(textarea.value);
    if (result.success) {
        lastSavedText = textarea.value;
        currentFilePath = result.filePath;   // NEW - remember this path
        statusEl.textContent = `Saved to: ${result.filePath}`;
    } else {
        statusEl.textContent = 'Save As cancelled.';
    }
});

// NEW: Open file button
const openFileBtn = document.getElementById('open-file');

openFileBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
    if (result.success) {
        textarea.value = result.content;
        lastSavedText = result.content;
        currentFilePath = result.filePath;
        statusEl.textContent = `Opened: ${result.filePath}`;
    } else {
        statusEl.textContext = 'Open cancelled.';
    }
});

// UPDATED: Save button now uses currentFilePath
saveBtn.addEventListener('click', async () => {
    try {
        const result = await window.electronAPI.smartSave(textarea.value, currentFilePath);
        lastSavedText = textarea.value;
        currentFilePath = result.filePath;
        statusEl.textContent = `Saved to: ${result.filePath}`;
    } catch (err) {
        console.error('Save failed:', err);
        statusEl.textContent = 'Save failed';
    }
});

    async function autoSave() {
        const currentText = textarea.value;
        if (currentText === lastSavedText) {
            statusEl.textContent = 'No changes to save';
            return;
        }
        try {
            await window.electronAPI.saveNote(currentText);
            lastSavedText = currentText;
            const now = new Date().toLocaleTimeString();
            statusEl.textContent = `Auto-saved at ${now}`;
        } catch (err) {
            console.error('Auto-save failed:', err);
            statusEl.textContent = 'Auto-save failed';
        }
    }

    let debounceTimer;
    textarea.addEventListener('input', () => {
        statusEl.textContent = 'Changes detected - auto-saving in 5 seconds...';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(autoSave, 5000);
    });

});