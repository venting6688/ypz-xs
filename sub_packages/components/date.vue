<template>
	<view class="box">
		<view class="header">
			<view class="date-btn">
				<view :class="{ blue: dateState === 'week' }" @click="timeClick('week')">本周内</view>
				<view :class="{ blue: dateState === 'month' }" @click="timeClick('month')">三个月内</view>
				<view :class="{ blue: dateState === 'other' }" @click="openDatePopup">其他时间</view>
			</view>
			<view class="result" v-if="selectedType === 'other' && startDate && endDate">{{ startDate }} ~ {{ endDate }}</view>
		</view>

		<uni-popup ref="datePopup" type="bottom" :safe-area-inset-bottom="false">
			<view class="popup-content" :style="{ marginBottom: isIOS ? '-70rpx' : '0' }">
				<view class="title">时间选择</view>
				<view class="dateText">
					<view class="start">{{ startDate }}</view>
					<view>至</view>
					<view class="end">{{ endDate }}</view>
				</view>
				<view class="date-row">
					<view class="date-column">
						<picker-view :value="startIndex" @change="onStartChange">
							<picker-view-column>
								<view v-for="y in years" :key="y">{{ y }}年</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="m in months" :key="m">{{ m }}月</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="d in startDays" :key="d">{{ d }}日</view>
							</picker-view-column>
						</picker-view>
					</view>

					<view class="date-column">
						<picker-view :value="endIndex" @change="onEndChange">
							<picker-view-column>
								<view v-for="y in years" :key="y">{{ y }}年</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="m in months" :key="m">{{ m }}月</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="d in endDays" :key="d">{{ d }}日</view>
							</picker-view-column>
						</picker-view>
					</view>
				</view>

				<view class="popup-footer" @click="confirm">确定</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import dayjs from 'dayjs';
export default {
	data() {
		const today = dayjs();
		const currentYear = today.year();
		return {
			date: {},
			dateState: 'week',
			now: dayjs().format('YYYY-MM-DD'),
			// range: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],

			//新增
			isIOS: false,
			years: [currentYear - 2, currentYear - 1, currentYear],
			months: Array.from({ length: 12 }, (_, i) => i + 1),
			startDays: Array.from({ length: 31 }, (_, i) => i + 1),
			endDays: Array.from({ length: 31 }, (_, i) => i + 1),

			// 默认选中为今天
			startIndex: [2, today.month(), today.date() - 1], // 2 对应当前年
			endIndex: [2, today.month(), today.date() - 1],

			startDate: today.format('YYYY-MM-DD'),
			endDate: today.format('YYYY-MM-DD')
		};
	},
	// watch: {
	// 	range(newval) {
	// 		console.log('s0s00s0s');
	// 		this.date = {
	// 			startTime: this.range.length ? this.range[0] : '',
	// 			endTime: this.range.length ? this.range[1] : ''
	// 		}
	// 		this.dateState = 'other';
	// 		this.$emit('handle',this.date)
	// 	},
	// },
	created() {
		const sysInfo = uni.getSystemInfoSync();
		this.isIOS = sysInfo.platform === 'ios';
	},
	mounted() {
		let startTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
		this.date = {
			startTime,
			endTime: this.now
		};
		this.$emit('handle', this.date);

		this.updateDays(this.startIndex[0], this.startIndex[1], 'start');
		this.updateDays(this.endIndex[0], this.endIndex[1], 'end');
	},
	methods: {
		timeClick(type) {
			let startTime = '',
				endTime = '';
			switch (type) {
				case 'week':
					let dateObj = this.getWeekRange();
					startTime = dateObj.start;
					endTime = dateObj.end;
					break;
				default:
					startTime = dayjs().subtract(3, 'month').startOf('month').format('YYYY-MM-DD');
					endTime = this.now;
					break;
			}
			this.date = {
				startTime,
				endTime
			};
			this.dateState = type;
			this.$emit('handle', this.date);
		},
		getWeekRange() {
			const currentDay = dayjs().day(); // 星期几（0=周日）
			const start = dayjs()
				.subtract((currentDay + 6) % 7, 'day')
				.format('YYYY-MM-DD');
			const end = dayjs()
				.add((7 - currentDay) % 7, 'day')
				.format('YYYY-MM-DD');
			return { start, end };
		},

		//新增
		openDatePopup() {
			this.$refs.datePopup.open();
			this.dateState = 'other'
		},
		updateDays(yearIndex, monthIndex, type) {
			const year = this.years[yearIndex];
			const month = this.months[monthIndex];
			const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
			const arr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

			if (type === 'start') {
				this.startDays = arr;
				if (this.startIndex[2] >= daysInMonth) this.startIndex[2] = daysInMonth - 1;
			} else {
				this.endDays = arr;
				if (this.endIndex[2] >= daysInMonth) this.endIndex[2] = daysInMonth - 1;
			}
		},
		onStartChange(e) {
			const [yIndex, mIndex, dIndex] = e.detail.value;
			this.startIndex = [yIndex, mIndex, dIndex];
			this.updateDays(yIndex, mIndex, 'start');

			const year = this.years[yIndex];
			const month = this.months[mIndex];
			const day = this.startDays[dIndex];
			this.startDate = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');

			if (dayjs(this.endDate).isBefore(this.startDate)) {
				this.endDate = this.startDate;
				this.endIndex = [...this.startIndex];
			}
		},
		onEndChange(e) {
			const [yIndex, mIndex, dIndex] = e.detail.value;
			this.endIndex = [yIndex, mIndex, dIndex];
			this.updateDays(yIndex, mIndex, 'end');

			const year = this.years[yIndex];
			const month = this.months[mIndex];
			const day = this.endDays[dIndex];
			this.endDate = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');

			if (dayjs(this.endDate).isBefore(this.startDate)) {
				this.endDate = this.startDate;
				this.endIndex = [...this.startIndex];
			}
		},
		confirm() {
			this.$refs.datePopup.close();
			this.date = {
				startTime: this.startDate,
				endTime: this.endDate,
			}
			this.$emit('handle',this.date)
			this.dateState = 'other'
		},
		cancel() {
			this.$refs.datePopup.close();
		}
	}
};
</script>

<style lang="less" scoped>
.box {
	margin-top: 25rpx;
	.date {
		width: 55%;
		margin-right: 25rpx;
	}
	.blueBorder {
		border: 1px solid #4286ff;
	}
	.date-btn {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		justify-content: space-between;
	}
	
	.date-btn > view {
	  text-align: center;
	  font-size: 28rpx;
	  line-height: 28rpx;
	  border: 2rpx solid #ccc;
	  border-radius: 10rpx;
	  padding: 17rpx;
	  color: #076aff;
	}
	.date-btn > view + view {
	  margin-left: 20rpx;
	}
	.blue {
	  background: #4286ff !important;
	  color: #ffffff !important;
	}

	//new css
	.popup-content {
		padding: 20px 20px;
		background-color: #fff;
	}
	.title {
		font-size: 18px;
		font-weight: bold;
		text-align: center;
		padding-bottom: 20px;
	}
	.dateText {
		display: flex;
		font-size: 32rpx;
		align-items: center;
		padding-bottom: 20rpx;
		justify-content: space-around;
		.start,
		.end {
			color: #4286ff;
		}
	}
	.date-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.date-column {
		flex: 1;
		margin-right: 10px;
	}
	.label {
		margin-bottom: 5px;
		font-size: 16px;
	}
	.popup-footer {
		color: #fff;
		border-radius: 15rpx;
		background: #4286ff;
		padding: 20rpx 15rpx;
		text-align: center;
		font-size: 36rpx;
	}
	picker-view {
		height: 150px;
		margin-bottom: 10px;
	}
}
</style>
