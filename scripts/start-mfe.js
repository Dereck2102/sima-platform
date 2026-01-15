#!/usr/bin/env node
/**
 * SIMA Microfrontends - Start All Script
 * Starts all 4 microfrontends in parallel
 * 
 * Usage: node scripts/start-mfe.js
 * Or: pnpm mfe:start
 */

const { spawn } = require('child_process');
const path = require('path');

const apps = [
  { name: 'assets-mfe', port: 4101, color: '\x1b[32m' },     // Green
  { name: 'dashboard-mfe', port: 4102, color: '\x1b[34m' },  // Blue
  { name: 'users-mfe', port: 4103, color: '\x1b[35m' },      // Magenta
  { name: 'shell-app', port: 4100, color: '\x1b[36m' },      // Cyan
];

console.log('\n\x1b[1m\x1b[33m🚀 Starting SIMA Microfrontends...\x1b[0m\n');

apps.forEach((app) => {
  const cwd = path.join(__dirname, '..', 'apps', app.name);
  
  console.log(`${app.color}Starting ${app.name} on port ${app.port}...\x1b[0m`);
  
  const process = spawn('pnpm', ['serve'], {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  process.stdout.on('data', (data) => {
    console.log(`${app.color}[${app.name}]\x1b[0m ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`${app.color}[${app.name}]\x1b[0m \x1b[31m${data.toString().trim()}\x1b[0m`);
  });

  process.on('close', (code) => {
    console.log(`${app.color}[${app.name}]\x1b[0m Process exited with code ${code}`);
  });
});

console.log('\n\x1b[33mWaiting for builds to complete...\x1b[0m');
console.log('\x1b[33mOnce ready, access:\x1b[0m');
console.log('  \x1b[36m→ Shell App: http://localhost:4100\x1b[0m');
console.log('  \x1b[32m→ Assets:    http://localhost:4101\x1b[0m');
console.log('  \x1b[34m→ Dashboard: http://localhost:4102\x1b[0m');
console.log('  \x1b[35m→ Users:     http://localhost:4103\x1b[0m\n');
