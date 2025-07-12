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
        }
    },
    persist: piniaPersistConfig('settingStore'),
})