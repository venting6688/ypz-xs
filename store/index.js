// store.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    footData: {},
	department:{},
	footList:[],
	showState:true,   //切换就诊人后需要重新渲染页面
	showModalState:true, //提示绑定家庭成员弹窗
  },
  mutations: {
	SET_FOOT_DATA(state, newValue) {
	  state.footData = newValue
	},
    SET_FOOT_DATA(state, newValue) {
      state.footData = newValue
    },
	SET_SHOW_STATE(state, value){
		state.showState = value
	},
	SET_DEPARTMENT(state, msg) {
		state.department = msg
	}
  },
  actions: {
  }
});
