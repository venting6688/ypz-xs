<template>
	<view class="box">
		<bar v-if="loginData.defaultArchives" />
		<date @handle="show" />
		<view class="head">
			<view>
				<view class="name" @click="headBtn(1)">
					<view :class="{black:headIndex===1}">
						检查报告
						<view class="wire" :class="{blue:headIndex===1}"></view>
					</view>
				</view>
				<view class="name" @click="headBtn(2)">
					<view :class="{black:headIndex===2}">
						检验报告
					<view class="wire" :class="{blue:headIndex===2}"></view>
					</view>
				</view>
			</view>
		</view>
		<view class="information">
			<ul v-if="List.length">
				<li @click="information(item)" v-for="(item,index) in List" :key="index">
					<view class="content">
						<view class="title">
							<view class="delete">
								<text>文档ID：</text>
								<text>{{item.documentID}}</text>
							</view>
							<view class="delete">
								<text style="color: #4286ff;">查看报告</text>
								<image src="../static/image/Vector@2x.png" mode=""></image>
							</view>
						</view>
						<view class="title">
							<view class="delete">
								<text>{{headIndex===1?'检查':'检验'}}项目：</text>
								<text>{{item.documentTitle}}</text>
							</view>
							<view class="delete">
								<text>{{headIndex===1?'检查':'检验'}}时间：</text>
								<text>{{item.updateDate}} {{item.updateTime}}</text>
							</view>
						</view>
					</view>
				</li>
			</ul>
			<view class="without" v-else>
				<image src="../static/image/wu.png" mode="widthFix"></image>
			</view>
		</view>
		<auth-popup
			ref="authPopup"
			@success="authSuccess"
			@fail="authFail"
			@cancel="authCancel"
		/>
		<Toast v-if="toastObj.state" @back="closeToast" :type="toastObj.type" :url="toastObj.url" :tips="toastObj.tips" :message="toastObj.message" />
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import bar from '../components/bar.vue'
	import date from '../components/date.vue'
	import Toast from '../components/toast.vue'
	import elseApi from '@/api/elseApi.js'
	import healthCard from '@/api/healthCard.js'
  import AuthPopup from '../components/auth-popup.vue'
	export default {
		components:{
			bar,
			date,
			AuthPopup,
			Toast,
		},
		data(){
			return {
				headIndex:1,
				date:{},
				List:[],
				loginData: {},
				siginData: {},
				isVerify: false,
				toastObj:{
					state:false,
				},
			}
		},
		computed: {
			...mapState(['footData']),
		},
		onLoad(e) {
			let loginValue = uni.getStorageSync("loginData");
			// if (!loginValue) {
			// 	uni.navigateTo({ url:"/sub_packages/login/index?title=山东第一医科大学第二附属医院" })
			// } else {
				this.loginData = loginValue ? JSON.parse(loginValue) : {};
				this.siginData = this.loginData.defaultArchives ? this.loginData.defaultArchives : {};
				this.registerOrderId = e.registerOrderId ? e.registerOrderId : '';
				if (this.registerOrderId == '') {
					this.healthcardVerify();
				}
				if (this.registerOrderId != '') {
					this.checkUniformVerifyResult();
				}
			// }
		},
		methods: {
			closeToast(state){
				this.toastObj = {
					state:state,
				}
			},
			show(time){
				const datePattern = /^\d{4}-\d{2}-\d{2}$/.test(time.startTime);
				if(datePattern){
					this.date = time
					if (this.isVerify) {
						let type = this.headIndex === 1 ? '00' : '99';
						this.getVisitRecord(type)
					}
				}
			},
			headBtn(num){
				this.headIndex = num
				let type = num === 1 ? '00' : '99';
				this.getVisitRecord(type)
			},
			
			//实人验证
			healthcardVerify() {
				var plugin = requirePlugin("healthCardPlugins");
				plugin.login((isok, res) => {
					if (!isok && res.result.toLogin) {
						this.$refs.authPopup.open();
					} else {
						this.verifyOrder(res);
					}
				}, {
					wechatCode: true,
				});
			},
			
			//实人验证生成orderid
			verifyOrder(val) {
				const { wechatCode } = val.result;
				
				let data = {
					cardType: '01',
					idCard: this.siginData.idNum,
					name: this.siginData.patientName,
					wechatCode,
					ecardNo: '',
					scene: '0101081',
					department: '',
					useCardType: '01',
					cardCostTypes: '',
					verifySuccessRedirectUrl: 'mini:/sub_packages/report/index?registerOrderId=${registerOrderId}',
					verifyFailRedirectUrl: 'mini:/sub_packages/report/index?registerOrderId=${registerOrderId}',
					faceUrl:`/sub_packages/family/faceVerify`,
					domainChannel: 3,
					openid: this.loginData.xcxOpenId,
				}
				
				healthCard.registerUniformVerifyOrder(data).then((res) => {
					let msg = res.data.data.commonOut.errMsg
					if (res.data.code == 200 && msg == '成功') {
						let url = res.data.data.rsp.verifyUrl;
						uni.setStorageSync('verifyOrderId', res.data.data.rsp.verifyOrderId)
						uni.redirectTo({ url: '/pages/webview/webview?url=' + encodeURIComponent(url) });
					} else {
						uni.showToast({
							title: '验证失败，请联系管理员',
							icon: 'none',
							url: '',
							duration: 2000 
						}) 
					}
				});
			},
			
			//实人验证结果查询
			checkUniformVerifyResult() {
				let verifyOrderId = uni.getStorageSync('verifyOrderId');
				let data = {
					verifyOrderId,
					verifyResult: this.registerOrderId,
					openid: this.loginData.xcxOpenId,
				}
				
				healthCard.checkUniformVerifyResult(data).then((res) => {
					if (res.data.code == 200) {
						this.headBtn(1);
						this.isVerify = true;
					}
				});
			},
			
			authSuccess(e) {
				const res = e.detail; 
				this.verifyOrder(res);
			},
			authFail(e) {
				console.log('授权失败：', e)
			},
			authCancel(e) {
				console.log('用户取消授权：', e)
			},
			
			getVisitRecord(type){
				try {
					uni.showLoading({
					  title: '加载中...',
					  mask: true 
					})
					let data = {
						patientID: this.footData.patientUniquelyIdentifies,
						visitNumber: '',
						documentType: type,
						startDate: this.date.startTime,
						endDate: this.date.endTime,
					}
					elseApi.getDocumentRetrieval(data).then(res => {
						if(res.data.code===200){
							this.List = res.data.data;
						}else {
							this.List = []
						}
					})
				} catch (error) {
					console.log(error)
				} finally {
					uni.hideLoading();
				}
			},
			information(item){
				if(this.headIndex===1){
					//检查
					uni.navigateTo({
						url: `/sub_packages/report/examine?report=${encodeURIComponent(JSON.stringify(item))}`
					})
				}else {
					//检验
					uni.navigateTo({
						url: `/sub_packages/report/checkout?report=${encodeURIComponent(JSON.stringify(item))}`
					})
				}
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
		
		.head {
			width: 681.3rpx;
			margin: 0 auto;
			background: #ffffff;
			// height: 120rpx;
			
			border-radius: 12rpx 12rpx 0 0;
			>view{
				padding-top: 20rpx;
				margin: 0 20rpx;
				display: flex;
				align-items: center;
				border-bottom: 2rpx solid #eeeeee;
				.name {
					display: flex;
					align-items: center;
					margin-right:40rpx;
					font-family: PingFang SC, PingFang SC-600;
					color: #000000;
					padding: 10rpx 0;
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
		.information {
			width: 100%;
			overflow: auto;
			margin-bottom: 50rpx;
			ul {
				width: 681.3rpx;
				margin: 0 auto;
				> li {
					width: 681.3rpx;
					background: #ffffff;
					&:last-child{
						.content{
							border: 0 !important;
						}
					}
					
					>.content{
						padding-bottom: 20rpx;
						margin: 0 20rpx;
						border-bottom: 2rpx solid #eeeeee;
						.title {
							height: 70rpx;
							display: flex;
							justify-content: space-between;
							align-items: right;
							
							image {
								width: 12rpx;
								height: 18rpx;
								margin-left:20rpx;
							}
							
							.name {
								display: flex;
								align-items: center;
								font-size: 28rpx;
								line-height: 34.35rpx;
								font-family: PingFang SC, PingFang SC-600;
								font-weight: 600;
								color: #000000;
								padding: 10rpx 0;
							}
							.delete {
								display: flex;
								align-items: center;
								font-size: 26.72rpx;
								line-height: 26.72rpx;
								font-family: PingFang SC, PingFang SC-400;
								font-weight: 400;
								padding: 10rpx 0;
							}
						}
						.center {
							height: 140rpx;
							display: flex;
							flex-direction: column;
							justify-content: space-between;
							.no {
								font-size: 30rpx;
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
					}
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
				width: 75%
			}
		}
	}
</style>