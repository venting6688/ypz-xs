<template>
	<view class="inventory ">
		<customerNav title="确认体检项目" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<scroll-view scroll-y class="container">
			<view class="content">
				<view class="title">套餐内项目({{packageQuantity}})</view>
				<view class="detail" v-for="(val, index) in detailInfo" :key="index">
					<view>{{val.}}</view>
					<view></view>
				</view>
			</view>
		</scroll-view>
		
		<view class="footer-fixed">
			<view class="left-info">
				<view class="total">共{{packageQuantity}}个项目</view>
				<view class="pay">个人支付 <text class="price">¥{{price}}</text></view>
			</view>
			<view class="next-btn">下一步</view>
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
				detailInfo: {},
			}
		},
		onLoad(e) {
			this.title = this.formatText(e.title);
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
									StationName: val.StationName,
								})
							})
						})
						console.log(JSON.stringify(this.detailInfo),'===w222==');
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
				}
				.detail {
					display: flex;
					view {
						display: flex;
						justify-content: center;
						align-items: center;
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
			justify-content: space-between;
			align-items: center;
			padding: 0 30rpx;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
			border-top: 1rpx solid #eee;
			z-index: 999;
		}
		
		/* 左边上下布局 */
		.left-info {
			display: flex;
			flex-direction: column;
			justify-content: center;
			line-height: 1.4;
		}
		
		.total {
			font-size: 26rpx;
			color: #666;
		}
		
		.pay {
			font-size: 28rpx;
			color: #333;
		}
		
		.price {
			color: #e60012;
			font-weight: bold;
			font-size: 34rpx;
			margin-left: 6rpx;
		}
		
		/* 右边按钮 */
		.next-btn {
			background-color: #3b82f6;
			color: #fff;
			font-size: 32rpx;
			padding: 0 40rpx;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			white-space: nowrap;
		}
		
	}
</style>
