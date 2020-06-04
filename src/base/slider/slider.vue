<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in  dots" :class="{active:currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">

import BScroll from 'better-scroll'
import {addClass} from '@/common/js/dom'
  export default {
    name: 'slider',
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 2000
      }
    },
    data() {
      return {
        dots: [],
        // children: []
        currentPageIndex: 0
      }
    },
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
        if(this.autoPlay){
          this._play()
        }
        window.addEventListener('resize',() => {
          if(!this.slider){
            return
          }
          this._setSliderWidth(true)
          this.slider.refresh()
        })
      }, 20)

    },
    activated() {
      if(this.autoPlay){
        this._play()
      }
    },
    deactivated() {
      clearTimeout(this.timer)
    },
    // beforeDestroy() {
    //   clearTimeout(this.timer)
    // },
    // destroyed() {
    //   clearTimeout(this.timer)
    // },
    methods: {
      // 计算轮播子元素和总宽度
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
        // console.log(this.dots)
      },
      _initSlider() {
        // 初始化better-scroll
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400,
        })
        // 监听滚动完成
        this.slider.on('scrollEnd',()=>{
          let pageIndex = this.slider.getCurrentPage().pageX  // 获得当前图片的index
          if(this.loop){
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex
          if(this.autoPlay){
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      _play() {
        let pageIndex = this.currentPageIndex + 1
        if(this.loop){
          pageIndex += 1
        }
        this.timer = setInterval(()=>{
          this.slider.goToPage(pageIndex,0,400)
        }, this.interval)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      /*position: relative*/
      /*overflow: hidden*/
      /*white-space: nowrap*/
      .slider-item
        float: left
        /*box-sizing: border-box*/
        /*overflow: hidden*/
        /*text-align: center*/
        img
          display: block
          width: 100%

    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
