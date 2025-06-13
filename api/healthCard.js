import { cjRequest } from '@/utils/service.js'

const healthCard = {
	//验证授权
	async registerHealthCardPreAuth(data) {
		const res = await cjRequest({
			url: "healthCardOpenPlatform/registerHealthCardPreAuth",
			method: "post",
			data
		}, 2)
		return res
	},
	
	//注册就诊人
	async registerHealthCardPreFill(data, query) {
		const queryParams = Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/registerHealthCardPreFill?${queryParams}`,
			method: "post",
			data
		}, 2)
		return res
	},
	
	//获取就诊人信息
	async getHealthCardByHealthCode(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/getHealthCardByHealthCode?${queryParams}`,
			method: "get",
		}, 2)
		return res
	},
	
	//健康卡建档
	async filingForHealthCard(data) {
		const res = await cjRequest({
			url: "healthCardOpenPlatform/filingForHealthCard",
			method: "post",
			data
		}, 2)
		return res
	},
	
	//存储健康卡
	async addHealthCard(data) {
		const res = await cjRequest({
			url: "healthCardOpenPlatform/addHealthCard",
			method: "post",
			data
		}, 2)
		return res
	},
	
	//获取健康卡列表
	async queueFilingInfo(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/queryTheListOfArchives?${queryParams}`,
			method: "get",
		}, 2)
		return res
	},
	
	//删除健康卡
	async deleteThePatient(data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `deleteThePatient?${queryParams}`,
			method: "delete",
		}, 2)
		return res
	},
	
	//设置默认就诊人
	async updateDefaultArchives(data) {
		const res = await cjRequest({
			url: "healthCardOpenPlatform/updateDefaultArchives",
			method: "post",
			data
		}, 2)
		return res
	},
	
	//人脸识别获取就诊人信息
	async getOrderInfoByOrderId (data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/getOrderInfoByOrderId?${queryParams}`,
			method: "get",
		}, 2)
		return res
	},
	
	//获取人脸识别结果
	async registerRealPersonAuthOrder (data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/registerRealPersonAuthOrder?${queryParams}`,
			method: "get",
		}, 2)
		return res
	},
	
	//实人验证获取orderid
	async registerUniformVerifyOrder (data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/registerUniformVerifyOrder?${queryParams}`,
			method: "get",
		}, 2)
		return res
	},
	
	//实人验证结果
	async checkUniformVerifyResult (data) {
		const queryParams = Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
		const res = await cjRequest({
			url: `healthCardOpenPlatform/checkUniformVerifyResult?${queryParams}`,
			method: "get",
		}, 2)
		return res
	},
	
	//用卡数据检测
	async reportHISData (id, data) {
		const res = await cjRequest({
			url: `healthCardOpenPlatform/reportHISData?openid=${id}`,
			method: "post",
			data
		}, 2)
		return res
	},
	
}

export default healthCard