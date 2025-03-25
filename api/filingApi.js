
 
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
	   
	   	})
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
	      		
	      
	      	})
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
		   		
		   
		   	})
		   	return res
		   },
}
 
export default patient