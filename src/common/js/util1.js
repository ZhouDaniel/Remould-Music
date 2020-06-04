// 获取随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 打乱数组
export function shuffle(arr) {
  // console.log(arr)
  let _arr = arr.slice()  // slice 不改变arr数组
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 防抖动
export function debounce(func, delay) {
  let timer = null
  return function() {
    // console.log('aaa')
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, arguments)
    }, delay)
  }
}
