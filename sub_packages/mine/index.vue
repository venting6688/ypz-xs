<template>
	<view class="user">
		<view class="top">
			<text>绑定手机号:</text>
			<text>{{pixelateNumber(footData.phoneNum)}}</text>
		</view>
		<view class="bottom">
			<ul>
				<li v-for="(item,index) in list" :key="index">
					<view>
						<text>{{item}}</text>
						<image src="../static/image/right.png" mode=""></image>
					</view>
				</li>
			</ul>
		</view>
		<view class="confirm" @click="confirm">
			退出登录
		</view>
	</view>
</template>

<script>
	import mixin from '@/mixins/mixin'
	import {mapState} from 'vuex'
	export default {
		mixins: [mixin],
		data(){
			return {
				list:['家庭地址管理','常见问题帮助','用户反馈','用户隐私保护说明']
			}
		},
		computed: {
			...mapState(['footData']),
		},
		methods: {
			confirm(){
				// uni.removeStorageSync('patient');
			}
		},
		mounted() {
			
		}
	}
</script>

<style lang="less" scoped>
	.user {
		width: 100vw;
		height: 100%; 
		display: flex;
		flex-direction: column;
		
		.top {
			width: 722rpx;
			height: 100rpx;
			margin: 30rpx auto;
			background: #ffffff;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			>text {
				margin-left: 30rpx;
				&:first-child{
					color: #999999;
				}
			}
		}
		.bottom {
			min-height: 1000rpx;
			>ul {
				width: 722rpx;
				background: #ffffff;
				border-radius: 12rpx;
				margin: 0 auto;
				padding: 20rpx 0;
				>li {
					padding: 20rpx 0;
					margin:0 30rpx;
					
					view {
						display: flex;
						justify-content: space-between;
						text{
							display: inline-block;
							font-size: 28rpx;
							line-height: 28rpx;
							
						}
						image {
							width: 26rpx;
							height: 26rpx;
						}
					}
				}
			}
		}
		.confirm {
			width: 512rpx;
			height: 92rpx;
			background: #ff5c5c;
			border-radius: 46rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 32rpx;
			line-height: 32rpx;
			color: #ffffff;
			margin: 60rpx auto;
			
		}
	}
</style>