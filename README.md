# BiblicalOrNot Chrome Extension

A Chrome extension that analyzes tweets on X (formerly Twitter) and posts on Substack to determine if they align with biblical principles using Perplexity AI.

## Features

- **Seamless Integration**: Adds a "Check if Biblical" option directly to the tweet/post menu (three-dot menu) on X and Substack.
- **AI Analysis**: Uses Perplexity's `sonar-pro` model to act as a biblical scholar.
- **Instant Verdict**: Provides a "Biblical", "Not Biblical", "Mixed/Unclear", or "Unrelated/Neutral" verdict with a brief explanation.

## Demo

<img src="assets/demo.gif" width="600" />

## Screenshots
<img src="assets/1.png" width="600" />
<br />
<img src="assets/2.png" width="600" />
<br />
<img src="assets/3.png" width="600" />
<br />
<img src="assets/4.png" width="600" />

## Installation

1.  **Clone or Download** this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the folder containing this project (where `manifest.json` is located).

## Configuration

### API Key

### API Key

You have two options:

**Option 1: UI (Recommended for Users)**
1.  Click the **BiblicalOrNot** extension icon in your Chrome toolbar.
2.  Enter your **Perplexity API Key** in the input field.
3.  Click **Save Key**.

**Option 2: .env (Recommended for Developers)**
1.  Create a `.env` file in the root directory (see `.env.example`).
2.  Add your key: `PERPLEXITY_API_KEY=your_key_here`.
3.  Run `npm run build` to generate the configuration file.
4.  Reload the extension.

## Usage

1.  Go to [x.com](https://x.com) or [substack.com](https://substack.com).
2.  Find a tweet or post you want to analyze.
3.  Click the **three dots (...)** menu on the post.
4.  Select **Check if Biblical** from the menu.
5.  A modal will appear with the analysis.

## Files

-   `manifest.json`: Extension configuration.
-   `content.js`: Handles the UI injection into Twitter and extracting tweet text.
-   `background.js`: Handles the API calls to Perplexity to avoid CORS issues.
-   `styles.css`: Styles for the modal and menu items.
-   `popup.html`: Simple info popup (not actively used for the main feature).
