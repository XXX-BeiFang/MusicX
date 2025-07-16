// 获取banner
module.exports = (req, res, createWebAPIRequest, request) => {
  const cookie = req.get("Cookie") ? req.get("Cookie") : "";
  const data = {
    type: req.query.type || 0, // 使用type=0获取默认轮播图
    csrf_token: ""
  };

  createWebAPIRequest(
    "music.163.com",
    `/weapi/v2/banner/get`,
    "POST",
    data,
    cookie,
    music_req => {
      try {
        const result = JSON.parse(music_req);

        // 定义高质量的音乐主题轮播图数据
        const mockBanners = [
            {
              pic: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=280&fit=crop&auto=format",
              targetId: 1001,
              adid: null,
              targetType: 1,
              titleColor: "red",
              typeTitle: "新歌首发",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_1"
            },
            {
              pic: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=280&fit=crop&auto=format",
              targetId: 1002,
              adid: null,
              targetType: 1,
              titleColor: "blue",
              typeTitle: "热门推荐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_2"
            },
            {
              pic: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=280&fit=crop&auto=format",
              targetId: 1003,
              adid: null,
              targetType: 1,
              titleColor: "green",
              typeTitle: "精选歌单",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_3"
            },
            {
              pic: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=280&fit=crop&auto=format",
              targetId: 1004,
              adid: null,
              targetType: 1,
              titleColor: "purple",
              typeTitle: "流行音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_4"
            },
            {
              pic: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=280&fit=crop&auto=format",
              targetId: 1005,
              adid: null,
              targetType: 1,
              titleColor: "orange",
              typeTitle: "经典老歌",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_5"
            },
            {
              pic: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=280&fit=crop&auto=format",
              targetId: 1006,
              adid: null,
              targetType: 1,
              titleColor: "cyan",
              typeTitle: "民谣音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_6"
            },
            {
              pic: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=280&fit=crop&auto=format",
              targetId: 1007,
              adid: null,
              targetType: 1,
              titleColor: "indigo",
              typeTitle: "电子音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_7"
            },
            {
              pic: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=280&fit=crop&auto=format",
              targetId: 1008,
              adid: null,
              targetType: 1,
              titleColor: "pink",
              typeTitle: "摇滚音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_8"
            },
            {
              pic: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=280&fit=crop&auto=format&q=80",
              targetId: 1009,
              adid: null,
              targetType: 1,
              titleColor: "teal",
              typeTitle: "爵士音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_9"
            },
            {
              pic: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&h=280&fit=crop&auto=format&q=80",
              targetId: 1010,
              adid: null,
              targetType: 1,
              titleColor: "amber",
              typeTitle: "古典音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_10"
            },
            {
              pic: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=280&fit=crop&auto=format&q=80&hue=120",
              targetId: 1011,
              adid: null,
              targetType: 1,
              titleColor: "lime",
              typeTitle: "世界音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_11"
            },
            {
              pic: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=280&fit=crop&auto=format&q=80&hue=240",
              targetId: 1012,
              adid: null,
              targetType: 1,
              titleColor: "rose",
              typeTitle: "独立音乐",
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: "music_12"
            }
          ];

        // 处理图片URL的函数，确保正确添加参数
        const processImageUrl = (pic) => {
          if (!pic) return '';
          // 对于Unsplash图片，直接返回（已经包含所需参数）
          if (pic.includes('unsplash.com')) return pic;
          // 对于网易云音乐图片，检查是否已经包含param参数
          if (pic.includes('?param=')) return pic;
          // 如果包含其他参数，添加&param=600y280
          if (pic.includes('?')) return pic + '&param=600y280';
          // 如果没有参数，添加?param=600y280
          return pic + '?param=600y280';
        };

        // 优先使用真实的网易云音乐轮播图数据
        if (result.banners && result.banners.length > 0) {
          console.log('Found real banner data:', result.banners.length, 'banners');
          // 处理真实轮播图数据，确保图片链接有效
          const validBanners = result.banners
            .filter(banner => banner.pic)
            .map(banner => ({
              ...banner,
              pic: processImageUrl(banner.pic)
            }));

          // 如果真实数据不足12个，用模拟数据补充
          if (validBanners.length < 12) {
            const needed = 12 - validBanners.length;
            const supplementBanners = mockBanners.slice(0, needed).map(banner => ({
              ...banner,
              pic: processImageUrl(banner.pic)
            }));
            result.banners = [...validBanners, ...supplementBanners];
          } else {
            result.banners = validBanners.slice(0, 12);
          }
        } else {
          console.log('No real banner data found, using mock data');
          // 如果没有真实数据，使用完整的模拟数据
          result.banners = mockBanners.map(banner => ({
            ...banner,
            pic: processImageUrl(banner.pic)
          }));
        }
        result.code = 200;

        res.send(JSON.stringify(result));
      } catch (error) {
        console.error('Banner API parse error:', error);
        // 如果解析失败，返回完整的模拟数据
        const fallbackBanners = {
          code: 200,
          banners: Array.from({length: 12}, (_, i) => {
            const images = [
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=280&fit=crop",
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=280&fit=crop",
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=280&fit=crop",
              "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=280&fit=crop",
              "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=280&fit=crop",
              "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=280&fit=crop"
            ];
            return {
              pic: images[i % images.length],
              targetId: 2000 + i,
              adid: null,
              targetType: 1,
              titleColor: ["blue", "red", "green", "purple", "orange", "cyan"][i % 6],
              typeTitle: ["新歌首发", "热门推荐", "精选歌单", "流行音乐", "经典老歌", "民谣音乐"][i % 6],
              url: "https://music.163.com/",
              adurlV2: null,
              exclusive: false,
              bannerId: `fallback_${i + 1}`
            };
          })
        };
        res.send(JSON.stringify(fallbackBanners));
      }
    },
    err => {
      console.error('Banner API request error:', err);
      // 如果请求失败，返回完整的模拟数据
      const fallbackBanners = {
        code: 200,
        banners: Array.from({length: 12}, (_, i) => {
          const images = [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=280&fit=crop",
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=280&fit=crop",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=280&fit=crop",
            "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=280&fit=crop",
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=280&fit=crop",
            "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=280&fit=crop"
          ];
          return {
            pic: images[i % images.length],
            targetId: 3000 + i,
            adid: null,
            targetType: 1,
            titleColor: ["blue", "red", "green", "purple", "orange", "cyan"][i % 6],
            typeTitle: ["新歌首发", "热门推荐", "精选歌单", "流行音乐", "经典老歌", "民谣音乐"][i % 6],
            url: "https://music.163.com/",
            adurlV2: null,
            exclusive: false,
            bannerId: `fallback_${i + 1}`
          };
        })
      };
      res.send(JSON.stringify(fallbackBanners));
    }
  );
};
