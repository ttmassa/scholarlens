import ReactDOM from 'react-dom/client'
import { HoverButton } from '@/components/HoverButton/HoverButton';
import { ResultsPanel, FactCheckStatus, FactCheckResult } from '@/components/ResultsPanel/ResultsPanel';

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

    // Helper functions
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
    };

    const getPreferredLanguage = async (): Promise<string> => {
      try {
        // Safe check for WXT storage auto-import or extension storage API
        if (typeof storage !== 'undefined' && storage?.getItem) {
          return (await storage.getItem<string>('local:preferredLanguage')) || 'English';
        }
      } catch (err) {
        console.warn('[ScholarLens] Failed to read language preference:', err);
      }
      return 'English';
    };

    const runFactCheck = async (text: string, lang?: string) => {
      // Render the results panel in loading state immediately so UI updates on click
      renderPanel(text, undefined, lang || 'English');

      const targetLanguage = lang || await getPreferredLanguage();

      // If language changed after resolving preference, refresh the header label
      if (!lang && targetLanguage !== 'English') {
        renderPanel(text, undefined, targetLanguage);
      }

      // Send the selected text to the background script for fact-checking
      browser.runtime.sendMessage({ type: 'CHECK_TEXT', payload: text, targetLanguage })
        .then((response) => {
          if (response.success) {
            renderPanel(text, response.result, targetLanguage);
          } else {
            renderPanel(text, {
              status: FactCheckStatus.Error,
              explanation: response.error || "An error occurred while checking the claim.",
            }, targetLanguage);
          }
        })
        .catch((error) => {
          renderPanel(text, {
            status: FactCheckStatus.Error,
            explanation: error?.message || error?.toString() || "An error occurred while communicating with the extension."
          }, targetLanguage);
        });
    };

    // Render the button and handle the fact-checking process
    const renderButton = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        removeButton();
        return;
      }

      const handleClick = () => {
        removeButton();
        removePanel();
        runFactCheck(text);
      };

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

    const renderPanel = (selectedText: string, result?: FactCheckResult, lang: string = "English") => {
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
      }

      const handleLanguageChange = async (newLang: string) => {
        try {
          if (typeof storage !== 'undefined' && storage?.setItem) {
            await storage.setItem('local:preferredLanguage', newLang);
          } else if (typeof browser !== 'undefined' && browser.storage?.local) {
            await browser.storage.local.set({ preferredLanguage: newLang });
          }
        } catch (err) {
          console.warn('[ScholarLens] Failed to save language preference:', err);
        }
        runFactCheck(selectedText, newLang);
      };

      // Default to loading state if no result is provided
      const resultToRender: FactCheckResult = result || {
        status: FactCheckStatus.Loading,
        explanation: "Analyzing claim..."
      };

      resultsPanelRoot?.render(
        <ResultsPanel selectedText={selectedText} result={resultToRender} currentLanguage={lang} onLanguageChange={handleLanguageChange} onClose={removePanel} />
      );
    };

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
        removePanel();
      }
    });

    document.addEventListener('scroll', () => {
      removeButton();
    }, { capture: true, passive: true });

    document.addEventListener('resize', () => {
      removeButton();
    }, { passive: true });
  },
});