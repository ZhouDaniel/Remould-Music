import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
// const Rank = () => import('@/components/rank/rank')
// const Recommend = () => import('@/components/recommend/recommend')
// const Search = () => import('@/components/search/search')
// const Singer = () => import('@/components/singer/singer')
// const SingerDetail = () => import('@/components/singer-detail/singer-detail')
// const Disc = () => import('@/components/rank/rank')
// const TopList = () => import('@/components/top-list/top-list')
// const userCenter = () => import('@/components/user-center/user-center')

import Rank from '@/components/rank/rank'
import Recommend from '@/components/recommend/recommend'
import Search from '@/components/search/search'
import Singer from '@/components/singer/singer'
import SingerDetail from '@/components/singer-detail/singer-detail'
import Disc from '@/components/disc/disc'
import TopList from '@/components/top-list/top-list'
import userCenter from '@/components/user-center/user-center'


export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: Recommend,
      children: [{
        path: ':id',
        component: Disc
      }]
    },
    {
      path: '/singer',
      name: 'singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      name: 'rank',
      component: Rank,
      children: [{
        path: ':id',
        component: TopList
      }]
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      name: 'user',
      component: userCenter,
    }
  ]
})
