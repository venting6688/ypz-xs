<template>
	<view class="inventory">
		<view class="title">请选择体检院区</view>
		<view class="content">
			<view class="banner" @click="getList('484')"><image src="../static/image/select.png" mode="aspectFit" /></view>
			<view class="banner" @click="getList('878')"><image src="../static/image/select1.png" mode="aspectFit" /></view>
		</view>
	</view>
</template>
<script>
	import { mapMutations } from 'vuex'
	import { getStatusBarHeight } from "@/utils/system.js";
	import customerNav from '@/components/customerNav.vue';
	export default {
		components: {
			customerNav,
		},
		onLoad() {
			let loginValue = uni.getStorageSync("loginData");
			this.loginData = loginValue ? JSON.parse(loginValue) : {};
		},
		methods: {
			...mapMutations({
				setLocId: 'SET_LOCID',
			}),
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
			getList(id) {
				uni.setStorageSync('locId', id);
				this.setLocId(id);
				uni.navigateTo({
					url: `/sub_packages/physicalExamination/index`
				})
			}
		}
	};
</script>

<style lang="less" scoped>
	.unl-popup.bottom {
	  padding-bottom: 0 !important;
	}
	.pageBg {
		padding: 0 !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.inventory {
		width: 100%;
		height: 100vh;
		background-color: #f5f5f5;
		.title {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 20rpx 0 15rpx;
			font-size: 34rpx;
		}
		.content {
			display: flex;
			flex-direction: column;
			.banner {
				padding: 0 20rpx;
				image {
					width: 744rpx;
					height: 420rpx;
				}
			}
		}
	}
</style>
