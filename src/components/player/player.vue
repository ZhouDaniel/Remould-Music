<template>
  <div class="player" v-show="playlist.length > 0">
    <!--    常规播放器-->
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image"/>
        </div>
        <div class="top">
          <div class="back" @click="back"><i class="icon-back"></i></div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div
          class="middle"
          @touchstart="middleTouchStart"
          @touchmove="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image"/>
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  v-for="(line, index) in currentLyric.lines"
                  :class="{ current: currentLineNum === index }"
                  :key="index"
                >
                  {{ line.txt }}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <!-- 底部-->
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot" :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <!-- 进度条-->
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                :percent="percent"
                @percentCharge="onPercentCharge"
              ></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteClass(currentSong)" @click="toggleFavoriteClass(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!--    迷你播放器-->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image"/>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i
              :class="miniIcon"
              class="icon-mini"
              @click.stop="togglePlaying"
            ></i>
          </progress-circle>
        </div>
        <div class="control">
          <i @click.stop="showPlaylist" class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio
      ref="audio"
      :src="currentSong.url"
      @play="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from '@/common/js/dom'
  import progressBar from '@/base/progress-bar/progress-bar'
  import progressCircle from '@/base/progress-circle/progress-circle'
  import {playMode} from '@/common/js/config'

  import Lyric from 'lyric-parser'
  import Scroll from '@/base/scroll/scroll'
  import Playlist from '@/components/playlist/playlist'
  import {changeModeMixin} from '@/common/js/mixin'

  const transform = prefixStyle('transform')
  const transition = prefixStyle('transition')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [changeModeMixin],
    data() {
      return {
        songReady: false, // 避免点击过快
        currentTime: 0, // 当前音乐播放的时间
        radius: 32,
        currentLyric: null, // 歌词
        currentLineNum: 0, // 当前歌词所在行
        currentShow: 'cd', // 当前展示是cd 还是 lyric
        playingLyric: '' // cd 页面展示的播放歌词
      }
    },
    created() {
      this.touch = {}
    },
    computed: {
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playlist',
        'playing',
        'currentIndex',
        'sequenceList',
      ])
    },
    methods: {
      // 变为miniplayer
      back() {
        this.setFullScreen(false)
      },
      // 变为全屏
      open() {
        this.setFullScreen(true)
      },
      // vue.js提供的4个js钩子函数
      // 动画执行之前, done函数执行完成后会进入afterEnter
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        //1 设置动画
        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0)  scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        // 2 注册animation
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        // 3 运行animation
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transition] = `all 0.4s`
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0)  scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft) // 移动的x轴距离
        const y = window.innerHeight - paddingTop - paddingBottom - width / 2 // 移动的y轴距离
        return {x, y, scale}
      },
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      // 播放下一首歌
      next() {
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
          this.songReady = false
        }
      },
      prev() {
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
          this.songReady = false
        }
      },
      // audio 准备好后会调用此函数
      ready() {
        this.songReady = true
        this.savePlayHistory(this.currentSong)
      },
      //歌曲加载失败
      error() {
        this.songReady = true
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      format(time) {
        time = time | 0 // 向下取整
        let minite = (time / 60) | 0
        let seconds = this._pad(time % 60)
        return `${minite}:${seconds}`
      },
      // 接收progressBar 组件传过来的 percent
      onPercentCharge(percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = percent * this.currentSong.duration
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      getLyric() {
        // this.currentLyric 改变后调用 handleLyric
        // 内置定时器，根据 Lyric 中的 time 改变歌词中的 Line
        this.currentSong
          .getLyric()
          .then(lyric => {
            if(lyric !== this.currentSong.lyric) {
              return
            }
            this.currentLyric = new Lyric(lyric, this.handleLyric)
            if (this.playing) {
              this.currentLyric.play()
            }
          })
          .catch((e) => {
            console.log(e)
            this.currentLyric = null
            this.playingLyric = ''
            this.currentLineNum = 0
          })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          // 当滚动歌词超过5行时，歌词头部移动到当前歌词的上面5个，来保证当前播放的歌词在中央
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        this.touch.startX = e.touches[0].pageX
        this.touch.startY = e.touches[0].pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        let deltaX = e.touches[0].pageX - this.touch.startX
        let deltaY = e.touches[0].pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        let offsetWidth = Math.min(
          0,
          Math.max(-window.innerWidth, left + deltaX)
        )
        this.$refs.lyricList.$el.style[
          transform
          ] = `translate3d(${offsetWidth}px, 0, 0)`
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0
            opacity = 1
          }
          this.$refs.middleL.style.opacity = opacity
          this.$refs.lyricList.$el.style[
            transform
            ] = `translate3d(${offsetWidth}px, 0, 0)`
        } else if (this.currentShow === 'lyric') {
          if (this.touch.percent < 0.9) {
            this.currentShow = 'cd'
            offsetWidth = 0
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
          this.$refs.middleL.style.opacity = opacity
          this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px, 0, 0)`
        }
        const time = 400
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      // 当 num 小于两位数在前面补 0
      _pad(num, n = 2) {
        let len = num.toString().length
        if (len < n) {
          num = '0' + num
        }
        return num
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE'
      }),
      ...mapActions([
        'savePlayHistory',
      ])
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          // 如果删除歌曲为最后一首，也就没有了 newSong.id
          return
        }
        if (oldSong.id === newSong.id) {
          return
        }
        if (this.currentLyric) {
          // 避免产生多个定时器
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        //微信从后台切到前台保证音频也可以正确播放
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      progressBar,
      progressCircle,
      Scroll,
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~@/common/stylus/variable'
  @import '~@/common/stylus/mixin'
  .player
    touch-action none

    .normal-player
      position fixed
      left 0
      right 0
      top 0
      bottom 0
      z-index 150
      background $color-background

      .background
        position absolute
        left 0
        top 0
        width 100%
        height 100%
        z-index -1
        opacity 0.6
        filter blur(20px)

      .top
        position relative
        margin-bottom 25px

        .back
          position absolute
          top 0
          left 6px
          z-index 50

          .icon-back
            display block
            padding 9px
            font-size $font-size-large-x
            color $color-theme
            transform rotate(-90deg)

        .title
          width 70%
          margin 0 auto
          line-height 40px
          text-align center
          no-wrap()
          font-size $font-size-large
          color $color-text

        .subtitle
          line-height 20px
          text-align center
          font-size $font-size-medium
          color $color-text

      .middle
        position fixed
        width 100%
        top 80px
        bottom 170px
        white-space nowrap
        font-size 0

        .middle-l
          display inline-block
          vertical-align top
          position relative
          width 100%
          height 0
          padding-top 80%

          .cd-wrapper
            position absolute
            left 10%
            top 0
            width 80%
            height 100%

            .cd
              width 100%
              height 100%
              box-sizing border-box
              border 10px solid rgba(255, 255, 255, 0.1)
              border-radius 50%

              &.play
                animation rotate 20s linear infinite

              &.pause
                animation-play-state paused

              .image
                position absolute
                left 0
                top 0
                width 100%
                height 100%
                border-radius 50%

          .playing-lyric-wrapper
            width 80%
            margin 30px auto 0 auto
            overflow hidden
            text-align center

            .playing-lyric
              height 20px
              line-height 20px
              font-size $font-size-medium
              color $color-text-l

        .middle-r
          display inline-block
          vertical-align top
          width 100%
          height 100%
          overflow hidden

          .lyric-wrapper
            width 80
            margin 0 auto
            overflow hidden
            text-align center

            .text
              line-height 32px
              color $color-text-l
              font-size $font-size-medium

              &.current
                color $color-text

      .bottom
        position absolute
        bottom 50px
        width 100%

        .dot-wrapper
          text-align center
          font-size 0

          .dot
            display inline-block
            vertical-align middle
            margin 0 4px
            width 8px
            height 8px
            border-radius 50%
            background $color-text-l

            &.active
              width 20px
              border-radius 5px
              background $color-text-ll

        .progress-wrapper
          display flex
          align-items center
          width 80%
          margin 0px auto
          padding 10px 0

          .time
            color $color-text
            font-size $font-size-small
            flex 0 0 30px
            line-height 30px
            width 30px

            &.time-l
              text-align left

            &.time-r
              text-align right

          .progress-bar-wrapper
            flex 1

        .operators
          display flex
          align-items center

          .icon
            flex 1
            color $color-theme

            &.disable
              color $color-theme-d

            i
              font-size 30px

          .i-left
            text-align right

          .i-center
            padding 0 20px
            text-align center

            i
              font-size 40px

          .i-right
            text-align left

          .icon-favorite
            color $color-sub-theme

      &.normal-enter-active, &.normal-leave-active
        transition all 0.4s

        .top, .bottom
          transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)

      &.normal-enter, &.normal-leave-to
        opacity 0

        .top
          transform translate3d(0, -100px, 0)

        .bottom
          transform translate3d(0, 100px, 0)

    .mini-player
      display flex
      align-items center
      position fixed
      left 0
      bottom 0
      z-index 180
      width 100%
      height 60px
      background $color-highlight-background

      &.mini-enter-active, &.mini-leave-active
        transition all 1s

      &.mini-enter, &.mini-leave-to
        opacity 0

      .icon
        flex 0 0 40px
        width 40px
        padding 0 10px 0 20px

        img
          border-radius 50%

          &.play
            animation rotate 10s linear infinite

          &.pause
            animation-play-state paused

      .text
        display flex
        flex-direction column
        justify-content center
        flex 1
        line-height 20px
        overflow hidden

        .name
          margin-bottom 2px
          no-wrap()
          font-size $font-size-medium
          color $color-text

        .desc
          no-wrap()
          font-size $font-size-small
          color $color-text-d

      .control
        flex 0 0 30px
        width 30px
        padding 0 10px

        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size 30px
          color $color-theme-d

        .icon-mini
          font-size 32px
          position absolute
          left 0
          top 0

  @keyframes rotate
    0%
      transform rotate(0)
    100%
      transform rotate(360deg)
</style>
