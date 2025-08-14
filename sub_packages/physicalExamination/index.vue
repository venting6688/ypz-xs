<template>
	<view class="inventory pageBg homePageBg">
		<customerNav title=" " />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="head">
			<view class="left">
				<text class="gradient">不知做什么项目？</text>
				<text>点击进行检查前测试</text>
				<view class="test">点击测试</view>
			</view>
			<image src="../static/image/anhao.png" mode="aspectFit" />
		</view>
		<view class="container">
			<view class="filter">
				<view class="tabs">
					<scroll-view
						:scroll-x="true" 
						:show-scrollbar="true"
						scroll-with-animation
						class="scroll-container"
					>
						<view 
							v-for="(item,index) in tabs" 
							:key="index" 
							class="scroll-item"
							:class="{active: levelId === index}"
							@click="searchType(index)" 
						>
							<view>{{item}}</view>
						</view>
					</scroll-view>
				</view>
				
				<view class="filter-bar">
					<view class="filter-item" @click="onGenderClick">
						性别 
						<uni-icons type="bottom" size="18" color="#999" />
					</view>
					<view class="filter-item" @click="togglePriceSort">
						价格 
						<uni-icons :type="priceSort === 'asc' ? 'arrow-up' : 'arrow-down'" size="18" color="#999" />
					</view>
				</view>
			</view>
			<list :lists="filteredList" />
			
			<!-- VS 对比按钮 -->
			<!-- <view class="vs-button">VS对比</view> -->
		</view>
		<!-- 性别 popup -->
		<uni-popup ref="sexPopup" background-color="#fff">
			<view class="popup-content">
				<view class="popup-option" 
				v-for="(item,index) in sexArr"
				:key="index"
				:class="{selectedSex: sexId === index}"
				@click="changeSex(index)" 
				>{{item}}</view>
			</view>
		</uni-popup>
	</view>
</template>
<script>
	import list from './components/list.vue';
	import { getStatusBarHeight } from "@/utils/system.js";
	import customerNav from '@/components/customerNav.vue';
	import physicalExamination from '@/api/physicalExamination.js'

	export default {
		components: {
			customerNav,
			list
		},
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			},
			filteredList() {
				let filtered = this.list;
				if (this.priceSort === 'asc') {
					filtered = filtered.sort((a, b) => a.packageAmt - b.packageAmt);
				} else {
					filtered = filtered.sort((a, b) => b.packageAmt - a.packageAmt);
				}
				return filtered;
			}
		},
		data() {
			return {
				sex: '',
				levelId: 0,
				tabs: ['全部'],
				sexArr: ['全部', '男性', '女性'],
				sexId: 0,
				priceSort: 'asc',
				showGenderPopup: false,
				showFilterPopup: false,
				selectedGender: '全部',
				loginData: {},
				list: [],
			}
		},
		onLoad() {
			let loginValue = uni.getStorageSync("loginData");
			this.loginData = loginValue ? JSON.parse(loginValue) : {};
			this.getPhysicalExaminationPackageList();
			this.getPhysicalExaminationPackageType();
		},
		methods: {
			onGenderClick() {
				this.$refs.sexPopup.open('bottom')
			},
			togglePriceSort() {
				this.priceSort = this.priceSort === 'asc' ? 'desc' : 'asc';
			},
			changeSex(index) {
				let val = index == 0 ? '全部' : index == "1" ? '男' : '女';
				this.sexId = index;
				this.selectedGender = val;
				this.sex = val == '全部' ? '' : val;
				this.$refs.sexPopup.close();
				this.getPhysicalExaminationPackageList();
			},
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
			searchType(index) {
				this.levelId = index;
				this.getPhysicalExaminationPackageList();
			},
			//获取体检套餐类型
			async getPhysicalExaminationPackageType() {
				try {
					const res = await physicalExamination.getPhysicalExaminationPackageType();
					console.log(JSON.stringify(res.data),'==111==');
					if (res.data.code == 200) {
						let type = res.data.data.ExamPackagesLevel;
						type.map(v => {
							this.tabs.push(v.levelDesc);
						})
					}
				} catch (err) {
			    console.error('获取类型失败', err);
			  }
			},
			//获取体检套餐列表
			getPhysicalExaminationPackageList() {
				let data = {
					locId: '484',
				}
				if (this.levelId) {
					data.levelId = this.levelId
				}
				if (this.sex) {
					data.sexDesc = this.sex;
				}
				physicalExamination.getPhysicalExaminationPackageList(data).then((res) => {
					this.list = [];
					if (res.data.code == 200 && res.data.data.ExaminationPackages.length) {
						this.list = res.data.data.ExaminationPackages;
					}
				});
			},
		}
	};
</script>

<style lang="less" scoped>
	.unl-popup.bottom {
	  padding-bottom: 0 !important;
	}
	.pageBg {
		padding: 0 !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.inventory {
		width: 100%;
		background-color: #f5f5f5;
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
				.gradient {
				  font-weight: 900;
				  font-style: italic;
				  font-size: 48rpx;
				  background: linear-gradient(
						to right, 
						#499EFF 0%,
						#499EFF 40%,
						#7B5AFD 90%,
						#7B5AFD 100%
					); /* 左→右渐变 */
				  -webkit-background-clip: text; /* 将背景应用到文字 */
				  -webkit-text-fill-color: transparent; /* 透明文字以显示背景 */
				  display: inline-block;
					margin-bottom: 20rpx;
				}
				.test {
					width: 200rpx;
					height: 60rpx;
					color: #fff;
					font-size: 30rpx;
					text-align: center;
					margin-top: 20rpx;
					line-height: 60rpx;
					border-radius: 35rpx;
					background: linear-gradient(to right, #499EFF, #7B5AFD);
					
				}
				text {
					flex: 1;
					font-size: 30rpx;
					word-wrap: break-word;
				}
			} 
			image {
				width: 300rpx;
				height: 335rpx;
			}
		}
		
		.container {
			width: 100%;
			position: absolute;
			top: 32.7%;
			.filter {
				margin-bottom: 10rpx;
				padding-bottom: 15rpx;
				.tabs {
					display: flex;
					background-color: #fff;
					border-radius: 10rpx;
					overflow: hidden;
					padding-bottom: 20rpx;
					padding-top: 5rpx;
					.scroll-container {
						width: 100%;
						white-space: nowrap;
						.scroll-item {
							display: inline-block;
							margin: 10rpx 20rpx;
							border: 1px solid #ccc;
							border-radius: 30rpx;
							padding: 8rpx 25rpx;
						}
						.active {
							color: #fff;
							background: #4286FF;
							border:1px solid #4286FF;
							font-weight: bold;
						}
					}
				}
				.filter-bar {
				  display: flex;
					justify-content: space-around;
					background-color: #fff;
					padding-bottom: 20rpx;
					.filter-item {
					  display: flex;
					  align-items: center;
					  font-size: 28rpx;
					  color: #333;
					  gap: 10rpx;
					}
				}
			}
		}
		
		.vs-button {
		  position: fixed;
		  right: 20rpx;
		  top: 50%;
		  transform: translateY(-50%);
		  background-color: #4286FF;
		  color: #fff;
		  padding: 16rpx 20rpx;
		  border-radius: 50rpx;
		  font-size: 26rpx;
		  z-index: 99;
		  box-shadow: 0 4rpx 12rpx rgba(66, 134, 255, 0.3);
		}
		
		/* Popup 样式 */
		.popup-content {
		  background-color: #ffffff;
		  border-radius: 30rpx 30rpx 0 0;
		}
		
		.popup-option {
		  font-size: 30rpx;
		  padding: 20rpx;
			text-align: center;
		  border-bottom: 1px solid #eee;
		}
		
		.selectedSex {
			color: #4286FF;
		}
	}
</style>
