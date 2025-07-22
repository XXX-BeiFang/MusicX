import { LyricData } from "@/utils/parsedLyrics";
/* UserState */
export interface UserState {
    userInfo: Partial<userModel> // 用户信息
    isLoggedIn: boolean // 是否登录
}
// user
export interface userModel {
    avatarUrl: string // 头像
    nickname: string // 昵称
    userId: number // 用户id
}

/* AudioState*/
export interface AudioState {
    trackList: trackModel[] // 歌曲缓存
    currentSongIndex: number // 当前播放歌曲索引
    volume: number // 音量
    quality: string // 音质
}
export interface trackModel {
    id: string; // 歌曲id
    title: string; // 歌曲名
    artist: string; // 艺术家
    album: string; // 专辑
    cover: string; // 封面
    url: string; // 音频地址
    duration: number; // 时长
    lyrics?: LyricData; // 歌词
    mv?: number | null; // MV ID（可选）
    source?: string; // 播放来源（可选）
}

/* MenuState */
export interface MenuState {
    menuIndex: string // 当前菜单索引
}

/* SettingState */
export interface SettingState {
    isDrawerCover: boolean // 是否覆盖抽屉
    isOriginalParsed: boolean // 是否解析原文
    isRomaParsed: boolean // 是否解析罗马音
    isTranslatedParsed: boolean // 是否解析翻译
    language: string | null // 当前系统语言
    themeColor: string // 主题颜色
    themeColorName: string // 主题颜色名称
    isDarkMode: boolean // 是否为深色模式
    wallpaper: string | null // 壁纸图片路径
    wallpaperType: 'preset' | 'custom' | 'none' | 'color' // 壁纸类型：预设、自定义、无、颜色
    wallpaperOpacity: number // 壁纸透明度
    wallpaperBlur: number // 壁纸模糊度
    playlistDoubleClickBehavior: 'replace' | 'add' // 播放列表双击行为：替换当前播放列表 | 添加到当前播放列表
    // 音质设置
    audioQuality: 'standard' | 'higher' | 'exhigh' | 'lossless' | 'hires' // 音质选择
    // 播放设置
    autoPlay: boolean // 自动播放
    crossfade: boolean // 淡入淡出
    gaplessPlayback: boolean // 无缝播放
    // 显示设置
    showDesktopLyrics: boolean // 桌面歌词
    enableNotifications: boolean // 通知提醒
    // 音效设置
    bassBoost: number // 低音增强 (-10 到 10)
    trebleBoost: number // 高音增强 (-10 到 10)
    virtualSurround: boolean // 虚拟环绕声
}

/* ChatState */
export interface ChatState {
    apiBaseUrl: string; // API 基础 URL
    apiToken: string; // API 令牌
    conversations: Conversation[]; // 会话数据
    activeConversationId: number; // 当前活动会话 ID
    modelSelect: string; // 模型选择
}

export interface Conversation {
    id: number; // 会话 ID
    messages: Message[]; // 消息数组
}

export interface Message {
    role: 'user' | 'system'; // 消息角色
    content: string; // 消息内容
}