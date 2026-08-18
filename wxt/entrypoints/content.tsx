import ReactDOM from 'react-dom/client'
import { HoverButton } from '@/components/HoverButton/HoverButton';
import { ResultsPanel, FactCheckStatus, FactCheckResult } from '@/components/ResultsPanel/ResultsPanel';
import { storage } from 'wxt/utils/storage';

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
        const storedLang = await storage.getItem<string>('local:preferredLanguage');
        return storedLang || 'English';
      } catch (err) {
        console.warn('[ScholarLens] Failed to read language preference:', err);
      }
      return 'English';
    };

    // Fact-checking process
    const runFactCheck = async (text: string, lang?: string) => {
      const targetLanguage = lang || await getPreferredLanguage();

      // Render the results panel in loading state immediately so UI updates on click
      renderPanel(text, undefined, targetLanguage);

      // Send the selected text to the background script for fact-checking
      browser.runtime.sendMessage({ type: 'CHECK_TEXT', payload: text, targetLanguage })
        .then((response) => {
          // Render the panel with the result if the response is successful
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

    const renderButton = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        removeButton();
        return;
      }

      // Run the fact-checking process when the button is clicked
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

      // Store the user's preferred language in local storage when they change it
      const handleLanguageChange = async (newLang: string) => {
        if (newLang === lang) return;

        try {
          await storage.setItem('local:preferredLanguage', newLang);
        } catch (err) {
          console.warn('[ScholarLens] Failed to save language preference:', err);
        }
        // Re-run the fact-checking process to update the results in the new language
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