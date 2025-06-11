<template>
	<view class="register">
		<bar />
		<view class="application" v-if="preHospitalization.admDepDesc != ''">
			<view class="head">住院信息</view>
			<view class="middle">
				<view>
					<text>登记号:</text>
					<text>{{patientID}}</text>
				</view>
				<view v-if="register">
					<text>预交金额:</text>
					<text>￥{{preHospitalization.depositAmount ? preHospitalization.depositAmount : 0}}元</text>
				</view>
				<view v-if="register">
					<text>余额:</text>
					<text>￥{{preHospitalization.depositBalance ? preHospitalization.depositBalance : 0}}元</text>
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
		<view class="content" v-if="preHospitalization.admDepDesc != undefined && !register">
			<view class="head">住院人信息</view>
			<form>
				<view class="cu-form-group">
					<view class="title">姓名</view>
					<span>{{footData.patientName}}</span>
				</view>
				<view class="cu-form-group">
					<view class="title">性别</view>
					<span>{{footData.sex}}</span>
				</view>
				<view class="cu-form-group">
					<view class="title">出生日期</view>
					<span>{{footData.dob}}</span>
				</view>
				<view class="cu-form-group">
					<view class="title">手机号</view>
					<span>{{footData.phoneNum}}</span>
				</view>
				<view class="cu-form-group" v-if="!register">
					<view class="title">陪护人姓名</view>
					<input placeholder="请输入姓名" v-model="informationObj.foreignID" name="input" />
				</view>
				<view class="cu-form-group" v-if="!register">
					<view class="title">陪护人手机号</view>
					<input placeholder="请输入手机号" v-model="informationObj.fPhon" maxlength="11" type="number" name="input" />
				</view>
			</form>
			<view class="btn" v-if="!register && iPBook !=''"><button class="cu-btn" @click="registerBtn">入院登记</button></view>
		</view>
		
		<view v-if="(preHospitalization.admDepDesc == '' || preHospitalization.admDept == '')" class="application">
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
					AimFlag: 'dep',
					patientID: this.footData.patientUniquelyIdentifies
				}
				let res = await hospitalizationApi.getHospitalRecord(data);
				if (res.data.code === 200 && res.data.data.admInfoList != null) {
					this.preHospitalization = res.data.data.admInfoList.admInfo[0];
					this.patientID = res.data.data.patientID;
					this.register = true;
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
		
		.application {
			width: 726rpx;
			background: #ffffff;
			border-radius: 16rpx;
			margin: 20rpx auto;
			
			.head {
				padding: 15rpx 0;
				margin: 0 20rpx;
				display: flex;
				justify-content: center;
				border-bottom: 2rpx solid #d1d9e3;
				font-weight: 600;
				font-size: 32rpx;
			}
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
		.content {
			width: 726rpx;
			background: #ffffff;
			padding: 0 20rpx;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			overflow: auto;
			flex: auto;
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
				height: 800rpx;
				overflow: auto;
				
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
				.patient {
					.middle {
						view {
							// margin-right: 160rpx;
						}
					}
				}
			}
			.btn {
				display: flex;
				justify-content: space-evenly;
				margin-bottom: 120rpx;
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