<template>
  <view :class="['bubble-container', isSelf ? 'right' : 'left']">
    <!-- 左侧显示头像，右侧不显示 -->
    <image v-if="!isSelf" class="avatar" :src="msg.avatar || defaultAvatar" />
    
    <!-- 气泡内容 -->
    <view class="bubble" :class="isSelf ? 'self' : 'other'">
      
      <!-- 文本消息 -->
      <text v-if="msg.type === 'TIMTextElem'">{{ msg.payload.text }}</text>
      
      <!-- 图片消息 -->
      <image v-else-if="msg.type === 'TIMImageElem'" :src="msg.payload.imageInfoArray[0].url" class="bubble-image" />
      
      <!-- 自定义消息 -->
      <view v-else-if="msg.type === 'TIMCustomElem'" class="custom-msg">
        {{ msg.payload.data }}
      </view>
      
    </view>

    <!-- 自己消息右侧显示头像 -->
    <image v-if="isSelf" class="avatar" :src="msg.avatar || defaultAvatar" />
  </view>
</template>

<script>
export default {
  props: {
    msg: Object,
    selfID: String
  },
  data() {
    return {
      defaultAvatar: '../../static/image/doctor.png' // 默认头像，可替换
    };
  },
  computed: {
    isSelf() {
      // 根据消息发送者判断左右
      return this.msg.from === this.selfID;
    }
  }
};
</script>

<style scoped>
.bubble-container {
  display: flex;
  align-items: flex-end;
  margin: 5px 10px;
}

.bubble-container.left {
  justify-content: flex-start;
}

.bubble-container.right {
  justify-content: flex-end;
}

/* 头像 */
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 5px;
}

/* 气泡 */
.bubble {
  padding: 8px 12px;
  border-radius: 16px;
  max-width: 70%;
  word-break: break-word;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.bubble.self {
  background-color: #dceafd;
  color: #000;
  border-bottom-right-radius: 0;
}

.bubble.other {
  background-color: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 0;
}

/* 图片消息 */
.bubble-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12px;
}

/* 自定义消息样式 */
.custom-msg {
  background-color: #ffd966;
  padding: 6px 10px;
  border-radius: 12px;
  color: #333;
}
</style>
