const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 源图标路径
const sourceIcon = path.resolve(__dirname, '../public/logo.png');

// 目标尺寸和文件名
const icons = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' }
];

// 确保public目录存在
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 生成不同尺寸的图标
async function generateIcons() {
  try {
    // 检查源图标是否存在
    if (!fs.existsSync(sourceIcon)) {
      console.error('源图标文件不存在:', sourceIcon);
      return;
    }

    console.log('开始生成PWA图标...');

    // 读取源图标
    const sourceBuffer = fs.readFileSync(sourceIcon);

    // 生成不同尺寸的图标
    for (const icon of icons) {
      const targetPath = path.resolve(publicDir, icon.name);

      await sharp(sourceBuffer)
        .resize(icon.size, icon.size)
        .toFile(targetPath);

      console.log(`生成图标: ${icon.name} (${icon.size}x${icon.size})`);
    }

    console.log('所有PWA图标生成完成!');
  } catch (error) {
    console.error('生成图标时出错:', error);
  }
}

// 执行生成
generateIcons();