<template>
	<view class="homeLayout pageBg homePageBg">
		<customerNav title="医生详情" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="container">
			<!-- 医生信息 -->
			<view class="doctor-card">
				<view class="doctor-header">
					<image class="avatar" src="../../static/image/doctor.png"></image>
					<view class="info">
						<view class="name">
							王银山
							<text class="title">副主任医师</text>
						</view>
						<view class="tag">耳鼻喉科</view>
					</view>
					<view class="follow-btn">关注</view>
				</view>
				<view class="desc">
					擅长治疗慢性支气管炎、肺气肿、肺心病、支气管哮喘、呼吸衰竭、肺部感染、肺癌、胸膜疾病、肺间质擅长治疗慢性支气管炎、肺气肿、肺心病、支气管哮喘、呼吸衰竭、肺部感染、肺癌、胸膜疾病、肺间质
				</view>
				<view class="statistics">
					<view class="item">
						<text class="num">7895</text>
						<text class="label">问诊量</text>
					</view>
					<view class="item">
						<text class="num">1分钟</text>
						<text class="label">平均响应</text>
					</view>
					<view class="item">
						<text class="num">100%</text>
						<text class="label">好评率</text>
					</view>
				</view>
			</view>
	
			<!-- 医生服务 -->
			<view class="service-card">
				<view class="title">医生服务</view>
				<view class="service-item">
					<view class="left">
						<view class="title">在线问诊 <text class="price">¥5</text></view>
						<view class="tips">图文、视频、语音均可选择，当日24点医生未回复将自动退诊</view>
					</view>
					<button class="btn blue">去问诊</button>
				</view>
	
				<view class="service-item">
					<view class="left">
						<view class="guahao">在线挂号</view>
						<view class="tips">图文、视频、语音均可选择，当日24点医生未回复将自动退诊</view>
					</view>
					<button class="btn green">去挂号</button>
				</view>
			</view>
	
			<!-- 患者评价 -->
			<view class="comment-card">
				<view class="header">
					<text>患者评价 (11)</text>
					<text class="more">全部 ></text>
				</view>
	
				<view class="comment-item" v-for="(item, index) in comments" :key="index">
					<view class="comment-top">
						<text class="user">{{ item.user }}</text>
						<view class="stars">
							<text v-for="n in 5" :key="n" class="star" :class="{ active: n <= item.star }">★</text>
						</view>
						<text class="date">{{ item.date }}</text>
					</view>
					<view class="comment-content">
						{{ item.content }}
					</view>
				</view>
			</view>
		</view>
		<view class="fill" :style="{ height: barHeight + 'px' }"></view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	import login from '@/utils/login.js'
	import customerNav from '@/components/customerNav.vue';
	import { getStatusBarHeight } from "@/utils/system.js";
	
	export default {
	  components: {
	    customerNav
	  },
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			},
			...mapState(['footData']),
		},
		data() {
			return {
				comments: [
					{
						user: "王***",
						star: 5,
						date: "2025-05-26",
						content:
							"孕期期间，幸到遇到王银山主任这样经验丰富的专家，否则真是不敢想象。我们母子的救命恩人。",
					},
					{
						user: "李***",
						star: 4,
						date: "2025-05-20",
						content:
							"医生回复很及时，态度很好，解答问题也很耐心，非常满意。",
					},
					{
						user: "张***",
						star: 5,
						date: "2025-05-18",
						content: "非常专业，解答详细，推荐！",
					},
				],
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
		}
	}
</script>

<style lang="scss" scoped>
	.pageBg {
		padding: 0 !important;
	}
	::v-deep .titleBar {
	  justify-content: center !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.homePageBg::before {
		height: 400rpx;
	}
	
	.homeLayout {
		width: 100%;
		overflow-x: hidden;
		.container {
		  // min-height: 100vh;
			position: absolute;
			top: 13%;
		  padding: 20rpx;
		}
		
		/* 医生卡片 */
		.doctor-card {
		  background: #fff;
		  border-radius: 16rpx;
		  padding: 20rpx;
		  margin-bottom: 20rpx;
		  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		  .doctor-header {
		    display: flex;
		    align-items: flex-start;
		    position: relative;
		
		    .avatar {
		      width: 120rpx;
		      height: 120rpx;
		      border-radius: 50%;
		      margin-right: 20rpx;
		    }
		
		    .info {
		      flex: 1;
		
		      .name {
		        font-size: 32rpx;
		        font-weight: bold;
		        margin-bottom: 8rpx;
		
		        .title {
		          margin-left: 12rpx;
		          font-size: 26rpx;
		          color: #666;
		        }
		
		        .tag {
		          margin-left: 12rpx;
		          font-size: 24rpx;
		          color: #409eff;
		          background: #e6f0ff;
		          padding: 2rpx 10rpx;
		          border-radius: 8rpx;
		        }
		      }
		
		     
		    }
		
		    .follow-btn {
		      font-size: 30rpx;
		      padding: 10rpx 30rpx;
		      border-radius: 30rpx;
		      border: 1px solid #4286FF;
		      color: #4286FF;
		    }
		  }
			
			.desc {
			  font-size: 28rpx;
			  color: #8E8E8E;
				padding: 10rpx;
			}
		
		  .statistics {
		    display: flex;
		    justify-content: space-around;
		    margin-top: 20rpx;
		
		    .item {
		      text-align: center;
		
		      .num {
		        display: block;
		        font-size: 32rpx;
		        font-weight: bold;
		        color: #4286FF;
		      }
		
		      .label {
		        font-size: 24rpx;
		        color: #999;
		      }
		    }
		  }
		}
		
		/* 医生服务 */
		.service-card {
		  border-radius: 16rpx;
		  padding: 30rpx 20rpx;
		  margin-bottom: 20rpx;
			background: linear-gradient(to bottom, #E3EDFF, #ffffff);
			.title {
				font-size: 36rpx;
				font-weight: bold;
			}
		  .service-item {
		    display: flex;
		    align-items: center;
		    justify-content: space-between;
				gap: 30rpx;
		    padding: 20rpx;
				border-radius: 30rpx;
				
				&:first {
				  background-color: rgba(66,134,255,0.06);
				}
				
		    &:last-child {
					background-color: rgba(60, 208, 170, 0.06);
		      border-bottom: none;
		    }
		
				.guahao {
					color: #3CD0AA;
					font-size: 30rpx;
				}
				
		    .left {
		      flex: 1;
		
		      .title {
		        font-size: 28rpx;
		        font-weight: bold;
		        margin-bottom: 8rpx;
		
		        .price {
		          color: #ff4d4f;
		          margin-left: 10rpx;
		        }
		      }
		
		      .tips {
		        font-size: 24rpx;
		        color: #999;
		      }
		    }
		
		    .btn {
		      font-size: 24rpx;
		      padding: 3rpx 28rpx;
		      border-radius: 30rpx;
		      color: #fff;
		
		      &.blue {
		        background: #4286FF;
		      }
		      &.green {
		        background: #3CD0AA;
		      }
		    }
		  }
		}
		
		/* 患者评价 */
		.comment-card {
		  background: #fff;
		  border-radius: 16rpx;
		  padding: 20rpx;
			background: linear-gradient(to bottom, #FFF7E7, #ffffff);
			
		  .header {
		    display: flex;
		    justify-content: space-between;
		    margin-bottom: 20rpx;
				font-size: 34rpx;
		
		    .more {
		      font-size: 30rpx;
		      color: #999;
		    }
		  }
		
		  .comment-item {
		    margin-bottom: 20rpx;
		
		    .comment-top {
		      display: flex;
		      align-items: center;
		      margin-bottom: 8rpx;
		
		      .user {
		        font-size: 28rpx;
		        font-weight: bold;
		        margin-right: 10rpx;
		      }
		
		      .stars {
		        margin-right: auto;
		
		        .star {
		          font-size: 28rpx;
		          color: #ddd;
		          margin-right: 2rpx;
		
		          &.active {
		            color: #ffcc00;
		          }
		        }
		      }
		
		      .date {
		        font-size: 24rpx;
		        color: #999;
		      }
		    }
		
		    .comment-content {
		      font-size: 26rpx;
		      color: #333;
		      line-height: 1.6;
		    }
		  }
		}
	}
</style>
