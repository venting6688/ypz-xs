<template>
	<view class="doctorsDetails">
		<bar v-if="footData.patientName" />
		<view class="middle">
			<view class="center">
				<view class="datum">
					<view class="img">
						<image :src="doctor.DoctorImg" v-if="doctor.DoctorImg" mode="aspectFit"></image>
						<image src="../../static/image/doctor.png" mode="" v-else></image>
					</view>
					<view class="message">
						<view class="name">
						    <text>{{doctor.DoctorName||''}}</text>
						    <text>{{doctor.DoctorSessType||''}}</text>
					    </view>
						<view class="synopsis">{{doctor.DoctorSpec ? doctor.DoctorSpec : '暂无简介'}}</view>
					</view>
				</view>
				<view class="information">
					<view>
						<text>就诊科室</text>
						<text>{{doctor.clinic || ''}}</text>
					</view>
					<view>
						<text>科室地点</text>
						<text>{{doctor.AdmitAddress}}</text>
					</view>
					<view>
						<text>诊查费</text>
						<text class="money">￥{{doctor.Fee || '0'}}</text>
					</view>
					<view>
						<text>就诊日期</text>
						<view class="time">
							<!-- <text class="twoDays">两天后</text> -->
						    <text>{{doctor.ServiceDate||''}} {{doctor.SessionName||''}}</text>
						</view>
					</view>
					<view>
						<text>就诊时间</text>
						<view class="time">
							<text>{{doctor.StartTime||''}}-{{doctor.EndTime||''}}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="me">
				<view class="title">
					就诊人
				</view>
				<view class="name">
					<text>{{footData.patientName ? footData.patientName:''}}</text>
				</view>
			</view>
			<view class="tips">
				<view class="tips-head">
					温馨提示
				</view>
				<view class="tips-middle">
					<view v-for="(item,index) in tipsList" :key="index">
						<text>★</text>
						<text>{{item}}</text>
					</view>
				</view>
			</view>
			<view class="btn">
				<view class="btnStyle bigBtn" @click="confirm">
					<text>确定预约</text>
				</view>
				<view class="agreement">
					<view @click="agreementState = !agreementState">
					<image v-if="agreementState" src="../static/image/icon-ok.png" mode=""></image>
					<text v-else class="yuan"></text>
					<text>预约即同意</text>
					</view>
					<text class="blue" @click="appointment">《预约须知》</text>
				</view>
			</view>
		</view>
		<Toast v-if="toastObj.state" @back="closeToast" :type="toastObj.type" :url="toastObj.url" :tips="toastObj.tips" :message="toastObj.message" />
	</view>
</template>

<script>
	import dayjs from 'dayjs';
	import { mapState } from 'vuex'
	import login from '@/utils/login.js'
	import bar from '../components/bar.vue'
	import Toast from '../components/toast.vue'
	import registrationApi from '@/api/registrationApi.js'
	import healthCard from '@/api/healthCard.js'
	export default {
		components:{
			Toast,
			bar
		},
		data() {
			return {
				doctor:{
					ServiceDate:'',
					hour:'',
					DoctorName:'',
					DoctorSessType:'',
					Fee:'',
					clinic:'',
					StartTime:'',
					EndTime:''
				},
				toastObj:{
					state:false,
				},
				agreementState:false,
				departmentName: '',
				tipsList:[
					'请使用患者本人身份证和医保卡(或医保电子凭证)进行预约挂号，儿童请用儿童身份证或身份信息。',
					'如需取消预约，请在就诊前一日取消。',
					'请按照候诊时间提示到医院等待就诊，请勿迟到根据国家医保政策规定，医保患者住院期间一律不得使用医保账户支付门诊费用，否则将影响住院费用的医保报销结算。',
					'同一身份证号码，30天内总计爽约5次，进入黑名单14天，14天内不能预约就诊，可以现场挂号，14天后黑名单自动解除。黑名单触发三次以上拉黑90天。'
				],
				parentName: [
					{name: '内科', index: '0300'},
					{name: '外科', index: '0400'},
					{name: '妇产科', index: '0500'},
					{name: '儿科', index: '0700'},
					{name: '眼科', index: '1000'},
					{name: '皮肤科', index: '1301'},
					{name: '耳鼻咽喉科', index: '1100'},
					{name: '口腔科', index: '1200'},
					{name: '心理科', index: '1506'},
					{name: '全科医学科', index: '0200'},
					{name: '美容整形门诊', index: '1400'},
					{name: '地方病科', index: '1800'},
				],
				loginData: {},
			}
		},
		computed: { 
			...mapState(['footData']),
		},
		methods: {
			closeToast(state){
				this.toastObj = {
					state:state,
				}
			},
			appointment(){
				uni.navigateTo({
					url:`/sub_packages/agreement/appointment`
				})
			},
			confirm(){
				if(!this.agreementState){
					uni.showToast({
					    title: '请先阅读预约须知',
					    icon: 'none',   
					    duration: 2000 
					}) 
					 return
				}
				let loginValue = uni.getStorageSync("loginData");
				if (!loginValue) {
					login.loginData().catch((error) => {});
				} else {
					let data = JSON.parse(loginValue)
					if(this.doctor.today){
						// 当天预约
						this.today(data)
					} else{
						// 其他时间预约
						this.otherTime(data)
					}
					//用卡检测数据接口（电子健康卡）
					let department = '';
					let filterRes = this.parentName.filter(x => x.name == this.departmentName);
					if (filterRes.length > 0) {
						department = filterRes[0].index;
					} else {
						department = '1800'
					}
					
					let healthCardData = {
						qrCodeText: this.footData.qrCodeText,
						time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
						hospitalCode: '40237',
						scene: '0101011',
						department,
						cardType: '11',
						cardChannel: '0402',
						cardCostTypes: '0100',
					}
					healthCard.reportHISData(data.xcxOpenId, healthCardData).then(healthRes => {
					});
					
				}
			},
			today(data){
				if (this.doctor.Fee === '') {
					let msg = {
						patientID: this.footData.patientUniquelyIdentifies, //'0000111227',
						patientCard: this.footData.patientCard, //'370921198210254828',
						patientName:this.footData.patientName,
						cardType: this.footData.cardTypeCode,
						scheduleItemCode:this.doctor.scheduleItemCode,
						startTime:this.doctor.StartTime,
						endTime:this.doctor.EndTime,
						amount: 0,
					}
					registrationApi.freeForThreeDays(msg).then(res => {
						if(res.data.code===200) {
							this.toastObj = {
								state:true,
								message:'预约成功',
								url:'/pages/convenient/index',
								tips:'秒自动为您切换便捷导引',
							}
						}
					});
				} else {
					let msg = {
						patientID:this.footData.patientUniquelyIdentifies,
						patientName:this.footData.patientName,
						scheduleItemCode:this.doctor.scheduleItemCode,
						startTime:this.doctor.StartTime,
						endTime:this.doctor.EndTime,
						amount: this.doctor.Fee,
						patientOpenid:data.xcxOpenId,
					}
					registrationApi.registrationPreOrder(msg).then(res => {
						if(res.data.code===200) {
							let obj = res.data.data.prePayResponse
							let registrationPrePayResponse = res.data.data
							registrationPrePayResponse.patientCard = data.defaultArchives.patientCard
							registrationPrePayResponse.cardType = data.defaultArchives.cardTypeCode
							uni.requestPayment({
								provider: 'wxpay', // 服务提提供商
								timeStamp: obj.body.miniPayRequest.timeStamp, // 时间戳
								nonceStr: obj.body.miniPayRequest.nonceStr, // 随机字符串
								package: obj.body.miniPayRequest.pkg,
								signType: obj.body.miniPayRequest.signType, // 签名算法
								paySign: obj.body.miniPayRequest.paySign, // 签名
								success:(result)=> {
									registrationApi.queryPayResult(registrationPrePayResponse).then(r => {
										this.toastObj = {
											state:true,
											message:'预约成功',
											url:'/pages/convenient/index',
											tips:'秒自动为您切换便捷导引',
										}
									})
									.catch(err => {
										console.log('errrrrr：', err);
									})
								},
								fail:(err)=> {
									let unLockNumData = {
										patientID:res.data.data.patientID,
										scheduleItemCode:res.data.data.lockNumResponse.scheduleItemCode,
										lockQueueNo:res.data.data.lockNumResponse.lockQueueNo,
										transactionId:res.data.data.lockNumResponse.transactionId,
									}
									registrationApi.unLockNum(unLockNumData).then(r => {
										this.toastObj = {
											state:true,
											type:'fail',
											message:'支付失败'
										}
										
									})
								}
							});	
							
						}else {
							this.toastObj = {
								state:true,
								type:'fail',
								message:res.data.msg?res.data.msg:'',
							}
						}
					})
					.catch(err => {
						console.log('errrrrr：', err);
					})
				}
			},
			otherTime(data){
				// 其他时间预约
				let obj = {
				    patientID: this.footData.patientUniquelyIdentifies,
				    idTypeCode: data.defaultArchives.idTypeCode,
				    cardNo: data.defaultArchives.patientCard,
				    cardType: data.defaultArchives.cardTypeCode,
				    scheduleItemCode:this.doctor.scheduleItemCode,
				    timeFrame: `${this.doctor.StartTime}-${this.doctor.EndTime}`,
				}
				registrationApi.appointmentRegister(obj).then(res => {
					if(res.data.code===200){
						this.toastObj = {
							state:true,
							message:'预约成功',
							url:'/pages/convenient/index',
							tips:'秒自动为您切换便捷导引',
						}
					}else {
						this.toastObj = {
							state:true,
							type:'fail',
							message:res.data.msg?res.data.msg:'',
						}
					}
				})
				.catch(err => {
					console.log('2：', err);
				})
			},
			timeBtn(item){
				this.timevisitTable = item
				// uni.navigateBack({
				//     delta: 2
				// });
			},
		},
		onLoad(e) {
			wx.setNavigationBarTitle({
			  title: e.title
			})
			this.doctor = JSON.parse(decodeURIComponent(e.doctor))
			this.departmentName = e.department;
		},
	}
</script>

<style lang="less" scoped>
    .doctorsDetails {
	    width: 100vw;
	    height: 100%; 
	    background-color: #f5f5f5;
	    display: flex;
		// align-items: center;
	    flex-direction: column;
		
		.middle {
			overflow: auto;
			.center {
				width: 680rpx;
				height: 480rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				margin: 25rpx auto;
				.datum{
					margin:0 10rpx;
					padding: 17rpx 0;
					display: flex;
					
					.img{
						width: 122.14rpx;
						height: 152.67rpx;
						border-radius: 9.54rpx;
						image{
							width: 122.14rpx;
							height: 152.67rpx;
							border-radius: 9.54rpx;
						}
					}
					.message {
						margin-left:24rpx;
						padding-top: 15rpx;
						.name {
							display: flex;
							align-items: center;
							position: relative;
							text {
								
								&:nth-of-type(1){
									font-size: 36rpx;
									line-height: 27rpx;
									margin-right: 20rpx;
								}
								&:nth-of-type(2){
									font-size: 30rpx;
									line-height: 23rpx;
									color: #999999;
									margin-right: 20rpx;
								}
							}
						}
						.synopsis {
							width: 508rpx;
							height: 99rpx;
							margin-top: 18rpx;
							font-size: 23rpx;
							line-height: 26rpx;
							color: #999999;
							overflow: hidden;
							display: -webkit-box; //将元素设为盒子伸缩模型显示
							-webkit-box-orient: vertical; //伸缩方向设为垂直方向
							-webkit-line-clamp: 4;  //超出3行隐藏，并显示省略号
							
						}
					}
				}
				.information {
					> view {
						display: flex;
						justify-content: space-between;
						align-items: center;
						font-size: 30rpx;
						margin: 16rpx 20rpx;
						
						> text {
							&:first-child{
								color: #999999;
							}
						}
						.money{
							color: #FFC03D;
						}
						.time {
							display: flex;
							align-items: center;
							color: #4286FF;
							text {
								margin-left: 20rpx;
							}
							
							.twoDays {
								width: 64.89rpx;
								height: 26.72rpx;
								background: #fffaf0;
								border-radius: 17.18rpx;
								color: #FFC03D;
								font-size: 15.27rpx;
								display: flex;
								justify-content: center;
								align-items: center;
							
							}
							
							image {
								width: 27rpx;
								height: 27rpx;
								margin-left: 10rpx;
							}
						}
						
					}
				}
			}
			.me {
				width: 680rpx;
				height: 72rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				margin: 25rpx auto;
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 27rpx;
				
				>.title {
					color: #999999;
					line-height: 27rpx;
					margin-left: 20rpx;
				}
				>.name {
					margin-right: 20rpx;
					color: #4286ff;
					display: flex;
					align-items: center;
					
					text {
						line-height: 27rpx;
					}
					
					image {
						width: 27rpx;
						height: 27rpx;
						margin-left: 10rpx;
					}
				}
			}
			.tips {
				width: 680rpx;
				height: 500rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				margin: 25rpx auto;
				
				.tips-head {
					margin: 20rpx 15rpx;
					padding-top: 20rpx;
				}
				
				.tips-middle {
					> view {
						margin: 20rpx 15rpx;
						display: flex;
						font-size: 22.9rpx;
						line-height: 40 rpx;
						
						&:first-child{
							color: #FFC03D;
						}
						
						text {
							&:first-child{
								margin-right: 14rpx;
							}
						}
					}
				}
			}
			.btn {
				width: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				.agreement {
					display: flex;
					align-items: center;
					justify-content: center;
					color: #999999;
					margin-top: 30rpx;
					
					>view {
						display: flex;
						align-items: center;
						justify-content: center;
						.yuan{
							width: 26rpx;
							height: 26rpx;
							border: 2rpx solid #999999;
							border-radius: 50%;
							margin-right: 15rpx;
						}
						image {
							width: 32rpx;
							height: 32rpx;
							margin-right: 12rpx;
						}
					}
					
					
					.blue {
						color: #076AFF;
					}
					
				}
			}
			
		}
		
	}
</style>
