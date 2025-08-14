<template>
	<view class="inventory">
		<bar v-if="footData.patientUniquelyIdentifies"/>
		<view class="date">
			<uni-datetime-picker v-model="range" type="daterange" style="border: none !important; border-radius: 15rpx !important;" />
		</view>
		<view class="center">
			<view class="top" @click="showInfo(item)" v-for="(item, index) in visibleData" :key="index">
				<view class="title">
					<view class="left">{{item.admDate}}</view>
					<view class="right">
						<text>查看详情</text>
						<image src="../static/image/Vector@2x.png" mode=""></image>
					</view>
				</view>
				<view class="content">住院科室：{{item.admDept}}</view>
				<view class="content">住院费用：￥{{item.totalAmount}}元</view>
			</view>
			
			<!-- 加载状态提示 -->
			<view v-if="loading" class="loading-text">加载中...</view>
			<view v-if="noMoreData" class="no-more-text">没有更多数据了</view>
			
			<view v-if="recordList.length === 0" class="without">
				<image src="../static/image/wu.png" mode="widthFix"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import dayjs from 'dayjs';
	import { mapState } from 'vuex';
	import bus from "@/utils/bus.js";
	import bar from '../components/bar.vue'
	import hospitalizationApi from '@/api/hospitalizationApi.js';
	export default {
		components:{
			bar,
		},
		data() {
			return {
				recordList: [],
				date:{},
				visibleData: [],  // 当前展示的数据（每次8条）
				currentPage: 1,   // 当前页
				pageSize: 10,     // 每页条数
				loading: false,   // 加载状态
				noMoreData: false, // 是否无更多数据
				range: [],
				startDate: '',
				endDate: '',
			}
		},
		computed: {
			...mapState(['footData','department']),
		},
		watch: {
			range(newval) {
				this.startDate = this.range.length ? this.range[0] : ''
				this.endDate =  this.range.length ? this.range[1] : ''
				this.fetchAllData();
			},
		},
		mounted() {
			this.fetchAllData()
		},
		onReachBottom() {
			this.loadMore(); // 触底加载更多
		},
		methods: {
			async fetchAllData() {
				this.loading = true;
				try {
					let data = {
						AimFlag: 'All',
						patientID: this.footData.patientUniquelyIdentifies,
						startDate: this.startDate,
						endDate: this.endDate
					}
					const res = await hospitalizationApi.getHospitalRecord(data);
					this.recordList = []; this.visibleData = [];
					if (res.data.code === 200 && res.data.data.admInfoList != undefined) {
						let resData = res.data.data.admInfoList.admInfo
						resData.sort((a, b) => new Date(b.admDate) - new Date(a.admDate))
						this.recordList = resData;
						this.visibleData = this.recordList.slice(0, this.pageSize); 
					} else {
						this.loading = false;
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
			
			showInfo(data) {
				uni.navigateTo({
					url: `/sub_packages/convenientModule/list?id=${data.admID}&date=${data.admDate}`
				})
			}
		},
	}
</script>

<style lang="less" scoped>
	.moveR-enter-active,  .moveR-leave-active {
	    transition: all 4s linear;
	    transform: translateX(0);
	  }
	   .moveR-enter,  .moveR-leave {
	    transform: translateX(100%);
	  }
	   .moveR-leave-to{
	     transform: translateX(100%);
	   }
	.inventory{
		.date {
			margin: 15rpx auto;
			width: 92%;
			border: 3rpx solid #4286ff
		}
		.center {
			margin:28rpx 33rpx 0 33rpx;
			width: 684rpx;
			background: #ffffff;
			border-radius: 12rpx;
			padding: 20rpx 0;
			
			.loading-text,
			.no-more-text {
			  text-align: center;
			  padding: 20rpx;
			  color: #999;
			}
			
			&:last-of-type{
				margin:28rpx 33rpx 28rpx 33rpx;
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
					width: 75%;
				}
			}
			
			.title {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 10rpx 0 15rpx;
				margin:0 20rpx;
				.right {
					image {
						width: 12rpx;
						height: 16rpx;
						margin-left: 10rpx
					}
					text {
						color: #4286FF;
					}
				}
			}
			.top {
				margin:15rpx 10rpx;
				padding: 15rpx 10rpx;
				border-bottom: 1px solid #eee;
				.content {
					margin:15rpx 20rpx;
					text-align: left;
				}
			}
			.bottom {
				background: #f8f8f8;
				margin: 20rpx 10rpx 0 10rpx;
				.content {
					margin:0 20rpx;
					text-align: left;
					.btn {
						width: 100%;
						text-align: right;
						padding-bottom: 20rpx;
						button {
							width: 180rpx;
							height: 48rpx;
							background: linear-gradient(353deg,#479cff 0%, rgba(71,188,253,0.89) 54%, rgba(71,216,251,0.80) 100%);
							border-radius: 70rpx;
							color: #ffffff;
							white-space: nowrap;
						}
					}
				}
				
			}
		}
	}
</style>
