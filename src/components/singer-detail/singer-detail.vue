<template>
  <music-list
    :title="title"
    :bg-image="bgImage"
    :songs="songs">
  </music-list>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from '@/api/singer'
  import {ERR_OK} from '@/api/config'
  import {createSong,  processSongsUrl} from '@/common/js/song'
  import musicList from '@/components/music-list/music-list'

  export default {
    name: 'singer-detail',
    data() {
      return {
        songs: []
      }
    },
    computed: {
      ...mapGetters([
        'singer'
      ]),
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      }
    },
    created() {
      // console.log(this.$route.params.id)
      // console.log(this.singer.id)
      this._getDetail()
    },
    methods: {
      _getDetail(id) {
        //如果获取不到歌手的id，返回歌手页面
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        //获取歌手的歌曲信息
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          ret.push(createSong(musicData))
        })
        return ret
      }
    },
    components: {
      musicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"


</style>
