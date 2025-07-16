const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');

// 生成PWA图标
console.log('正在生成PWA图标...');
execSync('node scripts/generate-pwa-icons.js', { stdio: 'inherit', cwd: rootDir });

// 启动开发服务器，启用PWA
console.log('正在启动开发服务器，已启用PWA功能...');
execSync('vite --force', { stdio: 'inherit', cwd: rootDir });