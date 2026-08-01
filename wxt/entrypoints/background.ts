export default defineBackground(() => {
  console.log('[Background] Service Worker started.');

  const WORKER_URL = "https://localhost:8787/api/check";

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CHECK_TEXT') {
      const claimText = message.payload;

      console.log('[Background] Received text from content script:', claimText);

      // Send the text to the worker for fact-checking
      fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: claimText }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('[Background] Received fact-check result from worker:', data);

        // Send the result back to the content script
        sendResponse({ success: true, result: data });
      })
      .catch(error => {
        console.error('[Background] Error while fetching fact-check result:', error);
        
        sendResponse({ success: false, error: error.toString()});
      });
      return true;
    }
    return false;
  });
  
});
