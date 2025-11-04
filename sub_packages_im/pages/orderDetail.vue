<template>
  <view class="page">
    <!-- 顶部提示 -->
    <view class="top-tips">
      本次咨询订单已完成，您如果还想继续咨询，可以继续购买医生服务咨询。
    </view>

    <!-- 订单类型 -->
    <view class="section">
      <view class="row">
        <text class="label">订单类型</text>
        <text class="value">图文咨询 <text class="price">(0元)</text></text>
      </view>
    </view>

    <!-- 医生信息 -->
    <view class="section doctor">
      <image class="avatar" src="https://img.yzcdn.cn/vant/cat.jpeg" mode="aspectFill" />
      <view class="info">
        <text class="name">韩爱卿</text>
        <text class="title"> 主任医师</text>
        <view class="dept">济南市妇幼保健院 产科</view>
      </view>
    </view>

    <!-- 咨询内容 -->
    <view class="section">
      <view class="title">咨询内容</view>
      <view class="row">
        <text class="label">患者信息</text>
        <text class="value">肖洁 女 27岁</text>
      </view>
      <view class="row">
        <text class="label">病情描述</text>
        <text class="value">韩主任，这是我的b族链球菌报告，麻烦看下</text>
      </view>
      <view class="row photo-row">
        <text class="label">照片</text>
        <text class="value">1张</text>
        <button class="btn-view">点击查看</button>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="section">
      <view class="row"><text class="label">订单编号</text><text class="value">53170165414557760</text></view>
      <view class="row"><text class="label">订单金额</text><text class="value">￥0</text></view>
      <view class="row"><text class="label">下单时间</text><text class="value">2023-12-04 09:42:25</text></view>
      <view class="row"><text class="label">支付时间</text><text class="value">2023-12-04 09:42:25</text></view>
      <view class="row"><text class="label">接诊时间</text><text class="value">2023-12-04 10:39:56</text></view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="float-btn" @click="goChat">聊天记录</view>

    <!-- 底部操作 -->
    <view class="bottom-bar">
      <button class="btn-rate">评价</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goChat() {
      uni.navigateTo({
        url: '/pages/chat/chat'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 120rpx; // 预留底部按钮空间
}

.top-tips {
  padding: 20rpx;
  font-size: 26rpx;
  color: #666;
  background: #fff7f7;
  line-height: 1.5;
}

.section {
  background: #fff;
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 12rpx;

  .title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }

  .row {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    .label {
      width: 160rpx;
      color: #666;
    }
    .value {
      flex: 1;
      color: #333;
    }
  }

  .photo-row {
    .btn-view {
      font-size: 26rpx;
      padding: 4rpx 16rpx;
      border: 1rpx solid #f56c6c;
      color: #f56c6c;
      border-radius: 30rpx;
      background: #fff;
      margin-left: 20rpx;
    }
  }
}

.doctor {
  display: flex;
  align-items: center;

  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }
  .info {
    .name {
      font-size: 32rpx;
      font-weight: 600;
    }
    .title {
      font-size: 28rpx;
      color: #666;
    }
    .dept {
      font-size: 26rpx;
      color: #999;
      margin-top: 6rpx;
    }
  }
}

.float-btn {
  position: fixed;
  right: 30rpx;
  bottom: 160rpx;
  width: 140rpx;
  height: 140rpx;
  background: #f56c6c;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
  z-index: 99;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);

  display: flex;
  justify-content: flex-end;

  .btn-rate {
    font-size: 28rpx;
    color: #f56c6c;
    border: 1rpx solid #f56c6c;
    border-radius: 40rpx;
    padding: 10rpx 40rpx;
    background: #fff;
  }
}
</style>
