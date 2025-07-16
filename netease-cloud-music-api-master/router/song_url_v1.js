// 获取音乐 url v1 版本
module.exports = (req, res, createWebAPIRequest, request) => {
  const id = req.query.id;
  const level = req.query.level || 'standard';
  
  // 根据level参数设置比特率
  let br = 999000; // 默认高品质
  switch(level) {
    case 'dolby':
      br = 999000; // 杜比全景声
      break;
    case 'lossless':
      br = 999000; // 无损
      break;
    case 'exhigh':
      br = 320000; // 极高
      break;
    case 'higher':
      br = 192000; // 较高
      break;
    case 'standard':
      br = 128000; // 标准
      break;
    default:
      br = 128000;
  }

  const data = {
    ids: [id],
    level: level,
    encodeType: 'mp3',
    csrf_token: ""
  };
  
  const cookie = req.get("Cookie") ? req.get("Cookie") : "";

  createWebAPIRequest(
    "music.163.com",
    "/weapi/song/enhance/player/url/v1",
    "POST",
    data,
    cookie,
    music_req => {
      try {
        const result = JSON.parse(music_req);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(result));
      } catch (error) {
        // 如果v1接口失败，尝试使用旧版接口
        const fallbackData = {
          ids: [id],
          br: br,
          csrf_token: ""
        };
        
        createWebAPIRequest(
          "music.163.com",
          "/weapi/song/enhance/player/url",
          "POST",
          fallbackData,
          cookie,
          fallback_req => {
            res.setHeader("Content-Type", "application/json");
            res.send(fallback_req);
          },
          fallback_err => {
            res.status(502).send("fetch error");
          }
        );
      }
    },
    err => {
      // 如果v1接口失败，尝试使用旧版接口
      const fallbackData = {
        ids: [id],
        br: br,
        csrf_token: ""
      };
      
      createWebAPIRequest(
        "music.163.com",
        "/weapi/song/enhance/player/url",
        "POST",
        fallbackData,
        cookie,
        fallback_req => {
          res.setHeader("Content-Type", "application/json");
          res.send(fallback_req);
        },
        fallback_err => {
          res.status(502).send("fetch error");
        }
      );
    }
  );
};
