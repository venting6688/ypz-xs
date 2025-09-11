<template>
	<scroll-view scroll-y class="homeLayout pageBg homePageBg">
		<visitNotice 
		ref="notice" 
		:fontMode="fontMode" 
		@confirmed="handleConfirm" 
		/>
		
		<customerNav title="山东第一医科大学第二附属医院" />
		<view class="first">
			<image
				v-for="(item, index) in list"
				:key="index"
				:src="item.img"
				class="icon-card"
				mode="aspectFit"
				@click="onJumpClick(item)"
			/>
			<patients />
		</view>
		<view class="video">
			<image src="../../static/image/wenzhen.png" mode="aspectFit" @click="inquiry"></image>
			<image src="../../static/image/kaiyao.png" mode="aspectFit"></image>
		</view>
		<view class="ai" @click="onAiClick">
			<image src="https://aiwz.sdtyfy.com:8099/img/ai.png" mode="aspectFit"></image>
		</view>
		
		<view class="content">
			<uni-segmented-control 
			:current="current" 
			:values="items" 
			@clickItem="onClickItem" 
			styleType="text" 
			activeColor="#4286FF"
			class="custom-tabs"
			>
			</uni-segmented-control>
			
			<view class="tabContent">
				<van-grid :column-num="4" clickable :border="false">
					<van-grid-item
						use-slot
						link-type="navigateTo"
						v-for="(item, index) in gridList[current]"
						:key="index"
						@click="onGridClick(item)"
					>
						<view class="img"><image :src="item.img" mode="" /></view>
						<view class="name">{{item.name}}</view>
					</van-grid-item>
				</van-grid>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	import { mapState } from 'vuex'
	import customerNav from '@/components/customerNav.vue';
	import visitNotice from '@/components/visitNotice.vue';
	import patients from '@/components/patients.vue';
	
	export default {
	  components: {
	    customerNav,
			visitNotice,
			patients,
	  },
		computed: {
			...mapState(['footData']),
		},
		data() {
			return {
				showMain: false,
				fontMode: 'normal',
				current: 0,
				list: [
					{ img: 'https://aiwz.sdtyfy.com:8099/img/yuyue.png', url: "/sub_packages/subscribe/departments" },
					{ img: 'https://aiwz.sdtyfy.com:8099/img/menzhen.png', url: "/sub_packages/report/index" },
					{ img: 'https://aiwz.sdtyfy.com:8099/img/jiaofei.png', url: "/sub_packages/outpatientExpenditure/index" },
				],
				items: ['门诊服务', '住院服务', '我的体检', '综合服务'],
				gridList: [
					[
						{ img: 'https://aiwz.sdtyfy.com:8099/img/outpatient1.png', name: '预约挂号', url: '/sub_packages/subscribe/departments' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/outpatient3.png', name: '门诊缴费', url: '/sub_packages/outpatientExpenditure/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/outpatient4.png', name: '门诊报告', url: '/sub_packages/report/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/outpatient7.png', name: '就诊记录', url: '/sub_packages/record/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/synthesize1.png', name: '就诊人管理', url: '/sub_packages_healthcard/family/familyManage' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/tsjy.png', name: '投诉与建议', url: '/sub_packages/complaint/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/myd.png', name: '满意度调查', url: '/sub_packages/questionnaire/index'  },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/daohang.png', name: '院内导航', appid: 'wx1d5dbdc2760788da', targetUrl: 'pages/index/index?buildld=1718820999468392449&e=0' },
					],
					[
						{ img: 'https://aiwz.sdtyfy.com:8099/img/hospitalized.png', name: '入院登记', url: '/sub_packages/beHospitalizedRegister/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/hospitalized7.png', name: '住院预交金', url: '/sub_packages/deposit/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/hospitalized5.png', name: '住院费用', url: '/sub_packages/convenientModule/index' },
						// { img: 'https://aiwz.sdtyfy.com:8099/img/cpjs.png', name: '床旁结算' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/cpjs.png', name: '住院报告', url: '/sub_packages/report/hospitalization' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/zybl.png', name: '住院病历' },
					],
					[
						{ img: 'https://aiwz.sdtyfy.com:8099/img/yyjl.png', name: '预约记录' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/ttyy.png', name: '团体预约' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/gryy.png', name: '个人预约', url: '/sub_packages/physicalExamination/campus' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/bgcx.png', name: '报告查询' }
					],
					[
						{ img: 'https://aiwz.sdtyfy.com:8099/img/synthesize3.png', name: '健康随访', appid: 'wxd8f336bfa8545586', targetUrl: 'pages/index/isCsmUser/isCsmUser?regNo=&hosId=11012&openId=' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/synthesize4.png', name: '互联网+护理', appid: 'wx54bf421b03978b4b', targetUrl: 'pages/homePage/homePage?stationId=717' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/person3.png', name:'疾病百科' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/person2.png', name:'药品查询', url: '/sub_packages/medicament/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/electronicBills.png', name:'电子票据', appid: 'wx8e0b79a7f627ca18', targetUrl: 'pages/index/index?agencyCode=d103b2f4592543e987fffc7f6d75cd03' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/health.png', name:'医保凭证', appid: 'wx7ec43a6a6c80544d', targetUrl: 'pages/new_index/index/index' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/medicalRecord.png', name:'病案通', appid: 'wxff4273542debbc64', targetUrl: 'pages/index/index?hosId=2119' },
						{ img: 'https://aiwz.sdtyfy.com:8099/img/hospitalized4.png', name:'营养点餐', appid: 'wx63c30833d698895a', targetUrl: 'pages/hospital/hospital?hoSpitAl_id=dffc9e5a317c&webtype=2' },
					]
				]
			}
		},
	  onLoad() {
		  const confirmed = uni.getStorageSync('popupConfirmed');
			if (!confirmed) {
				this.$nextTick(() => {
					this.$refs.notice.open();
				});
			} else {
				this.showMain = true;
			}
		},
		methods: {
			handleConfirm() {
				this.showMain = true;
			},
			onClickItem(e) {
				this.current = e.currentIndex
			},
			onGridClick(item) {
				if (item.url) {
					uni.navigateTo({ url: item.url })
				} else if (item.appid) {
					wx.navigateToMiniProgram({
					  appId: item.appid,
					  path: item.targetUrl,
					  envVersion: 'release',
					  success: function(res) {
					  },
					  fail: function(err) {
					    console.log('跳转失败', err);
					  }
					});
				} else {
					uni.showToast({
						title: '暂未开放，敬请期待',
						icon: 'none'
					})
				}
			},
			onAiClick() {
				wx.reLaunch({ url: '/pages/virtualNurse/index' })
			},
			inquiry() {
				uni.navigateTo({
					url: '/sub_packages_im/im/index'
				})
			},
			onJumpClick(item) {
				if (item.url) {
					uni.navigateTo({ url: item.url })
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.homeLayout {
		width: 100vw;
		height: 100vh;
		.first {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			.icon-card {
			  width: 220rpx;
				height: 220rpx;
			}
		}
		.video {
			width: 100%;
			height: 180rpx;
			display: flex;
			justify-content: space-between;
			gap: 20rpx;
			image {
				width: 100%;
				height: 100%;
			}
		}
		.ai {
			width: 100%;
			height: 220rpx;
			margin-top: 15rpx;
			image {
				height: 100%;
				width: 100%;
			}
		}
		.content {
			background: #fff;
			border-radius: 15rpx;
			padding: 15rpx;
			margin-top: 20rpx;
			.tabContent {
				.van-grid-item__content {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: space-evenly;
					padding: 0;
					
					>.img {
						width: 72rpx;
						height: 72rpx;
						margin-top: 10rpx;
						image {
							width: 72rpx;
							height: 72rpx;
						}
					}
					>.name {
						font-size: 28rpx;
						margin: 10rpx 0;
						color: $text-color;
					}
				}
				
				.grid-item-content {
				  display: flex;
				  flex-direction: column;
				  align-items: center;
				  justify-content: center;
				  padding: 10rpx;
				}
				
				.grid-image {
				  width: 60rpx;
				  height: 60rpx;
				  margin-bottom: 10rpx;
				}
				
				.grid-text {
				  font-size: 24rpx;
				  color: $text-color;
				}
			}
		}
		.custom-tabs ::v-deep .segmented-control__text {
			font-size: 34rpx;
		}
		::v-deep .van-grid-item__text {
			font-size: 26rpx;
			color: $text-color;
		}
		::v-deep .van-grid-item__content {
			padding: 10rpx 0;
		}
		::v-deep .segmented-control {
			margin-bottom: 30rpx;
		}
		
	}
</style>
