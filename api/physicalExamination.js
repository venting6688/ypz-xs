import { cjRequest } from '@/utils/service.js'

const patient = {
	async getPhysicalExaminationPackageType(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `getPhysicalExaminationPackageType?${queryParams}`,
			method: "get",
		})
		return res
	},
	
	async getPhysicalExaminationPackageList(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		
		const res = await cjRequest({
			url: `getPhysicalExaminationPackageList?${queryParams}`,
			method: "get",
		})
		return res
	},
	
	async getPhysicalExaminationPackageDetail(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		
		const res = await cjRequest({
			url: `getPhysicalExaminationPackageDetail?${queryParams}`,
			method: "get",
		})
		return res
	},
	
	async addPhysicalExaminationRecord(data) {
		const res = await cjRequest({
			url: `addPhysicalExaminationRecord`,
			method: "POST",
			data
		})
		return res
	},
	
	async physicalExaminationPersonList(openId) {
		const res = await cjRequest({
			url: `physicalExaminationPersonList?openId=${openId}`,
			method: "get",
		})
		return res
	},
	
	async getAllMedicalExamStations(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `getAllMedicalExamStations?${queryParams}`,
			method: "get",
		})
		return res
	},
	
	async getAllMedicalExamItems(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `getAllMedicalExamItems?${queryParams}`,
			method: "get",
		})
		return res
	},

}

export default patient