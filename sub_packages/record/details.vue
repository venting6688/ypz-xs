<template>
	<view class="details">
		<view class="middle">
			<view class="personal personal-1">
				<view class="center">
					<view class="no">
						<text>就诊科室：</text>
						<text>{{information.queueName}}</text>
					</view>
					<view class="no doctor">
						<text>就诊医生：</text>
						<text>{{information.doctorName}}</text>
					</view>
					<view class="no">
						<text>就诊时间：</text>
						<text>{{information.appointmentTime?information.appointmentTime.split(' ')[0]:''}}</text>
					</view>
				</view>
				<view class="tips">
					温馨提示：本次诊疗仅针对目前病情，如有病情变化，请及时复诊。
				</view>
			</view>
			<view class="personal personal-3" v-if="examineList.length">
				<view class="title">
					<view class="name">
						<text>检查信息</text>
					</view>
				</view>
				<view class="center">
					<view class="no" @click="caseHistoryReport(1,item)" v-for="(item,index) in examineList" :key="index">
						<view>
							<text>检查项目：</text>
						    <text>{{item.documentTitle}}</text>
						</view>
						<view>
							<image src="../static/image/Vector@2x.png" mode=""></image>
						</view>
					</view>
				</view>
			</view>
			<view class="personal personal-3"  v-if="checkoutList.length">
				<view class="title">
					<view class="name">
						<text>检验信息</text>
					</view>
				</view>
				<view class="center">
					<view class="no" @click="caseHistoryReport(2,item)" v-for="(item,index) in checkoutList" :key="index">
						<view>
							<text>检验项目：</text>
						    <text>{{item.documentTitle}}</text>
						</view>
						<view>
							<image src="../static/image/Vector@2x.png" mode=""></image>
						</view>
					</view>
				</view>
			</view>
			<view class="personal personal-4" style="padding-top: 20rpx;">
				<view class="center">
					<view class="uni-container">
						<uni-table border stripe>
							<uni-tr>
								<uni-th style="width: 40% !important">项目</uni-th>
								<uni-th style="width: 15% !important">数量</uni-th>
								<uni-th style="width: 20% !important">规格</uni-th>
								<uni-th style="width: 25% !important">金额</uni-th>
							</uni-tr>
							<uni-tr v-for="(val,i) in alreadyList" :key="i">
								<uni-td>{{val.itemName}}</uni-td>
								<uni-td>{{val.itemQty}}</uni-td>
								<uni-td>{{val.itemUom}}</uni-td>
								<uni-td>￥{{parseFloat(val.itemPrice).toFixed(2)}}</uni-td>
							</uni-tr>
						</uni-table>
					</view>
				</view>
				<view class="total">
					<text>合计：</text>
					<text>￥{{parseFloat(totalAmt).toFixed(2)}}元</text>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import elseApi from '@/api/elseApi.js'
	import outpatientExpenditureApi from '@/api/outpatientExpenditureApi.js'
	export default {
		data(){
			return {
				information:{},
				examineList:[],    //检查
				checkoutList:[],    //检验
				alreadyList:[],
				list: [],
				isShow: false,
				totalAmt: 0
			}
		},
		computed: {
			...mapState(['footData']),
		},
		onLoad(e) {
			this.information = JSON.parse(decodeURIComponent(e.item))
			if(this.information.visitNumber){
				this.getDocumentRetrieval('00')
				this.getDocumentRetrieval('99')
				this.getPaymentRecord()
			}
		},
		methods: {
			getDocumentRetrieval(type){
				try {
					let data = {
						patientID: this.footData.patientUniquelyIdentifies,
						visitNumber: '',//this.information.visitNumber,
						documentType: type,
					}
					elseApi.getDocumentRetrieval(data).then(res => {
						if(res.data.code===200){
							if(type==='00'){
								this.examineList = res.data.data || []
							}else {
								this.checkoutList = res.data.data || []
							}
						}
					})
				} catch (error) {
					console.log(error)
					//TODO handle the exception
				}
			},
			//就诊费用
			async getPaymentRecord(){
				try {
					uni.showLoading({
					  title: '加载中...',
					  mask: true 
					})
					let data = {
						patientID: this.footData.patientUniquelyIdentifies,
						startDate:this.information.startTime,
						endDate:this.information.endTime,
						visitNumber:this.information.visitNumber,
					}
					const res = await outpatientExpenditureApi.getPaymentRecord(data);
					if(res.data.code === 200){
						let list = res.data.data || [];
						const promises = list.map(v => {
							let detailInfo = {
								patientID: this.footData.patientUniquelyIdentifies,
								invoiceNo: v.invoiceNo,
							};
							return outpatientExpenditureApi.getPaymentDetails(detailInfo).then(detailRes => {
								if (detailRes.data.code === 200 && detailRes.data.data.length) {
									return detailRes.data.data[0];
								}
								return null;
							});
						});
						
						const detail = (await Promise.all(promises)).filter(v => v !== null);
						this.totalAmt = detail.reduce((sum, item) => sum + (Number(item.itemPrice) || 0), 0);
						this.totalAmt = Number(this.totalAmt);
						this.alreadyList = detail;
						
					}
				} catch (error) {
					console.log(error)
					//TODO handle the exception
				} finally {
					uni.hideLoading();
				}
			},
			
			caseHistoryReport(num,item){
				let data = {...item,...this.information}
				if(num===1){
					uni.navigateTo({
						url: `/sub_packages/report/examine?report=${encodeURIComponent(JSON.stringify(data))}`
					})
				}else if(num===2){
					uni.navigateTo({
						url: `/sub_packages/report/checkout?report=${encodeURIComponent(JSON.stringify(data))}`
					})
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.details {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		.middle {
			overflow: auto;
			margin-bottom: 50rpx;
			.personal {
				width: 722rpx;
				background: #ffffff;
				border-radius: 12rpx;
				margin: 30rpx auto 0 auto;
				padding: 5rpx 0 20rpx;
				.title {
					margin: 0 20rpx;
					height: 65rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					image {
						width: 12rpx;
						height: 18rpx;
						margin-left:20rpx;
					}
					
					.name {
						display: flex;
						align-items: center;
						font-size: 28rpx;
						line-height: 28rpx;
						font-family: PingFang SC, PingFang SC-600;
						color: #000000;
						padding: 10rpx 0;
					}
					.right {
						display: flex;
						align-items: center;
						font-size: 26.72rpx;
						line-height: 26.72rpx;
						font-family: PingFang SC, PingFang SC-400;
						font-weight: 400;
						color: #4286ff;
						padding: 10rpx 0;
					}
				}
			}
			.personal-1 {
				.title1 {
					margin: 0 20rpx;
					height: 70rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.name {
						display: flex;
						align-items: center;
						font-size: 40rpx;
						line-height: 40rpx;
						font-family: PingFang SC, PingFang SC-600;
						font-weight: 600;
						color: #000000;
						padding: 10rpx 0;
						text{
							margin-right:60rpx;
							
						}
					}
					
				}
				.center {
					margin: 0 20rpx;
					.uni-container {
						width: 96%;
						margin: 0 auto;
					}
					.no {
						margin: 12rpx 0;
						text {
							&:nth-child(1){
								color: #888888;
							}
							
						}
						
					}
					.doctor {
						text {
							&:nth-child(2){
								margin-right: 30rpx;
							}
							&:nth-child(3){
								color: #888888;
							}
						}
					}
				}
				.tips {
					margin:25rpx 20rpx 0 20rpx;
					font-size: 20rpx;
					color: #4286ff;
					line-height: 20rpx;
				}
			}
			.personal-2{
				
				.center {
					margin: 0 20rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-between;				
					.word {
						border-bottom: 2rpx solid #eeeeee;
						padding: 10rpx 0;
						position: relative;
						text {
							position: absolute;
							top: 20rpx;
							display: inline-block;
							width: 16rpx;
							height: 16rpx;
							background: #ff6262;
							border-radius: 50%;
							
						}
						view {
							margin-left: 25rpx;
						}
						&:last-child {
							border: 0;
						}
					}
				}
			}
			.personal-3,.personal-4{
				.center {
					margin: 0 20rpx;
					
					.no {
						padding: 26rpx 0;
						line-height: 28rpx;
						display: flex;
						align-items: center;
						justify-content: space-between;
						border-bottom: 2rpx solid #dfdfdf;
						&:last-child{
							border: 0;
						}
						view{
							display: flex;
							justify-content: space-between;
							align-items: center;
							text {
								font-size: 28rpx;
								min-height: 28rpx;
								&:nth-child(1){
									color: #888888;
								}
								&:nth-child(2){
									width: 480rpx;
								}
								
							}
							image {
								width: 20rpx;
								height: 28rpx;
								margin-right:20rpx;
							}
						}
						
					}
				}
			}
			.personal-4 {
				.center {
					border-bottom: 2rpx solid #eeeeee;
				}
				.total {
					margin-top: 20rpx;
					text-align: right;
					text {
						&:nth-child(2){
							color: #ec2e50;
							margin-right: 20rpx;
						}
						
					}
				}
			}
		}
		
		
	}
</style>