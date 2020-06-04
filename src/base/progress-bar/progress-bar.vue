<template>
  <div class="progress-bar" ref="progressBar" @click="barClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
           ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixStyle} from '@/common/js/dom'

  const progressBtnWidth = 16
  const transform = prefixStyle('transform')
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      // 用于不同的回调函数中共享数据
      this.touch = {}
    },
    methods: {
      progressTouchStart(e) {
        this.touch.initiated = true // 触摸开始
        this.touch.startX = e.touches[0].pageX // 获取此时鼠标 x 坐标
        this.touch.left = this.$refs.progress.clientWidth // 获得此时进度条长度
      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        let deltaX = e.touches[0].pageX - this.touch.startX
        let offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, deltaX + this.touch.left))
        this._offset(offsetWidth)
      },
      progressTouchEnd(e) {
        this.touch.initiated = false
        this._triggerPercent()
      },
      // 把此时的progressBar进度发送出
      _triggerPercent() {
        let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        let percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentCharge', percent)
      },
      //设置进度条宽度和按钮移动距离
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      },
      barClick(e) {
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        //this._offset(e.offsetX) offsetX 表示鼠标指针位置相对于触发事件的对象的 x 坐标。
        this._triggerPercent()
      }
    },
    watch: {
      percent(newPercent, oldPercent) {
        // 当没有拖动时 newPercent 才更新
        if(newPercent > 1){
          newPercent = 1
        }
        if(newPercent < oldPercent) {
          newPercent = 0
        }
        if (newPercent > 0 && !this.touch.initiated) {
          let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          let offsetWidth = newPercent * barWidth
          this._offset(offsetWidth)
        }

      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import '~@/common/stylus/variable'
  .progress-bar
    height 30px

    .bar-inner
      position relative
      top 13px
      height 4px
      background rgba(0, 0, 0, 0.3)

      .progress
        position absolute
        height 100%
        background $color-theme

      .progress-btn-wrapper
        position absolute
        left -8px
        top -13px
        width 30px
        height 30px

        .progress-btn
          position relative
          top 7px
          left 7px
          box-sizing border-box
          width 16px
          height 16px
          border 3px solid $color-text
          border-radius 50%
          background $color-theme
</style>
