<template>
  <scroll
    class="suggest"
    :data="result"
    :pullUp="pullUp"
    @scrollToEnd="searchMore"
    :beforeScroll="beforeScroll"
    @beforeScroll="listScroll"
    ref="suggest"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item,index) in result" :key="index" @click="selectItem(item)">
        <div class="icon"><i :class="getIconCls(item)"></i></div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore && !result.length" :title="title"></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
  import {search} from '@/api/search'
  import {ERR_OK} from '@/api/config'
  import {createSong, processSongsUrl} from '@/common/js/song'
  import Scroll from '@/base/scroll/scroll'
  import Loading from '@/base/loading/loading'
  import {mapMutations, mapActions} from 'vuex'
  import Singer from '@/common/js/singer'
  import NoResult from '@/base/no-result/no-result'

  const TYPE_SINGER = 'singer'
  const PERPAGE = 30
  export default {
    data() {
      return {
        page: 1,
        result: [],
        //Lresult: [], // 避免因异步造成的数组为空
        pullUp: true, // 需要上拉刷新
        hasMore: true, // 可以加载更多
        title: '',
        beforeScroll: true  // 是否监听滚动开始之前
      }
    },
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      search(query) {
        // query 改变时，初始化数据
        this.result = [],
        this.page = 1,
        this.hasMore = true
        search(query, this.page, this.showSinger, PERPAGE)
          .then((res) => {
            if (res.code === ERR_OK) {
              // this._genResult(res.data)
              // this._checkMore(res.data)
              this._genResult(res.data).then((result) => {
                this.result = result
                setTimeout(() => {
                  this._checkMore(res.data)
                }, 20)
              })
            }
          }).catch(e => {
          console.log(e)
        })
      },
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, PERPAGE)
          .then((res) => {
              // if (res.code === ERR_OK) {
              //   // 将数组处理合并成最终可赋值的结果
              //   this._genResult(res.data)
              //   // 检查是否可以再次查找
              //   this._checkMore(res.data)
              this._genResult(res.data).then((result) => {
                this.result = this.result.concat(result)
                setTimeout(() => {
                  this._checkMore(res.data)
                }, 20)
              })
            }
          ).catch(e => {
          console.log(e)
        })
      },
      //点击item跳转，并修改vuex
      selectItem(item) {
        if (item.type === TYPE_SINGER) {
          this.$router.push({
            path: `/search/${item.singerid}`
          })
          this.setSinger(new Singer({
            id: item.singermid,
            name: item.singername
          }))
        } else {
          this.insertSong(item)
        }
        this.$emit('select', this.getDisplayName(item))
      }
      ,
      refresh() {
        this.$refs.suggest.refresh()
      }
      ,
      // 核实是否还有需更多的搜索数据
      _checkMore(data) {
        if (!data.song.list.length || (data.song.curnum + (data.song.curpage - 1) * PERPAGE) >= data.song.totalnum) {
          // 如果所有结果全部显示出来就置为 false
          this.hasMore = false
        }
      }
      ,
      listScroll() {
        this.$emit('listscroll')
      }
      ,
      // 将歌手和歌曲存入一个数组
      _genResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid && this.page === 1) {
          // this.result.push({...data.zhida, ...{type: TYPE_SINGER}})
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        // if (data.song) {
        //   // 因为异步，第一次返回的数组为空，为了避免这样需要watch，然后再把数组push到result 当中
        //   this.Lresult = this._normalize(data.song.list)
        // }
        return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
          ret = ret.concat(songs)
          return ret
        })
      }
      ,
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          ret.push(createSong(musicData))
        })
        return ret
      }
      ,
      ...
        mapMutations({
          setSinger: 'SET_SINGER'
        }),
      ...
        mapActions([
          'insertSong'
        ])
    },
    watch: {
      query(newQuery) {
        if (!newQuery) {
          // console.log('a')
          return
        }
        this.search(newQuery)
      }
      //在这里解决异步问题 result.concat(this._normalize(data.song.list))
      // Lresult(newValue) {
      //   let newV = newValue[newValue.length - 1]
      //   if (newV) {
      //     this.result.push(newV)
      //   }
      // }
    }
    ,
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"
  .suggest
    height 100%
    overflow hidden

    .suggest-list
      padding 0 30px

      .suggest-item
        display flex
        align-items center
        padding-bottom 20px

      .icon
        flex 0 0 30px
        width 30px

        [class^="icon-"]
          font-size 14px
          color $color-text-d

      .name
        flex 1
        font-size $font-size-medium
        color $color-text-d
        overflow hidden

        .text
          no-wrap()

    .no-result-wrapper
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)


</style>
