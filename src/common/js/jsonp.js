import originJsonp from 'jsonp'
export default function jsonp(url,data1,option) {
   url += (url.indexOf('?') < 0 ? '?': '&') + param(data1)
  return new Promise((resolve,reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}
export function param(data){
  let url = ''
  for(var k in data){
    let value = data[k] !== undefined ? data[k] : ''
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  return url ? url.substring(1): ''
}
