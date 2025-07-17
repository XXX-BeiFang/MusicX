import { trackModel } from '@/stores/interface'
import { defaultSong } from "@/mock";
import { ElNotification } from "element-plus";
import { PlayMode } from "./interface";
import { urlV1, lyricNew } from "@/api";
import { parseAndMergeLyrics } from "@/utils/parsedLyrics";
interface AudioPlayer {
    isPlaying: Ref<boolean>
    currentTrack: ComputedRef<trackModel>
    currentTime: Ref<number>
    duration: Ref<number>
    volume: Ref<number>;
    currentLyricIndex: Ref<number>;
    playMode: Ref<PlayMode>;
    audioElement: Ref<HTMLAudioElement | null>
    play: () => void
    pause: () => void
    nextTrack: () => void
    prevTrack: () => void
    seek: (time: number) => void
    togglePlayPause: () => void;
    setVolume: (volume: number) => void;
    setPlayMode: (mode: PlayMode) => void;
    loadTrack: () => Promise<void>;
}

export const AudioPlayer = () => {
    const audioStore = AudioStore()
    const audioElement = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const volume = ref();
    const playMode = ref<PlayMode>('order'); // 默认为顺序播放

    // 当前播放的歌曲
    const currentTrack = computed<trackModel>(() => audioStore.trackList[audioStore.currentSongIndex] || defaultSong)
    const currentTime = ref(0)
    const duration = ref(0)

    // 用于追踪当前歌词索引
    const currentLyricIndex = ref(0)

    // 播放模式
    const modeLabels: Record<PlayMode, string> = {
        loop: '循环模式',
        order: '顺序播放',
        shuffle: '随机播放',
        single: '单曲循环'
    }

    currentTrack.value.lyrics?.lyrics

    // 检查网络状态
    const checkNetworkStatus = (): boolean => {
        if (!navigator.onLine) {
            ElNotification({
                title: '网络错误',
                message: '当前网络不可用，请检查网络连接',
                type: 'error',
            });
            return false;
        }
        return true;
    }

    // 尝试备用音频源
    const tryBackupAudioSource = async (): Promise<boolean> => {
        const trackIndex = audioStore.trackList.findIndex(
            (track: { id: any; }) => track.id === currentTrack.value.id
        );

        if (trackIndex === -1) return false;

        const track = audioStore.trackList[trackIndex];
        const backupUrls = track.backupUrls || [];

        if (backupUrls.length === 0) {
            console.log('没有备用音频源可用');
            return false;
        }

        // 尝试第一个备用URL
        const backupUrl = backupUrls[0];
        console.log('尝试备用音频源:', backupUrl);

        try {
            // 验证备用URL
            if (!backupUrl || (!backupUrl.startsWith('http') && !backupUrl.startsWith('//'))) {
                throw new Error('备用URL格式无效');
            }

            let finalUrl = backupUrl;
            if (finalUrl.startsWith('//')) {
                finalUrl = 'https:' + finalUrl;
            }

            // 更新音频源
            if (audioElement.value) {
                audioElement.value.src = finalUrl;
                audioElement.value.load();
            }

            // 更新trackList中的URL
            audioStore.trackList[trackIndex].url = finalUrl;
            // 移除已使用的备用URL
            audioStore.trackList[trackIndex].backupUrls = backupUrls.slice(1);

            return true;
        } catch (error) {
            console.error('备用音频源也失败:', error);
            // 移除失败的备用URL
            audioStore.trackList[trackIndex].backupUrls = backupUrls.slice(1);
            return false;
        }
    }

    // 检查音频格式支持
    const checkAudioSupport = (url: string): boolean => {
        if (!audioElement.value) return false;

        // 检查URL格式
        if (!url || (!url.startsWith('http') && !url.startsWith('//'))) {
            console.warn('无效的音频URL:', url);
            return false;
        }

        // 检查音频格式支持
        const audio = audioElement.value;

        // 尝试从URL中提取文件扩展名
        let extension = '';
        try {
            const urlObj = new URL(url.startsWith('//') ? 'https:' + url : url);
            const pathname = urlObj.pathname;
            extension = pathname.split('.').pop()?.toLowerCase() || '';
        } catch (e) {
            console.warn('无法解析URL:', url);
            return true; // 如果无法解析URL，仍然尝试播放
        }

        // 检查浏览器对音频格式的支持
        switch (extension) {
            case 'mp3':
                const mp3Support = audio.canPlayType('audio/mpeg');
                return mp3Support === 'probably' || mp3Support === 'maybe';
            case 'mp4':
            case 'm4a':
                const mp4Support = audio.canPlayType('audio/mp4');
                return mp4Support === 'probably' || mp4Support === 'maybe';
            case 'ogg':
                const oggSupport = audio.canPlayType('audio/ogg');
                return oggSupport === 'probably' || oggSupport === 'maybe';
            case 'wav':
                const wavSupport = audio.canPlayType('audio/wav');
                return wavSupport === 'probably' || wavSupport === 'maybe';
            case 'flac':
                const flacSupport = audio.canPlayType('audio/flac');
                return flacSupport === 'probably' || flacSupport === 'maybe';
            default:
                // 对于未知格式或没有扩展名的URL，仍然尝试播放
                console.log('未知的音频格式或无扩展名，尝试播放:', extension || 'no extension');
                return true;
        }
    }

    // 更新当前歌曲歌词索引
    const updateCurrentLyricIndex = (newTime: number = 0) => {
        if (!currentTrack.value.lyrics?.lines) return;

        // 找到当前时间对应的歌词行
        const lyrics = currentTrack.value.lyrics.lines;
        const targetIndex = lyrics.findIndex(
            (line: { time: number; }) => line.time > newTime * 1000
        )
        currentLyricIndex.value =
            targetIndex === -1 ? lyrics.length - 1 : targetIndex - 1
    }

    // 播放音乐
    const play = async (retryCount = 0) => {
        const maxRetries = 2;

        if (audioElement.value) {
            try {
                // 检查音频源是否有效
                if (!audioElement.value.src || audioElement.value.src === '') {
                    console.warn('音频源为空，尝试重新加载');
                    await loadTrack();
                }

                // 检查音频是否可以播放
                if (audioElement.value.readyState < 2) {
                    console.log('音频未准备好，等待加载...');
                    // 等待音频加载完成
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('音频加载超时'));
                        }, 15000); // 增加超时时间到15秒

                        const onCanPlay = () => {
                            clearTimeout(timeout);
                            audioElement.value?.removeEventListener('canplay', onCanPlay);
                            audioElement.value?.removeEventListener('error', onError);
                            resolve(void 0);
                        };

                        const onError = (e: Event) => {
                            clearTimeout(timeout);
                            audioElement.value?.removeEventListener('canplay', onCanPlay);
                            audioElement.value?.removeEventListener('error', onError);

                            const audio = e.target as HTMLAudioElement;
                            const error = audio.error;
                            let errorMessage = '音频加载失败';

                            if (error) {
                                switch (error.code) {
                                    case MediaError.MEDIA_ERR_NETWORK:
                                        errorMessage = '网络连接问题，请检查网络';
                                        break;
                                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                        errorMessage = '音频源不可用或格式不支持';
                                        break;
                                    default:
                                        errorMessage = '音频加载失败';
                                }
                            }

                            reject(new Error(errorMessage));
                        };

                        audioElement.value?.addEventListener('canplay', onCanPlay);
                        audioElement.value?.addEventListener('error', onError);
                    });
                }

                await audioElement.value.play()
                isPlaying.value = true
            } catch (error: any) {
                // 忽略 AbortError，这通常是由于快速切换歌曲导致的
                if (error.name === 'AbortError') {
                    return;
                }

                console.error('播放失败:', error);

                // 如果是音频源问题且还有重试次数，尝试备用源或重新获取
                if (retryCount < maxRetries &&
                    (error.message?.includes('音频源不可用') ||
                     error.message?.includes('音频加载失败') ||
                     error.message?.includes('音频加载超时'))) {

                    console.log(`播放失败，尝试恢复，重试次数: ${retryCount + 1}`);

                    // 首先尝试备用音频源
                    const backupSuccess = await tryBackupAudioSource();
                    if (backupSuccess) {
                        console.log('使用备用音频源重试播放');
                        await new Promise(resolve => setTimeout(resolve, 500));
                        return play(retryCount + 1);
                    }

                    // 如果没有备用源或备用源也失败，清除缓存重新获取
                    console.log('重新获取音频源');

                    // 清除当前音频源
                    if (audioElement.value) {
                        audioElement.value.src = '';
                        audioElement.value.load();
                    }

                    // 清除缓存的URL，强制重新获取
                    const trackIndex = audioStore.trackList.findIndex(
                        (track: { id: any; }) => track.id === currentTrack.value.id
                    );
                    if (trackIndex !== -1) {
                        audioStore.trackList[trackIndex].url = '';
                    }

                    // 等待一秒后重试
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return play(retryCount + 1);
                }

                // 显示错误通知
                ElNotification({
                    title: '播放失败',
                    message: error.message || '音频播放出现问题',
                    type: 'error',
                    duration: 4000
                });
            }
        } else {
            console.error('音频元素未初始化');
        }
    }
    // 跳转到指定时间
    const seek = (time: number) => {
        if (audioElement.value) {
            audioElement.value.currentTime = time
            currentTime.value = time
        }
    };
    // 暂停音乐
    const pause = () => {
        if (audioElement.value) {
            audioElement.value.pause()
            isPlaying.value = false
        }
    }


    // 播放下一首
    const nextTrack = async () => {
        switch (playMode.value) {
            case 'loop':
                if (audioStore.currentSongIndex < audioStore.trackList.length - 1) {
                    audioStore.currentSongIndex++
                } else {
                    audioStore.currentSongIndex = 0 // 从头开始
                }
                break;
            case 'shuffle':
                audioStore.currentSongIndex = Math.floor(Math.random() * audioStore.trackList.length);
                break;
            case 'single':
                audioElement.value!.currentTime = 0
                break;
            case 'order':
            default:
                if (audioStore.currentSongIndex < audioStore.trackList.length - 1) {
                    audioStore.currentSongIndex++
                } else {
                    audioStore.currentSongIndex = 0 // 从头开始
                }
                break;
        }
        await loadTrack()
        play()
    }

    // 播放上一首
    const prevTrack = async () => {
        switch (playMode.value) {
            case 'loop':
                if (audioStore.currentSongIndex > 0) {
                    audioStore.currentSongIndex--
                } else {
                    audioStore.currentSongIndex = audioStore.trackList.length - 1 // 从尾开始
                }
                break;
            case 'shuffle':
                audioStore.currentSongIndex = Math.floor(Math.random() * audioStore.trackList.length);
                break;
            case 'single':
                audioElement.value!.currentTime = 0
                break;
            case 'order':
            default:
                if (audioStore.currentSongIndex > 0) {
                    audioStore.currentSongIndex--
                } else {
                    audioStore.currentSongIndex = audioStore.trackList.length - 1 // 从尾开始
                }
                break;
        }
        await loadTrack()
        play()
    }


    // 加载当前歌曲
    const loadTrack = async () => {
        try {
            // 检查歌曲 URL
            await checkUrl()

            // 确保URL已获取
            if (!currentTrack.value.url) {
                throw new Error('无法获取音频播放链接');
            }

            // 检查音频格式支持
            if (!checkAudioSupport(currentTrack.value.url)) {
                throw new Error('浏览器不支持该音频格式');
            }

            // 歌词是否存在
            await checkLyrics()

            if (audioElement.value) {
                audioElement.value.src = currentTrack.value.url;
                audioElement.value.load();
            } else {
                throw new Error('音频元素未初始化');
            }
        } catch (error) {
            console.error('加载歌曲失败:', error);
            // 可以在这里显示用户友好的错误信息
            ElNotification({
                title: '播放失败',
                message: '无法加载音频文件，请尝试其他歌曲',
                type: 'error',
            });
            throw error;
        }
    };

    // 检查歌曲 URL
    const checkUrl = async () => {
        // 检查网络状态
        if (!checkNetworkStatus()) {
            throw new Error('网络不可用');
        }

        // 查看歌曲 URL 是否存在
        if (!currentTrack.value.url && currentTrack.value.id && currentTrack.value.id !== '') {
            try {
                // 如果 currentTrack 的 url 不存在，则获取 URL
                const response = await urlV1(currentTrack.value.id);

                // 尝试获取多个可用的URL，按音质排序
                const urls = response.data?.filter(item => item?.url && item.url !== '') || [];

                if (urls.length === 0) {
                    console.warn('未获取到有效的音频URL');
                    throw new Error('该歌曲暂时无法播放，可能是版权限制');
                }

                // 按音质排序，优先选择高音质
                urls.sort((a, b) => (b.br || 0) - (a.br || 0));

                // 选择第一个有效的URL，并保存备用URL
                let url = urls[0].url;
                const backupUrls = urls.slice(1).map(item => item.url).filter(u => u && u !== '');

                // 验证URL是否有效
                if (!url || (!url.startsWith('http') && !url.startsWith('//'))) {
                    console.warn('获取到的URL格式无效:', url);
                    throw new Error('音频链接格式无效');
                }

                // 如果URL以//开头，添加https协议
                if (url.startsWith('//')) {
                    url = 'https:' + url;
                }

                // 测试URL是否可访问
                try {
                    const testAudio = new Audio();
                    testAudio.preload = 'none';
                    testAudio.src = url;

                    // 简单的可访问性测试
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            testAudio.removeEventListener('loadstart', resolve);
                            testAudio.removeEventListener('error', reject);
                            resolve(void 0); // 超时不算错误，继续尝试
                        }, 3000);

                        testAudio.addEventListener('loadstart', () => {
                            clearTimeout(timeout);
                            resolve(void 0);
                        });

                        testAudio.addEventListener('error', () => {
                            clearTimeout(timeout);
                            reject(new Error('音频URL不可访问'));
                        });

                        testAudio.load();
                    });
                } catch (testError) {
                    console.warn('音频URL测试失败，但继续尝试:', testError);
                    // 不抛出错误，继续尝试播放
                }

                // 更新 trackList 中的对应歌曲的 url
                const trackIndex = audioStore.trackList.findIndex(
                    (track: { id: any; }) => track.id === currentTrack.value.id
                );
                if (trackIndex !== -1) {
                    audioStore.trackList[trackIndex].url = url; // 更新 URL
                    // 保存备用URL（如果有的话）
                    if (backupUrls.length > 0) {
                        audioStore.trackList[trackIndex].backupUrls = backupUrls;
                    }
                } else {
                    console.warn('未找到对应的歌曲索引');
                }
            } catch (error) {
                console.error('获取音频URL失败:', error);
                throw error; // 重新抛出错误，让调用者处理
            }
        } else if (!currentTrack.value.id) {
            console.warn('歌曲ID无效，无法获取音频URL');
            throw new Error('歌曲ID无效');
        }
        return Promise.resolve();
    }

    // 解析歌词数据
    const checkLyrics = async () => {
        // 查看歌词是否存在，并且歌曲ID有效
        if (!currentTrack.value.lyrics && currentTrack.value.id && currentTrack.value.id !== '') {
            try {
                // 如果 currentTrack 的 lyrics 不存在，则获取歌词
                const response = await lyricNew(currentTrack.value.id);

                // 更新 trackList 中的对应歌曲的歌词
                const trackIndex = audioStore.trackList.findIndex(
                    (track: { id: any; }) => track.id === currentTrack.value.id
                );

                if (trackIndex !== -1) {
                    // 添加响应数据验证
                    if (response && typeof response === 'object') {
                        const parsedLyrics = parseAndMergeLyrics(response);
                        audioStore.trackList[trackIndex].lyrics = parsedLyrics;
                    } else {
                        console.warn('歌词API返回数据格式异常:', response);
                        // 设置默认的空歌词数据
                        audioStore.trackList[trackIndex].lyrics = {
                            lines: [],
                            lyricUser: '',
                            transUser: '',
                            remark: '暂无歌词'
                        };
                    }
                }
            } catch (error) {
                console.error('获取歌词失败:', error);
                // 设置默认的空歌词数据
                const trackIndex = audioStore.trackList.findIndex(
                    (track: { id: any; }) => track.id === currentTrack.value.id
                );
                if (trackIndex !== -1) {
                    audioStore.trackList[trackIndex].lyrics = {
                        lines: [],
                        lyricUser: '',
                        transUser: '',
                        remark: '获取歌词失败'
                    };
                }
            }
        }
    }

    // 更新当前播放时间
    const updateTime = () => {
        if (audioElement.value) {
            currentTime.value = audioElement.value.currentTime
        }
    }

    // 更新总时长
    const onLoadedMetadata = () => {
        if (audioElement.value) {
            duration.value = audioElement.value.duration
        }
    }

    // 切换播放/暂停状态
    const togglePlayPause = () => {
        if (isPlaying.value) {
            pause();
        } else {
            play();
        }
    };

    // 设置音量
    const setVolume = (newVolume: number) => {
        if (audioElement.value) {
            volume.value = newVolume;
            audioStore.setAudioStore('volume', newVolume);
            audioElement.value.volume = newVolume / 100;
        }
    };

    // 设置播放模式
    const setPlayMode = (mode: PlayMode) => {
        playMode.value = mode;
        ElNotification({
            title: '播放模式',
            message: `已切换为 ${modeLabels[mode]}`, // 使用中文映射
            type: 'success',
        })
    };

    // 更新currentLyricIndex
    watch(currentTime, (newTime) => {
        updateCurrentLyricIndex(newTime)
    })

    // 组件挂载时初始化音频元素
    onMounted(async () => {
        // 创建音频元素，但不设置src
        audioElement.value = new Audio()
        volume.value = audioStore.volume || 50;
        audioElement.value.volume = volume.value / 100;

        // 添加事件监听器
        audioElement.value.addEventListener('timeupdate', updateTime)
        audioElement.value.addEventListener('ended', nextTrack)
        audioElement.value.addEventListener('loadedmetadata', onLoadedMetadata)

        // 添加错误处理
        audioElement.value.addEventListener('error', (e) => {
            const audio = e.target as HTMLAudioElement;
            const error = audio.error;
            let errorMessage = '音频加载失败';
            let shouldShowNotification = false;

            if (error) {
                switch (error.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMessage = '音频加载被中止';
                        shouldShowNotification = false; // 用户主动操作，不显示错误
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMessage = '网络连接问题，请检查网络后重试';
                        shouldShowNotification = true;
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMessage = '音频文件损坏或格式不支持';
                        shouldShowNotification = true;
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = '该歌曲暂时无法播放，可能是版权限制';
                        shouldShowNotification = true;
                        break;
                    default:
                        errorMessage = '音频播放出现问题';
                        shouldShowNotification = true;
                }
                console.error('音频错误详情:', {
                    code: error.code,
                    message: error.message,
                    src: audio.src,
                    currentTrack: currentTrack.value.title,
                    readyState: audio.readyState,
                    networkState: audio.networkState,
                    duration: audio.duration
                });
            } else {
                console.error('音频加载错误:', e);
                shouldShowNotification = true;
            }

            // 只在有音频源且需要显示通知时才显示错误通知
            if (audio.src && audio.src !== '' && shouldShowNotification) {
                ElNotification({
                    title: '播放失败',
                    message: errorMessage,
                    type: 'error',
                    duration: 4000
                });
            }
        });

        // 如果有当前歌曲且有ID，尝试获取歌词
        if (currentTrack.value.id && currentTrack.value.id !== '') {
            await checkLyrics()
        }
    })

    // 组件卸载时移除事件监听器
    onUnmounted(() => {
        if (audioElement.value) {
            audioElement.value.removeEventListener('timeupdate', updateTime)
            audioElement.value.removeEventListener('ended', nextTrack)
            audioElement.value.removeEventListener('loadedmetadata', onLoadedMetadata)
        }
    })



    const audioPlayer: AudioPlayer = {
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        volume,
        currentLyricIndex,
        playMode,
        audioElement,
        play,
        pause,
        nextTrack,
        prevTrack,
        seek,
        togglePlayPause,
        setVolume,
        setPlayMode,
        loadTrack
    };

    return audioPlayer;
};

export const useAudioPlayer = (): AudioPlayer => {
    const audioPlayer = inject<AudioPlayer>('audioPlayer')
    if (!audioPlayer) {
        throw new Error('useAudioPlayer must be used within a provider')
    }
    return audioPlayer
}