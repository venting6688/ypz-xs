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
					<view class="section-title">{{ categories[currentIndex] }}</view>
					<view v-for="(item, i) in currentItems" :key="item.hisItemId" class="section-item">
						<uni-data-checkbox
							multiple
						  v-model="selectedValue"
						  :localdata="[
						    {
						      text: item.itemDesc,
						      value: item.hisItemId,
						    }
						  ]"
						  :disabled="detailInfoIds.includes(item.hisItemId) ? false : false" 
						  @change="handleChange"
						/>
					</view>
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
			selectedValue: [], // 当前选中的值
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
			return this.currentItems.map(item => {
				const isChecked = this.detailInfo.includes(item.itemDesc) // 如果在 detailInfo 里，就默认选中
				return {
					text: item.itemDesc,
					value: item.itemDesc,
					disable: isChecked, // 已选中的不能取消
				}
			})
		}
	},
	watch: {
	  detailInfo: {
	    handler(newVal) {
	      this.setDefaultSelected()
	    },
	    immediate: true
	  },
	  currentItems(newItems) {
	    this.setDefaultSelected()
	  },
		categories(newVal) {
			if (newVal.length > 0) {
				this.clickCategory(newVal[0], 0) // 默认加载第一个分类
			}
		}
	},
  methods: {
		setDefaultSelected() {
			if (!this.currentItems || !this.detailInfo || !this.detailInfo.length) return;
				const selected = this.currentItems.find(item => this.detailInfo.map(x => x.ArcimDr).includes(item.hisItemId)
			)
			if (selected) {
				this.selectedValue.push(selected.hisItemId)
			}
		},
		clickCategory(item, index) {
			this.currentIndex = index
			if (!this.itemsMap[item]) {
				this.$emit("fetchItems", item)
			}
		},
		handleChange(e) {
			// 选中变化，通知父级
			this.$emit("updateSelection", e.detail.value)
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
