import login from './login.js'
let requestCount = 0
export const cjRequest = (parmas,state) => {
	return new Promise((resolve, reject) => {
	    // 基础url
	    const baseUrl = "https://www.chinzsoft.com/api/mobile/"
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
 