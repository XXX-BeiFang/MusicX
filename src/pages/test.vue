<template>
  <div class="test-page">
    <h1>音频可视化测试</h1>

    <div class="audio-controls">
      <audio ref="audioRef" controls>
        <source src="https://music.163.com/song/media/outer/url?id=1901371647.mp3" type="audio/mpeg">
        您的浏览器不支持音频元素。
      </audio>

      <div class="buttons">
        <button @click="play">播放</button>
        <button @click="pause">暂停</button>
      </div>
    </div>

    <div class="visualizer-container">
      <h2>频谱可视化</h2>
      <div class="visualizer">
        <AudioVisualizer type="spectrum" color="#1DB954" :height="100" />
      </div>

      <h2>波形可视化</h2>
      <div class="visualizer">
        <AudioVisualizer type="waveform" color="#1DB954" :height="100" />
      </div>

      <h2>圆形可视化</h2>
      <div class="visualizer">
        <AudioVisualizer type="circular" color="#1DB954" :height="200" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import * as AudioVisualizerModule from '../components/AudioVisualizer.vue';
const AudioVisualizer = AudioVisualizerModule.default || AudioVisualizerModule;

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);

const play = () => {
  if (audioRef.value) {
    audioRef.value.play();
    isPlaying.value = true;
  }
};

const pause = () => {
  if (audioRef.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  }
};

// 提供音频元素给子组件
provide('audioPlayer', {
  audioElement: audioRef,
  isPlaying
});

onMounted(() => {
  // 确保音频元素可以被其他组件访问
  if (audioRef.value) {
    console.log('Audio element initialized in test page');
    // 添加全局引用，使AudioVisualizer可以访问
    (window as any).audioElement = audioRef.value;
  }
});
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1, h2 {
  margin-bottom: 20px;
}

.audio-controls {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #18a64a;
}

.visualizer-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.visualizer {
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.visualizer:last-child {
  height: 200px;
}
</style>