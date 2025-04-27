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
	
	//获取患者获取住院记录
	async getHospitalRecord(patientID) {
		const res = await cjRequest({
			url: "hospitalizedInformation/getHospitalRecord?patientID="+patientID,
			method: "get",
		})
		return res
	},
}
 
export default patient