<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll class="list-content" :data="sequenceList" ref="listContent" :refresh-delay="refreshDelay">
          <transition-group name='list' tag='ul' ref="list">
            <li
              :key='song.id'
              class="item"
              v-for="(song, index) in sequenceList"
              @click="selectSong(song, index)"
              ref="listItem"
            >
              <i class="current" :class="getCurrentIcon(song)"></i>
              <span class="text">{{song.name}} - {{song.singer}}</span>
              <span class="like" @click.stop="toggleFavoriteClass(song)">
                <i :class="getFavoriteClass(song)"></i>
              </span>
              <span class="delete" @click.stop="deleteSong(song)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSongShow">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空播放列表" confirmBtnText="清空" @confirm="confirmClear"></confirm>
      <add-song ref="addSong" @hidden="showScroll"></add-song>
    </div>
  </transition>
</template>

<script>
  import Scroll from '@/base/scroll/scroll'
  import {playMode} from '@/common/js/config'
  import {mapGetters, mapActions, mapMutations} from 'vuex'
  import Confirm from '@/base/confirm/confirm'
  import {changeModeMixin} from '@/common/js/mixin'
  import addSong from '@/components/add-song/add-song'

  export default {
    mixins: [changeModeMixin],
    data() {
      return {
        showFlag: false,
        refreshDelay: 105,
        scrollShow: true
      }
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          // 跳转到当前播放歌曲
          this.scrollToCurrent(this.currentSong)
        }, 200)
      },
      hide() {
        this.showFlag = false
      },
      // 获取歌曲的icon
      getCurrentIcon(song) {
        if (song.id === this.currentSong.id) {
          return 'icon-play'
        } else {
          return ''
        }
      },
      //点击歌曲播放
      selectSong(song, index) {
        // 如果是随机播放
        if (this.mode === playMode.random) {
          // 找到当前播放歌曲的 Id 在 playlist中的数据
          index = this.playlist.findIndex(item => {
            return song.id === item.id
          })
        }
        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },
      // 滚动到当前歌曲
      scrollToCurrent(newSong) {
        const index = this.sequenceList.findIndex((item) => {
          return item.id === newSong.id
        })
        // let el = this.$refs.listItem[index]
        let el = this.$refs.list.$el.children[index]
        this.$refs.listContent.scrollToElement(el, 300)
      },
      // 点击删除歌曲
      deleteSong(song) {
        this.deleteSongAction(song)
        if (this.playlist.length === 0) {
          this.hide()
        }
      },
      showConfirm() {
        this.$refs.confirm.show()
      },
      confirmClear() {
        this.deleteSongList()
      },
      // 点击添加歌曲队列按钮
      addSongShow() {
        this.$refs.addSong.show()
      },
      showScroll() {
        this.scrollShow = true
      },
      ...mapActions([
        'deleteSongAction',
        'deleteSongList'
      ]),
      ...mapMutations({
        setPlayingState: 'SET_PLAYING_STATE'
      })
    },
    watch: {
      currentSong(newSong, oldSong) {
        if(!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        setTimeout(() => {
          this.scrollToCurrent(newSong)
        }, 20)
      },
      // currentSong(newSong, oldSong) {
      //   if(!this.showFlag || newSong.id === oldSong.id || !this.scrollShow) {
      //     return
      //   }
      //   this.scrollToCurrent(newSong)
      // },
      // scrollShow(newVal) {
      //   if(newVal) {
      //     this.$nextTick(() => {
      //       // 延迟300ms 因为list-wrapper v-if 属性 ，给时间渲染
      //       setTimeout(() => {
      //         this.scrollToCurrent(this.currentSong)
      //       }, 300)
      //     })
      //   }
      // }
    },
    computed: {
      iconMode() {
        return this.mode === playMode.sequence
          ? 'icon-sequence'
          : this.mode === playMode.loop
            ? 'icon-loop'
            : 'icon-random'
      },
      modeText() {
        return this.mode === playMode.sequence
          ? '顺序播放'
          : this.mode === playMode.loop
            ? '循环播放'
            : '随机播放'
      },
      ...mapGetters([
        'sequenceList',
        'playlist',
        'currentIndex'
      ])
    },
    components: {
      Scroll,
      Confirm,
      addSong
    }
  }
</script>

<style scoped lang="stylus">
  @import '~@/common/stylus/variable'
  @import '~@/common/stylus/mixin'
  .playlist
    position fixed
    left 0
    right 0
    top 0
    bottom 0
    z-index 200
    background-color $color-background-d

    &.list-fade-enter-active, &.list-fade-leave-active
      transition opacity 0.3s

      .list-wrapper
        transition all 0.3s

    &.list-fade-enter, &.list-fade-leave-to
      opacity 0

      .list-wrapper
        transform translate3d(0, 100%, 0)

    &.list-fade-enter, .list-wrapper
      position absolute
      left 0
      bottom 0
      width 100%
      background-color $color-highlight-background

      .list-header
        position relative
        padding 20px 30px 10px 20px

        .title
          display flex
          align-items center

          .icon
            margin-right 10px
            font-size 30px
            color $color-theme-d

          .text
            flex 1
            font-size $font-size-medium
            color $color-text-l

          .clear
            extend-click()

            .icon-clear
              font-size $font-size-medium
              color $color-text-d

      .list-content
        max-height 240px
        overflow hidden

        .item
          display flex
          align-items center
          height 40px
          padding 0 30px 0 20px
          overflow hidden

          &.list-enter-active, &.list-leave-active
            transition all 0.1s

          &.list-enter, &.list-leave-to
            height 0

          .current
            flex 0 0 20px
            width 20px
            font-size $font-size-small
            color $color-theme-d

          .text
            flex 1
            no-wrap()
            font-size $font-size-medium
            color $color-text-d

          .like
            extend-click()
            margin-right 15px
            font-size $font-size-small
            color $color-theme

            .icon-favorite
              color $color-sub-theme

          .delete
            extend-click()
            font-size $font-size-small
            color $color-theme

      .list-operate
        width 140px
        margin 20px auto 30px auto

        .add
          display flex
          align-items center
          padding 8px 16px
          border 1px solid $color-text-l
          border-radius 100px
          color $color-text-l

          .icon-add
            margin-right 5px
            font-size $font-size-small-s

          .text
            font-size $font-size-small

      .list-close
        text-align center
        line-height 50px
        background $color-background
        font-size $font-size-medium-x
        color $color-text-l
</style>
