<template>
	<view class="box">
		<!-- <bar v-if="loginData.defaultArchives" /> -->
		<date @handle="show" />
		<view class="information">
			<ul v-if="List.length">
				<li @click="information(item)" v-for="(item,index) in List" :key="index">
					<view class="content">
						<view class="title">
							<view class="delete">
								<text>检查编号：</text>
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
	export default {
		components:{
			bar,
			date,
			Toast,
		},
		data(){
			return {
				headIndex:1,
				date:{},
				List:[],
				loginData: {},
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
			this.getVisitRecord();
			this.isVerify = true;
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
						this.getVisitRecord()
					}
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
						visitNumber: '',
						documentType: '',
						startDate: this.date.startTime,
						endDate: this.date.endTime,
						admType: 'I',
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