import {mapActions, mapGetters, mapMutations} from 'vuex'
import { playMode } from "@/common/js/config";
import { shuffle } from "@/common/js/util1";
export const playListMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlayList(this.playlist)
  },
  activated() {
    this.handlePlayList(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlayList(newVal)
    }
  },
  method: {
    handlePlayList() {
      throw new Error('component must implement handlePlayList method')
    }
  }
}


// 改变播放模式
export const changeModeMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence
        ? "icon-sequence"
        : this.mode === playMode.loop
          ? "icon-loop"
          : "icon-random";
    },
    ...mapGetters([
      "mode",
      "currentSong",
      'favoriteList'
    ])
  },
  methods: {
    // 改变歌曲播放模式
    changeMode() {
      let currentMode = (this.mode + 1) % 3;
      this.setCurrentMode(currentMode);
      let list = null;
      if (currentMode === playMode.random) {
        // 打乱歌曲播放列表
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this._resetCurrentIndex(list);
      this.setPlayList(list);
    },
    // 保证切换模式的时候歌曲保持不变
    _resetCurrentIndex(list) {
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    // 获取歌曲喜欢的图标样式
    getFavoriteClass(song) {
      if (!this.isFavorite(song)) {
        return 'icon-not-favorite'
      }
      return 'icon-favorite'
    },
    // 喜欢的歌曲图标样式切换
    toggleFavoriteClass(song) {
      if (!this.isFavorite(song)) {
        this.saveFavoriteList(song)
      } else {
        this.deleteFavoriteList(song)
      }
    },
    isFavorite(song) {
      let index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setCurrentMode: "SET_PLAYING_MODE",
      setPlayList: "SET_PLAY_LIST",
      setCurrentIndex: "SET_CURRENT_INDEX",
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  },
}


////搜索mixin
export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 105
    }
  },
  methods: {
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    saveSearch(value) {
      this.saveSearchHistory(value)
    },
    onQueryChange(newQuery) {
      this.query = newQuery
    },
    deleteHistory(item) {
      this.deleteSearchHistory(item)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
    ])
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  }
}















