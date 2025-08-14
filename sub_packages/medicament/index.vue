<template>
	<view class="inventory pageBg homePageBg">
		<customerNav title="药品查询" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="container">
			<uni-section title="请输入药品名称查询" type="line">
				<uni-search-bar 
				placeholder="请输入药品名称查询" 
				bgColor="#fff" 
				@confirm="search" 
				@cancel="cancel" 
				@clear="clear"
				/>
			</uni-section>
			<view>
				<view class="list" v-for="(item, index) in visibleData" :key="index">
					<view class="title">{{item.ItemDesc}}</view>
					<view class="price">￥{{item.Price}}元</view>
					<view class="content">{{item.Factory}}</view>
				</view>
				
				<!-- 加载状态提示 -->
				<view v-if="loading" class="loading-text">加载中...</view>
				<view v-if="noMoreData" class="no-more-text">没有更多数据了</view>
				<view v-if="searchData" class="search-text">请输入您要查询的药品名称</view>
				
				<view v-if="noData" class="without">
					<image src="../static/image/wu.png" mode="widthFix"></image>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import HeaderBar from '@/components/HeaderBar.vue';
	import customerNav from '@/components/customerNav.vue';
	import { getStatusBarHeight } from "@/utils/system.js";
	import hospitalizationApi from '@/api/hospitalizationApi.js';
	
	export default {
		components: {
			HeaderBar,
			customerNav
		},
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			}
		},
		data() {
			return {
				recordList: [],
				visibleData: [],
				currentPage: 1,
				pageSize: 10,
				noData: false,
				loading: false,
				noMoreData: false,
				searchData: true,
				filter: '',
			}
		},
		onLoad() {
			let loginValue = uni.getStorageSync("loginData");
			this.loginData = loginValue ? JSON.parse(loginValue) : {};
		},
		onReachBottom() {
			this.loadMore();
		},
		onPullDownRefresh() {
			this.refreshData()
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
			search(res) {
				this.filter = res.value;
				this.getList();
			},
			cancel(res) {
				this.recordList = [];
				this.visibleData = [];
				this.noData = false;
				this.noMoreData = false;
				this.searchData = true;
			},
			clear(res) {
				this.recordList = [];
				this.visibleData = [];
				this.noData = false;
				this.noMoreData = false;
				this.searchData = true;
			},
			async getList() {
				this.loading = true;
				try {
					let data = { Keywords: this.filter };
					const res = await hospitalizationApi.drugQuery(data);
					this.recordList = []; this.visibleData = [];
					if (res.data.code === 200) {
						this.searchData = false;
						this.noData = false;
						this.recordList = res.data.data.MedItem;
						this.visibleData = this.recordList.slice(0, this.pageSize); 
					} else {
						this.loading = false;
						this.searchData = false;
						this.noData = true;
						this.recordList = [];
						this.visibleData = [];
					}
				} catch (error) {
					console.error("数据加载失败:", error);
				} finally {
					this.loading = false;
				}
			},
			loadMore() {
				if (this.noMoreData || this.loading) return;
				this.loading = true;
				setTimeout(() => { 
					const nextPageData = this.recordList.slice(
						this.currentPage * this.pageSize,
						(this.currentPage + 1) * this.pageSize
					);
				
					if (nextPageData.length === 0) {
						this.noMoreData = true;
					} else {
						this.visibleData = [...this.visibleData, ...nextPageData];
						this.currentPage++;
					}
					this.loading = false;
				}, 800);
			},

		}
	};
</script>

<style lang="less" scoped>
	.pageBg {
		padding: 0 !important;
	}
	::v-deep .titleBar {
	  justify-content: center !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.homePageBg::before {
		height: 350rpx;
	}
	.inventory {
		width: 100%;
		background-color: #f5f5f5;
		.container {
			width: 100%;
			position: absolute;
			top: 15%;
			.list {
				display: flex;
				margin: 25rpx;
				padding: 20rpx;
				background: #fff;
				border-radius: 15rpx;
				flex-direction: column;
				view {
					padding-bottom: 10rpx
				}
				.price {
					color: #ff0000;
				}
			}
			.loading-text,
			.no-more-text,
			.search-text{
			  text-align: center;
			  padding: 20rpx;
			  color: #999;
			}
			.search-text {
				color: #333;
			}
			.without {
				margin-top: 30rpx;
			}
		}
	}
</style>
