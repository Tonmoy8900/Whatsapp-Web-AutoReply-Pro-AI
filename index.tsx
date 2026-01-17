
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("AutoReply Pro AI: Successfully mounted.");
} catch (error) {
  console.error("AutoReply Pro AI: Mount failed", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Critical Load Error</h1>
      <p>The application failed to start. Check the console for more details.</p>
    </div>
  `;
}
