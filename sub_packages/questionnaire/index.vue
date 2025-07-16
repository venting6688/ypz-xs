<template>
	<view class="homeLayout pageBg homePageBg">
		<customerNav title=" " />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="head">
			<view class="left">
				<image src="../static/image/text-my.png" />
				<text>为了更好提升我院服务质量，占用您宝贵的1分钟时间，邀请您填写调查问卷</text>
			</view>
			<image src="../static/image/manyi.png" mode="aspectFit" />
		</view>
		<view class="content">
			<questionItem
			  v-for="(q, idx) in questionList"
			  :key="q.index"
			  :index="q.index"
			  :title="q.title"
			  :type="q.type"
			  :options="q.options"
			  :required="q.required"
			  :showIf="q.showIf"
			  :parentAnswer="q.showIf ? answers[q.showIf.qIndex] : null"
			  v-model="answers[q.index]"
			/>

			<button class="btnStyle bigBtn" @click="submit">提交</button>
		</view>
		<view class="fill" :style="{ height: barHeight + 'px' }"></view>
	</view>
</template>

<script>
	import customerNav from '@/components/customerNav.vue';
	import questionItem from '../components/questionItem.vue'
	import { getStatusBarHeight } from "@/utils/system.js";
	
	export default {
	  components: {
	    customerNav,
			questionItem
	  },
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			},
		},
		data() {
			return {
				answers: {},
				questionList: [
				  {
				    index: 1,
				    title: '你对我院预约方式是否满意？',
				    type: 'radio',
				    options: ['很满意', '满意', '一般', '不满意', '很不满意'],
				  },
				  {
				    index: 2,
				    title: '您认为各楼层的指示牌、路标等引导标识清晰准确吗？',
				    type: 'radio',
				    options: ['很准确', '准确', '一般', '不准确', '很不明确', '未关注'],
				  },
				  {
				    index: 3,
				    title: '您对就诊等候区秩序满意吗？',
				    type: 'radio',
				    options: ['很满意', '满意', '一般', '不满意', '很不满意', '未关注'],
				  },
				  {
				    index: 4,
				    title: '您对就诊过程中等候时间满意吗？',
				    type: 'radio',
				    options: ['很满意', '满意', '一般', '不满意', '很不满意', '未关注'],
				  },
				  {
				    index: 5,
				    title: '门诊医生为您看病大约用了多长时间？',
				    type: 'radio',
				    options: ['超过10分钟', '8-10分钟', '5-8分钟', '3-5分钟', '3分钟以内', '未关注'],
				  },
				  {
				    index: 6,
				    title: '您对医生服务态度满意吗？',
				    type: 'radio',
						options: ['很满意','满意','一般','不满意','很不满意'],
				  },
				  {
				    index: 7,
				    title: '您对门诊环境及卫生间的卫生状况和设施配备满意吗？',
				    type: 'radio',
						options: ['很满意','满意','一般','未关注','不满意','很不满意'],
				  },
				  {
				    index: 8,
				    title: '您选择我院最主要的理由：',
				    type: 'checkbox',
				    options: ['医院名气大', '设备先进', '技术高', '专家多', '就近方便', '他人介绍', '收费合理', '服务态度好', '院内有熟人', '就诊环境好'],
				  },
				  {
				    index: 9,
				    title: '您此次就诊对工作人员服务满意吗？',
				    type: 'radio',
				    options: ['很满意', '满意', '一般', '不满意', '很不满意'],
				  },
				  {
				    index: 10,
				    title: '您的就诊类型：',
				    type: 'radio',
				    options: ['初次就诊', '复诊'],
				    required: true
				  },
				  {
				    index: 11,
				    title: '您的就诊卡类型：',
				    type: 'radio',
				    options: ['省直医保', '市医保', '自费', '其他'],
				    required: true
				  },
				  {
				    index: 12,
				    title: '您对本次就诊的总体感受：',
				    type: 'radio',
				    options: ['很满意', '满意', '一般', '不满意', '很不满意'],
				    required: true
				  },
				]
			}
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
			shouldShow(q) {
				if (!q.showIf) return true
				const triggerValue = this.answers[q.showIf.qIndex]
				return Array.isArray(triggerValue)
					? triggerValue.some(v => q.showIf.values.includes(v))
					: q.showIf.values.includes(triggerValue)
			},
			submit() {
				// 验证
				for (const q of this.questionList) {
					if (q.required && this.shouldShow(q) && !this.answers[q.index]?.length) {
						return uni.showToast({ title: `请填写第${q.index}题`, icon: 'none' })
					}
				}
		
				// 发送数据
				console.log('提交数据：', this.answers)
				// uni.request({ url: ..., data: this.answers })
			}
		},
	}
</script>

<style lang="scss" scoped>
	.homeLayout {
		width: 100vw;
		height: 100vh;
		.goBack {
			position: absolute;
			z-index: 999;
			top: 0;
			left: 30rpx;
			margin-left: 0;
			width: 35px;
			height: 35px;
			border: 1rpx solid rgba(255, 255, 255, 0.3);
			border-radius: 35px;
			background: rgba(66, 134, 255);
			display: flex;
			align-items: center;
			justify-content: center;
			backdrop-filter: blur(10rpx);
		}
		
		.head {
			position: absolute;
			top: 12%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			padding: 0 30rpx;
			box-sizing: border-box;
			.left {
				display: flex;
				flex-direction: column; 
				flex: 1;
				text {
					flex: 1;
					font-size: 28rpx;
					word-wrap: break-word;
				}
				image {
					width: 456rpx;
					height: 66rpx;
					margin-bottom: 20rpx;
				}
			} 
			image {
				width: 200rpx;
				height: 200rpx;
			}
		}
		.content {
			
			position: absolute;
			top: 25%;
		}
	}
</style>
