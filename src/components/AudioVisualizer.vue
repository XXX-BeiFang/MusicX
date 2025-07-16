<template>
  <div class="audio-visualizer" ref="visualizerContainer">
    <canvas ref="visualizerCanvas" :class="{ active: isPlaying }"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, inject } from 'vue';
import { AudioStore } from '../stores/modules/audio';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'AudioVisualizer'
});

const props = defineProps({
  type: {
    type: String,
    default: 'spectrum', // 'spectrum', 'waveform', 'circular'
    validator: (value: string) => ['spectrum', 'waveform', 'circular'].includes(value)
  },
  color: {
    type: String,
    default: '#1DB954' // Spotify green as default
  },
  height: {
    type: Number,
    default: 100
  },
  width: {
    type: Number,
    default: 300
  },
  barWidth: {
    type: Number,
    default: 2
  },
  barSpacing: {
    type: Number,
    default: 1
  },
  sensitivity: {
    type: Number,
    default: 1.5
  }
});

const audioStore = AudioStore();
const { isPlaying } = storeToRefs(audioStore);

// 尝试从全局提供的audioPlayer中获取音频元素
const audioPlayer: any = inject('audioPlayer');
const audioElement = ref<HTMLAudioElement | null>(null);

// 获取全局注入的音频元素
onMounted(() => {
  try {
    // 首先尝试从audioPlayer中获取
    if (audioPlayer && audioPlayer.audioElement && audioPlayer.audioElement.value) {
      audioElement.value = audioPlayer.audioElement.value;
      console.log('Got audio element from audioPlayer');
    }

    // 如果没有获取到，尝试从DOM中获取
    if (!audioElement.value) {
      audioElement.value = document.querySelector('audio');
      console.log('Got audio element from DOM');
    }

    // 如果仍然没有获取到，创建一个新的Audio元素
    if (!audioElement.value) {
      console.warn('No audio element found, creating a new one');
      audioElement.value = new Audio();
    }
  } catch (error) {
    console.error('Error getting audio element:', error);
  }
});

const visualizerContainer = ref<HTMLDivElement | null>(null);
const visualizerCanvas = ref<HTMLCanvasElement | null>(null);
let canvasContext: CanvasRenderingContext2D | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let source: MediaElementAudioSourceNode | null = null;
let animationFrameId: number | null = null;
let initialized = false;

// Computed values for responsive sizing
const canvasWidth = computed(() => {
  const width = props.width || (visualizerContainer.value ? visualizerContainer.value.clientWidth : 300);
  return width;
});

const canvasHeight = computed(() => props.height || 100);

// Initialize the audio analyzer
const initAnalyzer = () => {
  if (!audioElement.value) {
    console.warn('Cannot initialize analyzer: audio element is null');
    return;
  }

  if (initialized) {
    console.log('Analyzer already initialized');
    return;
  }

  try {
    console.log('Initializing audio analyzer');
    // Create audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create analyzer node
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    // Connect audio element to analyzer
    source = audioContext.createMediaElementSource(audioElement.value);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Create data array for analyzer
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    initialized = true;

    // Start visualization
    startVisualization();
    console.log('Audio analyzer initialized successfully');
  } catch (error) {
    console.error('Error initializing audio analyzer:', error);
  }
};

// Start the visualization loop
const startVisualization = () => {
  if (!canvasContext || !analyser || !dataArray) {
    console.warn('Cannot start visualization: missing context, analyser or dataArray');
    return;
  }

  console.log('Starting visualization');

  const draw = () => {
    if (!canvasContext || !analyser || !dataArray) return;

    animationFrameId = requestAnimationFrame(draw);

    try {
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      if (canvasWidth.value && canvasHeight.value) {
        canvasContext.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
      }

      // Draw visualization based on type
      switch (props.type) {
        case 'spectrum':
          drawSpectrum();
          break;
        case 'waveform':
          drawWaveform();
          break;
        case 'circular':
          drawCircular();
          break;
        default:
          drawSpectrum();
      }
    } catch (error) {
      console.error('Error in visualization loop:', error);
      cancelAnimationFrame(animationFrameId as number);
    }
  };

  draw();
};

// Draw spectrum visualization
const drawSpectrum = () => {
  if (!canvasContext || !dataArray || !canvasWidth.value || !canvasHeight.value) return;

  const barCount = dataArray.length;
  const barWidth = (canvasWidth.value / barCount) * 2;
  const barSpacing = props.barSpacing;

  canvasContext.fillStyle = props.color;

  for (let i = 0; i < barCount; i++) {
    const barHeight = (dataArray[i] / 255) * canvasHeight.value * props.sensitivity;
    const x = i * (barWidth + barSpacing);
    const y = canvasHeight.value - barHeight;

    canvasContext.fillRect(x, y, barWidth, barHeight);
  }
};

// Draw waveform visualization
const drawWaveform = () => {
  if (!canvasContext || !analyser || !dataArray || !canvasWidth.value || !canvasHeight.value) return;

  analyser.getByteTimeDomainData(dataArray);

  canvasContext.lineWidth = 2;
  canvasContext.strokeStyle = props.color;
  canvasContext.beginPath();

  const sliceWidth = canvasWidth.value / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvasHeight.value / 2;

    if (i === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasContext.lineTo(canvasWidth.value, canvasHeight.value / 2);
  canvasContext.stroke();
};

// Draw circular visualization
const drawCircular = () => {
  if (!canvasContext || !dataArray || !canvasWidth.value || !canvasHeight.value) return;

  const centerX = canvasWidth.value / 2;
  const centerY = canvasHeight.value / 2;
  const radius = Math.min(centerX, centerY) - 10;

  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius / 4, 0, 2 * Math.PI);
  canvasContext.fillStyle = props.color;
  canvasContext.fill();

  for (let i = 0; i < dataArray.length; i++) {
    const amplitude = dataArray[i] / 255;
    const barHeight = radius * amplitude * props.sensitivity;
    const angle = (i * 2 * Math.PI) / dataArray.length;

    const x1 = centerX + (radius / 2) * Math.cos(angle);
    const y1 = centerY + (radius / 2) * Math.sin(angle);
    const x2 = centerX + (radius / 2 + barHeight) * Math.cos(angle);
    const y2 = centerY + (radius / 2 + barHeight) * Math.sin(angle);

    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.lineWidth = props.barWidth;
    canvasContext.strokeStyle = props.color;
    canvasContext.stroke();
  }
};

// Clean up resources
const cleanupVisualizer = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (source && audioContext) {
    try {
      source.disconnect();
      if (analyser) {
        analyser.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting audio nodes:', error);
    }
  }
};

// Setup canvas
const setupCanvas = () => {
  if (!visualizerCanvas.value) return;

  try {
    if (canvasWidth.value && canvasHeight.value) {
      visualizerCanvas.value.width = canvasWidth.value;
      visualizerCanvas.value.height = canvasHeight.value;
      canvasContext = visualizerCanvas.value.getContext('2d');
      console.log('Canvas setup complete');
    }
  } catch (error) {
    console.error('Error setting up canvas:', error);
  }
};

// Watch for audio element changes
watch(() => audioElement.value, (newAudioElement) => {
  console.log('Audio element changed:', newAudioElement ? 'exists' : 'null');
  if (newAudioElement) {
    cleanupVisualizer();
    setupCanvas();
    initAnalyzer();
  }
}, { immediate: true });

// Watch for playing state changes
// 在使用 isPlaying.value 之前添加检查
watch(() => isPlaying?.value, (newIsPlaying) => {
  console.log('Playing state changed:', newIsPlaying);
  if (newIsPlaying && audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
});

// Handle window resize
const handleResize = () => {
  if (visualizerCanvas.value && visualizerContainer.value && canvasHeight.value) {
    visualizerCanvas.value.width = visualizerContainer.value.clientWidth;
    visualizerCanvas.value.height = canvasHeight.value;
  }
};

onMounted(() => {
  console.log('AudioVisualizer component mounted');
  setupCanvas();
  if (audioElement.value) {
    initAnalyzer();
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  console.log('AudioVisualizer component unmounted');
  cleanupVisualizer();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.audio-visualizer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.audio-visualizer canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.audio-visualizer canvas.active {
  opacity: 1;
}
</style>