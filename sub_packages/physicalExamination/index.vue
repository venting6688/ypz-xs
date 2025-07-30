<template>
	<view class="inventory pageBg homePageBg">
		<customerNav title=" " />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="head">
			<view class="left">
				<image src="https://aiwz.sdtyfy.com:8099/img/text-my.png" />
				<text>为了更好提升我院服务质量，占用您宝贵的1分钟时间，邀请您填写调查问卷</text>
			</view>
			<image src="https://aiwz.sdtyfy.com:8099/img/manyi.png" mode="aspectFit" />
		</view>
		
	</view>
</template>
<script>
	import HeaderBar from '@/components/HeaderBar.vue';
	export default {
		components: {
			HeaderBar
		},
		data() {
			return {
				items: ['体检信息', '待检查信息'],
				current: 0
			}
		},
		methods: {
			onClickItem(e) {
				if (this.current != e.currentIndex) {
					this.current = e.currentIndex;
				}
			}
		}
	};
</script>

<style lang="less" scoped>
	.inventory {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		.head {
			position: absolute;
			top: 12%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			padding: 0 30rpx;
			box-sizing: border-box;
			.left {
				display: flex;
				flex-direction: column; 
				flex: 1;
				text {
					flex: 1;
					font-size: 28rpx;
					word-wrap: break-word;
				}
				image {
					width: 456rpx;
					height: 66rpx;
					margin-bottom: 20rpx;
				}
			} 
			image {
				width: 200rpx;
				height: 200rpx;
			}
		}
	}
</style>
