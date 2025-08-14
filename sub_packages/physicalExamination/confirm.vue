<template>
	<view class="inventory ">
		<customerNav title="确认体检项目" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="summary-card">
			<view class="summary-item">
				<text class="label">项目</text>
				<text class="value">{{detailInfo.length}}个</text>
			</view>
			<view class="summary-item">
				<text class="label">共计</text>
				<text class="price">¥{{price}}</text>
			</view>
		</view>
		<scroll-view scroll-y class="container">
			<view class="content">
				<view class="title">套餐内项目({{detailInfo.length}})</view>
				<view class="detail" v-for="(val, index) in detailInfo" :key="index">
					<view class="detail-left">{{index+1}}.{{val.ArcimDesc}}</view>
					<view class="detail-right">{{val.StationName}}</view>
				</view>
			</view>
		</scroll-view>
		
		<view class="footer-fixed">
			<view class="next-btn" @click="confirm()">确认预约</view>
		</view>
		
	</view>
</template>
<script>
	import dayjs from "dayjs";
	import { getStatusBarHeight } from "@/utils/system.js";
	import customerNav from '@/components/customerNav.vue';
	import detailItem from './components/detailItem.vue';
	import physicalExamination from '@/api/physicalExamination.js'

	export default {
		components: {
			customerNav,
			detailItem
		},
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			},
		},
		data() {
			return {
				sex: '',
				title: '',
				price: 0.00,
				ordSetsId: '',
				detailInfo: [],
			}
		},
		onLoad(e) {
			this.ordSetsId = e.ordSetsId;
			this.sex = e.sex;
			this.price = parseFloat(e.price).toFixed(2)
			this.getPhysicalExaminationPackageDetail();
		},
		methods: {
			goBack() {
				uni.navigateBack({
					success: () => {
					}, fail: (err) => {
						uni.reLaunch({
							url:'/pages/home/index'
						})
					}
				})
			},
			async getPhysicalExaminationPackageDetail() {
				try {
					let data = {
						locId: '484',
						OrdSetsId: this.ordSetsId,
					}
					const res = await physicalExamination.getPhysicalExaminationPackageDetail(data);
					if (res.data.code == 200) {
						let item = res.data.data.StationItem;
						item.map(v => {
							v.PeOrdItemList.PeOrdItem.map(val => {
								this.detailInfo.push({
									ArcimDesc: val.ArcimDesc,
									StationName: v.StationName,
								})
							})
						})
					}
				} catch(err) {
					console.error(err);
				}
			}
			
		}
	};
</script>

<style lang="less" scoped>
	::v-deep .segmented-control__text {
		font-size: 34rpx !important;
	}
	::v-deep .titleBar {
	  justify-content: center !important;
	}
	.pageBg {
		padding: 0 !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.homePageBg::before { 
		height: 150rpx;
	}
	
	.inventory {
		width: 100%;
		background-color: #f5f5f5;
		.summary-card {
			display: flex;
			gap: 20rpx;
			justify-content: center;
			background: #fff;
			margin: 20rpx;
			padding: 40rpx;
			border-radius: 16rpx;
			box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
			.summary-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			
			.summary-item .label {
				font-size: 26rpx;
				color: #999;
			}
			
			.summary-item .value {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-top: 8rpx;
			}
			
			.summary-item .price {
				font-size: 32rpx;
				font-weight: bold;
				color: #f44;
				margin-top: 8rpx;
			}
		}
		
		
		.container {
			flex: 1;
			overflow-y: auto;
			padding-bottom: 120rpx;
			.content {
				background: #fff;
				.title {
					border-bottom: 1px solid #ccc;
					text-align: center;
					font-size: 30rpx;
					padding: 30rpx 0;
					font-weight: bold;
				}
				.detail {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 10rpx 30rpx;
					.detail-left {
						flex: 1;
						color: #666;
						justify-content: flex-start;
					}
					.detail-right {
						color: #c2c2c2;
						margin-left: 30rpx;
						justify-content: flex-end;
					}
				}
			}
		}
		
		
		.footer-fixed {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 120rpx;
			background-color: #fff;
			display: flex;
			justify-content: flex-end; /* 按钮靠右 */
			align-items: center;
			padding: 0 30rpx;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
			border-top: 1rpx solid #eee;
			z-index: 999;
		}
		
		.next-btn {
			background-color: #3b82f6;
			color: #fff;
			font-size: 32rpx;
			padding: 0 40rpx;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			white-space: nowrap;
			margin-left: auto;
		}
		
	}
</style>
