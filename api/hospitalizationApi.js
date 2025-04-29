import { cjRequest } from '@/utils/service.js'

const patient = {
	//获取患者预约住院信息
	async getHospitalization(patientID) {
		const res = await cjRequest({
			url: "HospitalizationAppointment/getAppointment?patientID="+patientID,
			method: "get",
		})
		return res
	},
	
	// async getHospitalization(patientID) {
	// 	const res = await cjRequest({
	// 		url: "HospitalizationAppointment/admissionRegistration?patientID="+patientID,
	// 		method: "get",
	// 	})
	// 	return res
	// },

	//获取患者获取住院记录
	async getHospitalRecord(patientID) {
		const res = await cjRequest({
			url: "hospitalizedInformation/getHospitalRecord?patientID="+patientID,
			method: "get",
		})
		return res
	},
	
	//获取住院详细信息
	async getHospitalRecordDetail(id) {
		const res = await cjRequest({
			url: "hospitalizedInformation/getHospitalRecordDetail?AdmId="+id,
			method: "get",
		})
		return res
	},
	
	//获取住住院事项
	async getMattersRecord(data) {
		const queryParams = Object.keys(data)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');
		
		const res = await cjRequest({
			url: `HospitalizationMatters/matters?${queryParams}`,
			method: "get",
		})
		return res
	},
	
	


}
 
export default patient