var express = require('express')
var compression = require('compression')
var config = require('./config/index')
var axios = require('axios')
var port = process.env.PORT || config.build.port
const bodyParser = require('body-parser')
var app = express()

var apiRoutes = express.Router()

const ReqHeader = {
  referer: 'https://c.y.qq.com/',
  host: 'c.y.qq.com'
}
// 获取歌单
app.get('/api/getDiscList', function (req, res) {
  // qq 音乐歌单 api 地址
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    // 修改请求头获取数据
    headers: {
      referer: ReqHeader.referer,
      host: ReqHeader.host
    },
    params: req.query
  }).then((response) => {
    // 获取到 qq 音乐的数据并以 json 格式返回
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

app.get('/api/getSongVkey', function (req, res) {
  // qq 音乐获取 vkey
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  axios.get(url, {
    headers: {
      referer: ReqHeader.referer,
      host: ReqHeader.host
    },
    params: req.query   //将发送过来的数据接收再当参数传递
  })
    .then((response) => {
      res.json(response.data)
      // get qq 音乐 vkey
    })
    .catch((e) => {
      console.log('1')
      console.log(e)
    })
})

// 获取 qq 音乐歌词
app.get('/api/lyric', function (req, res) {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  // 修改请求头
  axios
    .get(url, {
      headers: {
        referer: ReqHeader.referer,
        host: ReqHeader.host
      },
      params: req.query
    })
    .then(response => {
      var ret = response.data
      if (typeof ret === 'string') {
        var reg = /^\w+\(({[^()]+})\)$/ // 用来匹配 jsonp 字符串
        var matches = ret.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      res.json(ret)
    })
    .catch(e => {
      console.log(e)
    })
})

// 根据歌单 id 获取歌单中歌曲
app.get('/api/getSongList', function (req, res) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios
    .get(url, {
      headers: {
        referer: ReqHeader.referer,
        host: ReqHeader.host
      },
      params: req.query
    })
    .then(response => {
      res.json(response.data)
    })
    .catch(e => {
      console.log(e)
    })
})
// search结果
app.get('/api/getSearch', function(req, res) {
  // qq 音乐获取 vkey
  const url =
    'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  // 修改请求头去获取数据
  axios
    .get(url, {
      headers: {
        referer: ReqHeader.referer,
        host: ReqHeader.host
      },
      params: req.query // 将发送过来的数据接收再当参数传递
    })
    .then(response => {
      // 获取搜索结果
      res.json(response.data)
    })
    .catch(e => {
      console.log(e)
    })
})
// 获取歌曲的url
app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  axios.post(url, req.body, {
    headers: {
      referer: 'https://y.qq.com/',
      origin: 'https://y.qq.com',
      'Content-type': 'application/x-www-form-urlencoded'
    }
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})
app.use('/api', apiRoutes)

app.use(compression())

app.use(express.static('./dist'))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
