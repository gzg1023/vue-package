import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { post, getJson } from './fetch'
Vue.config.productionTip = false
Vue.prototype.$post = post
Vue.prototype.$getJson = getJson

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
