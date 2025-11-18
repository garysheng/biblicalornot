let currentTweet = null;

// 1. Track which tweet's menu was clicked
document.addEventListener('click', (e) => {
    const caret = e.target.closest('[data-testid="caret"]');
    if (caret) {
        currentTweet = caret.closest('article');
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
    // 1. Find an existing menu item to use as a template
    // Twitter menu items usually have role="menuitem"
    const existingItem = menu.querySelector('[role="menuitem"]');

    if (!existingItem) return;

    // Check if we already injected
    const parentContainer = existingItem.parentNode;
    if (parentContainer.querySelector('.biblical-menu-item')) return;

    // 2. Clone the item
    const menuItem = existingItem.cloneNode(true);
    menuItem.classList.add('biblical-menu-item');

    // 3. Update Text
    // Walk through to find the text node. It's usually in a span.
    // We'll look for the span that holds the text of the existing item.
    const originalText = existingItem.innerText;

    // Helper to find the text node/element
    function replaceText(node, oldText, newText) {
        if (node.nodeType === 3) { // Text node
            if (node.nodeValue.trim().length > 0) {
                node.nodeValue = newText;
                return true;
            }
        }
        if (node.nodeType === 1) { // Element
            // If this element is the one containing the text
            if (node.innerText === oldText) {
                // If it's a leaf-ish node (no big structure), just replace text
                // But safer to go deeper if possible. 
                // Let's just try to find the specific span Twitter uses.
                // Twitter usually puts text in a span with specific classes.
                // Let's try a recursive search for the text node.
            }

            for (let child of node.childNodes) {
                if (replaceText(child, oldText, newText)) return true;
            }
        }
        return false;
    }

    // Simple approach: Find the span that contains the visible text
    const allSpans = menuItem.querySelectorAll('span');
    let textFound = false;
    for (const span of allSpans) {
        if (span.innerText && span.innerText.trim().length > 0) {
            span.innerText = 'Check if Biblical';
            textFound = true;
            break; // Assume the first text span is the label
        }
    }

    // Fallback if no span found (unlikely)
    if (!textFound) {
        const textDiv = menuItem.querySelector('div[dir="ltr"]');
        if (textDiv) textDiv.innerText = 'Check if Biblical';
    }

    // 4. Update Icon
    const svg = menuItem.querySelector('svg');
    if (svg) {
        // Use a simple book icon
        svg.innerHTML = '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>';
        // Ensure color matches (usually inherited, but sometimes set on path)
        const path = svg.querySelector('path');
        if (path) {
            // Remove specific color classes if any, or let it inherit
            // Twitter usually uses 'currentcolor' or specific classes on the SVG
        }
    }

    // 5. Add Click Listener
    menuItem.addEventListener('click', (e) => {
        // Close menu (simulated by clicking background or just hiding)
        // Best to let the event bubble if possible, but we need to trigger our action
        e.preventDefault();
        e.stopPropagation();

        // Hide menu manually since we intercepted the click
        menu.style.display = 'none';
        // Or try to find the close button/overlay. 
        // Actually, just hiding the menu container usually works for the user experience.
        const menuContainer = menu.closest('[role="group"]') || menu;
        if (menuContainer) menuContainer.style.display = 'none';

        if (currentTweet) {
            const text = extractTweetText(currentTweet);
            showModal(text);
            chrome.runtime.sendMessage({
                action: "checkBiblical",
                text: text
            }, (response) => {
                updateModal(response);
            });
        }
    });

    // 6. Insert
    // Insert as the first item for visibility
    parentContainer.insertBefore(menuItem, parentContainer.firstChild);
}

function extractTweetText(tweetElement) {
    const textNode = tweetElement.querySelector('[data-testid="tweetText"]');
    if (textNode) {
        return textNode.innerText;
    }
    return tweetElement.innerText;
}

// --- Modal Logic (Same as before) ---

function showModal(tweetText) {
    const overlay = document.createElement('div');
    overlay.className = 'biblical-modal-overlay';
    overlay.id = 'biblical-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'biblical-modal';

    modal.innerHTML = `
    <button class="biblical-close-btn">&times;</button>
    <h2>Biblical Check</h2>
    <div class="biblical-tweet-preview">${tweetText.substring(0, 100)}${tweetText.length > 100 ? '...' : ''}</div>
    <div id="biblical-content" class="biblical-loading">
      <div class="biblical-spinner"></div>
      <p>Consulting the scriptures...</p>
    </div>
  `;

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
        let formattedText = response.result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        contentDiv.innerHTML = formattedText;
        contentDiv.className = 'biblical-result';
    }
}
