chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkBiblical") {
        checkBiblical(request.text).then(result => {
            sendResponse({ result: result });
        }).catch(error => {
            sendResponse({ error: error.message });
        });
        return true; // Will respond asynchronously
    }
});

async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['perplexityApiKey'], (result) => {
            resolve(result.perplexityApiKey);
        });
    });
}

async function checkBiblical(text) {
    const apiKey = await getApiKey();

    if (!apiKey) {
        throw new Error("API Key not set. Please click the extension icon and enter your Perplexity API Key.");
    }

    const url = "https://api.perplexity.ai/chat/completions";

    const systemPrompt = "You are a biblical scholar. Your task is to analyze the following tweet and determine if it aligns with biblical principles or scripture. Provide a concise verdict: 'Biblical', 'Not Biblical', 'Mixed/Unclear', or 'Unrelated/Neutral'. Use 'Unrelated/Neutral' if the tweet has nothing to do with the Bible, religion, or moral questions addressed by scripture (e.g., sports scores, tech news, random observations). Follow the verdict with a brief explanation, citing relevant verses only if applicable. Keep it under 150 words.";

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "sonar-pro",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Tweet: "${text}"` }
            ]
        })
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Perplexity API Error:", error);
        throw error;
    }
}
