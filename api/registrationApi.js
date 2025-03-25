
 
import { cjRequest } from '@/utils/service.js'
 
 
const patient = {
	// 获取所有服务组(大科室)
	async getServiceGroup(data) {
	   	const res = await cjRequest({
	   		url: "getServiceGroup",
	   		method: "get",
	   	})
	   	return res
	},
	// 获取所有专业组(小科室)
	async getSpecialtyGroup(cliSerGroupID) {
	   	const res = await cjRequest({
	   		url: "getSpecialtyGroup",
	   		method: "get",
			data:{
			cliSerGroupID: cliSerGroupID,
			},
	   	})
	   	return res
	},
	// 获取7天号源
	async getScheduleDates(data) {
	   	const res = await cjRequest({
	   		url: "getScheduleDates",
	   		method: "get",
			data:{
			patientID: data.patientID,
			days: data.days,
			specialtyGroupId: data.specialtyGroupId,
			},
	   	})
	   	return res
	},
	// 获取医生
	async getScheduleDetail(data) {
	   	const res = await cjRequest({
	   		url: "getScheduleDetail",
	   		method: "get",
			data:{
			patientID: data.patientID,
			dateStr: data.dateStr,
			specialtyGroupId: data.specialtyGroupId,
			},
	   	})
	   	return res
	},
	// 其他时间预约
	async appointmentRegister(data) {
		const queryParams = Object.keys(data)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');
		const url = `appointmentRegister?${queryParams}`;
	   	const res = await cjRequest({
	   		url: url,
	   		method: "post",
	   	})
	   	return res
	},
	// 获取医生号源
	async getNumSource(data) {
	   	const res = await cjRequest({
	   		url: "getNumSource",
	   		method: "get",
			data:{
			patientID: data.patientID,
			dateStr: data.dateStr,
			scheduleItemCode: data.scheduleItemCode,
			},
	   	})
	   	return res
	},
	// 拉起支付
	async registrationPreOrder(data) {
	   	const res = await cjRequest({
	   		url: "registrationPreOrder",
	   		method: "get",
			data:{
			patientID: data.patientID,
			patientName: data.patientName,
			scheduleItemCode: data.scheduleItemCode,
			startTime:data.startTime,
			endTime:data.endTime,
			amount:data.amount,
			patientOpenid:data.patientOpenid,
			},
	   	})
	   	return res
	},
	// 查询支付结果
	async queryPayResult(registrationPrePayResponse) {
	   	const res = await cjRequest({
	   		url: "queryPayResult",
	   		method: "post",
			data:registrationPrePayResponse,
	   	})
	   	return res
	},
	// 取消锁号
	async unLockNum(data) {
		const queryParams = Object.keys(data)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');
		const url = `unLockNum?${queryParams}`;
	   	const res = await cjRequest({
	   		url: url,
	   		method: "post",
	   	})
	   	return res
	},
}
 
export default patient