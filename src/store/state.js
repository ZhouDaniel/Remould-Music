import {playMode} from '@/common/js/config'
import {loadSearch, loadPlayHistory, loadFavorite} from '@/common/js/cache'
const state = {
  singer: {},  //歌手信息
  playing: false, // 是否正在播放
  fullScreen: false, // 播放器是否全屏
  playlist: [],  // 当前播放器播放列表
  sequenceList: [], // 顺序播放列表
  mode: playMode.sequence,  // 当前播放模式
  currentIndex: -1,  // 当前播放歌曲的索引
  disc: {}, // recommend.vue 点击的歌曲列表数据
  topList: {}, //榜单的歌单列表
  searchHistory: loadSearch(), // 搜索历史
  playHistory: loadPlayHistory(),    // 播放历史
  favoriteList: loadFavorite()  //喜欢的歌曲列表
}

export default state
