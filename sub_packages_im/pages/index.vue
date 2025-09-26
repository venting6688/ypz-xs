<template>
	<view class="inventory">
		<uni-section title="请输入要查询的医生" type="line">
			<uni-search-bar 
			placeholder="请输入要查询的医生" 
			bgColor="#f3f3f3" 
			@confirm="search" 
			@cancel="cancel" 
			@clear="clear"
			/>
		</uni-section>
		
		<view class="filter-bar">
		  <view class="dept-btn" @click="toggleDept">
		    {{ selectedDept || '全部科室' }}
		    <text class="arrow" :class="{ open: showDept }"></text>
		  </view>
		  <view class="filter-btn">
		    筛选 <text class="arrow"></text>
		  </view>
		</view>
		
		<!-- 科室筛选悬浮区域 -->
		<view v-if="showDept">
		  <!-- 遮罩层（只覆盖科室下方，不遮住顶部搜索） -->
		  <view class="overlay" @click="closeDept"></view>
		
		  <!-- 科室容器 -->
		  <view class="dept-container">
		    <!-- 左侧分类 -->
		    <scroll-view scroll-y class="left-menu">
		      <view
		        v-for="(item, index) in categories"
		        :key="index"
		        :class="['menu-item', currentIndex === index ? 'active' : '']"
		        @click="currentIndex = index"
		      >
		        {{ item.name }}
		      </view>
		    </scroll-view>
		
		    <!-- 右侧子分类 -->
		    <scroll-view scroll-y class="right-content">
		      <view
		        v-for="(sub, i) in categories[currentIndex].children"
		        :key="i"
		        class="sub-item"
		        @click="selectSub(sub)"
		      >
		        {{ sub.name }}
		      </view>
		    </scroll-view>
		  </view>
		</view>
		
		
		<view class="doctor-list">
			<view class="doctor-card" v-for="(item,index) in doctorList" :key="index">
				<!-- 头像 -->
				<image class="avatar" src="../../static/image/doctor.png" mode="aspectFill" />
				<!-- 中间信息 -->
				<view class="info">
					<view class="name-title">
						<text class="name">{{ item.name }}</text>
						<text class="title">{{ item.title }}</text>
					</view>
					<view class="department">{{ item.department }}</view>
					<view class="price-row">
						<view class="price">图文咨询 ¥{{ item.textPrice }}</view>
						<view class="price">视频问诊 ¥{{ item.videoPrice }}</view>
					</view>
				</view>
				<!-- 按钮 -->
				<view class="action">
					<button class="ask-btn" @click="askDoctor(item)">问医生</button>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import hospitalizationApi from '@/api/hospitalizationApi.js';
	
	export default {
		data() {
			return {
				loginData: [],
				doctorList: [
					{
						avatar: '/static/doctor.png',
						name: '王银山',
						title: '副主任医师',
						department: '耳鼻喉科',
						textPrice: 5,
						videoPrice: 5
					},
					{
						avatar: '/static/doctor.png',
						name: '张三',
						title: '主任医师',
						department: '心内科',
						textPrice: 10,
						videoPrice: 20
					}
				],
				showDept: false,
				currentIndex: 0,
				selectedDept: '心内科互联网门诊',
				categories: [
					{
						name: '内科',
						children: [
							{ name: '消化内科互联网门诊' },
							{ name: '肾内科互联网门诊' },
							{ name: '风湿免疫科互联网门诊' },
						],
					},
					{
						name: '外科',
						children: [
							{ name: '普外科互联网门诊' },
							{ name: '骨科互联网门诊' },
						],
					},
				]
			}
		},
		onLoad() {
			let loginValue = uni.getStorageSync("loginData");
			this.loginData = loginValue ? JSON.parse(loginValue) : {};
		},
		methods: {
			toggleDept() {
			  this.showDept = !this.showDept
			},
			closeDept() {
			  this.showDept = false
			},
			selectSub(sub) {
			  this.selectedDept = sub.name
			  this.showDept = false // 收起
			},
			search(res) {
				this.filter = res.value;
				this.getList();
			},
			cancel(res) {
				this.recordList = [];
				this.visibleData = [];
				this.noData = false;
				this.noMoreData = false;
				this.searchData = true;
			},
			clear(res) {
				this.recordList = [];
				this.visibleData = [];
				this.noData = false;
				this.noMoreData = false;
				this.searchData = true;
			},
			askDoctor() {
				uni.navigateTo({
					url: '/sub_packages_im/pages/doctor'
				})
			},
			async getList() {
				this.loading = true;
				try {
					let data = { Keywords: this.filter };
					const res = await hospitalizationApi.drugQuery(data);
					this.recordList = []; this.visibleData = [];
					if (res.data.code === 200) {
						this.searchData = false;
						this.noData = false;
						this.recordList = res.data.data.MedItem;
						this.visibleData = this.recordList.slice(0, this.pageSize); 
					} else {
						this.loading = false;
						this.searchData = false;
						this.noData = true;
						this.recordList = [];
						this.visibleData = [];
					}
				} catch (error) {
					console.error("数据加载失败:", error);
				} finally {
					this.loading = false;
				}
			},
			loadMore() {
				if (this.noMoreData || this.loading) return;
				this.loading = true;
				setTimeout(() => { 
					const nextPageData = this.recordList.slice(
						this.currentPage * this.pageSize,
						(this.currentPage + 1) * this.pageSize
					);
				
					if (nextPageData.length === 0) {
						this.noMoreData = true;
					} else {
						this.visibleData = [...this.visibleData, ...nextPageData];
						this.currentPage++;
					}
					this.loading = false;
				}, 800);
			},

		}
	};
</script>

<style lang="less" scoped>
	.inventory {
		width: 100%;
		background-color: #fff;
		.doctor-list {
		  padding: 20rpx;
			background-color: #f3f3f3;
		}
		.doctor-card {
		  display: flex;
		  flex-direction: row;
		  align-items: center;
		  background: #fff;
		  border-radius: 16rpx;
		  padding: 30rpx 25rpx;
		  margin-bottom: 20rpx;
		  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.05);
		}
		.avatar {
		  width: 100rpx;
		  height: 100rpx;
		  border-radius: 50%;
		}
		.info {
		  flex: 1;
		  margin-left: 20rpx;
		}
		.name-title {
		  display: flex;
		  flex-direction: row;
		  align-items: center;
		}
		.name {
		  font-size: 32rpx;
		  font-weight: bold;
		  margin-right: 12rpx;
		}
		.title {
		  font-size: 26rpx;
		  color: #666;
		}
		.department {
		  font-size: 26rpx;
		  color: #666;
		  margin: 8rpx 0;
		}
		.price-row {
		  display: flex;
		  flex-direction: row;
		  font-size: 26rpx;
		}
		.price {
		  color: #333;
		  margin-right: 20rpx;
			background: #F6F6F6;
			padding: 5rpx 10rpx;
		}
		.action {
		  margin-left: 20rpx;
		}
		.ask-btn {
		  background: #1a8cff;
		  color: #fff;
		  font-size: 28rpx;
		  border-radius: 40rpx;
		  padding: 0 30rpx;
		}
		
		.filter-bar {
		  display: flex;
		  background: #fff;
		  padding: 20rpx;
		  border-bottom: 1px solid #eee;
		  position: relative;
		  z-index: 10;
		}
		.dept-btn,
		.filter-btn {
		  flex: 1;
		  text-align: center;
		  font-size: 28rpx;
		  position: relative;
		}
		.arrow {
		  display: inline-block;
		  margin-left: 10rpx;
		  width: 0;
		  height: 0;
		  border-left: 10rpx solid transparent;
		  border-right: 10rpx solid transparent;
		  border-top: 10rpx solid #666;
		  transition: transform 0.3s;
		}
		.arrow.open {
		  transform: rotate(180deg);
		}
		
		/* 遮罩层 */
		.overlay {
		  position: fixed;
		  top: 200rpx; /* 搜索栏 + 筛选栏的高度，按实际调整 */
		  left: 0;
		  right: 0;
		  bottom: 0;
		  background: rgba(0, 0, 0, 0.3);
		  z-index: 8;
		}
		
		/* 悬浮的科室容器 */
		.dept-container {
		  position: absolute;
		  top: 185rpx;
		  left: 0;
		  right: 0;
		  height: 600rpx;
		  background: #fff;
		  z-index: 9;
		  display: flex;
		}
		
		/* 左侧分类 */
		.left-menu {
		  width: 200rpx;
		  background: #f8f8f8;
		}
		.menu-item {
		  padding: 20rpx;
		  text-align: center;
		  font-size: 26rpx;
		  color: #333;
		}
		.menu-item.active {
		  background: #fff;
		  font-weight: bold;
		  color: #007aff;
		}
		
		/* 右侧子分类 */
		.right-content {
		  flex: 1;
		  padding: 20rpx;
		}
		.sub-item {
		  padding: 20rpx;
		  font-size: 26rpx;
		  border-bottom: 1px solid #f2f2f2;
		}
		
	}
</style>
