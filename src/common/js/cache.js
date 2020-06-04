import storage from 'good-storage'

let SEARCH_KEY = '__search__'
let PLAY_KEY = '__PLAY__'
let FAVORITE_KEY = '__favorite__'
let SEARCH_MAX_LENGTH = 15
let PLAY_MAX_LENGTH = 200
let FAVORITE_MAX_LENGTH = 200

function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
    arr.unshift(val)
  } else {
    arr.unshift(val)
  }
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}
// function insertArray(arr, val, compare, maxLen) {
//   const index = arr.findIndex(compare)
//   if (index === 0) {
//     return
//   }
//   if (index > 0) {
//     arr.splice(index, 1)
//   }
//   // 在开头插入最新搜索数据
//   arr.unshift(val)
//   if (maxLen && arr.length > maxLen) {
//     arr.pop()
//   }
// }

function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}
// 增加localstorge一条数据
export function saveSearch(history) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, history, (item) => {
    return item === history
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

// 删除localstorge一条历史数据
export function deleteSearch(history) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === history
  })
  // console.log(searches)
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 删除所有数据
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

// 保存播放历史
export function savePlay(history) {
  let playHistory = storage.get(PLAY_KEY, [])
  insertArray(playHistory, history, (item) => {
    return item.id === history.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, playHistory)
  return playHistory
}

export function loadPlayHistory() {
 return storage.get(PLAY_KEY, [])
}

// 增加喜欢歌曲
export function saveFavorite(song) {
  let favoriteList = storage.get('FAVORITE_KEY', [])
  insertArray(favoriteList, song, (item) => {
    return item.id === song.id
  }, FAVORITE_MAX_LENGTH)
  storage.set('FAVORITE_KEY', favoriteList)
  return favoriteList
}
// 删除
export function deleteFavorite(song) {
  let favoriteList = storage.get('FAVORITE_KEY', [])
  deleteFromArray(favoriteList, (item) => {
    return item.id === song.id
  })
  storage.set('FAVORITE_KEY', favoriteList)
  return favoriteList
}
export function loadFavorite() {
  return storage.get('FAVORITE_KEY', [])
}




