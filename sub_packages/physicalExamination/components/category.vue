<template>
  <view class="category-container">
    <!-- 左侧分类 -->
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
          <view class="section-title">
            {{ categories[currentIndex] }} (已选{{ currentCategorySelectedCount }})
          </view>
          <uni-data-checkbox
						class="typeCheckbox"
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
		sex: { type: String, default: '' },
    categories: { type: Array, default: () => [] },
    itemsMap: { type: Object, default: () => ({}) }, // { 分类名: [ { hisItemId, itemDesc, price }, ... ] }
    detailInfo: { type: Array, default: () => [] }   // [{ ArcimDr, ... }]
  },
  data() {
    return {
      currentIndex: 0,
      // 仅存“用户新增”的 ID（跨分类累计）
      userSelectedIds: [],
      // UI 绑定用的全局选中值（= detailInfoIds ∪ userSelectedIds）
      selectedValue: []
    }
  },
  computed: {
    currentCategory() {
      return this.categories[this.currentIndex] || ''
    },
    currentItems() {
      return this.itemsMap[this.currentCategory] || []
    },
    // 原始已选（不可取消）
    detailInfoIds() {
      return (this.detailInfo || []).map(x => x.ArcimDr)
    },
    // 右侧列表数据（原始已选项禁用）
    checkboxOptions() {
      const detailSet = new Set(this.detailInfoIds)
      return this.currentItems.map(item => ({
        text: item.itemDesc + " (￥"+item.price+")",
        value: item.hisItemId,
        disable: detailSet.has(item.hisItemId) || this.sex == '男' && item.stationDesc == '妇科'
      }))
    },
    // 当前分类下已选数量（包含原始 + 用户新增）
    currentCategorySelectedCount() {
      const selSet = new Set(this.selectedValue)
      return this.currentItems.reduce((acc, it) => acc + (selSet.has(it.hisItemId) ? 1 : 0), 0)
    }
  },
  watch: {
    // 初始化首个分类
    categories(newVal) {
      if (newVal && newVal.length) this.clickCategory(newVal[0], 0)
    },
    // 原始已选变化时，重建 selectedValue，但不动 userSelectedIds
    detailInfo: {
      handler() {
        this.rebuildSelectedValue()
        this.emitStats()
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    clickCategory(item, index) {
      this.currentIndex = index
      if (!this.itemsMap[item]) this.$emit('fetchItems', item)
    },
    // 核心：仅替换“当前分类”的用户新增部分，其他分类保留
    handleChange(e) {
      const newVal = e.detail.value || []
      const detailSet = new Set(this.detailInfoIds)
      const catIds = new Set(this.currentItems.map(it => it.hisItemId))
      // 1) 当前分类中，用户这次勾选到的“新增部分”（排除原始已选）
      const currentCatUserSelected = newVal.filter(id => catIds.has(id) && !detailSet.has(id))
      // 2) 从全局 userSelectedIds 中移除“当前分类”的旧数据，保留其他分类
      const keptOtherCats = this.userSelectedIds.filter(id => !catIds.has(id))
      // 3) 合并得到新的全局 userSelectedIds
      this.userSelectedIds = Array.from(new Set([...keptOtherCats, ...currentCatUserSelected]))
      // 4) 重建 UI 绑定值：原始 ∪ 用户新增
      this.rebuildSelectedValue()
      // 5) 回传统计
      this.emitStats()
    },

    // 把 selectedValue 维护成：原始 ∪ 用户新增（全局）
    rebuildSelectedValue() {
      const union = new Set([...this.detailInfoIds, ...this.userSelectedIds])
      this.selectedValue = Array.from(union);
    },

    emitStats() {
      //用户新增数量：直接来自 userSelectedIds，跨分类累计，稳定可靠
      const totalUserSelectedCount = this.userSelectedIds.length
      //用户新增金额：用 itemsMap 建索引，未加载的条目按 0 处理
      const priceMap = new Map()
      for (const arr of Object.values(this.itemsMap || {})) {
        (arr || []).forEach(it => priceMap.set(it.hisItemId, it.price || 0))
      }
			let totalUserSelectedPrice = 0, userSelectedType = []; //增项总金额
			for (const arr of Object.values(this.itemsMap || {})) {
			  (arr || []).forEach(it => {
					if (this.userSelectedIds.includes(it.hisItemId)) {
						totalUserSelectedPrice += it.price;
						userSelectedType.push(it);
					}
				})
			}
			
      //每个分类下的已选数量（包含原始 + 用户新增）
      const selSet = new Set(this.selectedValue)
      const categoryCounts = {}
      this.categories.forEach(cat => {
        const catItems = this.itemsMap[cat] || []
        categoryCounts[cat] = catItems.reduce(
          (acc, it) => acc + (selSet.has(it.hisItemId) ? 1 : 0),
          0
        )
      })

      this.$emit('updateStats', {
        userSelectedCount: totalUserSelectedCount,
        userSelectedPrice: totalUserSelectedPrice,
        categoryCounts,
				userSelectedType
      })
    }
  },
  // 保证初次渲染时 selectedValue 正确
  mounted() {
    this.rebuildSelectedValue()
    this.emitStats()
  }
}
</script>


<style>
	/* .typeCheckbox .uni-data-checklist .checklist-group .checklist-box .checklist-content {
		font-size: 34rpx !important;
		word-wrap: break-word !important;
	} */
.category-container {
  display: flex;
  height: 100vh;
	margin-bottom: 25rpx;
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
