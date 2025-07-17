import { defineStore } from 'pinia'
import piniaPersistConfig from '@/stores/helper/persist'
import { SettingState } from "@/stores/interface";
/**
 * 设置
 */
export const settingStore = defineStore({
    id: 'settingStore',
    state: (): SettingState => ({
        isDrawerCover: true,
        isOriginalParsed: true,
        isTranslatedParsed: true,
        isRomaParsed: true,
        // 当前系统语言
        language: null,
        // 主题颜色
        themeColor: '#8b5cf6', // 默认紫色
        themeColorName: '默认紫',
        // 深色模式
        isDarkMode: false, // 默认浅色模式
        // 壁纸设置
        wallpaper: null,
        wallpaperType: 'none',
        wallpaperOpacity: 0.8,
        wallpaperBlur: 0, // 默认无模糊
    }),
    actions: {
        // Set SettingState
        setSettingState(...args: ObjToKeyValArray<SettingState>) {
            this.$patch({ [args[0]]: args[1] } as Record<string, any>);
        },

        // 设置主题颜色
        setThemeColor(color: string, name: string) {
            this.themeColor = color;
            this.themeColorName = name;

            // 设置 CSS 变量
            document.documentElement.style.setProperty('--primary', color);

            // 转换为 RGB 格式并设置
            const hexToRgb = (hex: string) => {
                // 移除 # 号
                hex = hex.replace('#', '');

                // 处理缩写形式（例如 #fff）
                if (hex.length === 3) {
                    hex = hex.split('').map(h => h + h).join('');
                }

                // 转换为 RGB
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);

                return `${r}, ${g}, ${b}`;
            };

            document.documentElement.style.setProperty('--primary-rgb', hexToRgb(color));
        },

        // 切换深色模式
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            this.applyDarkMode();
        },

        // 设置深色模式
        setDarkMode(isDark: boolean) {
            this.isDarkMode = isDark;
            this.applyDarkMode();
        },

        // 应用深色模式
        applyDarkMode() {
            if (this.isDarkMode) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.setAttribute('data-bs-theme', 'light');
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
            }
        },

        // 设置壁纸
        setWallpaper(wallpaper: string | null, type: 'preset' | 'custom' | 'none' | 'color') {
            this.wallpaper = wallpaper;
            this.wallpaperType = type;
        },

        // 设置壁纸透明度
        setWallpaperOpacity(opacity: number) {
            this.wallpaperOpacity = opacity;
        },

        // 设置壁纸模糊度
        setWallpaperBlur(blur: number) {
            this.wallpaperBlur = blur;
        }
    },
    persist: piniaPersistConfig('settingStore'),
})