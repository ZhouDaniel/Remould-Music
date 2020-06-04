import jsonp from '@/common/js/jsonp'
import { commonParams, options } from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
// 热门搜索
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    needNewCode: 1,
    platform: 'h5'
  })

  return jsonp(url, data, options)
}


// 搜索歌曲，歌手
export function search(query, page, zhida, perpage) {
  const url = debug ? '/api/getSearch' : 'http://music.zhoudaniel.top:88/music/api/getSearch'

  const data = Object.assign({}, commonParams, {
    w: query,
    catZhida: zhida ? 1 : 0,
    p: page,
    perpage,
    n: perpage,
    platform: 'h5',
    needNewCode: 1,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    format: 'json'
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      // 返回一个 Promise 对象
      return Promise.resolve(res.data)
    })
    .catch((e) => {
      console.log(e)
    })
}
