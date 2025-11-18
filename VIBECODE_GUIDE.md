# How to Vibecode the BiblicalOrNot Chrome Extension

> A step-by-step guide to building this Chrome extension using AI coding assistants like Antigravity or Cursor

## What is "Vibecoding"?

Vibecoding is the practice of building software by conversing with an AI coding assistant. Instead of writing every line of code yourself, you describe what you want to build, provide relevant documentation, and iterate with the AI to create a working application.

## Prerequisites

- An AI coding IDE (Antigravity, Cursor, or similar)
- A Perplexity API key ([get one here](https://perplexity.ai/account/api/keys))
- Basic understanding of Chrome extensions (helpful but not required)
- Chrome browser for testing

## The Vibecoding Process

### Step 1: Start with a Clear Vision

Begin with a concise description of what you want to build. For this project, the initial prompt was:

```
I want you to create a Chrome extension that allows me to click on a tweet 
while I'm on the web view of X. When I click on it, it takes a screenshot 
of the whole page and infers which tweet I was talking about. Then, it gives 
me a report about whether the tweet was biblical.

I want to use perplexity api as my search engine to check whether the tweet 
was biblical.
```

**Key elements of a good initial prompt:**
- Clear objective (analyze tweets for biblical alignment)
- Specific platform (X/Twitter web)
- Desired interaction model (click on tweet → get analysis)
- Technical requirements (Perplexity API)

### Step 2: Ground the AI with Documentation

This is **critical** for success. Don't assume the AI knows the latest API documentation. Instead:

1. **Navigate to the API documentation** (e.g., [Perplexity API Docs](https://docs.perplexity.ai))
2. **Use your browser's "Copy" function** to get the raw markdown of the documentation page
3. **Paste the entire documentation** into your prompt

For this project, the prompt included:
- Perplexity API Quickstart guide
- Authentication examples
- Request/response formats
- Model information (`sonar-pro`)
- The actual API key

**Example of what to copy:**

```markdown
# Quickstart

> Generate an API key and make your first call in < 3 minutes.

## Generating an API Key
[... full documentation ...]

## Making Your First API Call
[... code examples in Python, TypeScript, cURL ...]
```

**Why this works:**
- Ensures the AI uses the correct, current API format
- Provides working code examples to reference
- Reduces hallucination and incorrect assumptions
- Gives context about authentication, parameters, and response structure

### Essential Perplexity API Documentation to Copy

For an app using **Grounded LLM functionality** (like this one), copy these specific pages:

1. **[Quickstart Guide](https://docs.perplexity.ai/getting-started/quickstart)**
   - Authentication setup
   - Basic API call structure
   - Model selection (`sonar-pro` for grounded search)
   - Request/response format

2. **[Search API Reference](https://docs.perplexity.ai/api-reference/search-post)**
   - Complete endpoint specification
   - All available parameters
   - Response schema with `citations` and `search_results`
   - Examples of filtered searches

3. **[Chat Completions Guide](https://docs.perplexity.ai/guides/chat-completions-guide)** (if using chat format)
   - System prompts
   - Message formatting
   - Streaming responses

**How to copy documentation:**
1. Navigate to the documentation page
2. Use your browser's built-in "Copy" or "Select All" (Cmd/Ctrl+A)
3. Paste the entire markdown into your prompt
4. Include multiple pages if needed—more context is better!

### Step 3: Let the AI Architect the Solution

After providing your vision and documentation, the AI will:
1. Propose an architecture
2. Identify the necessary files
3. Suggest the implementation approach

For this project, the AI proposed:
- `manifest.json` - Chrome extension configuration
- `content.js` - Inject UI into Twitter/Substack pages
- `background.js` - Handle API calls (avoid CORS)
- `popup.html` / `popup.js` - Extension popup for settings
- `styles.css` - Modal and UI styling

**Let the AI explain its reasoning.** This helps you understand the approach and catch potential issues early.

### Step 4: Iterate with Specific Requests

As the AI builds the initial version, you'll want to refine it. Make specific requests:

**Examples from this project:**

1. **"Can you make it so I don't have to enable selection mode? Just add it to the three-dot menu on tweets."**
   - This shifted from a toggle-based UI to seamless integration

2. **"The API key is hardcoded. Can you make it so users can enter it in the popup?"**
   - This improved security and made the extension shareable

3. **"Add a 'Powered by Perplexity' tag at the bottom of the popup UI"**
   - Small UX improvements

4. **"Respect `*text*` formatting for italics"**
   - Refinement of the output display

5. **"Add a 'Biblical but Oversimplified' category"**
   - Feature addition based on real-world testing

6. **"Can you add this functionality to Substack web too?"**
   - Platform expansion

### Step 5: Provide Visual Feedback

When something isn't working as expected:
1. **Take screenshots** of the issue
2. **Copy error messages** from the browser console
3. **Describe what you expected vs. what happened**

**Example:**
```
The button is appearing outside the menu instead of inside it.
[attach screenshot]
```

The AI can then adjust the DOM manipulation logic to fix the issue.

### Step 6: Handle Errors Systematically

When you encounter errors:

1. **Share the full error message:**
   ```
   Uncaught TypeError: Cannot read properties of undefined (reading 'getURL')
   ```

2. **Provide context:**
   - Where it happened (which file, line number)
   - What action triggered it
   - Browser console stack trace

3. **Let the AI diagnose and fix**

The AI will often:
- Identify the root cause (e.g., orphaned extension context)
- Propose a fix (e.g., add defensive checks)
- Explain why the error occurred

### Step 7: Refine the User Experience

Once the core functionality works, iterate on UX:

- **Formatting:** "Can you make citations clickable?"
- **Branding:** "Update the title to 'BiblicalOrNot' throughout"
- **Documentation:** "Add a demo.gif to the README"
- **Instructions:** "Update README to clarify this works on Substack too"

## Best Practices for Vibecoding

### 1. **Be Specific, Not Vague**

❌ "Make it better"
✅ "Add the logo image to the footer instead of just text"

❌ "Fix the menu"
✅ "Put the button inside the actual menu as the first item"

### 2. **Provide Documentation, Not Assumptions**

❌ "Use the Perplexity API"
✅ [Paste entire Perplexity API documentation]

### 3. **Iterate in Small Steps**

Don't try to build everything at once. Start with:
1. Basic functionality (analyze a tweet)
2. UI integration (add to menu)
3. Configuration (API key management)
4. Polish (formatting, citations, branding)
5. Expansion (add Substack support)

### 4. **Test and Report Issues Clearly**

After each change:
1. Reload the extension
2. Test the functionality
3. Report what works and what doesn't
4. Provide screenshots/errors for issues

### 5. **Use the AI's Explanations**

When the AI explains why it's doing something, read it. This helps you:
- Understand the codebase
- Make better requests
- Catch potential issues
- Learn new techniques

### 6. **Keep Context Manageable**

If the conversation gets very long:
- The AI may lose track of earlier decisions
- Consider starting a new conversation
- Reference the existing code files
- Summarize what's working and what needs fixing

## Common Pitfalls to Avoid

### 1. **Not Reloading the Extension**
Chrome extensions don't auto-reload. After every code change:
- Go to `chrome://extensions/`
- Click the reload icon
- Refresh any open tabs

### 2. **Forgetting to Refresh the Page**
After reloading the extension, refresh the page you're testing on (Twitter/Substack).

### 3. **Assuming the AI Knows Current APIs**
Always provide documentation. APIs change, and the AI's training data has a cutoff date.

### 4. **Not Checking the Browser Console**
Errors often appear in the console. Open DevTools (F12) and check for:
- Red error messages
- Network request failures
- Extension context issues

### 5. **Vague Bug Reports**
"It's not working" doesn't help. Instead:
- "The menu item appears but clicking it does nothing"
- "I get this error: [paste error]"
- "The modal shows but the content is blank"

## Example Workflow: Adding Substack Support

Here's how the Substack feature was added:

1. **Request:** "Can you add this functionality to Substack web too?"

2. **AI Response:** 
   - Updated `manifest.json` with Substack permissions
   - Modified `content.js` to detect Substack menus
   - Added Substack-specific selectors
   - Created separate injection logic for Substack

3. **Testing:** User tested on Substack, found issues

4. **Iteration:**
   - "The button appears outside the menu" → AI fixed positioning
   - "Getting a CSS selector error" → AI fixed invalid selector
   - "Put the button in the menu" → AI adjusted insertion point

5. **Documentation:** "Update README to clarify this works on Substack too"

## Tools and Resources

### Essential Browser Tools
- **Chrome DevTools** (F12) - Console, Network, Elements tabs
- **Extension Developer Mode** (`chrome://extensions/`)
- **Extension Error Console** (click "Errors" button in extension card)

### Documentation to Reference
- **[Perplexity API Quickstart](https://docs.perplexity.ai/getting-started/quickstart)** - Essential for authentication and basic setup
- **[Perplexity Search API Reference](https://docs.perplexity.ai/api-reference/search-post)** - Critical for grounded LLM apps
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/) - For extension-specific features
- [MDN Web Docs](https://developer.mozilla.org) - For DOM manipulation, CSS, etc.

### Some AI Coding IDEs
- **Antigravity** (Google Deepmind)
- **Cursor** (Anysphere)
- **GitHub Copilot** (Microsoft)

## Key Takeaways

1. **Start with a clear vision** - Know what you want to build
2. **Ground with documentation** - Copy/paste relevant API docs
3. **Iterate incrementally** - Build feature by feature
4. **Test thoroughly** - Reload, refresh, check console
5. **Report issues clearly** - Screenshots, errors, specific descriptions
6. **Trust the process** - The AI can handle complexity if you guide it well

## Final Thoughts

Vibecoding isn't about being lazy—it's about **focusing on what you want to build** rather than memorizing syntax. You're the architect and product manager; the AI is your senior developer.

The key is **clear communication**:
- What you want
- What's not working
- What documentation is relevant

With practice, you can build complex applications in a fraction of the time it would take to code everything manually.

---

**Built with this guide?** Share your experience and improvements!
