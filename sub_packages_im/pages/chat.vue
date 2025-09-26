<template>
  <view class="chat-page">
    <!-- 顶部服务状态 -->
    <view class="chat-header" v-if="serviceStatus !== 'ended'">
      <text>问诊服务已开始，本次最多 {{ maxMessages }} 条</text>
      <text class="end-btn" @click="endService">结束服务</text>
    </view>
    <view class="chat-header ended" v-else>
      <text>服务已结束，不能再发送消息</text>
    </view>

    <!-- 剩余条数提示 -->
    <view class="remain-tip" v-if="serviceStatus === 'active'">
      还可以发送 {{ maxMessages - messageCount }} 条消息
    </view>

    <!-- 消息列表 -->
    <scroll-view
      scroll-y
      class="msg-list"
      :scroll-into-view="lastMsgId"
    >
      <block v-for="(msg, index) in messageList" :key="msg.id">
        <!-- 时间分隔 -->
        <view v-if="msg.showTime" class="time-tip">
          {{ formatTime(msg.time) }}
        </view>

        <!-- 患者卡片 -->
        <patientCard v-if="msg.type === 'patientCard'" :info="msg.info" class="patient-card-container" />

        <!-- 消息气泡 -->
        <view
          class="msg-item"
          :class="{ self: msg.from === userId }"
          :id="msg.id"
          v-if="msg.type !== 'patientCard'"
        >
          <!-- 头像 -->
          <image
            class="msg-avatar"
            :src="msg.from === userId ? patient.avatar : doctor.avatar"
          />
          <!-- 文本 -->
          <view v-if="msg.type === 'text'" class="bubble">
            {{ msg.content }}
          </view>
          <!-- 图片 -->
          <image
            v-if="msg.type === 'image'"
            class="bubble-img"
            :src="msg.content"
            mode="widthFix"
          />
        </view>
      </block>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-area" v-if="serviceStatus === 'active'">
      <input
        class="input-box"
        v-model="inputText"
        placeholder="请输入消息"
        confirm-type="send"
        @confirm="sendTextMsg"
      />
      <button
        class="send-btn"
        :disabled="!inputText"
        @click="sendTextMsg"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script>
import TIM from "tim-wx-sdk";
import tim from "../common/im.js";
import imService from "../common/imService.js";
import patientCard from "../components/patientCard.vue";

export default {
  components: { patientCard },
  data() {
    return {
      orderId: "",
      doctor: {},
      patient: {},
      userId: "",
      conversationID: "",
      messageList: [],
      inputText: "",
      lastMsgId: "",
      lastMessageTime: 0,

      // 服务限制
      maxMessages: 5,
      messageCount: 0, // 当前订单已使用条数
      serviceStatus: "active", // active | ended
    };
  },
  async onLoad(options) {
    const params = JSON.parse(decodeURIComponent(options.data));
    this.orderId = params.orderId;
    this.doctor = params.doctor;
    this.patient = params.patient;
    this.userId = this.patient.id;
    this.conversationID = "C2C" + this.doctor.id;

    // 恢复订单计数
    this.messageCount =
      uni.getStorageSync(`order_${this.orderId}_count`) || 0;
    if (this.messageCount >= this.maxMessages) {
      this.serviceStatus = "ended";
    }

    // 初始展示患者卡片
    const cardInfo = {
      patient: this.patient,
      diseaseDesc: params.diseaseDesc || "",
      images: params.images || [],
    };
    this.addMessage({
      id: "init-card",
      type: "patientCard",
      info: cardInfo,
      from: this.userId,
      time: Date.now(),
    }, false);

    await this.initTIM();
  },
  methods: {
    async initTIM() {
      try {
        await imService.login(this.userId);

        // 拉取历史消息
        const historyList = await imService.getHistoryMsg(this.conversationID);
        historyList.reverse().forEach((msg) => {
          const parsedMsg = this.parseMsg(msg);
          if (parsedMsg) this.addMessage(parsedMsg, false); // 历史消息不计数
        });

        // 监听实时消息
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, (event) => {
          event.data.forEach((msg) => {
            if (msg.conversationID === this.conversationID) {
              const parsedMsg = this.parseMsg(msg);
              if (parsedMsg) {
                this.addMessage(parsedMsg);
                this.lastMsgId = msg.ID;
              }
            }
          });
        });
      } catch (err) {
        console.error("聊天初始化失败:", err);
      }
    },

    parseMsg(msg) {
      let parsedMsg = null;
      const time = msg.time * 1000;
      if (msg.type === TIM.TYPES.MSG_TEXT) {
        parsedMsg = {
          id: msg.ID,
          type: "text",
          content: msg.payload.text,
          from: msg.from,
          time,
        };
      } else if (msg.type === TIM.TYPES.MSG_IMAGE) {
        parsedMsg = {
          id: msg.ID,
          type: "image",
          content: msg.payload.imageInfoArray[0].url,
          from: msg.from,
          time,
        };
      } else if (msg.type === TIM.TYPES.MSG_CUSTOM) {
        try {
          const data = JSON.parse(msg.payload.data);
          if (data.type === "patientCard") {
            parsedMsg = {
              id: msg.ID,
              type: "patientCard",
              info: data.content,
              from: msg.from,
              time,
            };
          }
        } catch (e) {
          console.error("自定义消息解析失败", e);
        }
      }
      return parsedMsg;
    },

    addMessage(msg, countFlag = true) {
      msg.showTime = false;
      if (
        !this.lastMessageTime ||
        msg.time - this.lastMessageTime > 5 * 60 * 1000
      ) {
        msg.showTime = true;
        this.lastMessageTime = msg.time;
      }
      this.messageList.push(msg);

      // 计数逻辑
      if (
        this.serviceStatus === "active" &&
        countFlag &&
        (msg.from === this.userId || msg.from === this.doctor.id)
      ) {
        this.messageCount++;
        uni.setStorageSync(`order_${this.orderId}_count`, this.messageCount);
        if (this.messageCount >= this.maxMessages) {
          this.serviceStatus = "ended";
          uni.showToast({ title: "已达到最大条数，本次服务结束", icon: "none" });
        }
      }
    },

    // 发送文本消息
    async sendTextMsg() {
      if (!this.inputText || this.serviceStatus === "ended") return;
      try {
        const timMsg = await imService.sendText(
          this.doctor.id,
          this.inputText
        );
        const parsedMsg = this.parseMsg(timMsg);
        if (parsedMsg) {
          this.addMessage(parsedMsg);
          this.lastMsgId = parsedMsg.id;
        }
        this.inputText = "";
      } catch (e) {
        console.error("发送失败", e);
      }
    },

    endService() {
      this.serviceStatus = "ended";
      uni.showToast({ title: "服务已结束", icon: "none" });
    },

    formatTime(time) {
      const date = new Date(time);
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    },
  },
};
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部状态条 */
.chat-header {
  background: #e6f7ff;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #333;
}
.chat-header.ended {
  background: #f5f5f5;
  color: #999;
}
.end-btn {
  color: #f00;
  font-weight: bold;
}

/* 剩余提示 */
.remain-tip {
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin: 10rpx 0;
}

.msg-list {
  flex: 1;
  height: 80vh;
  padding: 20rpx;
  background: #f5f5f5;
}
.time-tip {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin: 20rpx 0;
}
.msg-item {
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
}
.msg-item.self {
  flex-direction: row-reverse; /* 自己的消息反向排列 */
}
.msg-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.bubble {
  max-width: 60%;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  word-break: break-word;
}
.msg-item.self .bubble {
  background: #95ec69;
}
.bubble-img {
  max-width: 40%;
  border-radius: 12rpx;
  object-fit: cover;
}
.input-area {
  display: flex;
  align-items: center;
  padding: 10rpx;
  border-top: 1px solid #eee;
  background: #fff;
}
.input-box {
  flex: 1;
  height: 70rpx;
  border: 1px solid #ddd;
  border-radius: 35rpx;
  padding: 0 20rpx;
  margin-right: 10rpx;
  background: #f7f7f7;
}
.send-btn {
  background: #07c160;
  color: #fff;
  border-radius: 35rpx;
  padding: 0 20rpx;
  height: 70rpx;
  line-height: 70rpx;
}
.send-btn:disabled {
  background: #ccc;
}
.patient-card-container {
  display: flex;
  justify-content: center;
  margin: 20rpx auto;
}
.patient-card-container > * {
  min-width: 400rpx;
  max-width: 90%;
}
</style>
