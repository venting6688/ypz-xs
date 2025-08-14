
 
import { cjRequest } from '@/utils/service.js'
 
 
const patient = {
	/**
		 * 获取手机验证码
	*/
	   async sendVerificationCode(phoneNum) {
	   	const res = await cjRequest({
	   		url: "sendVerificationCode",
	   		method: "get",
	   		data:{
	   		    phoneNum:phoneNum,
	   		}
	   
	   	},2)
	   	return res
	   },
	   /**
	   	 * 建档
	   */
	      async Filing(filingDTO) {
	      	const res = await cjRequest({
	      		url: "Filing",
	      		method: "post",
	      		data:filingDTO,
	      		
	      
	      	},2)
	      	return res
	      },
		/**
			 * 家庭管理添加成员
		*/
		async queueFilingInfo(filingDTO) {
			const res = await cjRequest({
				url: "queueFilingInfo",
				method: "post",
				data:filingDTO,
				
		 
			},2)
			return res
		},
		//获取职业、婚姻、证件类型、关系
		async getInforCategory(type) {
			const res = await cjRequest({
				url: "dict/data/type/"+type,
				method: "get",
			}, 2)
			return res
		},
		async replenishArchives(data) {
			const res = await cjRequest({
				url: "replenishArchives",
				method: "PUT",
				data,
			}, 2)
			return res
		},

}
 
export default patient