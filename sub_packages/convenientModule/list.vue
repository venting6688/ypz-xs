<template>
	<view class="inventory">
		<bar />
		<view class="date"><date @handle="show" /></view>
		<view class="center">
			<view class="top" @click="showDetail(item.value)" v-for="(item, index) in dayList" :key="index">
				<view class="title">
					<view class="left">{{item.date}}</view>
					<view class="right">
						<text>查看详情</text>
						<image src="../static/image/Vector@2x.png" mode=""></image>
					</view>
				</view>
				<view class="content">本日消费金额：￥{{item.totalAmount}}元</view>
			</view>
			<view v-if="dayList.length === 0" class="without">
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
	import date from '../components/date.vue'
	import hospitalizationApi from '@/api/hospitalizationApi.js';
	export default {
		components:{
			bar,
			date,
		},
		data() {
			return {
				date:{},
				dayList: [],
				admID: '',
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
				this.getHospitalizationDaysList();
			},
		},
		onLoad(e) {
			this.admID = e.id;
			this.startDate = e.date;
			this.getHospitalizationDaysList();
		},
		
		methods: {
			show(time){
				const datePattern = /^\d{4}-\d{2}-\d{2}$/.test(time.startTime);
				if(datePattern){
					this.date = time
					this.getHospitalizationDaysList()
				}
			},
			async getHospitalizationDaysList () {
				let str = {
					startDate: this.startDate,
					endDate: this.endDate,
					admID: this.admID,
				}
				let data = await hospitalizationApi.getHospitalizationDaysList(str);
				this.dayList = [];
				if (data.data.code === 200) {
					this.dayList = data.data.data;
					this.dayList.sort((a, b) => new Date(b.date) - new Date(a.date))
				} 
			},
			showDetail(data) {
				uni.navigateTo({
					url: `/sub_packages/convenientModule/detail?data=${encodeURIComponent(JSON.stringify(data))}`
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
			height: 70rpx;
		}
		.center {
			margin: 20rpx 20rpx;
			padding: 10rpx 0;
			background: #ffffff;
			border-radius: 12rpx;
			.widthout {
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
				padding: 0 10rpx 20rpx;
				border-bottom: 1px solid #eee;
				.content {
					margin:0 20rpx;
					text-align: left;
				}
			}
			.bottom {
				background: #f8f8f8;
				margin:20rpx 10rpx 0 10rpx;
				.content {
					margin:0 20rpx;
					// display: flex;
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
