<template>
  <view class="card">
    <!-- 患者信息 -->
    <view class="info">
      <view class="row">
        <view class="label">患者信息：</view>
        <view class="value">{{ info.patient.name }} {{ info.patient.age }} {{ info.patient.gender }}</view>
      </view>
    </view>

    <!-- 病情描述 -->
    <view class="description row">
      <view class="label">病情描述：</view>
      <view class="value">{{ info.diseaseDesc }}</view>
    </view>

    <!-- 上传图片 -->
    <view class="images row" v-if="info.images && info.images.length">
      <view class="label">上传图片：</view>
      <view class="value images-list">
				<view>
					<image
					  v-for="(img, idx) in info.images"
					  :key="idx"
					  :src="img"
					  class="card-img"
					  @click="previewImage(idx)"
					/>
				</view>
				<view class="tip">温馨提示：可点击查看大图</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  methods: {
    previewImage(index) {
      uni.previewImage({
        current: this.info.images[index],
        urls: this.info.images
      });
    }
  }
};
</script>

<style scoped>
.card {
  padding: 12px;
  margin: 10px;
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
	min-width: 600rpx;
}

/* 每一行左右布局 */
.row {
  display: flex;
  flex-direction: row;
  align-items: flex-start; /* 左右内容顶部对齐 */
  margin-bottom: 10px;
}

/* 左侧标签 */
.label {
  font-weight: bold;
  color: #333;
}

/* 右侧内容 */
.value {
  flex: 1;
  color: #666;
  word-break: break-word;
}

.images, .images-list {
	display: flex;
	flex-direction: column;
}

/* 图片列表容器 */
.images-list {
  display: flex;
  flex-wrap: wrap;
}

/* 图片样式 */
.card-img {
  width: 80px;
  height: 80px;
  margin-right: 5px;
  margin-top: 5px;
  border-radius: 6px;
  object-fit: cover;
}
.tip {
	color: #666;
}
</style>
