import { ref } from 'vue';
import { registerSW } from 'virtual:pwa-register';

export function useServiceWorker() {
  const updateAvailable = ref(false);
  const offlineReady = ref(false);
  const needRefresh = ref(false);

  // 注册Service Worker
  const { updateServiceWorker } = registerSW({
    onNeedRefresh() {
      needRefresh.value = true;
      updateAvailable.value = true;
    },
    onOfflineReady() {
      offlineReady.value = true;
    }
  });

  // 更新Service Worker
  const updateSW = () => {
    updateServiceWorker();
    needRefresh.value = false;
  };

  // 缓存当前播放的音频
  const cacheCurrentAudio = async (url: string) => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const cache = await caches.open('audio-cache');
      await cache.add(url);
      console.log('Audio cached for offline playback:', url);
    } catch (error) {
      console.error('Failed to cache audio:', error);
    }
  };

  // 清理旧的音频缓存
  const cleanupAudioCache = async (keepCount = 10) => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const cache = await caches.open('audio-cache');
      const keys = await cache.keys();

      if (keys.length > keepCount) {
        // 删除最旧的缓存
        const keysToDelete = keys.slice(0, keys.length - keepCount);
        for (const key of keysToDelete) {
          await cache.delete(key);
        }
        console.log(`Cleaned up ${keysToDelete.length} old audio cache entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup audio cache:', error);
    }
  };

  return {
    updateAvailable,
    offlineReady,
    needRefresh,
    updateSW,
    cacheCurrentAudio,
    cleanupAudioCache
  };
}