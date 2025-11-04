<template>
  <view class="page">
    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-list">
      <view
        class="order-card"
        v-for="(item, index) in orderList"
        :key="index"
				@click="showDetail"
      >
        <!-- 医生信息行 -->
        <view class="doctor-info">
          <image class="avatar" :src="item.doctorAvatar" mode="aspectFill" />
          <view class="doctor-name">
            <text class="name">{{ item.doctorName }}</text>
            <text class="dept">{{ item.dept }}</text>
          </view>
          <text
            class="status"
            :class="item.status === '已取消' ? 'cancel' : 'done'"
          >
            {{ item.status }}
          </text>
        </view>

        <!-- 病情描述 -->
        <view class="desc">
          <text class="label">病情描述：</text>
          <text>{{ item.desc }}</text>
        </view>

        <!-- 底部信息 -->
        <view class="footer">
          <text class="time">{{ item.time }}</text>
          <text class="patient">
            问诊人：{{ item.patientName }} {{ item.patientSex }} {{ item.patientAge }}岁 图文咨询
          </text>
        </view>

        <!-- 操作按钮 -->
         <view class="actions" v-if="item.status !== '已取消'">
					<button
						class="btn rate"
						:class="{ disabled: item.rated }"
						:disabled="item.rated"
					>
						评价
					</button>
				</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderList: [
        {
          doctorAvatar:
            "https://img.yzcdn.cn/vant/cat.jpeg",
          doctorName: "韩爱卿",
          dept: "产科",
          status: "已取消",
          desc: "你好，韩主任，孕妇缺铁怎么食补",
          time: "2025-08-19",
          patientName: "肖洁",
          patientSex: "女",
          patientAge: 27,
          rated: false,
        },
        {
          doctorAvatar:
            "https://img.yzcdn.cn/vant/cat.jpeg",
          doctorName: "韩爱卿",
          dept: "产科",
          status: "已完成",
          desc: "韩主任，这是我的b族链球菌报告，麻烦看下",
          time: "2023-12-04",
          patientName: "肖洁",
          patientSex: "女",
          patientAge: 27,
          rated: true,
        },
        {
          doctorAvatar:
            "https://img.yzcdn.cn/vant/cat.jpeg",
          doctorName: "韩爱卿",
          dept: "产科",
          status: "已完成",
          desc: "韩主任，这是我糖耐的结果，您看下",
          time: "2023-10-10",
          patientName: "肖洁",
          patientSex: "女",
          patientAge: 27,
          rated: false,
        },
      ],
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
		showDetail() {
			uni.navigateTo({
				url: `/sub_packages_im/pages/orderDetail`
			});
		},
  },
};
</script>

<style lang="scss" scoped>
.page {
  background: #f8f8f8;
  height: 100%;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;

  .title {
    font-size: 34rpx;
    font-weight: 600;
  }
  .iconfont {
    font-size: 36rpx;
  }
}

.order-list {
  padding: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);

  .doctor-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
    }

    .doctor-name {
      flex: 1;
      margin-left: 16rpx;

      .name {
        font-weight: 600;
        margin-right: 10rpx;
      }
      .dept {
        color: #666;
        font-size: 26rpx;
      }
    }

    .status {
      font-size: 26rpx;

      &.done {
        color: #999;
      }
      &.cancel {
        color: #f56c6c;
      }
    }
  }

  .desc {
    margin-top: 16rpx;
    font-size: 28rpx;
    line-height: 1.5;

    .label {
      font-weight: 600;
    }
  }

  .footer {
		display: flex;
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #888;
		justify-content: space-between;
		
    .time {
      margin-right: 20rpx;
    }
  }

  .actions {
		margin-top: 16rpx;
		display: flex;
		justify-content: flex-end;
		border-top: 1px solid #f5f5f5;
		padding-top: 15rpx;
				
		.btn {
			border: 1rpx solid #4286FF;
			border-radius: 40rpx;
			font-size: 26rpx;
			background: #fff;

			&.rate {
				color: #4286FF;
				border-color: #4286FF;
				margin: 0;

				&.disabled {
					color: #ccc;
					border-color: #ccc;
					margin: 0;
				}
			}
		}
	}
}
</style>
