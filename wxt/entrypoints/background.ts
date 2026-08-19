export default defineBackground(() => {
  console.log('[Background] Service Worker started.');

  const WORKER_URL = "http://localhost:8787/api/check";

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CHECK_TEXT') {
      const { payload: claimText, targetLanguage } = message;

      // Fast path check for local offline status
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        sendResponse({ success: false, error: "You are currently offline. Please check your internet connection and try again." });
        return true;
      }

      console.log('[Background] Received text from content script:', claimText);

      // Send the text to the worker for fact-checking
      fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: claimText, language: targetLanguage }),
      })
      // Handle the response from the worker
      .then(async (response) => {
        const data = await response.json();
        console.log('[Background] Received response from worker:', data);
        
        // Handle specific error codes here
        if (!response.ok) {
          sendResponse({ success: false, error: data.error });
          return;
        }

        // Send the result back to the content script
        sendResponse({ success: true, result: data });
      })
      .catch(error => {
        console.error('[Background] Error while fetching fact-check result:', error);
        
        sendResponse({ success: false, error: error.toString()});
      });
      return true;
    }

    if (message.type === 'OPEN_EXPORT_PREVIEW') {
      const content = message?.payload?.content;

      if (typeof content !== 'string' || !content.trim()) {
        sendResponse({ success: false, error: 'Export content is empty.' });
        return false;
      }

      const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

      browser.tabs.create({ url: dataUrl })
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error('[Background] Failed to open export preview tab:', error);
          sendResponse({ success: false, error: error?.toString?.() || 'Failed to open preview tab.' });
        });

      return true;
    }

    return false;
  });
  
});