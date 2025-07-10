<template>
	<view class="box">
		<uni-datetime-picker 
		v-model="range" 
		type="daterange" 
		style="border: none !important; border-radius: 15rpx !important;" 
		/>
	</view>
</template>

<script>
	import dayjs from 'dayjs';
	export default {
		data() {
			return {
				date:{},
				range: [dayjs().subtract(6, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
			}
		},
		watch: {
			range(newval) {
				this.date = {
					startTime: this.range.length ? this.range[0] : '',
					endTime: this.range.length ? this.range[1] : ''
				}
				this.$emit('handle',this.date)
			},
		},
		mounted() {
			this.date = {
				startTime: this.range.length ? this.range[0] : '',
				endTime: this.range.length ? this.range[1] : ''
			}
			this.$emit('handle', this.date)
		}
	}
</script>

<style lang="less" scoped>
	.box {
		margin: 15rpx auto;
		width: 92%;
		border: 3rpx solid #4286ff;
	}
</style>