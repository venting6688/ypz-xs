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
					<view
						class="tab"
						v-for="(item, index) in tabs"
						:key="index"
						:class="{ active: currentTab === index }"
						@click="currentTab = index"
					>
						{{ item }}
					</view>
				</view>
					
				<!-- 筛选栏 -->
				<view class="filter-bar">
					<view class="filter-item" @click="onGenderClick">
						性别
						<uni-icons type="bottom" size="18" color="#999" />
					</view>
					<view class="filter-item" @click="togglePriceSort">
						价格
						<uni-icons :type="priceSort === 'asc' ? 'arrow-up' : 'arrow-down'" size="18" color="#999" />
					</view>
					<view class="filter-item" @click="onFilterClick">
						筛选
						<uni-icons type="settings" size="18" color="#999" />
					</view>
				</view>
			</view>
			
	
			<!-- 套餐卡片列表 -->
			<view class="card-list">
				<view class="card" v-for="(item, index) in filteredList" :key="index">
					<view class="corner-tag">21项</view>
	
					<view class="content">
						<view class="title">{{ item.title }}</view>
						<view class="price-box">
							<text class="price">¥{{ item.price }}</text>
							<text class="old-price">¥{{ item.oldPrice }}</text>
						</view>
						<view class="tag-row">
							<text class="orange-tag">活动套餐</text>
							<text class="red-tip">距离活动结束仅剩10天</text>
						</view>
					</view>
				</view>
			</view>
	
			<!-- VS 对比按钮 -->
			<view class="vs-button">VS对比</view>
		</view>
		<!-- 性别 popup -->
		<uni-popup ref="genderPopup" type="bottom">
			<view class="popup-content">
				<view class="popup-option" @click="selectGender('通用')">通用</view>
				<view class="popup-option" @click="selectGender('男')">男性</view>
				<view class="popup-option" @click="selectGender('女')">女性</view>
			</view>
		</uni-popup>
			
		<!-- 筛选 popup -->
		<uni-popup ref="filterPopup" type="right">
			<view class="popup-content">
				<view class="popup-option">支持医保</view>
				<view class="popup-option">体检中心</view>
				<view class="popup-option">可预约时间</view>
			</view>
		</uni-popup>

	</view>
</template>
<script>
	import HeaderBar from '@/components/HeaderBar.vue';
	import { getStatusBarHeight } from "@/utils/system.js";
	
	export default {
		components: {
			HeaderBar
		},
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			},
			filteredList() {
				let filtered = this.list;
	
				if (this.searchKeyword) {
					filtered = filtered.filter(item => item.title.includes(this.searchKeyword));
				}
	
				if (this.selectedGender !== '全部') {
					filtered = filtered.filter(item => item.gender === this.selectedGender);
				}
	
				if (this.priceSort === 'asc') {
					filtered = filtered.sort((a, b) => a.price - b.price);
				} else {
					filtered = filtered.sort((a, b) => b.price - a.price);
				}
	
				return filtered;
			}
		},
		data() {
			return {
				searchKeyword: '',
				currentTab: 0,
				tabs: ['全部', '男性套餐', '女性套餐', '入职体检'],
				priceSort: 'asc',
				showGenderPopup: false,
				showFilterPopup: false,
				selectedGender: '全部',
				loginData: {},
				list: [
					{ title: '呵护父母基础套餐-女士', price: 860, oldPrice: 1299, gender: '女' },
					{ title: '呵护父母基础套餐-男士', price: 900, oldPrice: 1299, gender: '男' },
					{ title: '入职基础套餐', price: 580, oldPrice: 999, gender: '不限' },
					{ title: '入职基础套餐', price: 620, oldPrice: 999, gender: '不限' },
					{ title: '入职基础套餐', price: 170, oldPrice: 999, gender: '不限' },
				],
			}
		},
		onLoad() {
			let loginValue = uni.getStorageSync("loginData");
			this.loginData = loginValue ? JSON.parse(loginValue) : {};
		},
		methods: {
			onGenderClick() {
				// this.$refs.genderPopup.open('right');
			},
			onFilterClick() {
				// this.$refs.filterPopup.open()
			},
			togglePriceSort() {
				this.priceSort = this.priceSort === 'asc' ? 'desc' : 'asc';
			},
			selectGender(gender) {
				this.selectedGender = gender;
				this.$refs.genderPopup.close();
			},
			confirmFilter() {
				this.$refs.filterPopup.close();
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
		}
		
		.filter {
			background: #fff;
		}
		
		.search-box {
		  background-color: #fff;
		  padding: 20rpx;
		  border-radius: 10rpx;
		  margin-bottom: 20rpx;
		}
		
		.search-input {
		  background-color: #f0f0f0;
		  padding: 20rpx;
		  border-radius: 40rpx;
		  font-size: 28rpx;
		}
		
		.tabs {
		  display: flex;
		  background-color: #fff;
		  border-radius: 10rpx;
		  overflow: hidden;
		  margin-bottom: 20rpx;
		}
		
		.tab {
		  flex: 1;
		  text-align: center;
		  padding: 20rpx 0;
		  font-size: 28rpx;
		  color: #333;
		}
		
		.tab.active {
		  color: #4286FF;
		  font-weight: bold;
		}
		
		.filter-bar {
		  display: flex;
		  justify-content: space-around;
		  background-color: #fff;
		  padding: 20rpx 0;
		  margin-bottom: 20rpx;
		}
		
		.filter-item {
		  display: flex;
		  align-items: center;
		  font-size: 28rpx;
		  color: #333;
		  gap: 10rpx;
		}
		
		.card-list {
		  display: flex;
		  flex-direction: column;
		  gap: 20rpx;
			padding: 0 20rpx;
		}
		
		.card {
		  position: relative;
		  background-color: #fff;
		  padding: 30rpx;
		  border-radius: 20rpx;
		  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
		}
		
		.corner-tag {
		  position: absolute;
		  top: 0;
		  left: 0;
		  background-color: #4286FF;
		  color: #fff;
		  font-size: 22rpx;
		  padding: 8rpx 20rpx;
		  border-top-left-radius: 20rpx;
		  border-bottom-right-radius: 20rpx;
		}
		
		.content {
		  margin-top: 20rpx;
		}
		
		.title {
		  font-size: 32rpx;
		  font-weight: 600;
		  margin-bottom: 20rpx;
		}
		
		.price-box {
		  display: flex;
		  align-items: baseline;
		  gap: 20rpx;
		  margin-bottom: 20rpx;
		}
		
		.price {
		  font-size: 40rpx;
		  color: #ff3b30;
		  font-weight: bold;
		}
		
		.old-price {
		  font-size: 26rpx;
		  color: #999;
		  text-decoration: line-through;
		}
		
		.tag-row {
		  display: flex;
		  gap: 20rpx;
		  align-items: center;
		}
		
		.orange-tag {
		  background-color: #ff9900;
		  color: #fff;
		  font-size: 22rpx;
		  padding: 4rpx 12rpx;
		  border-radius: 8rpx;
		}
		
		.red-tip {
		  color: #ff3b30;
		  font-size: 22rpx;
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
		  border-bottom: 1px solid #eee;
		}
	}
</style>
