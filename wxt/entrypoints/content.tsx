import ReactDOM from 'react-dom/client'
import { HoverButton } from '@/components/HoverButton/HoverButton';
import './style.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'manifest',
  main() {
    let container: HTMLDivElement | null = null;
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

    const removeButton = () => {
      // Unmount React component
      root?.unmount();
      root = null;
      // Remove the container from the DOM
      container?.remove();
      container = null;
    };
    
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || selection?.isCollapsed) {
        removeButton();
        return;
      }

      const handleClick = () => {
        console.log('[ContentScript] Sending text:', text);
        browser.runtime.sendMessage({ type: 'CHECK_TEXT', payload: text });
        removeButton();
      }

      const range = selection!.getRangeAt(0);
      // Get all bounding rectangles across wrapped lines
      const rects = range.getClientRects();
      // Fallback to boundingClientRect if getClientRects is empty
      const targetRect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();

      if (!container) {
        // Create a new container for the React component
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.zIndex = '9999';
        document.body.appendChild(container);

        // Render the React component into the container
        root = ReactDOM.createRoot(container);
        root.render(
          <HoverButton onClick={handleClick}/>
        )
      }

      // Position above the start of the first highlighted line
      container.style.top = `${Math.max(0, targetRect.top + window.scrollY - 36)}px`;
      container.style.left = `${targetRect.left + window.scrollX}px`;
    };

    // Event listeners to handle text selection and button removal
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