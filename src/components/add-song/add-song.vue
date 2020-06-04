<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲列表</h1>
        <div class="close" @click="hidden">
          <div class="icon-close"></div>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box placeholder="搜索歌曲"  @query="onQueryChange" ref="searchBox"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches
          :switches="switches"
          :currentIndex="currentIndex"
          @switchSelect="switchIndex"
        ></switches>
        <div class="list-wrapper">
          <scroll v-if="currentIndex === 0" :data="playHistory" class="list-scroll" ref="scroll">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll
            v-if="currentIndex === 1"
            :data="searchHistory"
            class="list-scroll"
            ref="scroll2"
            :refresh-delay="refreshDelay"
          >
            <div class="list-inner">
              <search-list :searches="searchHistory" @select="addQuery" @delete="deleteHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="suggestSelect" @listscroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title" >
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
  import searchBox from '@/base/search-box/search-box'
  import suggest from '@/components/suggest/suggest'
  import {searchMixin} from '@/common/js/mixin'
  import Switches from '@/base/switches/switches'
  import Scroll from '@/base/scroll/scroll'
  import {mapGetters, mapActions} from 'vuex'
  import SongList from '@/base/song-list/song-list'
  import Song from '@/common/js/song'
  import SearchList from '@/base/search-list/search-list'
  import TopTip from '@/base/top-tip/top-tip'
  export default {
    mixins: [searchMixin],
    data() {
      return {
        showFlag: false,
        query: '',
        showSinger: false,
        switches: [
          {name: '最近播放'},
          {name: '搜索历史'}
        ],
        currentIndex: 0
      }
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          if(this.currentIndex === 0) {
            this.$refs.scroll.refresh()
          } else if(this.currentIndex === 1) {
            this.$refs.scroll2.refresh()
          }
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      hidden() {
        this.hide()
        this.$emit('hidden')
      },
      switchIndex(index) {
        this.currentIndex = index
      },
      suggestSelect() {
        this.saveSearch
        this.$refs.topTip.show()
      },
      selectSong(item, index) {
        if(index !== 0) {
          this.insertSong(new Song(item))
          this.$refs.topTip.show()
        }
      },
      ...mapActions([
        'insertSong'
      ])
    },
    computed: {
      ...mapGetters([
        'playHistory',
        'searchHistory'
      ])
    },
    components: {
      searchBox,
      suggest,
      Switches,
      Scroll,
      SongList,
      SearchList,
      TopTip
    }
  }
</script>

<style scoped lang="stylus">
  @import '~@/common/stylus/variable'
  @import '~@/common/stylus/mixin'
  .add-song
    position fixed
    top 0
    bottom 0
    width 100%
    z-index 200
    background $color-background
    &.slide-enter-active, &.slide-leave-active
      transition all 0.3s
    &.slide-enter, &.slide-leave-to
      transform translate3d(100%, 0, 0)
    .header
      position relative
      height 44px
      text-align center
      .title
        line-height 44px
        font-size $font-size-large
        color $color-text
      .close
        position absolute
        top 0
        right 8px
        .icon-close
          display block
          padding 12px
          font-size 20px
          color $color-theme
    .search-box-wrapper
      margin 20px
    .shortcut
      .list-wrapper
        position absolute
        top 165px
        bottom 0
        width 100%
        .list-scroll
          height 100%
          overflow hidden
          .list-inner
            padding 20px 30px
    .search-result
      position fixed
      top 124px
      bottom 0
      width 100%
    .tip-title
      text-align center
      padding 18px 0
      font-size 0
      .icon-ok
        font-size $font-size-medium
        color $color-theme
        margin-right 4px
      .text
        font-size $font-size-medium
        color $color-text
</style>
