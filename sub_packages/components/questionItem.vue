<template>
  <view class="question-box">
    <view class="question-title">{{ index }}. {{ title }}</view>
    <view v-if="type === 'radio'" class="options">
			<radio-group @change="handleRadioChange" class="option-group">
			  <label v-for="(item, i) in options" :key="i" class="option-label">
			    <radio :value="item" :checked="value === item" class="custom-radio" />
			    <text class="option-text">{{ item }}</text>
			  </label>
			</radio-group>
    </view>
		
    <view v-else-if="type === 'checkbox'" class="options">
			<checkbox-group @change="handleCheckboxChange" class="option-group">
			  <label v-for="(item, i) in options" :key="i" class="option-label">
			    <checkbox :value="item" :checked="Array.isArray(value) && value.includes(item)" class="custom-radio" />
			    <text class="option-text">{{ item }}</text>
			  </label>
			</checkbox-group>
    </view>
		
		<view v-else-if="type === 'input'" class="input-wrapper">
			<textarea
				class="input-box"
				v-model="innerValue"
				@input="emitInput"
				placeholder="请输入内容"
				auto-height
			/>
		</view>
		
  </view>
</template>

<script>
export default {
  name: 'questionItem',
   props: {
		title: String,
		index: Number,
		type: {
			type: String,
			default: 'radio'
		},
		options: {
			type: Array,
			default: () => []
		},
		required: {
			type: Boolean,
			default: false
		},
		value: {
		  type: [String, Array],
		  default: () => []
		}
	},
	data() {
		return {
			innerValue: this.value,
		};
	},
	watch: {
		value(val) {
			this.innerValue = val;
		}
	},
  methods: {
    handleRadioChange(e) {
			this.$emit('update:value', e.detail.value);
		},
		handleCheckboxChange(e) {
			this.$emit('update:value', e.detail.value);
		},
		emitInput() {
			this.$emit('update:value', this.innerValue);
		}
  }
}
</script>

<style scoped>
	.custom-radio {
	  transform: scale(0.6); 
	  transform-origin: center;
	}
	
	.question-box {
		width: 700rpx;
		margin: 30rpx 0;
		padding: 20rpx 30rpx;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 0 8rpx rgba(0, 0, 0, 0.05);
	}
	.question-title {
		font-size: 32rpx;
		margin-bottom: 20rpx;
	}
	.required {
		color: red;
		margin-right: 8rpx;
	}
	.option-group {
	  display: flex;
	  flex-wrap: wrap;
	  gap: 20rpx; /* 选项之间留白 */
	}
	
	.option-label {
	  display: flex;
	  align-items: center;
	  margin-right: 20rpx;
	  padding: 10rpx 0;
	}
	
	.option-text {
	  font-size: 30rpx;
	  color: #666;
	}
	.input-wrapper {
		margin-top: 20rpx;
	}
	.input-box {
		width: 100%;
		min-height: 100rpx;
		border: 2rpx solid #ccc;
		border-radius: 10rpx;
		padding: 10rpx;
		font-size: 28rpx;
		color: #333;
	}
</style>
