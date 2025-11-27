<template>
	<view class="box">
		<view class="header">
			<view class="date-btn" @click="openDatePopup">
				<uni-icons type="calendar" size="24" color="#999"></uni-icons>
				<text>{{ date.startTime }} ~ {{ date.endTime }}</text>
			</view>
			<view class="left">
				<uni-section title="请选择时间" type="line">
					<view class="uni-px-5 uni-pb-5">
						<uni-data-select v-model="value" :localdata="range" :clear="false" @change="timeClick"></uni-data-select>
					</view>
				</uni-section>
			</view>
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
								<view v-for="y in years" :key="y" class="picker-item">{{ y }}年</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="m in months" :key="m" class="picker-item">{{ m }}月</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="d in startDays" :key="d" class="picker-item">{{ d }}日</view>
							</picker-view-column>
						</picker-view>
					</view>

					<view class="date-column">
						<picker-view :value="endIndex" @change="onEndChange">
							<picker-view-column>
								<view v-for="y in years" :key="y" class="picker-item">{{ y }}年</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="m in months" :key="m" class="picker-item">{{ m }}月</view>
							</picker-view-column>
							<picker-view-column>
								<view v-for="d in endDays" :key="d" class="picker-item">{{ d }}日</view>
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
			value: 1,
			now: dayjs().format('YYYY-MM-DD'),
			range: [
				{ value: 1, text: '本周内'},
				{ value: 2, text: '近三月'},
				{ value: 3, text: '近半年'},
				{ value: 4, text: '近一年'},
			],

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
	created() {
		const sysInfo = uni.getSystemInfoSync();
		this.isIOS = sysInfo.platform === 'ios';
	},
	mounted() {
		let dateObj = this.getWeekRange();
		this.date = {
			startTime: dateObj.start,
			endTime: dateObj.end
		};
		this.$emit('handle', this.date);
	
		this.updateDays(this.startIndex[0], this.startIndex[1], 'start');
		this.updateDays(this.endIndex[0], this.endIndex[1], 'end');
	},
	methods: {
		timeClick(e) {
		  let startTime = '',
		      endTime = '';
		  switch (e) {
		    case 1:
		      let dateObj = this.getWeekRange();
		      startTime = dateObj.start;
		      endTime = dateObj.end;
		      break;
		    case 2:
		      startTime = dayjs().subtract(3, 'month').startOf('month').format('YYYY-MM-DD');
		      endTime = this.now;
		      break;
		    case 3:
		      startTime = dayjs().subtract(6, 'month').startOf('month').format('YYYY-MM-DD');
		      endTime = this.now;
		      break;
		    default:
		      startTime = dayjs().startOf('year').format('YYYY-MM-DD');
		      endTime = dayjs().endOf('year').format('YYYY-MM-DD');
		      break;
		  }
		  this.date = { startTime, endTime };
		  this.$emit('handle', this.date);
		
		  // ★ 新增：同步日期插件选中内容
		  this.startDate = startTime;
		  this.endDate = endTime;
		  const s = dayjs(startTime);
		  const e2 = dayjs(endTime);
		  this.startIndex = [
		    this.years.indexOf(s.year()),
		    this.months.indexOf(s.month() + 1),
		    s.date() - 1
		  ];
		  this.endIndex = [
		    this.years.indexOf(e2.year()),
		    this.months.indexOf(e2.month() + 1),
		    e2.date() - 1
		  ];
		  this.updateDays(this.startIndex[0], this.startIndex[1], 'start');
		  this.updateDays(this.endIndex[0], this.endIndex[1], 'end');
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
		    endTime: this.endDate
		  };
		
		  const start = dayjs(this.startDate);
		  const end = dayjs(this.endDate);
		  const now = dayjs();
		
		  const week = this.getWeekRange();
		  if (this.startDate === week.start && this.endDate === week.end) {
		    this.value = 1;
		  } else if (start.isSame(now.subtract(3, 'month').startOf('month')) || start.isAfter(now.subtract(3, 'month')) ) {
		    this.value = 2;
		  } else if (start.isSame(now.subtract(6, 'month').startOf('month')) || start.isAfter(now.subtract(6, 'month')) ) {
		    this.value = 3;
		  } else if (start.isSame(now.startOf('year')) || start.isAfter(now.startOf('year'))) {
		    this.value = 4;
		  } else {
		    this.value = '';  // 自定义，不匹配任何
		  }
		
		  this.$emit('handle', this.date);
		},
	}
};
</script>

<style lang="less" scoped>
.box {
	margin-top: 25rpx;
	.header {
		padding: 0 20rpx;
		.left {
			float: right;
			width: 25%;
		}
	}
	.date-btn {
		width: 73%;
		float: left;
		text-align: center;
		font-size: 32rpx;
		background-color: #fff;
		border: 2rpx solid #c0c4cc;
		border-radius: 10rpx;
		padding: 8rpx 17rpx 8rpx 0;
		color: #333;
	
		display: flex;
		align-items: center;
		justify-content: center; 
		gap: 10rpx;
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
	.picker-item {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  font-size: 30rpx;
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
