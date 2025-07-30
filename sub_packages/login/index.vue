<template>
	<view class="login">
		<view class="icon">
			<image src="https://aiwz.sdtyfy.com:8099/img/logo.png" mode="widthFix"></image>
		</view>
		<view class="tips">
			登录需要绑定手机号码
		</view>
		<view class="agreement">
			<view @click="agreementState = !agreementState">
			<image v-if="agreementState" src="../static/image/icon-ok.png" mode=""></image>
			<text v-else class="yuan"></text>
			<text>已阅读并同意</text>
			</view>
			<text class="blue" @click="userAgreement">《用户协议》和《隐私政策》</text>
			
		</view>
		<view class="btn">
			<button @click="btn" :open-type="agreementState?'getPhoneNumber':''" @getphonenumber="onGetPhoneNumber">手机号授权登录</button>
		</view>
		<view class="cancel" @click="back">
			取消登录
		</view>
	</view>
</template>

<script>
	import loginApi from '@/api/loginApi.js'
	import { mapMutations } from 'vuex'
	export default {
		data (){
			return {
				agreementState:false,
			}
		},
		methods: {
			...mapMutations({
				setLoginStatus: 'SET_LOGINSTATUS',
				setLoginToken: 'SET_LOGINTOKEN',
			}),
			userAgreement(){
				uni.navigateTo({
					url:`/sub_packages/agreement/userAgreement`
				})
			},
			privacyPolicy(){
				uni.navigateTo({
					url:`/sub_packages/agreement/privacyPolicy`
				})
			},
			back(){
				uni.switchTab({url:`/pages/home/index`})
			},
			btn(){
				if(!this.agreementState){
					uni.showToast({
					    title: '请先阅读用户协议和隐私政策',
					    icon: 'none',   
					    duration: 2000 
					})
				}
			},
			onGetPhoneNumber(e){ 
			    this.loginFn().then(res => {  // 微信登录&服务端获取openid
					this.getPhoneNumberFn(e.detail.code, res.code).then(data => { // 服务端获取手机号
						if (data.code === 200) {
							let res = data.data;
							let items = JSON.stringify(res);
							uni.setStorageSync('loginData', items)
							uni.setStorageSync('loginToken', res.token)
							this.setLoginStatus('login');
							this.setLoginToken(res.token);
							if (!data.data.defaultArchives) {
								uni.navigateTo({ url:"/sub_packages_healthcard/family/familyManage" })
							} else {
								uni.showToast({ title: '登录成功' })
								wx.reLaunch({ url: `/pages/virtualNurse/index?pattern=2&shouldUpdate=true` })
							}
						}
					})
				})
			},
			
			// 微信登录
			loginFn() {
				return new Promise((resolve, reject) => {
					uni.login({
						success: (res) => {	
							resolve(res)
						},
						fail: (err) => {
							console.log('login fail:', err);
						}
					})
				})
			},
			
			// 获取手机号
			getPhoneNumberFn(phoneCode, openidCode) {
				return new Promise(resolve => {
					loginApi.getPhoneNumber({
							phoneCode,
							openidCode
						}).then(r => {
							if (r.data.code !== 200) {
								uni.showToast({
								    title: `登录失败`,
								    icon: 'none',   
								    duration: 2000 
								}) 
								return
							}
							resolve(r.data)
						})
						.catch(err => {
							uni.showToast({
							    title: `登录失败:${err}`,
							    icon: 'none',   
							    duration: 2000 
							})  
						})
				})
			},
			
		},
		onLoad(e){  
			wx.setNavigationBarTitle({
				title: e.title
			})
		}
	}
	
</script>

<style lang="scss">
	.login {
		width: 100vw;
		height: 100%;
		background: #ffffff;
		
		.icon {
			width: 100%;
			// paadding: 35rpx 0;
			transform: translate(0,70rpx);
			display: flex;
			justify-content: center;
			image {
				width: 300rpx;
				height: 300rpx;
			}
		}
		
		.tips {
			display: flex;
			justify-content: center;
			font-size: 32rpx;
			font-weight: 500;
			margin: 200rpx 0 40rpx 0;
		}
		
		.agreement {
			display: flex;
			align-items: center;
			justify-content: center;
			color: #999999;
			
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
		
		.btn {
			margin: 40rpx 0;
			button {
				width: 552rpx;
				height: 80rpx;
				background: $global-color;
				border-radius: 40rpx;
				color: #ffffff;
				font-size: 38rpx;
				line-height: 32rpx;
				display: flex;
				font-weight: 700;
				align-items: center;
				justify-content: center;
			}
		}
		.cancel {
			font-size: 28rpx;
			font-family: Source Han Sans CN, Source Han Sans CN-400;
			font-weight: 400;
			text-align: center;
			color: #a5a5a5;
			line-height: 24rpx;
		}
	}
</style>