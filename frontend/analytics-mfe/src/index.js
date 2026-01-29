import React from 'react';
import { createRoot } from 'react-dom/client';
import Analytics from './Analytics';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Analytics />
  </React.StrictMode>
);
