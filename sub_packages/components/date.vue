<template>
	<view class="box">
		<view class="header">
			<view class="date">
				<picker mode="date" header-text="选择年"  :start="startIndex" :end="endIndex" fields="year" :value="year" @change="bindDateChange">
				    <view class="date">
				        <text>{{year!=='无'?year+'年':year}}</text>
				        <image src="../../static/image/Frame.png" mode=""></image>
				    </view>
				</picker>
				<picker @change="bindPickerdateChange" :value="index" :range="monthArr">
				    <view class="date">
				      <text>{{monthArr[index]}}</text>
					  <image src="../../static/image/Frame.png" mode=""></image>
				    </view>
				  </picker>
			</view>
			<view class="date-btn">
				<view :class="{blue:dateState===1}" @click="timeClick(1)">
					近半年
				</view>
				<view :class="{blue:dateState===2}" @click="timeClick(2)">
					近三个月
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import moment from 'moment';
	
	export default {
		
		data(){
			return {
				year: '无',
				indexValue:'',
				date:{},
				index:0,
				dateState:0,
				startIndex:null,
				endIndex:null,
				monthArr:['无','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
			}
		},

		methods: {
			bindDateChange(e) {
				this.year = e.detail.value;
				this.dateState = 0
				this.dateFun()
			},
			bindPickerdateChange(e) {
			    this.index = e.detail.value;
				if(this.index.length===1){
					this.indexValue = `0${this.index}`
				}				
				this.dateState = 0
				this.dateFun()
			},
			timeClick(num){
				this.dateState = num
				this.year = '无'
				this.index = 0
				this.dateFun()
			},
			dateFun(){
				if(!this.dateState){
					let date = this.getMonthStartEnd(this.indexValue, this.year);
					this.date.startTime = date.start
					this.date.endTime = date.end
				} else {
					let monthNum = this.dateState === 1 ? 6 : 3;
					this.date = {
						startTime: moment().subtract(monthNum, 'months').format('YYYY-MM-DD'),
						endTime: moment().format('YYYY-MM-DD'),
					}
				}
				this.$emit('handle',this.date)
			},
			padDate(value) { return value < 10 ? '0' + value : value },
			// 获取月份的起止时间
			getMonthStartEnd(month, year) {
			  // 创建一个 moment 对象，设置为该月的第一天
			  const start = moment({year: year, month: month - 1, day: 1}).startOf('month');
			  // 获取当月的最后一天
			  const end = moment(start).endOf('month');  
			  return {
			    start: start.format('YYYY-MM-DD'),
			    end: end.format('YYYY-MM-DD')
			  };
			},
		},
		mounted() {
			this.endIndex= new Date().getFullYear();
			this.startIndex = this.endIndex - 5;
			this.timeClick(2)
		},
		
	}
</script>

<style lang="less" scoped>
	.box {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 30rpx;
			
			.date {
				min-width: 208rpx;
				height: 72rpx;
				background: #ffffff;
				border-radius: 12rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				.date {
					display: flex;
					justify-content: center;
					align-items: center;
					min-width: 50%;
					padding: 0 10rpx;
					
					text {
						min-width: 60rpx;
					}
					image {
						width: 22rpx;
						height: 12rpx;
					}
				}
			}
			.date-btn {
				display: flex;
				view {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 56rpx;
					font-size: 28rpx;
					line-height: 28rpx;
					border: 2rpx solid #4286ff;
					border-radius: 42rpx;
					padding: 0 20rpx;
					color: #076aff;
					margin-left: 20rpx;
				}
				.blue {
					background: #4286ff !important;
					color: #ffffff !important;
				}
			}
		}
	}
</style>