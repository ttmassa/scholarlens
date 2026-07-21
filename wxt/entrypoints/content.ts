import './style.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'manifest',
  main() {
    let button: HTMLButtonElement | null = null;

    const removeButton = () => {
      button?.remove();
      button = null;
    };

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || selection?.isCollapsed) {
        removeButton();
        return;
      }

      const range = selection!.getRangeAt(0);
      // Get all bounding rectangles across wrapped lines
      const rects = range.getClientRects();
      // Fallback to boundingClientRect if getClientRects is empty
      const targetRect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();

      if (!button) {
        button = document.createElement('button');
        button.className = 'factcheck-btn';
        button.innerText = 'Fact Check';

        button.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('[ContentScript] Sending text:', text);

          browser.runtime.sendMessage({ type: 'CHECK_TEXT', payload: text });
          removeButton();
        });

        document.body.appendChild(button);
      }

      // Position precisely above the start of the first highlighted line
      button.style.top = `${Math.max(0, targetRect.top + window.scrollY - 36)}px`;
      button.style.left = `${targetRect.left + window.scrollX}px`;
    };

    document.addEventListener('mouseup', () => {
      handleSelection();
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') {
        handleSelection();
      }
    });

    document.addEventListener('selectionchange', () => {
      if (window.getSelection()?.isCollapsed) {
        removeButton();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        removeButton();
      }
    });

    document.addEventListener('scroll', () => {
      removeButton();
    }, { capture: true, passive: true });
  },
});