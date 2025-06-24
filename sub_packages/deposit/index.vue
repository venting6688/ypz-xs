<template>
	<view class="box">
		<bar v-if="footData.patientUniquelyIdentifies" />
		<view class="title">
			<view>
				<view class="name" @click="outpatientTopUp(1)">
				<view :class="{black:index===1}">
					住院充值
					<view class="wire" :class="{blue:index===1}"></view>
				</view>
			</view>
			<view class="name" @click="outpatientTopUp(2)">
				<view :class="{black:index===2}">
					充值记录
					<view class="wire" :class="{blue:index===2}"></view>
				</view>
			</view>
			</view>
		</view>
		<view class="middle">
			<view class="center" v-if="index===1">
				<view class="tips">选择充值金额</view>
				<ul>
					<li v-for="item in priceList" :key="item" @click="priceClick(item)" :class="{borderBlue:price===item}">
						{{item}}
					</li>
				</ul>
				<view class="input">
					<view class="test">￥</view>
					<input v-model="price" @input="input" type="number" placeholder="输入金额" />
				</view>
			</view>
			<view class="message" v-if="!isHospitalization && index == 1">未查询到您的住院记录，无法进行充值</view>
			
			<view v-if="isHospitalization && index != 1" class="record">
				<ul>
					<li v-for="(item, index) in list" :key="index">
						<view class="info">
							充值时间: {{item.PayDate}} {{item.PayTime}}
						</view>
						<view class="info">
							<view>充值金额: ￥{{parseFloat(item.PayAmout).toFixed(2)}}元</view>
							<view>科室: {{item.PayDept}}</view>
						</view>
					</li>
				</ul>
			</view>
			<view class="without" v-if="list.length == 0 && index != 1">
				<image src="https://aiwz.sdtyfy.com:8099/img/wu.png" mode="widthFix"></image>
			</view>
		</view>
		<view class="confirm" @click="confirm" v-if="index === 1 && isHospitalization">
			立即充值
		</view>
		
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	import bar from '../components/bar.vue'
	import hospitalizationApi from '@/api/hospitalizationApi.js'
	export default {
		components:{
			bar,
		},
		data(){
			return {
				index:1,
				list: [],
				price: 300,
				adminID: '',
				isHospitalization: false,
				priceList:[300,500,800,1000,1500,2000],
			}
		},
		computed: {
			...mapState(['footData']),
		},
		onLoad() {
			this.getHospitalRecord()
		},
		methods: {
			outpatientTopUp(num){
				this.index = num
				wx.setNavigationBarTitle({
					title: this.index===1 ? '住院预交金' : '充值记录'
				})
			},
			priceClick(item){
				this.price = item
			},
			input(e){
				this.price = e.detail.value
			},
			async getHospitalRecord () {
				let data = {
					AimFlag: 'All',
					patientID: this.footData.patientUniquelyIdentifies,
					startDate: '',
					endDate: '',
				}
				let res = await hospitalizationApi.getHospitalRecord(data);
				if (res.data.code === 200 && res.data.data.admInfoList != null) {
					this.adminID = res.data.data.admInfoList.admInfo[0].admID;
					this.isHospitalization = true;
					this.getPayRecord();
				}
			},
			getPayRecord() {
				let data = {
					patientID: this.footData.patientUniquelyIdentifies,
					admID: this.adminID,
				}
				hospitalizationApi.getPayRecord(data).then(res => {
					this.list = [];
					if (res.data.code === 200) {
						this.list = res.data.data.Response.RecordList.Record;
					}
				});
			},
			confirm(){
				if(this.index===1){
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
									let payDate = resData.payDate+' '+resData.payTime;
									this.callApiWithRetry(str).then((r) => {
										uni.navigateTo({ url: `/sub_packages/deposit/topUpRecord?index=${this.index}&amount=${resData.amount}&pay=${payDate}&payOrder=${obj.body.tradeNo}`})
									})
								},
								fail:(err)=> {
									uni.showModal({
										title: '支付',
										content: '支付失败',
										duration: 2000
									})
								}
							});
						} else {
							uni.showModal({
								title: '支付',
								content: '取消支付',
								duration: 2000
							})
						}
					})
				}
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
		
		.title {
			margin: 20rpx auto 0 auto;
			width: 722rpx;
			background: #ffffff;
			border-radius:12rpx 12rpx 0 0;
			>view {
				margin: 0 20rpx;
				height: 100rpx;
				display: flex;
				border-bottom: 2rpx solid #eeeeee;
				
				.name {
					display: flex;
					align-items: center;
					margin-right:40rpx;
					font-family: PingFang SC, PingFang SC-600;
					color: #000000;
					padding-top: 10rpx;
					font-size: 32rpx;
					line-height: 32rpx;
					color: #8a8a8a;
										
				}
				
				.wire {
					width: 92rpx;
					height: 8rpx;
					margin: 18rpx auto 0 auto;
					border-radius: 8rpx;
				}
				.blue {
					background: #4286ff;
				}
				.black {
					color: #000000;
				}
			}
		}
		
		.middle {
			width: 722rpx;
			background: #ffffff;
			border-radius:0 0 12rpx 12rpx;
			margin:  0 auto;
			padding-bottom: 40rpx;
			overflow: auto;
			
			
			.center {
				margin: 0 20rpx;
				.tips {
					color: #222222;
					margin: 30rpx 0;
				}
				>ul {
					// margin: 0 30rpx;
					height: 240rpx;
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;
					align-content: space-between;
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
					margin: 30rpx auto 0 auto;
					// width: 628rpx;
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
			.record {
				overflow: auto;
				>ul {
					>li {
						margin: 0 20rpx;
						padding-top: 20rpx;
						border-bottom: 2rpx solid #eeeeee;
						.info {
							display: flex;
							margin: 16rpx 0;
							>view {
								width: 50%;
							}
						}
						
						.refund {
							display: flex;
							align-items: center;
							justify-content: space-between;
							.price {
								font-size: 32rpx;
								line-height: 32rpx;
								text {
									&:last-child{
										color: red;
									}
								}
							}
							.refundBtn{
								width: 180rpx;
								height: 56rpx;
								border: 2rpx solid #4286ff;
								border-radius: 15rpx;
								font-size: 32rpx;
								line-height: 32rpx;
								display: flex;
								justify-content: center;
								align-items: center;
								color: #4286ff;
							}
						}
						
					}
				}
				
			}
		}
		.confirm {
			margin: 74rpx auto 0 auto;
			width: 512rpx;
			height: 92rpx;
			background: #4286ff;
			border-radius: 46rpx;
			font-size: 32rpx;
			line-height: 32rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #ffffff;
		}
		.message {
			height: 80rpx;
			background: #f0f7ff;
			text-align: center;
			line-height: 80rpx;
			margin: 20rpx 20rpx 0;
			color: #4286ff;
		}
	}
</style>