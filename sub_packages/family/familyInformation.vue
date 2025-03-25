<template>
	<view class="information">
		<view class="bar">
			<view @click="relationBtn(i)" :class="{blue:informationObj.relation===i}" v-for="(i,x) in barList" :key="x">{{i}}</view>
		</view>
		<form>
			<view class="cu-form-group">
				<view class="title">姓名</view>
				<input v-model="informationObj.name" placeholder="请输入" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">身份证号</view>
				<input v-model="informationObj.num" placeholder="请输入" type="idcard" name="input" />
			</view>

			<view class="cu-form-group">
				<view class="title">手机号</view>
				<input v-model="informationObj.phone" placeholder="请输入院内预留手机号" type="number" maxlength="11" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">验证码</view>
				<input v-model="informationObj.verificationCode" placeholder="请输入短信验证码" type="number" name="input" />
				<view @click="verificationCodeBtn" :class="{gray:informationObj.phone.length !== 11}" v-if="!verificationCodeState" class="verificationCode">
					获取验证码
				</view>
				<view class="answer" v-else>
					{{time}}s
				</view>
			</view>
		</form>
		<!-- <view class="healthCard">
			关联电子健康卡
		</view> -->
		<view class="tips">
			<view class="tips-title">
				温馨提示
			</view>
			<view class="tips-center">
				<view>
					<text>★</text>
					<text>请使用家庭成员的实名信息进行添加操作如家庭成员未在医院进行过建档需要先使用建档功能；</text>
				</view>
				<view>
					<text>★</text>
					<text>为保护隐私手机号务必使用院内建档时预留的手机号；</text>
				</view>
				<view>
					<text>★</text>
					<text>如果预留手机号已经不在使用需要先到院内窗口进行更换手机号后再进行添加操作；</text>
				</view>
			</view>
		</view>
		<view class="confirm">
			<view  @click="queueFilingInfo(1)" >
				在线建档
			</view>
			<view  @click="queueFilingInfo(2)" :class="{unclickable:!informationObj.relation || !informationObj.name ||!informationObj.num ||!informationObj.phone || !informationObj.verificationCode }">
				确认添加
			</view>
		</view>
	</view>
</template>
<script>
	import filingApi from '@/api/filingApi.js'
	export default {
		data(){
			return {
				informationObj:{
					relation:'',
					name:'',
					num:'',
					phone:'',
					verificationCode:'',
				},
				occupationPickerIndex: -1,
				patientTypePickerIndex:-1,

				barList:['本人','配偶','父母','子女','其他'],
				countTimer:null,
				time:60,
				verificationCodeState:false,
			}
		},
		methods: {
			relationBtn(i){
				this.informationObj.relation = i
			},
			// 获取验证码
			verificationCodeBtn(){
				if(this.informationObj.phone.length !== 11){
					return
				}
				console.log(this.informationObj)
				this.verificationCodeState = true
				this.count(60)
				filingApi.sendVerificationCode(this.informationObj.phone).then(res => {
					if(res.data.code!==200){
						uni.showToast({
							title: res.data.msg,
							icon: 'error',
							duration: 2000
						});
					}
				})
				.catch(err => {
					console.log('2：', err);
				})
				
			},
			queueFilingInfo(num){
				if(num===1){
					uni.navigateTo({
						url: `/sub_packages/filing/identityCard`
					})
					return
				}
				let loginValue = uni.getStorageSync("loginData");
				let loginData = JSON.parse(loginValue)
				this.informationObj.cloudUser = loginData
				
				if (!this.informationObj.relation || !this.informationObj.name ||!this.informationObj.num ||!this.informationObj.phone || !this.informationObj.verificationCode) {
				    uni.showToast({
				        title: '请完善您的信息',
				        icon: 'none',   
				        duration: 3000 
				    })
				} else {
					filingApi.queueFilingInfo(this.informationObj).then(res => {
						if(res.data.code===200){
							uni.showToast({
								title: '添加成功',
								duration: 3000
							});
							uni.setStorageSync('loginData', JSON.stringify(res.data.data))
							setTimeout(()=>{
								uni.navigateBack({
									delta: 3
								});
							},3000)
						}else if(res.data.code===-1){
							uni.showModal({
								title: '院内查询不到该人员信息，是否需要在院内建档',
								success: res => {
									if (res.confirm) {
										uni.navigateTo({
											url:"/sub_packages/filing/identityCard"
										})
									} 
								}
							});
						}else{
							uni.showModal({
							   title: res.data.msg,
							   confirmColor: '#576B95',
							   confirmText: '我知道了',
							   showCancel: false,
							 });
						}
						
					})
					.catch(err => {
						console.log('2：', err);
					})
				}
				
				
			},
			count(time) {
			    if (time) {
			        this.time = time
			    }
			    if (this.time < 2) {
			        this.verificationCodeState = false
			        this.time = 60 
			        
			    } else {
			        this.time--
			        if (this.countTimer) clearTimeout(this.countTimer)
			        this.countTimer = setTimeout(() => {
			            this.count()
			        }, 1000)
			    }
			},
		}
	}
</script>

<style lang="less" scoped>
	.unclickable{
		background: #beccff !important;
	}
	.gray{
		color: #999999  !important;
		border: 1.91rpx solid #999999 !important;
	}
	.information {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		
		.bar {
			margin: 30rpx 30rpx 0 30rpx;
			display: flex;
			justify-content: space-between;
			
			view {
				width: 118.32rpx;
				height: 72.52rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 26.72rpx;
				font-weight: 500;
				color: #000000;
				line-height: 26.72rpx;
			}
			.blue {
				background: #4286ff !important;
				color: #ffffff !important;
			}
			
		}
		form {
			margin:30rpx;
			overflow: auto;
			
			.cu-form-group {
				
				min-height: 86rpx;
				.title {
					width: 160rpx;
				}
				.answer {
					color: #999999;
				}
				.verificationCode {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 148.85rpx;
					height: 49.62rpx;
					border: 1.91rpx solid #4286ff;
					border-radius: 30.53rpx;
					font-size: 22.9rpx;
					color: #4286ff;
					line-height: 22.9rpx;
				}
			}
		}
		.healthCard {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 221.37rpx;
			margin:10rpx auto 60rpx auto;
			height: 57.25rpx;
			background: #4286ff;
			border-radius: 7.63rpx;
			color: #ffffff;
			font-size: 22.9rpx;
			line-height: 22.9rpx;
		}
		.tips {
			font-size: 26.72rpx;
			color: #333333;
			margin: 0 30rpx;
			
			.tips-title {
				margin-bottom: 20rpx;
			}
			.tips-center {
				view {
					display: flex;
					
					text{
						font-size: 22.9rpx;
						line-height: 40rpx;
						color: #333333;
						margin: 10rpx 10rpx 10rpx 0;
					}
				}
			}
		}
		.confirm {
			margin-top: 60rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			view{
				width: 311.07rpx;
				height: 87.79rpx;
				border-radius: 43.89rpx;
				margin:0 20rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 30.53rpx;
				font-family: PingFang SC, PingFang SC-600;
				font-weight: 600;
				color: #ffffff;
				line-height: 30.53rpx;
				&:first-child{
					background: #3cd0aa;
				}
				&:last-child{
					background: #4286ff;
				}
			}
			
			
		}
	}
</style>