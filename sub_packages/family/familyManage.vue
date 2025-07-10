<template>
	<view class="manage">
		<view class="information">
			<ul v-if="patientList.length">
				<li v-for="(item,index) in patientList" :key="item.patientCard">
					<view class="title">
						<view class="name">
							<text class="big">{{item.patientName ? pixelate(item.patientName) : ''}}</text>
							<text class="small">{{item.sex}}</text>
							<text class="relation">{{item.relation}}</text>
						</view>
						<view class="ok" @click="updateDefaultArchives(item)">
							<image v-if="item.defaultType == 1" src="../static/image/icon-ok.png" mode=""></image>
							<image v-else src="../static/image/grayOk.png" mode=""></image>
							<text>默认就诊人</text>
						</view>
						<view class="dele" @click="deletePatients(item.patientUniquelyIdentifies)">
							<uni-icons type="trash" color="red"></uni-icons>
							删除
						</view>
					</view>
					<view class="center">
						<view class="content">
							<text>证件号：</text>
							<text>{{item.idNum ? pixelateNumber(item.idNum.toString()):''}}</text>
						</view>
						<view class="bottomBtn" @click="showHealthCard(item.patientCard)" v-if="item.cardTypeCode == '04'">
							<view>
								<text>{{item.patientCard == cardNum && isShowHealthCard ? '收起详情':'展开详情'}}</text>
								<image v-if="item.patientCard == cardNum && isShowHealthCard" src="../static/image/top.png" mode=""></image>
								<image v-else src="../static/image/bottom.png" mode=""></image>
							</view>
						</view>
						<view class="upHealthCard" @click="linkHealthCard()" v-else>
							<uni-icons type="upload" color="#1B98FF" size="22" style="margin-right: 10rpx;"></uni-icons> 
							升级电子健康卡
						</view>
					</view>
					
					<!-- 健康卡 -->
					<view class="wrap" v-if='item.cardTypeCode == "04" && item.patientCard == cardNum && isShowHealthCard'>
						<view class="cardNum">就诊卡：{{item.idNum}}</view>
						<view>
							<view class="card-face-container" @click="showQRCode(item.patientCard)">
								<img class="card-bg" src="../static/image/cardnewbg.png" alt="" />
								<view class="card-top-info">
										<view class="card-top-org">山东省卫生健康委员会</view>
										<view class="card-top-title">
												<img src="../static/image/icon2.png" alt="" />
												<span>电子健康卡</span>
										</view>
								</view>
								<view class="card-detail-info">
										<view class="card-user-info">
												<span class="card-user-name">{{item.patientName}}</span>
												<span class="card-user-id">{{pixelateNumber(item.idNum)}}</span>
										</view>
										<view class="card-qrcode">
												<img class="card-qrcode-logo" src="../static/image/logo_.png" alt="" />
												<img src="../static/image/qrcode.png" alt="" />
										</view>
								</view>
								<view class="card-footer">中华人民共和国国家卫生健康委员会监制</view>
							</view>
						</view>
					</view>
				</li>
			</ul>
		</view>
		<view class="btn" @click="linkHealthCard" v-if="5-this.patientList.length > 0">
			<image src="../static/image/icon-add.png" mode=""></image>
			<text>添加就诊人（剩{{5-this.patientList.length}}人）</text>
		</view>
		<view class="btn" @click="returnIndex" style="background-color: #EAAA52;">
			<text>返回</text>
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
	import login from '@/utils/login.js'
	import mixin from '@/mixins/mixin.js'
	import {mapMutations , mapState} from 'vuex'
	import HeaderbarApi from '@/api/HeaderbarApi.js'
	import Toast from '../components/toast.vue'
	import filingApi from '@/api/filingApi.js'
	import healthCard from '@/api/healthCard.js'
  import AuthPopup from '../components/auth-popup.vue'
	
	export default {
		mixins: [mixin],
		components: {
			AuthPopup,
			Toast
		},
		data(){
			return {
				patientList:[],
				toastObj: {
					state:false,
				},
				loginValue: {},
				cardNum: '',
				isShowHealthCard: false,
			}
		},
		onShow() {
			let loginValue = uni.getStorageSync("loginData");
			if(loginValue){
				let registerData = JSON.parse(loginValue)
				if(registerData && registerData.archivesList.length){
					this.patientList = registerData.archivesList
					this.patientList.forEach((item, i) => {
						item.defaul = false;
						this.$set(this.patientList, i, item);
					});
					const temp = this.patientList[0];
					temp.default = true;
					this.$set(this.patientList, 0, temp);
				}
			}
		},
		computed: {
			...mapState(['footData']),
		},
		onLoad(e) {
			let loginData = uni.getStorageSync("loginData");
			this.loginValue = loginData ? JSON.parse(loginData) : {};
			this.healthCode = e.healthCode ? e.healthCode : '';
			this.regInfoCode = e.regInfoCode ? e.regInfoCode : '';
			this.authCode = e.authCode ? e.authCode : '';
			this.getHealthCardList();
			if (this.healthCode != '') {
				this.getHealthCard();
			}
		},
		methods: {
			...mapMutations({
				setFootData:'SET_FOOT_DATA',
				setLoginStatus: 'SET_LOGINSTATUS',
			}),
			
			closeToast(state){
				this.toastObj = {
					state:state,
				}
			},
			returnIndex() {
				uni.switchTab({url:`/pages/home/index`})
			},
			
			onFinish(e) {
				console.log('🐞 onFinish', e);
			},
			// 刷新用户信息
			refreshUserInfo(phoneNum){
				HeaderbarApi.refreshUserInfo(phoneNum).then(result => {
					if(result.data.code === 200){
						let data = result.data.data
						this.setFootData(data.defaultArchives)
						this.setLoginStatus('login');
						let items = JSON.stringify(data)
						uni.setStorageSync('loginData', items)
					}
				})
			},
			// 切换家庭成员
			async updateDefaultArchives(item){
				let loginValue = uni.getStorageSync("loginData");
				let value = JSON.parse(loginValue)
				if(item.patientCard===value.defaultArchives.patientCard){
					return
				}
				try{
					let data = {
						phone:value.phoneNum,
						patientCard:item.patientCard,
					}
					const res = await HeaderbarApi.updateDefaultArchives(data).then((result) => {
						this.$emit('handle',item)
						this.refreshUserInfo(value.phoneNum)
						this.getHealthCardList();
					})
				}catch(e){
					console.log(e);
				}
			},
		
			showHealthCard(num) {
				this.cardNum = num;
				this.isShowHealthCard = !this.isShowHealthCard;
			},
			
			//电子健康卡
			linkHealthCard(type) {
				let loginData = uni.getStorageSync("loginData");
				if (!loginData) {
					uni.navigateTo({ url:"/sub_packages/login/index?title=山东第一医科大学第二附属医院" })
				} else {
					var plugin = requirePlugin("healthCardPlugins");
					plugin.login((isok, res) => {
						if (!isok && res.result.toLogin) {
							// 用户未授权，需要用户同意授权
							this.$refs.authPopup.open();
						} else {
							// 用户在微信授权过，可直接获取登录信息，处理后续业务
							this.todo(res);
						}
					}, {
						wechatCode: true,
					});
				}
			},
			
			todo(val) {
				const { wechatCode } = val.result;
				let data = {
					wechatCode,
					patientType: 0,
					successRedirectUrl: 'mini:/sub_packages/family/familyManage?healthCode=${healthCode}', //授权成功获取就诊人列表
					failRedirectUrl: 'mini:/sub_packages/family/familyManage?regInfoCode=${regInfoCode}',
					userFormPageUrl: 'mini:/sub_packages/family/registerHealth?authCode=${authCode}', //添加就诊人
					faceUrl:`/sub_packages/family/faceVerify`,
					verifyFailRedirectUrl:`mini:/sub_packages/family/familyManage`,
					domainChannel: 3,
					relateOpenId: this.loginValue.xcxOpenId,
				}
				healthCard.registerHealthCardPreAuth(data).then((res) => {
					if (res.data.code == 200) {
						let url = res.data.data.rsp.bindCardUrl;
						uni.redirectTo({ url: '/pages/webview/webview?url=' + encodeURIComponent(url) });
					}
				});
			},
			//获取健康卡信息
			async getHealthCard() {
				let str = {
					healthCode: this.healthCode,
					openid: this.loginValue.xcxOpenId,
				}
				let res = await healthCard.getHealthCardByHealthCode(str);
				if (res.data.code == 200) {
					let data = res.data.data.rsp.card;
					//健康卡建档
					data.cloudUser = this.loginValue;
					healthCard.filingForHealthCard(data).then(result => {
						if(result.data.code === 200){
							this.refreshUserInfo(this.loginValue.phoneNum)
							this.getHealthCardList();
						}
					})
				}
			},
			
			//获取健康卡列表
			async getHealthCardList() {
				let data = {accountPhone: this.loginValue.phoneNum}
				let res = await healthCard.queueFilingInfo(data);
				if (res.data.code == 200 && res.data.data) {
					this.patientList = res.data.data.archivesList;
				}
			},
			//展码
			showQRCode(healthCardId) {
				let hospitalId = '40237';
				let webviewUrl = '/pages/webview/webview?url=$url';
				let redirectUrl = '';
				let fieldCode = '';
				
				wx.navigateTo({
					url: `plugin://healthCardPlugins/healthcode?hospitalId=${hospitalId}&healthCardId=${healthCardId}&webviewUrl=${encodeURIComponent(webviewUrl)}&redirectUrl=${encodeURIComponent(redirectUrl)}`,
				});	
			},
			
			//删除就诊人
			deletePatients(patientID) {
				uni.showModal({
					title: "提示",
					content: "确定删除该就诊人吗？",
					success: (res) => {
						if (res.confirm) {
							try {
								let data = {
									patientID,
									accountPhone: this.loginValue.phoneNum,
								}
								healthCard.deleteThePatient(data).then(res => {
									if(res.data.code === 200){
										uni.showToast({
											title: "删除成功",
											icon: "none",
										});
									} else {
										uni.showToast({
											title: res.data.msg,
											icon: "none",
										});
									}
									this.getHealthCardList()
									this.refreshUserInfo(this.loginValue.phoneNum);
								})
							} catch (error) {
								console.log(error)
								//TODO handle the exception
							}
						}
					},
				});
			},
			
			onFinish(e) {
				console.log('🐞 onFinish', e);
			},
			// 用户同意授权，授权成功回调
			authSuccess(e) {
				const res = e.detail; 
				// 同 plugin.login，用户同意授权，获取登录信息，处理后续业务
				this.todo(res);
			},
					
			// 用户授权失败
			authFail(e) {
				console.log('授权失败：', e)
			},
					
			// 用户取消授权，授权失败回调
			authCancel(e) {
				console.log('用户取消授权：', e)
			},
		}
	}
</script>

<style lang="less" scoped>
	.manage {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		
		.headTitle {
			line-height: 64rpx;
			background: #F0F7FF;
			color: #1B98FF;
			font-size: 28rpx;
			text-align: center;
		}
		
		.information {
			width: 100%;
			overflow: auto;
			ul {
				width: 681.3rpx;
				margin: 0 auto;
				> li {
					width: 681.3rpx;
					background: #ffffff;
					border-radius: 15.27rpx;
					margin-top: 30rpx;
					padding-bottom: 15rpx;
					
					.title {
						margin: 0 28rpx;
						height: 88rpx;
						display: flex;
						justify-content: space-between;
						align-items: center;
						
						image {
							width: 30rpx;
							height: 30rpx;
							margin: 0 10rpx 0 20rpx;
						}
						
						.name {
							display: flex;
							align-items: center;
							font-size: 34.35rpx;
							line-height: 34.35rpx;
							font-family: PingFang SC, PingFang SC-600;
							font-weight: 600;
							color: #000000;
							padding: 10rpx 0;
							
							.big {
								margin-right: 15rpx;
							}
							.small {
								line-height: 26.72rpx;
								font-size: 26.72rpx;
								color: #666666;
								font-weight: 400;
								margin-right: 15rpx;
							}
							.relation{
								padding: 5rpx 10rpx;
								background: #4286ff;
								border-radius: 7.63rpx;
								color: #ffffff;
								font-weight: 400;
								font-size: 22.9rpx;
								line-height: 22.9rpx;
							}
						}
						.ok {
							display: flex;
							align-items: center;
							font-size: 26.72rpx;
							line-height: 26.72rpx;
							font-family: PingFang SC, PingFang SC-400;
							font-weight: 400;
							color: #666666;
							padding: 10rpx 0;
						}
						.dele {
							color: #ff0000;
						}
					}
					.center {
						margin: 0 28rpx 25rpx;
						display: flex;
						justify-content: space-between;
						.content {
							margin-top: 20rpx;
							text {
								&:nth-child(1){
									display: inline-block;
									width: 145rpx;
									color: #999999;
								}
								&:nth-child(2){
									color: #333333;
									margin-right: 20rpx;
								}
								&:nth-child(3){
									padding: 6rpx 14rpx;
									background: rgba(66,134,255,0.08);
									border-radius: 26.72rpx;
									color: #4286ff;
									font-size: 22.9rpx;
									line-height: 22.9rpx;
								}
							}
							.money {
								color: #ff4848 !important;
							}
						}
						.img {
							margin: 20rpx auto 0 auto;
							image {
								width: 624rpx;
								height: 351.15rpx;
								border-radius: 11.45rpx;
							}
						}
					}
					.bottomBtn {
						color: #999999;
						font-size: 26.72rpx;
						margin-top: 20rpx;
						
						image {
							width: 30rpx;
							height: 30rpx;
							margin-left: 8rpx;
						}
					}
					.upHealthCard {
						color: #1B98FF;
						font-size: 26.72rpx;
						margin-top: 20rpx;
					}
				}
			}
			
			//电子健康卡
			.wrap {
				border-top: 1px solid #eee;
				background: #fff;
				min-height: 99%;
				padding-top: 1%;
				width: 100%;
				font-family: 'PINGFANG MEDIUM', 'PingFang SC', 'Microsoft YaHei', sans-serif;
				font-weight: 600;
				.cardNum {
					margin-left: 28rpx;
					padding: 10rpx 0 0;
				}
				.card-face-container {
					height: 351rpx;
					width: 620rpx;
					margin: 15rpx auto;
					position: relative;
					color: #000000;
				}
				.card-face-container .card-bg {
				    height: 100%;
				    width: 100%;
				    position: absolute;
				}
				
				.card-face-container .card-top-info {
				    position: absolute;
				    top: 15rpx;
				    width: calc(100% - 15rpx - 20rpx);
				    padding: 0 15rpx 0 20rpx;
				    display: flex;
				    justify-content: space-between;
				    align-items: center;
				}
				
				.card-face-container .card-top-info .card-top-org {
				    font-size: 22rpx;
				    line-height: 22rpx;
				}
				
				.card-face-container .card-top-info .card-top-title {
				    display: flex;
				    align-items: center;
				    font-size: 30rpx;
				    line-height: 36rpx;
				    color: #2B2B2B;
				}
				
				.card-face-container .card-top-info .card-top-title img {
				    height: 58rpx;
				    width: 58rpx;
				    margin-right: 10rpx;
				}
				
				.card-face-container .card-detail-info {
				    position: absolute;
				    top: 100rpx;
				    width: calc(100% - 30rpx - 15rpx);
				    padding-left: 20rpx;
				    display: flex;
				    justify-content: space-between;
				    align-items: flex-end;
				}
				
				.card-face-container .card-detail-info .card-user-info {
				    font-size: 30rpx;
				    color: #2B2B2B;
				}
				
				.card-face-container .card-detail-info .card-user-info .card-user-id {
				    font-size: 28rpx;
				    line-height: 28rpx;
				    display: block;
				    padding-top: 10rpx;
				}
				
				.card-face-container .card-detail-info .card-qrcode {
				    background: #FFFFFF;
				    padding: 5rpx;
				    position: relative;
				}
				
				.card-face-container .card-detail-info .card-qrcode .card-qrcode-logo {
				    height: 164rpx;
				    width: 164rpx;
				    position: absolute;
				    top: 50%;
				    left: 50%;
				    transform: translate(-50%, -50%);
				}
				
				.card-face-container .card-detail-info .card-qrcode img {
				    height: 164rpx;
				    width: 164rpx;
				}
				
				.card-face-container .card-footer {
				    position: absolute;
				    font-size: 22rpx;
				    bottom: 26rpx;
				    left: 50%;
				    transform: translateX(-50%);
				    white-space: nowrap;
				    letter-spacing: 0;
				    line-height: 22rpx;
				}	
				.bottom {
					display: flex;
					align-items: center;
					font-size: 26.72rpx;
					line-height: 26.72rpx;
					font-family: PingFang SC, PingFang SC-400;
					font-weight: 400;
					color: #666666;
					padding: 10rpx 0;
					margin: auto 65rpx;
					justify-content: space-between;
					.default image {
						width: 32rpx;
						height: 32rpx;
						margin-right: 10rpx;
					}
					
				}
			}
		}
		
		.btn {
			width: 681.3rpx;
			height: 87.79rpx;
			background: #4286ff;
			border-radius: 20rpx;
			margin: 30rpx auto 0;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #ffffff;
			padding: 15rpx 0;
			
			image {
				width: 41.98rpx;
				height: 41.98rpx;
				margin-right: 15rpx;
			}
			text {
				font-size: 30.53rpx;
				line-height: 30.53rpx;
			}
		}
	}
</style>