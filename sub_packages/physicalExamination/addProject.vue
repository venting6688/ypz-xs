<template>
	<view class="inventory ">
		<customerNav title="自主加项" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<scroll-view scroll-y class="container">
			<view class="content">
				<category 
				:categories="categories"
				:itemsMap="itemsMap"
				:detailInfo="detailInfo"
				@fetchItems="fetchItems"
				/>
			</view>
		</scroll-view>
	</view>
</template>
<script>
	import dayjs from "dayjs";
	import { mapState } from 'vuex'
	import { getStatusBarHeight } from "@/utils/system.js";
	import customerNav from '@/components/customerNav.vue';
	import physicalExamination from '@/api/physicalExamination.js'
	import category from './components/category.vue'

	export default {
		components: {
			category,
			customerNav,
		},
		computed: {
			...mapState(['locId']),
			barHeight() {
				return getStatusBarHeight()+5
			},
		},
		data() {
			return {
				ordSetsId: '',
				detailInfo: [],
			  categories: [],
				itemsMap: {} // { categoryId: [list] }
			}
		},
		onLoad(e) {
			this.ordSetsId = e.ordSetsId;
			this.getAllMedicalExamStations()
			this.getPhysicalExaminationPackageDetail()
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
			
			async getAllMedicalExamStations() {
				try {
					let data = {
						locId: this.locId,
					}
					const res = await physicalExamination.getAllMedicalExamStations(data);
					if (res.data.code == 200) {
						this.categories = res.data.data || []
					}
				} catch(err) {
					console.error(err);
				}
			},
			
			// 获取某个分类下的内容
			async fetchItems(category) {
				// 如果已经有缓存，不再请求
				if (this.itemsMap[category]) return
				try {
					let data = {
						locId: this.locId,
						station: category
					}
					const res = await physicalExamination.getAllMedicalExamItems(data);
					if (res.data.code == 200) {
						this.$set(this.itemsMap, category, res.data.data || [])
					}
				} catch(err) {
					console.error(err);
				}
			},
			async getPhysicalExaminationPackageDetail() {
				try {
					let data = {
						locId: this.locId,
						OrdSetsId: this.ordSetsId,
					}
					const res = await physicalExamination.getPhysicalExaminationPackageDetail(data);
					if (res.data.code == 200) {
						let stationItem = res.data.data.StationItem;
						this.detailInfo = [
						  ...new Set(
						    stationItem.flatMap(v => v.PeOrdItemList.PeOrdItem)
						  )
						]
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
			.content {
				background: #fff;
				padding: 15rpx 10rpx;
				margin-top: 20rpx;
			}
		}
	}
</style>
