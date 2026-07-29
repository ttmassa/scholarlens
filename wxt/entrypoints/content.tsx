import ReactDOM from 'react-dom/client'
import { HoverButton } from '@/components/HoverButton/HoverButton';
import { ResultsPanel, FactCheckStatus, FactCheckVerdict, FactCheckResult } from '@/components/ResultsPanel/ResultsPanel';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'manifest',
  main() {
    // Button
    let buttonContainer: HTMLDivElement | null = null;
    let buttonRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;

    // Panel
    let resultsPanelContainer: HTMLDivElement | null = null;
    let resultsPanelRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;

    const removeButton = () => {
      // Unmount React component
      buttonRoot?.unmount();
      buttonRoot = null;
      // Remove the container from the DOM
      buttonContainer?.remove();
      buttonContainer = null;
    };

    const removePanel = () => {
      // Unmount React component
      resultsPanelRoot?.unmount();
      resultsPanelRoot = null;
      // Remove the container from the DOM
      resultsPanelContainer?.remove();
      resultsPanelContainer = null;
    }
    
    const renderButton = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || selection?.isCollapsed) {
        removeButton();
        return;
      }

      const handleClick = () => {
        removeButton();
        renderPanel(text)
        // console.log('[ContentScript] Sending text:', text);
        // browser.runtime.sendMessage({ type: 'CHECK_TEXT', payload: text });
        // removeButton();
      }

      const range = selection!.getRangeAt(0);
      // Get all bounding rectangles across wrapped lines
      const rects = range.getClientRects();
      // Fallback to boundingClientRect if getClientRects is empty
      const targetRect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();

      if (!buttonContainer) {
        // Create a new container for the React component
        buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.zIndex = '9999';
        document.body.appendChild(buttonContainer);

        // Render the React component into the container
        buttonRoot = ReactDOM.createRoot(buttonContainer);
        buttonRoot.render(
          <HoverButton onClick={handleClick}/>
        )
      }

      // Position above the start of the first highlighted line
      buttonContainer.style.top = `${Math.max(0, targetRect.top + window.scrollY - 36)}px`;
      buttonContainer.style.left = `${targetRect.left + window.scrollX}px`;
    };

    const renderPanel = (selectedText: string) => {
      if (!resultsPanelContainer) {
        // Create a container for the React component
        resultsPanelContainer = document.createElement('div');
        resultsPanelContainer.style.position = 'fixed';
        resultsPanelContainer.style.top = '20px';
        resultsPanelContainer.style.right = '20px';
        resultsPanelContainer.style.zIndex = '99999';
        document.body.appendChild(resultsPanelContainer);

        // Render the React component into the container
        resultsPanelRoot = ReactDOM.createRoot(resultsPanelContainer);
        // Render mock data for now
        let mockResult: FactCheckResult = {
          status: FactCheckStatus.Success,
          verdict: FactCheckVerdict.Misleading,
          score: 100,
          explanation: "This statement is misleading because it omits important context.",
          sources: ["https://example.com/source1", "https://example.com/source2"]
        }

        resultsPanelRoot.render(
          <ResultsPanel selectedText={selectedText} result={mockResult}/>
        )
      }
    }

    // Event listeners to handle text selection and button removal
    document.addEventListener('mouseup', () => {
      renderButton();
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') {
        renderButton();
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