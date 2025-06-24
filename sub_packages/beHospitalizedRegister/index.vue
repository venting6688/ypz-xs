<template>
	<view class="register">
		<bar v-if="footData.patientUniquelyIdentifies" />
		<view class="application" v-if="isHospitalization">
			<view class="head">住院信息</view>
			<view class="middle">
				<view>
					<text>登记号:</text>
					<text>{{patientID}}</text>
				</view>
				<view v-if="register">
					<text>预交金额:</text>
					<text>￥{{preHospitalization.depositAmount ? parseFloat(preHospitalization.depositAmount).toFixed(2) : 0}}元</text>
				</view>
				<view v-if="register">
					<text>余额:</text>
					<text>￥{{preHospitalization.depositBalance ? parseFloat(preHospitalization.depositBalance).toFixed(2) : 0}}元</text>
				</view>
				<!-- <view>
					<text>就诊日期:</text>
					<text>{{preHospitalization.admDate}}</text>
				</view> -->
				<view>
					<text>住院科室:</text>
					<text>{{preHospitalization.admDepDesc ? preHospitalization.admDepDesc : preHospitalization.admDept}}</text>
				</view>
				<view>
					<text>住院病区:</text>
					<text>{{preHospitalization.admWardDesc ? preHospitalization.admWardDesc : preHospitalization.currWard}}</text>
				</view>
				<view>
					<text>病床号:</text>
					<text>{{preHospitalization.bed}}</text>
				</view>
				<view>
					<text>临床诊断:</text>
					<text>{{preHospitalization.diagnosDesc ? preHospitalization.diagnosDesc : preHospitalization.inReason}}</text>
				</view>
			</view>
		</view>
		<view class="content" v-if="isHospitalization && !register">
			<view class="head">住院人信息</view>
			<form>
				<view class="info">
					<view class="cu-form-group">
						姓名：{{footData.patientName}}
					</view>
					<view class="cu-form-group">
						性别：{{footData.sex}}
					</view>
				</view>
				<view class="info">
					<view class="cu-form-group">
						出生日期：{{footData.dob}}
					</view>
					<view class="cu-form-group">
						手机号：{{footData.phoneNum}}
					</view>
				</view>
				
				<view class="cu-form-group" v-if="!register">
					<view class="title">姓名：</view>
					<input placeholder="请输入陪护人姓名" v-model="informationObj.foreignID" name="input" />
				</view>
				<view class="cu-form-group" v-if="!register">
					<view class="title">手机号：</view>
					<input placeholder="请输入陪护人手机号" v-model="informationObj.fPhon" maxlength="11" type="number" name="input" />
				</view>
			</form>
			<view class="btn" v-if="!register && iPBook !=''"><button class="cu-btn" @click="registerBtn">入院登记</button></view>
		</view>
		<!-- 住院充值 -->
		<view class="deposit" v-if="register || isHospitalization">
			<view class="center">
				<view class="head">住院预交金</view>
				<ul>
					<li v-for="item in priceList" :key="item" @click="priceClick(item)" :class="{borderBlue:price===item}">
						{{item}}
					</li>
				</ul>
				<view class="input">
					<view class="test">￥</view>
					<input v-model="price" @input="onInput" type="number" placeholder="输入金额" />
				</view>
			</view>
			<view class="btn" v-if="register"><button class="cu-btn" @click="recharge">立即充值</button></view>
		</view>
		
		<view v-if="!isHospitalization" class="application">
			<image src="https://aiwz.sdtyfy.com:8099/img/wu.png" mode="widthFix"></image>
		</view>
	</view>
	
</template>

<script>
	import { mapState } from 'vuex';
	import mixin from '@/mixins/mixin.js'
	import bar from '../components/bar.vue'
	import hospitalizationApi from '@/api/hospitalizationApi.js'
	export default {
		mixins: [mixin],
		components:{ bar },
		data (){
			return {
				register: false,
				isHospitalization: false,
				preHospitalization: {},
				iPBook: '',
				patientID: '',
				informationObj: {
					foreignID: '',
					fPhon: '',
				},
				toastObj:{
					state:false,
				},
				priceList:[300,500,1000],
				price: 300,
				adminID: '',
			}
		},
		computed: {
			...mapState(['footData','department']),
		},
		mounted() {
			this.getHospitalRecord()
			this.getHospitalization()
		},
		methods: {
			closeToast(state){
				this.toastObj = {
					state:state,
				}
			},
			priceClick(item){
				this.price = item
			},
			onInput(e) {
				this.price = e.detail.value
			},
			recharge() {
				let loginValue = JSON.parse(uni.getStorageSync("loginData"));
				let data = {
					patientID: this.footData.patientUniquelyIdentifies,
					patientName: this.footData.patientName,
					amount: this.price,
					patientOpenid: loginValue.xcxOpenId,
					admID: this.adminID,
				}
				
				hospitalizationApi.hospitalDepositPrePay(data).then(res => {
					if(res.data.code == 200) {
						let resData = res.data.data
						let obj = resData.prePayResponse;
						uni.requestPayment({
							provider: 'wxpay', // 服务提提供商
							timeStamp: obj.body.miniPayRequest.timeStamp, // 时间戳
							nonceStr: obj.body.miniPayRequest.nonceStr, // 随机字符串
							package: obj.body.miniPayRequest.pkg,
							signType: obj.body.miniPayRequest.signType, // 签名算法
							paySign: obj.body.miniPayRequest.paySign, // 签名
							success:(result)=> {
								let str = {
									prePayResponse: obj,
									amount: resData.amount,
									payDate: resData.payDate,
									payTime: resData.payTime,
									patientID: this.footData.patientUniquelyIdentifies,
									admID: this.adminID,
								}
								this.callApiWithRetry(str).then((r) => {
									this.getHospitalRecord();
									this.toastObj = {
										state:true,
										message:'支付成功',
									}
								})
							},
							fail:(err)=> {
								this.toastObj = {
									state:true,
									type:'fail',
									message:'支付失败'
								}
							}
						});
					}
				})
			},
			
			async callApiWithRetry(data, maxRetry = 5) {
			  let retryCount = 0;
			  
			  while (retryCount < maxRetry) {
			    try {
			      const res = await hospitalizationApi.queryHospitalDepositPrePayResult(data);
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
			
			async registerBtn(){
				if (this.informationObj.foreignID == '' && this.informationObj.fPhon == '') {
					uni.showToast({
						title: '请先填写联系人信息',
						icon: 'none',   
						duration: 2000
					})
				} else {
					let str = {
						patientID: this.footData.patientUniquelyIdentifies,
						cardType: this.footData.cardTypeCode,
						iPBook: this.iPBook,
						foreignID: this.informationObj.foreignID,
						fPhon: this.informationObj.fPhon,
					}
					let res = await hospitalizationApi.registration(str);
					if (res.data.code === 200) {
						this.getHospitalRecord()
					}
				}
			},
			//获取住院记录
			async getHospitalRecord () {
				let data = {
					AimFlag: 'Dep',
					patientID: this.footData.patientUniquelyIdentifies,
					startDate: '',
					endDate: '',
				}
				let res = await hospitalizationApi.getHospitalRecord(data);
				if (res.data.code === 200 && res.data.data.admInfoList != null) {
					this.preHospitalization = res.data.data.admInfoList.admInfo[0];
					this.patientID = res.data.data.patientID;
					this.adminID = res.data.data.admInfoList.admInfo[0].admID;
					this.register = true;
					this.isHospitalization = true;
				}
			},
			
			//获取预住院记录
			async getHospitalization () {
				let res = await hospitalizationApi.getHospitalization(this.footData.patientUniquelyIdentifies);
				if (res.data.code === 200) {
					this.preHospitalization = res.data.data.admInfo;
					this.iPBook = res.data.data.ipBook;
					this.patientID = res.data.data.patInfo.patientID;
					this.register = false;
					this.isHospitalization = true;
				}
			},
		},
	}
	
</script>

<style lang="less" scoped>
	.register {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		
		.head {
			padding: 15rpx 0;
			margin: 0 20rpx;
			display: flex;
			justify-content: center;
			border-bottom: 2rpx solid #d1d9e3;
			font-weight: 600;
			font-size: 32rpx;
		}
		
		.application {
			width: 726rpx;
			background: #ffffff;
			border-radius: 16rpx;
			margin: 20rpx auto;
			
			
			.middle {
				padding: 20rpx 0;
				margin: 0 20rpx;
				view {
					padding: 10rpx 0;
					text {
						&:first-child{
							color: #888888;
							display: inline-block;
							width: 130rpx;
						}
					}
				}
			}
		}
		
		.deposit {
			width: 722rpx;
			background: #ffffff;
			border-radius:0 0 12rpx 12rpx;
			margin:  0 auto;
			padding-bottom: 40rpx;
			overflow: auto;
			.center {
				.tips {
					color: #222222;
					margin: 30rpx 0;
				}
				>ul {
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;
					align-content: space-between;
					margin: 30rpx 20rpx 0;
					li {
						width: 180rpx;
						height: 100rpx;
						border: 2rpx solid #d9d9d9;
						border-radius: 8rpx;
						color: #777777;
						font-size: 32rpx;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					.borderBlue {
						border: 2rpx solid #4286FF;
						color: #4286FF;
					}
				}
				.input {
					margin: 30rpx 20rpx 0;
					height: 90rpx;
					background: #f5f5f5;
					border-radius: 8rpx;
					display: flex;
					// justify-content: center;
					align-items: center;
					
					.test {
						margin: 0 15rpx;
						font-size: 36rpx;
						color: #4286FF;
					}
					input {
						width: 550rpx;
					}
				}
			}
			.btn {
				display: flex;
				justify-content: space-evenly;
				margin-top: 20rpx;
				button {
					width: 240rpx;
					min-height: 76rpx;
					background: linear-gradient(353deg,#479cff 0%, rgba(71,216,251,0.80) 100%);
					border-radius: 70rpx;
					color: #fff;
					font-size: 32rpx;
				}
				.gray {
					background: #96B2D3;
				}
			}
			
		}
		
		.content {
			width: 726rpx;
			background: #ffffff;
			padding: 0 20rpx;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			// overflow: auto;
			// flex: auto;
			border-radius: 16rpx 16rpx 0rpx 0rpx;
			.head {
				padding: 15rpx 0;
				display: flex;
				justify-content: center;
				border-bottom: 2rpx solid #d1d9e3;
				font-weight: 600;
				font-size: 32rpx;
			}
			>ul {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 10rpx;
				
				>li{
					padding: 20rpx 0;
					color: #888888;
					font-weight: 400;
					width: 25%;
					display: flex;
					justify-content: center;
				}
				.blue {
					color: #1b98ff !important;
				}
			}
			.custom-class{
				/deep/.van-progress__portion {
                    transition: width 0.5s ease;
                }
				/deep/.van-progress {
					height: 12rpx !important;
					background: #f0f7ff !important;
				}
				/deep/.van-progress__pivot{
					color: transparent !important;
					min-width: 20rpx !important;
					max-width: 20rpx !important;
					height: 20rpx !important;
					border-radius: 50% !important;
				}
			}
			form {
				margin:30rpx 0;
				overflow: auto;
				.info {
					display: flex;
					border-bottom: 1px solid #eee;
					.cu-form-group {
						width: 50%;
						border-top: 0;
					}
				}
				.cu-form-group {
					min-height: 86rpx;
					display: flex;
					justify-content: left;
					padding: 1rpx 0;
					.title {
						width: 180rpx;
					}
					.answer {
						color: #999999;
					}
					/deep/.picker{
						text-align: left;
					}
					/deep/.van-radio-group {
						display: flex;
						justify-content: center;
						.van-radio{
							margin-right:40rpx;
						}
					}
				}
			}
			.price {
				height: 800rpx;
				view {
					margin: 30rpx auto;
					text-align: center;
				}
			}
			.complete{
				margin: 10rpx 0;
				height: 800rpx;
				.message {
					.head {
						margin-top: 10rpx;
						text{
							&:first-child{
								display: inline-block;
								width: 6rpx;
								height: 24rpx;
								background: #0680ff;
								border-radius: 46rpx;
								margin-right: 10rpx;
							}
						}
					}
					.middle {
						padding:10rpx 20rpx;
						border-bottom: 2rpx solid #D1D9E3;
						view {
							margin: 10rpx 0;
							display: flex;
							text {
								display: inline-block;
								
								&:first-child{
									color: #999999;
									width: 140rpx;
								}
								&:nth-child(3){
									color: #999999;
									width: 80rpx;
									margin-left: 100rpx;
								}
								&:last-child{
								}
							}
						}
					}
				}
			}
			.btn {
				display: flex;
				justify-content: space-evenly;
				// margin-bottom: 120rpx;
				button {
					width: 240rpx;
					min-height: 76rpx;
					background: linear-gradient(353deg,#479cff 0%, rgba(71,216,251,0.80) 100%);
					border-radius: 70rpx;
					color: #fff;
					font-size: 32rpx;
				}
				.gray {
					background: #96B2D3;
				}
			}
		}
	}
</style>