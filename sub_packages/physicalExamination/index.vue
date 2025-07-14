<template>
	<view class="inventory">
		<HeaderBar @handle="show" :footState="footState" />
		<view>
			<uni-segmented-control 
			:current="current" 
			:values="items" 
			@clickItem="onClickItem" 
			styleType="button" 
			activeColor="#1B98FF"
			class="tab"
			>
			</uni-segmented-control>
			<view class="content">
				<view v-show="current === 0">
					选项卡1的内容
				</view>
				<view v-show="current === 1">
					选项卡2的内容
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import HeaderBar from '@/components/HeaderBar.vue';
	export default {
		components: {
			HeaderBar
		},
		data() {
			return {
				items: ['体检信息', '待检查信息'],
				current: 0
			}
		},
		methods: {
			onClickItem(e) {
				if (this.current != e.currentIndex) {
					this.current = e.currentIndex;
				}
			}
		}
	};
</script>

<style lang="less" scoped>
	.inventory {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		.tab {
			background: #fff;
			padding: 15rpx;
		}
	}
</style>
