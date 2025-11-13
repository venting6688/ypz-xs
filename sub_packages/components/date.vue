<template>
	<view class="box">
		<view class="header">
			<view class="date-btn">
				<view :class="{blue:dateState=== 'week'}" @click="timeClick('week')">
					一周内
				</view>
				<view :class="{blue:dateState=== 'month'}" @click="timeClick('month')">
					1个月内
				</view>
			</view>
		</view>
		<view class="date" :class="{blueBorder:dateState=== 'other'}">
			<uni-datetime-picker 
			v-model="range" 
			:end="now"
			type="daterange" 
			style="border: none !important; border-radius: 15rpx !important;" 
			/>
		</view> 
	</view>
</template>

<script>
	import dayjs from 'dayjs';
	export default {
		data() {
			return {
				date:{},
				dateState: 'week',
				now: dayjs().format('YYYY-MM-DD'),
				range: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
			}
		},
		watch: {
			range(newval) {
				console.log('s0s00s0s');
				this.date = {
					startTime: this.range.length ? this.range[0] : '',
					endTime: this.range.length ? this.range[1] : ''
				}
				this.dateState = 'other';
				this.$emit('handle',this.date)
			},
		},
		mounted() {
			let startTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
			this.date = {
				startTime,
				endTime: this.now
			}
			this.$emit('handle', this.date)
		},
		methods: {
			timeClick(type) {
				let time = type == 'week' ? 7 : 30;
				let startTime = dayjs().subtract(time, 'day').format('YYYY-MM-DD')
				this.date = {
					startTime,
					endTime: this.now
				}
				this.dateState = type
				this.$emit('handle', this.date)
			}
		}
	}
</script>

<style lang="less" scoped>
	.box {
		display: flex;
		margin-top: 25rpx;
		align-items: center;
		justify-content: space-between;
		.date {
			width: 55%;
			margin-right: 25rpx;
		}
		.blueBorder {
			border: 1px solid #4286ff;
		}
		.date-btn {
			display: flex;
			view {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 28rpx;
				line-height: 28rpx;
				border: 2rpx solid #ccc;//#4286ff;
				border-radius: 10rpx;
				padding: 17rpx 20rpx;
				color: #076aff;
				margin-left: 20rpx;
			}
			.blue {
				background: #4286ff !important;
				color: #ffffff !important;
			}
			
		}
	}
</style>