<template>
  <view class="chat-page">
    <!-- 顶部提示 -->
		<view class="chat-header">
		  <text class="msg-count" v-if="!sessionEnded">
		    剩余问诊条数 {{ remainingMsg }}/5条
		  </text>
			<text v-else>服务已结束，不能发送消息</text>
		</view>
		
    <!-- 消息列表 -->
    <scroll-view
      scroll-y
      class="msg-list"
      :scroll-into-view="lastMsgId"
      scroll-with-animation
      ref="msgScroll"
    >
      <block v-for="(msg, index) in messageList" :key="msg.id">
        <!-- 时间分隔 -->
        <view v-if="msg.showTime" class="time-tip">
          {{ formatTime(msg.time) }}
        </view>

        <!-- 患者卡片 -->
        <view v-if="msg.type === 'patientCard'" class="patient-card-container">
          <patientCard :info="msg.info" />
        </view>

        <!-- 文本/图片消息 -->
        <view
          v-else
          class="msg-item"
          :class="{ self: msg.from === userId }"
          :id="msg.id"
        >
          <!-- 医生头像 -->
          <image v-if="msg.from !== userId" class="msg-avatar" :src="doctor.avatar" />
          <!-- 患者头像 -->
          <image v-if="msg.from === userId" class="msg-avatar" :src="patient.avatar" />

          <!-- 消息气泡 -->
          <view class="bubble">
            <template v-if="msg.type === 'text'">{{ msg.content }}</template>
            <template v-else-if="msg.type === 'image'">
              <image :src="msg.content" class="bubble-img" mode="widthFix" />
            </template>
          </view>
        </view>
      </block>
    </scroll-view>

    <!-- 输入区 -->
    <view class="input-area">
      <input
        class="input-box"
        v-model="inputText"
        placeholder="请输入消息"
        confirm-type="send"
        @confirm="sendTextMsg"
        :disabled="sessionEnded"
      />
      <button
        class="send-btn"
        :disabled="!inputText || sessionEnded"
        @click="sendTextMsg"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script>
import TIM from 'tim-wx-sdk';
import tim from '../common/im.js';
import imService from '../common/imService.js';
import patientCard from '../components/patientCard.vue';

export default {
  components: { patientCard },
  data() {
    return {
      doctor: {},
      patient: {},
      userId: "",
      conversationID: "",
      messageList: [],
      inputText: "",
      lastMsgId: "",
      lastMessageTime: 0,
      sessionEnded: false,
      remainingMsg: 5, // 当前会话可发送消息数
    };
  },
  async onLoad(options) {
    const params = JSON.parse(decodeURIComponent(options.data));

    this.doctor = params.doctor;
    this.patient = params.patient;
    this.userId = this.patient.id;
    this.conversationID = "C2C" + this.doctor.id;

    // 初始患者信息卡片
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
    }, true); // 初始卡片不消耗条数

    await this.initTIM();
  },
  methods: {
    async initTIM() {
      try {
        // 登录 IM 并等待 SDK_READY
        await imService.login(this.userId);

        // 拉历史消息
        const historyList = await imService.getHistoryMsg(this.conversationID);
        historyList.reverse().forEach(msg => {
          const parsedMsg = this.parseMsg(msg);
          if (parsedMsg) this.addMessage(parsedMsg, true); // 历史消息不计数
        });

        // 监听实时消息
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, event => {
          event.data.forEach(msg => {
            if (msg.conversationID === this.conversationID) {
              const parsedMsg = this.parseMsg(msg);
              if (parsedMsg) this.addMessage(parsedMsg); // 新消息计数
              this.lastMsgId = msg.ID;
            }
          });
        });

      } catch (err) {
        console.error("聊天初始化失败:", err);
      }
    },

    parseMsg(msg) {
      if (!TIM.TYPES) return null; // 防止 undefined
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

    addMessage(msg, isHistory = false) {
      msg.showTime = false;
      if (!this.lastMessageTime || msg.time - this.lastMessageTime > 5 * 60 * 1000) {
        msg.showTime = true;
        this.lastMessageTime = msg.time;
      }
      this.messageList.push(msg);

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // 只计算新发送的患者消息
      if (!isHistory && msg.from === this.userId) {
        this.remainingMsg = Math.max(0, this.remainingMsg - 1);
        if (this.remainingMsg === 0) this.sessionEnded = true;
      }
    },

    scrollToBottom() {
      const query = uni.createSelectorQuery().in(this);
      query.select('.msg-list').scrollOffset(offset => {
        offset.scrollTop = offset.scrollHeight;
      }).exec();
    },

    async sendTextMsg() {
      if (!this.inputText) return;
      if (this.sessionEnded) {
        uni.showToast({ title: '服务已结束，不能发送消息', icon: 'none' });
        return;
      }
      try {
        const timMsg = await imService.sendText(this.doctor.id, this.inputText);
        const parsedMsg = this.parseMsg(timMsg);
        if (parsedMsg) this.addMessage(parsedMsg); // 新消息计数
        this.lastMsgId = parsedMsg.id;
        this.inputText = "";
      } catch (e) {
        console.error("发送失败", e);
      }
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

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 20rpx;
  background: #E3EDFF;
  font-size: 26rpx;
}

.msg-count {
  color: #333;
}

.end-btn {
  margin: 0;
  font-size: 24rpx;
  border-radius: 30rpx;
  background: #FAAA03;
  color: #fff;
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
  display: flex;
  align-items: flex-end;
  margin-bottom: 20rpx;
  gap: 12rpx;
}

.msg-item.self {
  flex-direction: row-reverse; /* 患者消息：头像右侧，气泡左侧 */
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
