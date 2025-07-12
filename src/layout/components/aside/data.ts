export const MenuData = [
    {
        title: '',
        children: [
            { title: '首页', icon: 'HomeFilled', router: '/' },
        ],
    },
    {
        title: '发现',
        children: [
            {
                title: '推荐',
                icon: 'Star',
                router: '/search',
                shortcut: 'D',
            },
            { title: 'MV', icon: 'VideoCamera', router: '/mv' },
            {
                title: '歌单',
                icon: 'Menu',
                router: '/playlist',
            },
            {
                title: '歌手',
                icon: 'Avatar',
                router: '/artist',
            },
        ],
    },
    {
        title: '实验性测试',
        children: [
            {
                title: 'ChatGPT',
                icon: 'ChatDotRound',
                router: '/chatGPT',
            },
            {
                title: '图标示例',
                icon: 'Collection',
                router: '/utils'
            },
        ],
    },
    {
        title: '设置',
        children: [
            { title: '设置', icon: 'Setting', router: '/setting' },
        ],
    },
]