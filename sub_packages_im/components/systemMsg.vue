<template>
  <view class="system-msg">
    <text>{{ content }}</text>
  </view>
</template>

<script>
export default {
  name: "systemMsg",
  props: {
    content: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.system-msg {
	background: #fff;
	border-radius: 25rpx;
	width: 500rpx;
	margin: 20rpx auto;
	padding: 15rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}
</style>
