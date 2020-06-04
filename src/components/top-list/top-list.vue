<template>
  <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
</template>

<script>
  import MusicList from '@/components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getMusicList} from '@/api/rank'
  import {ERR_OK} from '@/api/config'
  import {createSong, processSongsUrl} from '@/common/js/song'

  export default {
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    created() {
      this._getMusicList()
    },
    methods: {
      _getMusicList() {
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        getMusicList(this.topList.id).then(res => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          ret.push(createSong(musicData))
        })
        return ret
      }
    },
    computed: {
      ...mapGetters([
        'topList'
      ]),
      title() {
        return this.topList.topTitle
      },
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return this.topList.picUrl
      }
    },

    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
