<template>
	<view class="card-list">
		<view v-if="lists.length">
			<view class="card" v-for="(item, index) in lists" :key="index" @click="detail(item)">
				<view class="corner-tag">{{item.sexDesc}}性套餐</view>
				<view class="content">
					<view class="title">
						{{ item.packageDesc }} 
					</view>
					<!-- <text class="orange-tag">{{item.locDesc}}</text> -->
					<view class="price-box">
						<text class="price">¥{{ item.packageAmt }}</text>
						<text class="old-price">¥{{ item.originAmt }}</text>
					</view>
					<view class="tag-row" v-if="item.levelDesc">
						<text class="orange-tag">{{item.levelDesc}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view v-else class="without">
			<image src="../../static/image/wu.png" mode="widthFix"></image>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			lists: {
				type: Array,
				default: () => []
			},
			locId: {
				type: String,
				default: () => ''
			},
		},
		methods: {
			detail(item) {
				let title = item.packageDesc;
				let id = item.ordSetsId;
				let sex = item.sexDesc;
				let price = item.packageAmt;
				uni.navigateTo({
					url: `/sub_packages/physicalExamination/detail?title=${title}&ordSetsId=${id}&sex=${sex}&price=${price}&locId=${this.locId}`
				})
			}
		}
	}
</script>

<style lang="less">
	.card-list {
	  display: flex;
	  flex-direction: column;
	  gap: 20rpx;
		padding: 0 20rpx;
	}
	
	.card {
	  position: relative;
	  background-color: #fff;
	  padding: 30rpx;
	  border-radius: 20rpx;
		margin-bottom: 20rpx;
	  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.corner-tag {
	  position: absolute;
	  top: 0;
	  left: 0;
	  background-color: #4286FF;
	  color: #fff;
	  font-size: 22rpx;
	  padding: 8rpx 20rpx;
	  border-top-left-radius: 20rpx;
	  border-bottom-right-radius: 20rpx;
	}
	
	.content {
	  margin-top: 25rpx;
	}
	
	.title {
	  font-size: 32rpx;
	  font-weight: 600;
	  margin-bottom: 20rpx;
	}
	
	.price-box {
	  display: flex;
	  align-items: baseline;
	  gap: 20rpx;
	  margin-bottom: 20rpx;
	}
	
	.price {
	  font-size: 40rpx;
	  color: #ff3b30;
	  font-weight: bold;
	}
	
	.old-price {
	  font-size: 26rpx;
	  color: #999;
	  text-decoration: line-through;
	}
	
	.tag-row {
	  display: flex;
	  gap: 20rpx;
	  align-items: center;
	}
	
	.orange-tag {
	  background-color: #ff9900;
	  color: #fff;
	  font-size: 22rpx;
	  padding: 4rpx 12rpx;
	  border-radius: 8rpx;
	}
	
	.red-tip {
	  color: #ff3b30;
	  font-size: 22rpx;
	}
</style>