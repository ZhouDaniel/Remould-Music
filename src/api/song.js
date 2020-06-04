import axios from 'axios'
import {commonParams} from './config'
import {getUid} from '@/common/js/uid'
import {ERR_OK} from '@/api/config'

const debug = process.env.NODE_ENV !== 'production'

// export function getMusicSource(mid) {
//   const url = debug ? '/api/getSongVkey' : 'http://music.zhoudaniel.top:88/music/api/getSongVkey'
//   const data = Object.assign({}, commonParams, {
//     songmid: mid,
//     filename: 'C400' + mid + '.m4a',
//     guid: 2180150330,
//     platform: 'yqq',
//     loginUin: 0,
//     hostUin: 0,
//     needNewCode: 0,
//     format: 'json',
//     cid: 205361747,
//     uin: 0
//   })
//   return axios
//     .get(url, {
//       params: data
//     })
//     .then((res) => {
//       return Promise.resolve(res.data)
//     })
// }

export function getLyric(mid) {
  const url = debug ? '/api/lyric' : 'http://music.zhoudaniel.top:88/music/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: +new Date(),
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    g_tk: 67232076,
    format: 'json'
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
}


// 获取歌曲的url的方法
export function getSongsUrl (songs) {
  const url = debug ? '/api/getPurlUrl' : 'http://music.zhoudaniel.top:88/music/api/getPurlUrl'

  let mids = []
  let types = []

  songs.forEach((song) => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3

    function request () {
      return axios.post(url, {
        comm: data,
        req_0: urlMid
      }).then((response) => {
        const res = response.data
        if (res.code === ERR_OK) {
          let urlMid = res.req_0
          console.log(urlMid)
          if (urlMid && urlMid.code === ERR_OK) {
            const purlMap = {}
            urlMid.data.midurlinfo.forEach((item) => {
              if (item.purl) {
                purlMap[item.songmid] = item.purl
              }
            })
            if (Object.keys(purlMap).length > 0) {
              resolve(purlMap)
            } else {
              retry()
            }
          } else {
            retry()
          }
        } else {
          retry()
        }
      })
    }

    function retry () {
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('Can not get the songs url'))
      }
    }

    request()
  })
}

function genUrlMid (mids, types) {
  const guid = getUid()
  return {
    module: 'vkey.GetVkeyServer',
    method: 'CgiGetVkey',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}
