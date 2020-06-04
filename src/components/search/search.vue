<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box :placeholder="placeholder" ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll class="shortcut" :data="scrollData" ref="shortcut"  :refresh-delay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li v-for="item in hotKey" class="item" @click="addQuery(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
            </h1>
            <search-list
              :searches="searchHistory"
              @select="addQuery"
              @delete="deleteHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggest" :query="query" @listscroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <confirm text="是否清空所有搜索历史" ref="confirm" @confirm="clearAll"></confirm>
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import SearchBox from '@/base/search-box/search-box'
  import {getHotKey} from '@/api/search'
  import {ERR_OK} from '@/api/config'
  import Suggest from '@/components/suggest/suggest'
  import {mapActions} from 'vuex'
  import SearchList from '@/base/search-list/search-list'
  import Confirm from '@/base/confirm/confirm'
  import Scroll from '@/base/scroll/scroll'
  import {playListMixin, searchMixin} from '@/common/js/mixin'
  export default {
    mixins: [playListMixin, searchMixin],
    data() {
      return {
        placeholder: '搜索歌曲、歌手',
        hotKey: [],
      }
    },
    created() {
      this._getHotKey()
    },
    methods: {
      handlePlayList(playlist) {
        let bottom = playlist.length > 0 ? '70px' : 0
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.searchResult.style.bottom = bottom
        this.$refs.shortcut.refresh()
        this.$refs.suggest.refresh()
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      clearAll() {
        this.clearSearchHistory()
      },
      _getHotKey() {
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      ...mapActions([
        'clearSearchHistory'
      ])
    },
    computed: {
      scrollData() {
        return this.hotKey.concat(this.searchHistory)
      }
    },
    watch: {
      // 在搜索界面时，shortcut-wrapper隐藏，better-scroll不能准确计算滚动值，所以shortcut就不会滚动，所以需要手动更新一下
      query(newValue) {
        if (!newValue) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          },100)
        }
      }
    },
    components: {
      SearchBox,
      Suggest,
      SearchList,
      Confirm,
      Scroll
    }
  }
</script>
<style scoped lang="stylus">
  @import '~@/common/stylus/variable'
  @import '~@/common/stylus/mixin'
  .search
    touch-action none

    .search-box-wrapper
      margin 20px

    .shortcut-wrapper
      position fixed
      top 178px
      bottom 0
      width 100%

      .shortcut
        height 100%
        overflow hidden

        .hot-key
          margin 0 20px 20px 20px

          .title
            margin-bottom 20px
            font-size $font-size-medium
            color $color-text-l

          .item
            display inline-block
            padding 5px 10px
            margin 0 20px 10px 0
            border-radius 6px
            background $color-highlight-background
            font-size $font-size-medium
            color $color-text-d

        .search-history
          position relative
          margin 0 20px

          .title
            display flex
            align-items center
            height 40px
            font-size $font-size-medium
            color $color-text-l

            .text
              flex 1

            .clear
              extend-click()

              .icon-clear
                font-size $font-size-medium
                color $color-text-d

    .search-result
      position fixed
      width 100%
      top 178px
      bottom 0

    .slide-enter-active, .slide-leave-active
      all 0.4s

    .slide-enter, .slide-leave-to
      transform translate3d(100%, 0, 0)
</style>
