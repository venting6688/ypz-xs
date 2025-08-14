<template>
	<view class="detail">
		<view class="title">
			<view>项目</view>
			<view>项目描述</view>
		</view>
		<view 
		class="detailContent" 
		v-for="(val, index) in detailInfo" 
		:key="index"
		>
			<view class="name">{{val.StationName}}项目({{val.PeOrdItemList.PeOrdItem.length}}项)</view>
			<view 
			class="title" 
			v-for="(item, k) in val.PeOrdItemList.PeOrdItem" 
			:key="k"
			>
				<view class="proName">{{item.ArcimDesc}}</view>
				<view class="des">暂无描述内容，敬请期待！</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			detailInfo: Array,
			default: [],
		},
		
	}
</script>

<style lang="less">
	.detail {
		margin-top: 20rpx;
		.title {
			display: flex;
			gap: 20rpx;
			margin-bottom: 20rpx;
			view {
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				background: #ECF5FF;
				padding: 15rpx 0;
				border-radius: 10rpx;
				color: #02134E;
				font-weight: bold;
			}
			view:first-child {
				flex: 1;
				padding: 15rpx;
			}
			view:last-child {
				flex: 2;
				padding: 15rpx;
			}
			.des {
				background: #F2F4F7;
				color: #333333;
				font-weight: normal;
			}
			.proName {
				background: #F2F4F7;
			}
		}
		
		.detailContent {
			// margin-top: 15rpx;
			.name {
				background: #4286FF;
				color: #fff;
				border-radius: 10rpx;
				font-size: 30rpx;
				padding: 15rpx;
				margin-bottom: 15rpx;
			}
		}
	}
	
</style>