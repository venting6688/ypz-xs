<template>
	<view class="box">
		<!-- <bar v-if="loginData.defaultArchives" /> -->
		<date @handle="show" />
		<view class="information">
			<ul v-if="list.length">
				<li v-for="(item,index) in list" :key="index">
					<view class="center">
						<view class="detail">
							<view class="no">
								<text>就诊医生：</text>
								<text>{{item.doctorName}}({{item.doctorTitle}})</text>
							</view>
							<view class="no" style="color: #4286ff;">{{item.treatmentStatus}}</view>
						</view>
						<view class="detail">
							<view class="no">
								<text>就诊科室：</text>
								<text>{{item.queueName}}</text>
							</view>
							<view class="no">
								<text>挂号费：</text>
								<text style="color: #de9552;">{{(item.regFee).trim()}}</text>
							</view>
						</view>
						<view class="no">
							<text>{{item.appointmentTime ? '就诊' : '预约'}}时间：</text>
							<text style="color: #4286ff;">{{item.appointmentTime ? item.appointmentTime : item.admitDate}}</text>
						</view>
					</view>
					<view class="bottom">
						<view @click="information(item)" >查看详情</view>
						<view v-if="item.returnFlag == 'Y'" @click="cancelRegistration(item)">申请退号</view>
						<view v-else style="color: #de9552;">{{item.returnMsg}}</view>
					</view>
				</li>
			</ul>
			<view v-else class="without">
				<image src="../static/image/wu.png" mode="widthFix"></image>
			</view>
		</view>
		<Toast v-if="toastObj.state" @back="closeToast" :type="toastObj.type" :message="toastObj.message"/>
	</view>
</template>

<script>
	import dayjs from 'dayjs';
	import { mapState } from 'vuex'
	import bar from '../components/bar.vue'
	import date from '../components/date.vue'
	import Toast from '../components/toast.vue'
	import elseApi from '@/api/elseApi.js'
	import guideApi from '@/api/guideApi.js'
	import subMessage from '@/utils/subscribe.js'
	
	export default {
		components:{
			bar,
			date,
			Toast
		},
		data(){
			return {
				list:[],
				date:{
					startTime: '',
					endTime: ''
				},
				loginData: {},
				toastObj:{
					state:false,
				},
			}
		},
		onLoad() {
			let data = uni.getStorageSync('loginData');
			this.loginData = data ? JSON.parse(data) : {};
		},
		computed: {
			...mapState(['footData']),
		},
		
		methods: {
			closeToast(state){
				this.toastObj.state = state
			},
			show(time){
				const datePattern = /^\d{4}-\d{2}-\d{2}$/.test(time.startTime);
				if(datePattern){
					this.date = time
					this.getVisitRecord()
				}
			},
			getVisitRecord(){
				try {
					uni.showLoading({
					  title: '加载中...',
					  mask: true 
					})
					let data = {
						patientID: this.footData.patientUniquelyIdentifies,
						startDate:this.date.startTime,
						endDate:this.date.endTime,
					}
					let now = dayjs().format('YYYY-MM-DD HH:mm:ss');
					elseApi.getVisitRecord(data).then(res => {
						if(res.data.code === 200){
							uni.hideLoading()
							let resData = res.data.data.orders.order || [];
							resData.sort((a,b) => b.admitDate.localeCompare(a.admitDate))
							resData.map(v => {
								v.treatmentStatus = '';
								let timeRange = v.appointmentTime;
								if (timeRange != "") {
									let match = timeRange.match(/^(.+?) (.+?)-(.+)$/);
									let startTime = `${match[1]} ${match[2]}`;
									let endTime = `${match[1]} ${match[3]}`;
									let isWithinCurrentTime = now >= startTime && now <= endTime;
									v.treatmentStatus = v.returnFlag == 'Y' ? (isWithinCurrentTime ? '待就诊' : '未就诊') : '已就诊'
								}
							})
							this.list = resData;
						} else {
							uni.hideLoading()
							this.list = []
						}
					})
				} catch (error) {
					uni.hideLoading()
					console.log(error)
				}
			},
			
			// 退号 & 退费 + 订阅消息
			cancelRegistration(val) {
			  try {
					let refundTmplIds = [
					  'Fiv9HSnHU_-AKIECUvwuCS1SSBq9hsiUctlPuboV95Q', // 退号成功
					];
			    const cancelParams = {
			      doctor: val.doctorName,
			      department: val.queueName,
			      admitDate: val.admitDate,
			      patName: val.patientName,
						visitNum: val.visitNumber,
			      openId: this.loginData.xcxOpenId,
			    };
			    // 退号接口 + 退号订阅消息一起触发
			    subMessage.subscribeRegisterNotice(
			      refundTmplIds,
			      { [refundTmplIds[0]]: guideApi.cancelRegistration }, 
			      { [refundTmplIds[0]]: cancelParams },
			      cancelParams
			    ).then((res) => {
						const templateId = refundTmplIds[0];
						let resData = res.responses?.[templateId]?.result?.data;
						if (resData.data.cancelRegistrationResponse.returnFee != '0') {
							resData.data.patientID = this.footData.patientUniquelyIdentifies;
							resData.data.cardNo = this.footData.patientCard;
							resData.data.cardType = this.footData.cardTypeCode;
							resData.data.openid = this.loginData.xcxOpenId;
							this.callApiWithRetry(resData.data).then((r) => {
								this.toastObj = {
									state:true,
									message:'退号成功',
								}
								this.getVisitRecord();
							});
						  // 退费订阅消息
							// let refundFee = {
							// 	...data.data,
							// 	patientID: this.footData.patientUniquelyIdentifies,
							// 	cardNo: this.footData.patientCard,
							// 	cardType: this.footData.cardTypeCode,
							// 	openid: this.loginData.xcxOpenId
							// }
							// console.log(JSON.stringify(refundFee),'refundFee===============');
						 //  subMessage.subscribeRegisterNotice(
						 //    refundTmplIds,
						 //    { [refundTmplIds[1]]: guideApi.queryRefundResult },
						 //    { [refundTmplIds[1]]: refundFee },
						 //    refundFee
						 //  ).then((feeRes) => {
							// 	console.log(JSON.stringify(feeRes),'++++++++++++++++');
							// 	this.toastObj = {
							// 	  state: true,
							// 	  message: '退号成功',
							// 	};
							// 	this.getVisitRecord();
							// });
						} else {
							this.toastObj = {
								state:true,
								message:'退号成功',
							}
							this.getVisitRecord();
						}
					});
			  } catch (err) {
			    console.error('退号/退费异常', err);
			    this.toastObj = {
			      state: true,
			      type: 'fail',
			      message: '退号失败，请稍后重试',
			    };
			  }
			},
			
			//退号查询
			async callApiWithRetry(data, maxRetry = 5) {
			  let retryCount = 0;
			  while (retryCount < maxRetry) {
			    try {
			      const res = await guideApi.queryRefundResult(data);
			      if (res.data.code !== 999) {
			        return res.data;
			      }
			      // 如果是999状态码，增加重试计数
			      retryCount++;
			      // 等待1秒后继续下一次循环
			      await new Promise(resolve => setTimeout(resolve, 1000));
			    } catch (e) {
			      this.toastObj = {
			        state: true,
			        type: 'fail',
			        message: e.toString(),
			      };
			      // 异常直接抛出
			      throw e;
			    }
			  }
			  
			  // 达到最大重试次数仍返回999
			  throw new Error('达到最大重试次数');
			},
			
			information(item){
				let data = {...this.date,...item}
				uni.navigateTo({
					url: `/sub_packages/record/details?item=${encodeURIComponent(JSON.stringify(data))}`
				})
			}
		},
	}
</script>

<style lang="less" scoped>
	.box {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		
		.information {
			width: 100%;
			overflow: auto;
			margin-bottom: 50rpx;
			ul {
				width: 681.3rpx;
				margin: 0 auto;
				> li {
					width: 681.3rpx;
					padding: 15rpx 0 0;
					background: #ffffff;
					border-radius: 15.27rpx;
					margin-top: 30rpx;
					&:first-child{
						margin: 0;
					}
					
					.center {
						margin: 0 20rpx;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						.detail {
							display: flex;
							justify-content: space-between;
							align-items: center;
						}
						.no {
							padding: 8rpx 0;
							text {
								&:nth-child(1){
									color: #999999;
								}
								&:nth-child(2){
									color: #333333;
								}
							}
						}
					}
					.bottom {
						color: #4286ff;
						margin: 20rpx 20rpx 0;
						padding: 25rpx 0;
						border-top: 2px dashed #ccc;
						display: flex;
						justify-content: space-between;
						align-items: center;
						
					}
				}
			}
			.without {
				font-size: 40rpx;
				width: 681.3rpx;
				height: 500rpx;
				background: #ffffff;
				margin: 0 auto;
				border-radius: 15.27rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				image {
					width: 75%;
				}
			}
		}
		
	}
</style>