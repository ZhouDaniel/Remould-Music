<template>
  <music-list :bg-image="bgImage" :title="title" :songs="songs"></music-list>
</template>

<script>
  import MusicList from '@/components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from '@/api/recommend'
  import {ERR_OK} from '@/api/config'
  import {createSong, processSongsUrl} from '@/common/js/song'

  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      ...mapGetters([
        'disc'
      ]),
      bgImage() {
        return this.disc.imgurl
      },
      title() {
        return this.disc.dissname
      }
    },
    created() {
      this._getSongList()
    },
    methods: {
      _getSongList() {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          ret.push(createSong(musicData))
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
