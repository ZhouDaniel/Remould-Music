import Vue from 'vue'
import App from './App'
import store from './store'
import 'babel-polyfill'
import fastclick from 'fastclick'
import router from './router'
import  '@/common/stylus/index.styl'
import VueLazyLoad from 'vue-lazyload'

fastclick.attach(document.body)
Vue.use(VueLazyLoad,{
  loading: require('@/common/image/default.png')
})
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
