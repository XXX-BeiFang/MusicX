/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

declare const self: ServiceWorkerGlobalScope;

// 预缓存由Vite PWA插件自动注入的资源
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST);

// 缓存音频文件
registerRoute(
  ({ request }) => request.destination === 'audio',
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 50, // 最多缓存50个音频文件
        maxAgeSeconds: 7 * 24 * 60 * 60, // 缓存一周
      }),
    ],
  })
);

// 缓存图片
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100, // 最多缓存100张图片
        maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存一个月
      }),
    ],
  })
);

// 缓存API请求
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 1 * 60 * 60, // 缓存一小时
      }),
    ],
  })
);

// 缓存字体文件
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存一年
      }),
    ],
  })
);

// 添加自定义离线页面
self.addEventListener('install', (event) => {
  const offlinePage = new Request('/offline.html');
  event.waitUntil(
    fetch(offlinePage).then((response) => {
      return caches.open('offline-cache').then((cache) => {
        return cache.put(offlinePage, response);
      });
    })
  );
});

// 处理导航请求的离线回退
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.open('offline-cache').then((cache) => {
          return cache.match('/offline.html').then(response => {
            return response || new Response('离线模式 - 无法连接到服务器', {
              status: 503,
              headers: { 'Content-Type': 'text/html' }
            });
          });
        });
      })
    );
  }
});

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 自定义缓存音频文件的函数
export const cacheAudio = async (url: string) => {
  const cache = await caches.open('audio-cache');
  await cache.add(url);
};