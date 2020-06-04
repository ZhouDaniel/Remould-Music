import * as types from './mutation-types'
import {playMode} from '@/common/js/config'
import {shuffle} from '@/common/js/util1'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from '@/common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 选择歌曲
export const selectPlay = function ({commit, state}, {list, index}) {
  // 在这的 list是一个引用类型，所以就有可能在 vuex 之外的地方改变了 list(父子通信造成的,引文list值是异步获取的，多次改变了list)。那么就有可能 this._committing 的值就不会变为 true 。所以就会报错。
  // let list = list.slice()

  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAY_LIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index) // 设置正在播放歌曲的索引
  commit(types.SET_PLAYING_STATE, true) // 是否播放音乐
  commit(types.SET_FULL_SCREEN, true) // 播放器页面全展示
}

// 打乱歌曲
export const randomPlay = function ({commit, state}, {list}) {
  commit(types.SET_PLAYING_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAY_LIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 增加一条歌曲
export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录一下当前歌曲
  let currentSong = playlist[currentIndex]
  let fdIndex = findIndex(playlist, song)  // 找playlist 当前要插入歌曲的序号（没找到返回-1）
  currentIndex++
  //插入歌曲
  playlist.splice(currentIndex, 0, song)
  // 如果歌曲列表已经有这首歌曲
  if (fdIndex > -1) {
    // 如果要插入的歌曲在当前播放歌曲之前
    if (currentIndex > fdIndex) {
      playlist.splice(fdIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fdIndex + 1, 1)
    }
  }
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fdSIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fdSIndex > -1) {
    if (currentSIndex > fdSIndex) {
      sequenceList.splice(fdSIndex, 1)
    } else {
      sequenceList.splice(fdSIndex + 1, 1)
    }
  }

  commit(types.SET_PLAY_LIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAYING_STATE, true) // 是否播放音乐
  commit(types.SET_FULL_SCREEN, true) // 播放器页面全展示
}

// 保存历史搜索记录
export const saveSearchHistory = function ({commit, state}, history) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(history))
}
// 保存播放记录
export const savePlayHistory = function ({commit, state}, history) {
  commit(types.SET_PLAY_HISTORY, savePlay(history))
}
// 删除一条数据
export const deleteSearchHistory = function ({commit, state}, history) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(history))
}
// 删除所有数据
export const clearSearchHistory = function ({commit, state}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 删除歌曲
export const deleteSongAction = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  let fSIndex = findIndex(sequenceList, song)
  sequenceList.splice(fSIndex ,1)

  let fPIndex = findIndex(playlist, song)
  playlist.splice(fPIndex ,1)

  // 当删除的歌曲在播放歌曲之前，或是正在播放的歌曲是在当前播放歌单的最后一首
  if(fPIndex < currentIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_PLAY_LIST, playlist)
  commit(types.SET_CURRENT_INDEX, currentIndex)
//当没有歌曲时，暂停播放
  if(playlist.length === 0) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}

// 删除歌曲列表
export const deleteSongList = function({ commit, state }) {
  commit(types.SET_PLAY_LIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

// 添加这首歌为喜欢歌曲
export const saveFavoriteList = function ({commit, state}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 删除喜欢歌曲列表的这首歌曲
export const deleteFavoriteList = function ({commit, state}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
