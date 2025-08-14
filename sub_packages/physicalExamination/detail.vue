<template>
	<view class="inventory ">
		<customerNav :title="title" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<scroll-view scroll-y class="container">
			<view class="guide"><image src="../static/image/banner.png"  mode="aspectFit" /></view>
			<view class="timeCard">
				<view class="title">预约日期</view>
				<view class="tipMsg">温馨提示：日期仅供参考，会因检查项目变化，实际可约日期以下单页为准</view>
				<scroll-view 
					:scroll-x="true" 
					:show-scrollbar="true"
					scroll-with-animation
					class="scroll-container"
				>
					<view 
						v-for="(item,index) in timeList" 
						:key="index" 
						class="scroll-item"
						:class="{back:timeObj.date===item.date}"
						@click="getScheduleDetail(item,index)"
					>
						<view>{{item.week}}</view>
						<view>{{item.date.substring(item.date.indexOf("-") + 1)}}</view>
						<view :class="{col:item.status==='无号'}">{{item.status}}</view>
					</view>
				</scroll-view>
			</view>
			<view class="content">
				<uni-section type="line">
					<view class="uni-padding-wrap uni-common-mt">
						<uni-segmented-control 
							:current="currentTab" 
							:values="tabs" 
							style-type="text"
							activeColor="#4286FF"
							@clickItem="onTabClick" 
						/>
					</view>
					<view class="tab-content">
						<view class="content" >
							<view v-if="currentTab === 0">
								<view class="project">套餐项目({{packageQuantity}}项)</view>
								<detailItem :detailInfo="detailInfo" />
							</view>
							<view v-if="currentTab === 1" class="des">
								<view class="img">
									<image src="../static/image/all.png"  mode="aspectFit" />
									全年龄段
								</view>
								<view class="img" v-if="sex == '女'">
									<image src="../static/image/nv.png"  mode="aspectFit" />
									女士
								</view>
								<view class="img" v-if="sex == '男'">
									<image src="../static/image/nan.png"  mode="aspectFit" />
									男士
								</view>
							</view>
							<view v-if="currentTab === 2">
								<text class="popup-text">
								请携带身份证，空腹，禁饮食，前往体检中心
								
								1.体检前三天忌酒,限高脂饮食。避免使用对肝、肾功有影响的药物。孕期禁止行放射性检查，哺乳期及备孕者（男女）慎做放射检查，请咨询相关专业医师。
								
								2.体检前请核对体检表内容是否属实，并妥善保管好自己的体检资料，切勿丢失。体检时请听从工作人员安排，自觉维护查体秩序。
								
								3.化验肝功、肾功、血脂、血糖、消化系统彩超检查等需要空腹，故体检当天应禁食、禁水。做前列腺、膀胱、妇科彩超检查时，需要保持膀胱充盈，故检查前请不要排尿。
								
								4.女士月经期间不宜做妇科检查及尿检。做妇科检查前需排小便。未婚女同志禁止进行妇科检查。
								
								5.如需加项检查，请与体检中心接待处联系，按照有关规定办理。
								
								6.体检当日请自行保管随身贵重物品。不要穿带有金属装饰物的上衣，以免影响放射检查结果。
								
								7.心电图及血压测量前请您平静休息5至10分钟后再做检查！
								
								8.体检项目完成后，请将体检表交护士站，以便整理查体资料为您做出体检结论,需要时请在护士站领取车辆放行证！
								
								祝 您 体 检 愉 快！
								
								山东第一医科大学第二附属医院体检中心
								
								地址：山一大二附院2号楼一楼 电话6236350
								</text>
							</view>
						</view>
					</view>
				</uni-section>
			</view>
		</scroll-view>
		
		<view class="footer-fixed">
			<view class="left-info">
				<view class="total">共{{packageQuantity}}个项目</view>
				<view class="pay">个人支付 <text class="price">¥{{price}}</text></view>
			</view>
			<view class="next-btn" @click="confirm()">下一步</view>
		</view>
		
	</view>
</template>
<script>
	import dayjs from "dayjs";
	import { getStatusBarHeight } from "@/utils/system.js";
	import customerNav from '@/components/customerNav.vue';
	import detailItem from './components/detailItem.vue';
	import physicalExamination from '@/api/physicalExamination.js'

	export default {
		components: {
			customerNav,
			detailItem
		},
		computed: {
			barHeight() {
				return getStatusBarHeight()+5
			},
		},
		data() {
			return {
				sex: '',
				title: '',
				price: 0.00,
				ordSetsId: '',
				timeList: [],
				detailInfo: {},
				timeObj:{
					week:'',
					date:'',
				},
				currentTab: 0,
				packageQuantity: 0,
				tabs: ['套餐项目', '套餐简介', '体检须知'],
				days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
			}
		},
		onLoad(e) {
			this.title = this.formatText(e.title);
			this.ordSetsId = e.ordSetsId;
			this.sex = e.sex;
			this.price = parseFloat(e.price).toFixed(2)
			this.timeObj = {
				week: this.days[dayjs().day()],
				date: dayjs().format('YYYY-MM-DD'),
			}
			this.getScheduleDates();
			this.getPhysicalExaminationPackageDetail();
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
			onTabClick(e) {
				this.currentTab = e.currentIndex
			},
			formatText(str) {
				if (!str) return '';
				return str.length > 14 ? str.slice(0, 14) + '...' : str;
			},
			confirm() {
				uni.navigateTo({
					url: `/sub_packages/physicalExamination/confirm?count=${this.packageQuantity}&ordSetsId=${this.ordSetsId}&sex=${this.sex}&price=${this.price}`
				})
			},
			getScheduleDates(){
				for (let i = 0; i < 20; i++) {
					const date = new Date();
					date.setDate(date.getDate() + i);
					const year = date.getFullYear();
					const month = (date.getMonth() + 1).toString().padStart(2, '0');
					const day = date.getDate().toString().padStart(2, '0');
					const weekDay = this.days[date.getDay()];
					this.timeList.push({
						date: `${year}-${month}-${day}`,
						week: weekDay,
						status: "余200"
					});
				}
			},
			async getPhysicalExaminationPackageDetail() {
				try {
					let data = {
						locId: '484',
						OrdSetsId: this.ordSetsId,
					}
					const res = await physicalExamination.getPhysicalExaminationPackageDetail(data);
					if (res.data.code == 200) {
						let stationItem = res.data.data.StationItem;
						stationItem.map(item => {
							this.packageQuantity += item.PeOrdItemList.PeOrdItem.length
						})
						this.detailInfo = stationItem;
					}
				} catch(err) {
					console.error(err);
				}
			}
			
		}
	};
</script>

<style lang="less" scoped>
	::v-deep .segmented-control__text {
		font-size: 34rpx !important;
	}
	::v-deep .titleBar {
	  justify-content: center !important;
	}
	.pageBg {
		padding: 0 !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.homePageBg::before { 
		height: 150rpx;
	}
	
	.inventory {
		width: 100%;
		background-color: #f5f5f5;
		.container {
			flex: 1;
			overflow-y: auto;
			padding-bottom: 120rpx;
			.guide {
				padding: 15rpx;
				image {
					width: 744rpx;
					height: 296rpx;
				}
			}
			.timeCard{
				background: #fff;
				padding: 15rpx;
				.title {
					padding: 15rpx 0;
					font-size: 32rpx;
					font-weight: bold;
					border-bottom: 1px solid #F5F5F5;
				}
				.tipMsg {
					color: #FFC03D;
					font-size: 30rpx;
					padding: 15rpx 0;
				}
				.scroll-container {
				  width: 100%;
				  white-space: nowrap; /* 防止子元素换行 */
				}
				.back{
					background: #4286FF !important;
					view {
						color: #ffffff !important;
					}
				}
				.scroll-item {
					display: inline-block;
					margin:18rpx 10rpx;
					width: 130rpx;
					height: 123rpx;
					background: #f3f3f3;
					border-radius: 11.45rpx;
					text-align: center;
					font-size: 30rpx;
					view {
						display: flex;
						justify-content: center;
						align-items: center;
						height: 33.33%;
						
						&:nth-of-type(1){
							color: #666666;
						}
						&:nth-of-type(3){
							color: #4286ff;
						}
					}
				}
			}
			.content {
				background: #fff;
				padding: 15rpx 10rpx;
				margin-top: 20rpx;
				.des {
					display: flex;
					gap: 20rpx;
					.img {
						width: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-flow: column;
						image {
							width: 128rpx;
							height: 128rpx;
						}
					}
				}
				.popup-text {
				  font-size: 28rpx;
				  color: #666;
				  line-height: 1.8;
				}
				.project {
					font-size: 34rpx;
					color: #02134E;
					text-align: center;
					font-weight: bold;
				}
			}
		}
		
		.footer-fixed {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 120rpx;
			background-color: #fff;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 30rpx;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
			border-top: 1rpx solid #eee;
			z-index: 999;
		}
		
		/* 左边上下布局 */
		.left-info {
			display: flex;
			flex-direction: column;
			justify-content: center;
			line-height: 1.4;
		}
		
		.total {
			font-size: 26rpx;
			color: #666;
		}
		
		.pay {
			font-size: 28rpx;
			color: #333;
		}
		
		.price {
			color: #e60012;
			font-weight: bold;
			font-size: 34rpx;
			margin-left: 6rpx;
		}
		
		/* 右边按钮 */
		.next-btn {
			background-color: #3b82f6;
			color: #fff;
			font-size: 32rpx;
			padding: 0 40rpx;
			height: 80rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			white-space: nowrap;
		}
		
	}
</style>
