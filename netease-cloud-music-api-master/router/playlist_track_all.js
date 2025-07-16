// 获取歌单全部歌曲
module.exports = (req, res, createWebAPIRequest, request) => {
  const cookie = req.get("Cookie") ? req.get("Cookie") : "";
  const data = {
    id: req.query.id,
    n: req.query.limit || 1000,
    s: req.query.s || 8,
    offset: req.query.offset || 0,
    csrf_token: ""
  };

  createWebAPIRequest(
    "music.163.com",
    `/weapi/v6/playlist/detail`,
    "POST",
    data,
    cookie,
    music_req => {
      try {
        const result = JSON.parse(music_req);
        // 返回歌曲列表格式
        const response = {
          code: result.code,
          songs: result.playlist ? result.playlist.tracks : [],
          privileges: result.privileges || []
        };
        res.send(JSON.stringify(response));
      } catch (error) {
        res.status(502).send("fetch error");
      }
    },
    err => {
      res.status(502).send("fetch error");
    }
  );
};
