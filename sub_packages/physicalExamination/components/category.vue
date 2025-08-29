<template>
  <view class="category-container">
    <scroll-view class="category-left" scroll-y>
      <view
        v-for="(item, index) in categories"
        :key="index"
        :class="['category-item', currentIndex === index ? 'active' : '']"
        @click="clickCategory(item, index)"
      >
        {{ item }}
      </view>
    </scroll-view>
		<!-- 右侧内容 -->
		<scroll-view class="category-right" scroll-y>
			<transition name="fade">
				<view v-if="currentItems.length > 0" class="category-section">
					<view class="section-title">{{ categories[currentIndex] }}(已选{{currentCategorySelectedCount}})</view>
					<uni-data-checkbox
						mode="list"
						multiple
						v-model="selectedValue"
						:localdata="checkboxOptions"
						@change="handleChange"
					/>
				</view>
			</transition>
		</scroll-view>
  </view>
</template>

<script>
export default {
  props: {
    categories: { type: Array, default: () => [] },
    itemsMap: { type: Object, default: () => ({}) },
    detailInfo: { type: Array, default: () => [] } // 父级传来的已选中列表
  },
  data() {
    return {
      currentIndex: 0,
			selectedValue: [],      // 显示在UI上的，包含detailInfo + 用户选择
			userSelectedIds: []     // 仅用户新增的id
    }
  },
  computed: {
		currentCategory() {
			return this.categories[this.currentIndex] || ""
		},
		currentItems() {
			return this.itemsMap[this.currentCategory] || []
		},
		detailInfoIds() {
			return this.detailInfo.map(x => x.ArcimDr)
		},
		checkboxOptions() {
			return this.currentItems.map(item => ({
				text: item.itemDesc,
				value: item.hisItemId,
				disable: this.detailInfoIds.includes(item.hisItemId)
			}))
		},
		currentCategorySelectedCount() {
			return this.currentItems.filter(item =>
				this.selectedValue.includes(item.hisItemId)
			).length
		}
	},
	watch: {
	  categories(newVal) {
			if (newVal.length) this.clickCategory(newVal[0], 0)
		},
		detailInfo: {
			handler(newVal) {
				if (newVal && newVal.length) {
					// 初始化 selectedValue，但不影响 userSelectedIds
					this.selectedValue = Array.from(new Set([
						...this.selectedValue,
						...newVal.map(item => item.ArcimDr)
					]))
					this.emitStats()
				}
			},
			immediate: true
		},
		selectedValue: {
			handler() {
				this.emitStats()
			},
			deep: true
		},
	},
  methods: {
		clickCategory(item, index) {
			this.currentIndex = index
			if (!this.itemsMap[item]) this.$emit("fetchItems", item)
		},
		emitStats() {
			const allItems = Object.values(this.itemsMap).flat()
	
			// 仅统计用户新增的
			const userSelectedItems = allItems.filter(item =>
				this.userSelectedIds.includes(item.hisItemId)
			)
			const totalUserSelectedCount = userSelectedItems.length
			const totalUserSelectedPrice = userSelectedItems.reduce((sum, item) => sum + (item.price || 0), 0)
	
			// 每个分类下的选中数量（包含已选）
			const categoryCounts = {}
			this.categories.forEach(cat => {
				const catItems = this.itemsMap[cat] || []
				categoryCounts[cat] = catItems.filter(item => this.selectedValue.includes(item.hisItemId)).length
			})
	
			this.$emit('updateStats', {
				userSelectedCount: totalUserSelectedCount,
				userSelectedPrice: totalUserSelectedPrice,
				categoryCounts
			})
		},
		handleChange(e) {
			const newVal = e.detail.value
	
			// 保留已选项不可取消逻辑
			this.detailInfoIds.forEach(id => {
				if (!newVal.includes(id)) newVal.push(id)
			})
	
			// 更新UI选中
			this.selectedValue = newVal
	
			// === 关键修改 ===
			// 当前分类下所有items
			const catItems = this.currentItems.map(item => item.hisItemId)
	
			// 当前分类下用户新选的（排除detailInfo里的）
			const currentUserSelected = newVal.filter(
				id => catItems.includes(id) && !this.detailInfoIds.includes(id)
			)
	
			// 全局合并（把其他分类之前选的保留）
			const otherSelected = this.userSelectedIds.filter(
				id => !catItems.includes(id)
			)
			this.userSelectedIds = [...new Set([...otherSelected, ...currentUserSelected])]
		}
	}
}
</script>

<style scoped>
.category-container {
  display: flex;
  height: 100vh;
}
.category-left {
  width: 200rpx;
  background: #f5f5f5;
}
.category-item {
  padding: 20rpx;
  text-align: center;
}
.category-item.active {
  background: #fff;
  font-weight: bold;
  color: #007aff;
  border-left: 6rpx solid #007aff;
}
.category-right {
  flex: 1;
  background: #fff;
}
.category-section {
  padding: 20rpx;
}
.section-title {
	background: #4286FF;
	padding: 15rpx;
	color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.section-item {
  padding: 10rpx;
  border-bottom: 1px solid #eee;
}
.empty-data {
  text-align: center;
  color: #999;
  padding: 50rpx;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
