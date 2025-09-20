// Polyfills for browser compatibility and to prevent hanging

// Add timeout to fetch requests to prevent hanging
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  const timeout = options.timeout || 10000; // 10 second default timeout
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return originalFetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Add timeout to WebSocket connections
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
  const ws = new originalWebSocket(url, protocols);
  
  // Set timeout for connection
  const timeout = setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }, 5000);
  
  const originalOnOpen = ws.onopen;
  ws.onopen = function(event) {
    clearTimeout(timeout);
    if (originalOnOpen) originalOnOpen.call(this, event);
  };
  
  const originalOnError = ws.onerror;
  ws.onerror = function(event) {
    clearTimeout(timeout);
    if (originalOnError) originalOnError.call(this, event);
  };
  
  return ws;
};

// Prevent infinite loops in React components
let renderCount = 0;
const maxRenders = 50;

const originalSetState = React?.Component?.prototype?.setState;
if (originalSetState) {
  React.Component.prototype.setState = function(state, callback) {
    renderCount++;
    if (renderCount > maxRenders) {
      console.warn('Potential infinite render loop detected, throttling setState');
      return;
    }
    
    // Reset counter after a delay
    setTimeout(() => {
      renderCount = 0;
    }, 1000);
    
    return originalSetState.call(this, state, callback);
  };
}

// Add error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.warn('Unhandled promise rejection:', event.reason);
  // Prevent the default behavior (which would log to console)
  event.preventDefault();
});