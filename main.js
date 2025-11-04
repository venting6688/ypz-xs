import App from './App'
import Vue from 'vue'
import './uni.promisify.adaptor'
import store from "./store";
import  login from './utils/login.js'

// #ifndef VUE3
import VueCompositionAPI from '@vue/composition-api';
Vue.use(VueCompositionAPI);
// #endif
 
Vue.config.productionTip = false
Vue.prototype.$login = login
App.mpType = 'app'
const app = new Vue({
  ...App,
    store,
})
app.$mount()
