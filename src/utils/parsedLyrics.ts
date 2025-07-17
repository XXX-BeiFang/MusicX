import { API } from "@/api/interface";
import { safeSplit, safeGet, validateApiResponse, createDefaultLyricsData, logError } from './errorHandler';
export interface LyricLine {
    time: number // 歌词对应的时间（毫秒）
    lrc: string // 歌词文本
}
export interface MergedLyricLine extends LyricLine {
    tlyric?: string // 可选的翻译文本
    romalrc?: string // 可选的罗马音歌词
}

interface LyricUser {
    id: number // 用户 ID
    status: number // 状态
    demand: number // 需求
    userid: number // 用户 ID
    nickname: string // 用户昵称
    uptime: number // 更新时间戳
}

export interface LyricData {
    lines: MergedLyricLine[]
    lyricUser?: LyricUser // 歌词贡献者信息
    transUser?: LyricUser // 翻译贡献者信息
    remark?: string // 其他备注信息
}

export function parseLyrics(lyricString: string): LyricLine[] {
    try {
        // 使用安全的split方法，防止null错误
        const lines = safeSplit(lyricString, '\n')
        const parsedLines: LyricLine[] = []

    lines.forEach((line) => {
        const matches = [...line.matchAll(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/g)]
        const lrc = line.replace(/\[.*?\]/g, '').trim() // 去除时间戳部分，保留歌词文本

        if (matches.length && lrc) {
            matches.forEach((match) => {
                const minutes = parseInt(match[1], 10)
                const seconds = parseInt(match[2], 10)
                const milliseconds =
                    match[3].length === 3
                        ? parseInt(match[3], 10)
                        : parseInt(match[3], 10) * 10
                const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds
                parsedLines.push({ time: time, lrc })
            })
        }
    })

    return parsedLines
    } catch (error) {
        logError(error, 'parseLyrics')
        return []
    }
}

export function parseAndMergeLyrics(lyrics: API.LyricsResponse): LyricData {
    try {
        // 验证API响应数据格式
        if (!validateApiResponse(lyrics)) {
            return createDefaultLyricsData('歌词数据无效')
        }

        const { lyricUser, transUser, lrc, tlyric, romalrc } = lyrics

        // 使用安全的属性访问解析歌词
        const originalParsed: LyricLine[] = parseLyrics(safeGet(lrc, 'lyric', '')) || []
        const translatedParsed: LyricLine[] = parseLyrics(safeGet(tlyric, 'lyric', '')) || []
        const romaParsed: LyricLine[] = parseLyrics(safeGet(romalrc, 'lyric', '')) || []

    // 备注信息，如果 originalParsed 为空，将 lrc.lyric 作为备注显示
    let remark = ''
    if (originalParsed.length === 0 && lrc?.lyric) {
        remark = lrc.lyric // 使用 lrc.lyric 作为备注
    }

    // 合并原文和翻译，假设每一行的时间戳都一致
    const mergedLyrics = originalParsed.map((lyric) => {
        // 尝试找到时间戳匹配的翻译行
        const translation: LyricLine | undefined = translatedParsed.find(
            (tran) => tran.time === lyric.time
        )

        const romaLrc: LyricLine | undefined = romaParsed.find(
            (tran) => tran.time === lyric.time
        )

        // 如果找到翻译，添加到原文对象中
        return {
            ...lyric,
            tlyric: translation?.lrc,
            romalrc: romaLrc?.lrc,
        }
    })

    // 如果也没有解析到原歌词，同时歌词字段不为空，使用 lyric 字段作为备注
    if (mergedLyrics.length === 0 && lyrics.lyric) {
        remark = lyrics.lyric
    }

    return {
        lines: mergedLyrics,
        lyricUser: lyricUser || '',
        transUser: transUser || '',
        remark,
    }
    } catch (error) {
        logError(error, 'parseAndMergeLyrics')
        return createDefaultLyricsData('歌词解析失败')
    }
}