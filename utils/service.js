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

const baseUrl = "https://www.chinzsoft.com/api/mobile/";
// const baseUrl = "https://aiwz.sdtyfy.com:8099/prod-api/mobile/"

function request(parmas,state){
	let header = { "Authorization": store.state.loginToken };
	
	return new Promise((resolve, reject) => {
		if(!state){
			requestCount++;
			uni.showLoading({
				title:'加载中'
			})
		}
		uni.request({
			url: baseUrl + parmas.url,
			method: parmas.method,
			header,
			data: parmas.data,
			success: res => {
				if(!state){
					requestCount--;
					if(!requestCount){
						uni.hideLoading()
					}
				}
				resolve(res)
			},
			fail: err => {
				reject(err)
			}
		});
	})
}
 