import jsonp from '@/common/js/jsonp'
import {commonParams, options}  from "./config";

// 获取各个榜单的头部歌曲列表
export function getTopList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return jsonp(url, data, options)
}


// 点击榜单，根据榜的 topid 获取这个榜单详细的歌曲列表ID
export function getMusicList(topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    tpl: 3,
    page: 'detail',
    type: 'top',
    topid
  })
  return jsonp(url, data, options)
}
