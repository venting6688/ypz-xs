import login from './login.js'
import store from '../store';
let requestCount = 0
/**
 *
 * @param state   1: 没有加载弹框    2：跳过判断登录弹窗     3：定时刷新接口不弹窗   
*/
export const cjRequest =  (parmas, state) => {
	if(!store.state.loginValue && state!==2){
		let loginValue = uni.getStorageSync("loginData");
		if (loginValue){
			let data = JSON.parse(loginValue)
			if(!data.defaultArchives){
				if(!store.state.showModalState && state!==3){
					store.commit('SET_SHOW_MODAL_STATE', true);
					return login.loginData(state)
				}else{
					return Promise.reject(false);
				}
				
			}else {
				store.commit('SET_LOGIN_VALUE', true);
				return request(parmas,state)
			}
		} else{
			if(!store.state.showModalState && state!==3){
				store.commit('SET_SHOW_MODAL_STATE', true);
				return login.loginData(state)
			}else{
				return Promise.reject(false);
			}
		}
	}else{
		return request(parmas,state)
	}
}

// const BASE_URL = "https://www.chinzsoft.com/api/mobile/";
// const BASE_URL = "https://aiwz.sdtyfy.com:8099/prod-api/mobile/";

// function request() {
// 	let { 
// 		url, 
// 		method = 'GET',
// 		header = {},
// 		data = {},
// 	} = obj;
	
// 	url = BASE_URL+url;
// 	header['Authorization'] = 'lwt9311';
	
// 	// 使用promise封装方法
// 	return new Promise((resolve,reject) => {
// 		uni.request({
// 			url,
// 			method,
// 			header,
// 			data,
// 			success: res => {
// 				if (res.data.errCode == 0) {
// 					resolve(res.data)
// 				} else if (res.data.errCode == 400) {
// 					uni.showModal({
// 						title:'错误提示',
// 						content: res.data.errMsg,
// 						showCancel:false
// 					})
// 					resolve(res.data)
// 				} else {
// 					uni.showToast({
// 						title:res.data.errMsg,
// 						icon:"none"
// 					})
// 					reject(res.data)
// 				}
// 			},
// 			fail: err => {
// 				reject(err)
// 			}
// 		});
// 	})
	
// }

function request(parmas,state){
	return new Promise((resolve, reject) => {
		// 基础url
		const baseUrl = "https://www.chinzsoft.com/api/mobile/";
		// const baseUrl = "https://aiwz.sdtyfy.com:8099/prod-api/mobile/"
		if(!state){
			requestCount++;
			uni.showLoading({
				title:'加载中'
			})
		}
		wx.request({
				...parmas,
				url: baseUrl + parmas.url,
				success: (result) => {
				if(!state){
					requestCount--;
					if(!requestCount){
						uni.hideLoading()
					}
				}
						resolve(result)
				},
				fail: (err) => {
						reject(err)
				},
			 
		}); 
	})
}
 