export default defineBackground(() => {
  console.log('[Background] Service Worker started.');

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'CHECK_TEXT') {
      console.log('[Background] Received text from content script:', message.payload);
    }
  });
  
});
