// Try to load the generated env.js file
try {
    importScripts('env.js');
} catch (e) {
    console.log('env.js not found. Ensure you ran "npm run build" or set the key in the popup.');
}

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
            if (result.perplexityApiKey) {
                resolve(result.perplexityApiKey);
            } else if (typeof PROCESS_ENV !== 'undefined' && PROCESS_ENV.PERPLEXITY_API_KEY) {
                resolve(PROCESS_ENV.PERPLEXITY_API_KEY);
            } else {
                resolve(null);
            }
        });
    });
}

async function checkBiblical(text) {
    const apiKey = await getApiKey();

    if (!apiKey) {
        throw new Error("API Key not set. Please click the extension icon and enter your Perplexity API Key.");
    }

    const url = "https://api.perplexity.ai/chat/completions";

    const systemPrompt = "You are a biblical scholar. Your task is to analyze the following tweet and determine if it aligns with biblical principles or scripture. Choose one verdict: 'Biblical', 'Not Biblical', 'Mixed/Unclear', 'Biblical but Oversimplified', or 'Unrelated/Neutral'.\n\nUse 'Biblical but Oversimplified' if the tweet captures a core biblical truth but lacks important nuance or context.\nUse 'Unrelated/Neutral' if the tweet has nothing to do with the Bible, religion, or moral questions addressed by scripture.\n\nFORMAT YOUR RESPONSE EXACTLY LIKE THIS:\nVERDICT: **[Insert Verdict Here]**\n\n[Insert your brief explanation and analysis here]\n\nIMPORTANT: When citing scripture, use the standard format 'Book Chapter:Verse' (e.g., John 3:16, 1 Corinthians 13:4-7) so it can be automatically linked. Keep the analysis under 150 words.";

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
        return {
            content: data.choices[0].message.content,
            citations: data.citations || []
        };
    } catch (error) {
        console.error("Perplexity API Error:", error);
        throw error;
    }
}
