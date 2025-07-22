import { Conversation } from "@/stores/interface";
/*填充默认数据| ChatState */
export const conversationsData: Conversation[] = [
    {
        id: 1,
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant.',
            },
            {
                role: 'user',
                content: 'goods.',
            },
        ],
    },
]

// 默认数据
export const trackListData = [
    {
        id: '27591651',
        title: 'Intro AE 86',
        artist: '陈光荣',
        album: '頭文字[イニシャル]D THE MOVIE SOUND TUNE',
        cover:
            'http://p4.music.126.net/9KeyafHLjadqSQTRS_tN5Q==/5741649720318487.jpg',
        url: 'http://music.163.com/song/media/outer/url?id=27591651.mp3',
        duration: 149000,
        mv: 5646424,
        source: '网易云音乐',
        lyrics: {
            lines: [
                { time: 0, lrc: '这是一首纯音乐', tlyric: 'This is instrumental music', romalrc: 'zhe shi yi shou chun yin yue' },
                { time: 5000, lrc: '没有歌词', tlyric: 'No lyrics', romalrc: 'mei you ge ci' },
                { time: 10000, lrc: '请欣赏美妙的旋律', tlyric: 'Please enjoy the beautiful melody', romalrc: 'qing xin shang mei miao de xuan lv' },
                { time: 20000, lrc: '感受音乐的魅力', tlyric: 'Feel the charm of music', romalrc: 'gan shou yin yue de mei li' },
                { time: 30000, lrc: '让心灵得到放松', tlyric: 'Let your soul relax', romalrc: 'rang xin ling de dao fang song' },
                { time: 45000, lrc: '沉浸在音乐的世界里', tlyric: 'Immerse in the world of music', romalrc: 'chen jin zai yin yue de shi jie li' },
                { time: 60000, lrc: '享受这美好的时光', tlyric: 'Enjoy this wonderful time', romalrc: 'xiang shou zhe mei hao de shi guang' },
                { time: 80000, lrc: '音乐是心灵的语言', tlyric: 'Music is the language of the soul', romalrc: 'yin yue shi xin ling de yu yan' },
                { time: 100000, lrc: '它能触动我们的内心', tlyric: 'It can touch our hearts', romalrc: 'ta neng chu dong wo men de nei xin' },
                { time: 120000, lrc: '感谢聆听', tlyric: 'Thank you for listening', romalrc: 'gan xie ling ting' }
            ]
        }
    },
    {
        id: '409872504',
        title: 'Ninelie',
        artist: 'Aimer',
        album: 'ninelie EP',
        cover:
            'http://p3.music.126.net/g7aakYG_Wfmrn1_IDfVUXA==/109951165050166241.jpg',
        url: 'http://music.163.com/song/media/outer/url?id=409872504.mp3',
        duration: 260675,
        mv: null,
        source: '网易云音乐',
        lyrics: {
            lines: [
                { time: 0, lrc: '静寂の夜に響く', tlyric: '在寂静的夜晚响起', romalrc: 'seijaku no yoru ni hibiku' },
                { time: 5000, lrc: '君の声が聞こえる', tlyric: '能听到你的声音', romalrc: 'kimi no koe ga kikoeru' },
                { time: 10000, lrc: '遠い記憶の中で', tlyric: '在遥远的记忆中', romalrc: 'tooi kioku no naka de' },
                { time: 15000, lrc: '輝いていた日々', tlyric: '闪耀着的日子', romalrc: 'kagayaite ita hibi' },
                { time: 20000, lrc: 'もう戻れない', tlyric: '已经回不去了', romalrc: 'mou modorenai' },
                { time: 25000, lrc: 'あの時間に', tlyric: '那个时光', romalrc: 'ano jikan ni' },
                { time: 30000, lrc: 'でも心の奥で', tlyric: '但在心灵深处', romalrc: 'demo kokoro no oku de' },
                { time: 35000, lrc: '君を想っている', tlyric: '想念着你', romalrc: 'kimi wo omotte iru' },
                { time: 40000, lrc: 'Ninelie', tlyric: 'Ninelie', romalrc: 'Ninelie' },
                { time: 45000, lrc: '永遠に続く', tlyric: '永远延续', romalrc: 'eien ni tsuzuku' },
                { time: 50000, lrc: 'この想いを', tlyric: '这份思念', romalrc: 'kono omoi wo' },
                { time: 55000, lrc: '君に届けたい', tlyric: '想要传达给你', romalrc: 'kimi ni todoketai' },
                { time: 60000, lrc: '時を超えて', tlyric: '超越时间', romalrc: 'toki wo koete' },
                { time: 65000, lrc: '愛は続いてく', tlyric: '爱将延续', romalrc: 'ai wa tsuzuiteku' },
                { time: 70000, lrc: 'どんなに離れても', tlyric: '无论多么遥远', romalrc: 'donna ni hanarete mo' },
                { time: 75000, lrc: '心は一つ', tlyric: '心是一体的', romalrc: 'kokoro wa hitotsu' }
            ]
        }
    },
]

export const defaultSong = {
    id: '',
    title: '未选择歌曲',
    artist: '未知歌手',
    album: '',
    cover: new URL(`@/assets/default_album.jpg`, import.meta.url).href,
    url: '',
    duration: 0,
    mv: null,
    source: '本地音乐'
}