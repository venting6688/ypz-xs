
 
import { cjRequest } from '@/utils/service.js'
 
 
const patient = {

	   async getPhoneNumber(data) {
	   	const res = await cjRequest({
	   		url: "XCXLogin",
	   		method: "get",
	   		data:{
				phoneCode:data.phoneCode,
	   		    openidCode:data.openidCode, 
	   		}
	   
	   	})
	   	return res
	   },
}
 
export default patient