document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved key
    chrome.storage.sync.get(['perplexityApiKey'], (result) => {
        if (result.perplexityApiKey) {
            apiKeyInput.value = result.perplexityApiKey;
        }
    });

    // Save key
    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            showStatus('Please enter a key.', 'red');
            return;
        }

        chrome.storage.sync.set({ perplexityApiKey: key }, () => {
            showStatus('API Key saved!', 'green');
            setTimeout(() => {
                showStatus('', '');
            }, 2000);
        });
    });

    function showStatus(text, color) {
        statusDiv.innerText = text;
        statusDiv.style.color = color;
    }
});
