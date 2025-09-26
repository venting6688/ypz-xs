<template>
  <view>
    <!-- 弹窗 -->
    <uni-popup ref="popup" type="bottom" background-color="#fff">
      <view class="popup-container">
        <!-- 标题 -->
        <view class="popup-title">请选择问诊方式</view>

        <!-- 选项区域 -->
        <view class="service-list">
          <view
            class="service-item"
            v-for="(item, index) in services"
            :key="index"
            :class="{ active: selectedIndex === index }"
            :style="{ backgroundImage: 'url(' + item.icon + ')' }"
            @click="selectService(index)"
          >
            <view class="label">{{ item.label }}</view>
            <view class="price">￥{{ item.price }}</view>
          </view>
        </view>

        <!-- 提示语（根据选择动态切换） -->
        <view class="tips">
          <rich-text :nodes="services[selectedIndex].tips"></rich-text>
        </view>

        <!-- 底部按钮 -->
        <view class="btn-group">
          <view class="btn cancel" @click="close">取消</view>
          <view class="btn confirm" @click="confirm">确认问诊</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
	import TUIChat from '@/TUIKit/components/TUIChat/index.vue'
	
	export default {
		name: "ConsultPopup",
		data() {
			return {
				selectedIndex: 0,
				services: [
					{
						label: "图文问诊",
						price: 5,
						icon: "../static/images/tuwen.png",
						tips: "采用图文方式，每个订单<span style='color: #ff6600'>限20条</span>，实时对接，若当日24点前医生未接诊将自动退单，未接诊前患者可随时申请退单"
					},
					{
						label: "语音问诊",
						price: 5,
						icon: "../static/images/yuyin.png",
						tips: "采用语音方式，单次限时<span style='color: #ff6600'>10分钟</span>，实时对接，若医生未接听，订单将自动退单"
					},
					{
						label: "视频问诊",
						price: 5,
						icon: "../static/images/shipin.png",
						tips: "采用视频方式，单次限时<span style='color: #ff6600'>15分钟</span>，实时对接，若医生未接听，订单将自动退单"
					}
				]
			};
		},
		methods: {
			open() {
				this.$refs.popup.open();
			},
			close() {
				this.$refs.popup.close();
			},
			confirm() {
				const selected = this.services[this.selectedIndex];
				this.$emit("confirm", selected);
				this.close();
			},
			selectService(index) {
				this.selectedIndex = index;
				const conversationID = 'C2Chaimianbaobao';
				uni.navigateTo({ url: `/TUIKit/components/TUIChat/index?conversationID=${conversationID}`});
			}
		}
	};
</script>

<style scoped>
.popup-container {
  width: 100%;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;
  background-color: #fff;
}
.popup-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}
.service-list {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}
.service-item {
  width: 225rpx;
  height: 240rpx;
  border-radius: 20rpx;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;  /* 文字和价格放到底部 */
  align-items: center;
  padding-bottom: 20rpx;       /* 离底部留点空间 */
}

.service-item .label {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 6rpx;
}

.service-item .price {
  font-size: 30rpx;
	font-weight: bold;
  color: #FAAA03;
}

.service-item.active {
  border: 2rpx solid #4286ff;
  background-color: rgba(66, 134, 255, 0.06);
}
.tips {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40rpx;
}
.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}
.btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.cancel {
  border: 2rpx solid #4286ff;
  color: #4286ff;
  background: #fff;
}
.confirm {
  background: #4286ff;
  color: #fff;
}
</style>
