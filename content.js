let currentPost = null;

// 1. Track which post's menu was clicked
document.addEventListener('click', (e) => {
    // Twitter
    const twitterCaret = e.target.closest('[data-testid="caret"]');
    if (twitterCaret) {
        currentPost = twitterCaret.closest('article');
        return;
    }

    // Substack
    // Substack menu buttons often have the lucide-ellipsis class or are within a specific button structure
    // Based on screenshot: button with svg.lucide-ellipsis
    const substackMenuBtn = e.target.closest('button');
    if (substackMenuBtn && substackMenuBtn.querySelector('.lucide-ellipsis')) {
        // Find the closest post container. 
        // Substack structure varies (Notes vs Articles). 
        // Notes often have role="article" or class "feedItem-..."
        currentPost = substackMenuBtn.closest('[role="article"]') || substackMenuBtn.closest('.feed-item') || substackMenuBtn.closest('.post-preview');
    }
}, true);

// 2. Observe for the menu opening
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                // Check if the added node is a menu or contains a menu
                const menu = node.querySelector ? node.querySelector('[role="menu"]') : null;
                if (menu || (node.getAttribute && node.getAttribute('role') === 'menu')) {
                    const targetMenu = menu || node;
                    injectMenuItem(targetMenu);
                }
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

function injectMenuItem(menu) {
    // Prevent duplicate injection
    if (menu.querySelector('.biblical-menu-item')) return;

    // Determine if it's Twitter or Substack based on classes or structure
    const isTwitter = menu.querySelector('[role="menuitem"]') && menu.innerHTML.includes('data-testid');
    const isSubstack = menu.classList.contains('pencraft') || menu.querySelector('.pencraft');

    if (isTwitter) {
        injectTwitterMenuItem(menu);
    } else if (isSubstack || menu.querySelector('button')) {
        // Substack menus are often just a list of buttons in a div
        injectSubstackMenuItem(menu);
    }
}

function injectTwitterMenuItem(menu) {
    const existingItem = menu.querySelector('[role="menuitem"]');
    if (!existingItem) return;

    const parentContainer = existingItem.parentNode;
    if (parentContainer.querySelector('.biblical-menu-item')) return;

    const menuItem = existingItem.cloneNode(true);
    menuItem.classList.add('biblical-menu-item');

    // Update Text
    const allSpans = menuItem.querySelectorAll('span');
    let textFound = false;
    for (const span of allSpans) {
        if (span.innerText && span.innerText.trim().length > 0) {
            span.innerText = 'Check if Biblical';
            textFound = true;
            break;
        }
    }

    if (!textFound) {
        const textDiv = menuItem.querySelector('div[dir="ltr"]');
        if (textDiv) textDiv.innerText = 'Check if Biblical';
    }

    // Update Icon
    const svg = menuItem.querySelector('svg');
    if (svg) {
        svg.innerHTML = '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>';
    }

    menuItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.style.display = 'none';
        const menuContainer = menu.closest('[role="group"]') || menu;
        if (menuContainer) menuContainer.style.display = 'none';

        if (currentPost) {
            const text = extractPostText(currentPost);
            showModal(text);
            chrome.runtime.sendMessage({
                action: "checkBiblical",
                text: text
            }, (response) => {
                updateModal(response);
            });
        }
    });

    parentContainer.insertBefore(menuItem, parentContainer.firstChild);
}

function injectSubstackMenuItem(menu) {
    // Substack menu items are usually <button> elements with 'pencraft' classes
    // We'll try to clone one
    const existingItem = menu.querySelector('button');
    if (!existingItem) return;

    const menuItem = existingItem.cloneNode(true);
    menuItem.classList.add('biblical-menu-item');

    // Remove any ID to avoid duplicates
    menuItem.removeAttribute('id');

    // Helper to recursively find and replace text
    function replaceText(node, newText) {
        if (node.nodeType === 3 && node.nodeValue.trim()) { // Text node
            node.nodeValue = newText;
            return true;
        }
        let replaced = false;
        for (let child of node.childNodes) {
            if (replaceText(child, newText)) {
                replaced = true;
                // Don't break immediately if we want to replace all text, 
                // but usually we just want the main label.
                // Let's stop after first match to avoid wiping icons if they are text-based (unlikely)
                return true;
            }
        }
        return replaced;
    }

    // Update Text
    const textReplaced = replaceText(menuItem, 'Check if Biblical');

    // Fallback if no text node found
    if (!textReplaced) {
        // Try to find a div/span and set innerText
        const textContainer = menuItem.querySelector('div') || menuItem.querySelector('span');
        if (textContainer) {
            textContainer.innerText = 'Check if Biblical';
        } else {
            menuItem.innerText = 'Check if Biblical';
        }
    }

    // Update Icon if present
    const svg = menuItem.querySelector('svg');
    if (svg) {
        // Use book icon
        svg.innerHTML = '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" fill="currentColor"/>';
        svg.setAttribute('viewBox', '0 0 24 24');
    }

    menuItem.addEventListener('click', (e) => {
        // Substack menus usually close on click
        const portal = menu.closest('[id^="headlessui-portal-root"]') || document.querySelector('[id^="headlessui-portal-root"]');
        if (portal) {
            // Try to find the backdrop or just hide the menu
            menu.style.display = 'none';
            // Ideally we trigger the native close, but hiding works for now
        } else {
            menu.style.display = 'none';
        }

        if (currentPost) {
            const text = extractPostText(currentPost);
            showModal(text);
            chrome.runtime.sendMessage({
                action: "checkBiblical",
                text: text
            }, (response) => {
                updateModal(response);
            });
        }
    });

    // Insert inside the container that holds the other items, before the first button
    existingItem.parentNode.insertBefore(menuItem, existingItem);
}

function extractPostText(postElement) {
    // Twitter
    const tweetTextNode = postElement.querySelector('[data-testid="tweetText"]');
    if (tweetTextNode) {
        return tweetTextNode.innerText;
    }

    // Substack
    // Substack posts/notes usually have a content div.
    // For Notes: class="feedItem-..." -> div.pencraft...
    // We can try to grab the main text content.
    // Look for the body of the post.
    const substackBody = postElement.querySelector('[class*="feedCommentBody"]') || postElement.querySelector('.post-preview-content') || postElement.querySelector('.pencraft.pc-display-flex.pc-flexDirection-column');

    if (substackBody) {
        return substackBody.innerText;
    }

    // Fallback
    return postElement.innerText;
}

// --- Modal Logic ---

function showModal(tweetText) {
    const overlay = document.createElement('div');
    overlay.className = 'biblical-modal-overlay';
    overlay.id = 'biblical-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'biblical-modal';

    let footerContent = '<span>Perplexity AI</span>';
    try {
        // Check for chrome.runtime.getURL support
        if (typeof chrome !== 'undefined' && chrome && chrome.runtime && chrome.runtime.getURL) {
            const logoUrl = chrome.runtime.getURL('assets/Perplexity_AI_logo.png');
            footerContent = '<img src="' + logoUrl + '" alt="Perplexity AI" style="height: 16px; vertical-align: middle;">';
        }
    } catch (e) {
        // Fallback already set
    }

    modal.innerHTML = [
        '<button class="biblical-close-btn">&times;</button>',
        '<h2>BiblicalOrNot</h2>',
        '<div class="biblical-tweet-preview">' + tweetText.substring(0, 100) + (tweetText.length > 100 ? '...' : '') + '</div>',
        '<div id="biblical-content" class="biblical-loading">',
        '  <div class="biblical-spinner"></div>',
        '  <p>Consulting the scriptures...</p>',
        '</div>',
        '<div class="biblical-footer">',
        '  <span style="margin-right: 5px;">Powered by</span>',
        '  ' + footerContent,
        '</div>'
    ].join('');

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector('.biblical-close-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function updateModal(response) {
    const contentDiv = document.getElementById('biblical-content');
    if (!contentDiv) return;

    if (response.error) {
        contentDiv.innerHTML = `<p style="color: red;">Error: ${response.error}</p>`;
        contentDiv.className = 'biblical-result';
    } else {
        const data = response.result;
        let text = data.content || "";
        const citations = data.citations || [];

        // 1. Linkify Perplexity Citations [1], [2], etc.
        // We replace [n] with <a href="citation_url" ...>[n]</a>
        text = text.replace(/\[(\d+)\]/g, (match, number) => {
            const index = parseInt(number) - 1;
            if (citations[index]) {
                return `<a href="${citations[index]}" target="_blank" class="biblical-citation">[${number}]</a>`;
            }
            return match;
        });

        // 2. Linkify Bible Verses
        // Regex to match "Book Chapter:Verse" patterns
        // e.g. John 3:16, 1 Corinthians 13:4-7, Gen 1:1
        // This is a basic regex and might need tuning.
        const bibleRegex = /\b((?:1|2|3|I|II|III)?\s*[A-Z][a-z]+)\s+(\d+):(\d+(?:-\d+)?)\b/g;

        text = text.replace(bibleRegex, (match, book, chapter, verse) => {
            // Construct Bible Gateway URL
            // search=Book+Chapter:Verse&version=NIV
            const searchQuery = `${book} ${chapter}:${verse}`;
            const encodedQuery = encodeURIComponent(searchQuery);
            const url = `https://www.biblegateway.com/passage/?search=${encodedQuery}&version=NIV`;
            return `<a href="${url}" target="_blank" class="biblical-verse-link">${match}</a>`;
        });

        // 3. Formatting
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/\n/g, '<br>');

        contentDiv.innerHTML = formattedText;
        contentDiv.className = 'biblical-result';
    }
}
