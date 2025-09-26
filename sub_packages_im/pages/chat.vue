<template>
  <view class="chat-page">
    <!-- 顶部提示 -->
    <view class="chat-header">
      <text>IM服务已开始，患者可随时结束服务</text>
      <text v-if="!serviceEnded">还剩 {{ remainingCount }} 条消息</text>
      <button v-if="!serviceEnded" class="end-btn" @click="endService">结束服务</button>
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
        <patientCard v-if="msg.type === 'patientCard'" :info="msg.info" class="patient-card-container"/>

        <!-- 普通消息 -->
        <view v-if="msg.type !== 'patientCard'" class="msg-item" :class="{ self: msg.from === userId }" :id="msg.id">
          <!-- 左侧头像（医生） -->
          <image v-if="msg.from !== userId" class="msg-avatar" :src="doctor.avatar" />
          <!-- 气泡 -->
          <view class="bubble">{{ msg.content }}</view>
          <!-- 右侧头像（自己） -->
          <image v-if="msg.from === userId" class="msg-avatar" :src="patient.avatar" />
        </view>
      </block>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-area" v-if="!serviceEnded">
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

    <!-- 服务结束提示 -->
    <view v-else class="ended-tip">
      <text>服务已结束，不能发送消息</text>
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
      userId: '',
      conversationID: '',
      messageList: [],
      inputText: '',
      lastMsgId: '',
      lastMessageTime: 0,
      serviceEnded: false,
      remainingCount: 5,
      currentSessionCount: 0,
    };
  },
  async onLoad(options) {
    const params = JSON.parse(decodeURIComponent(options.data));

    this.doctor = params.doctor;
    this.patient = params.patient;
    this.userId = this.patient.id;
    this.conversationID = 'C2C' + this.doctor.id;

    // 初始化患者卡片
    const cardInfo = {
      patient: this.patient,
      diseaseDesc: params.diseaseDesc || '',
      images: params.images || [],
    };
    this.addMessage({
      id: 'init-card',
      type: 'patientCard',
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

        // 拉历史消息
        const historyList = await imService.getHistoryMsg(this.conversationID);
        historyList.reverse().forEach(msg => {
          const parsedMsg = this.parseMsg(msg);
          if (parsedMsg) this.addMessage(parsedMsg, false);
        });

        // 实时监听
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, (event) => {
          event.data.forEach(msg => {
            if (msg.conversationID === this.conversationID) {
              const parsedMsg = this.parseMsg(msg);
              if (parsedMsg) {
                this.addMessage(parsedMsg, true);
                this.lastMsgId = msg.ID;
              }
            }
          });
        });
      } catch (err) {
        console.error('聊天初始化失败:', err);
      }
    },

    parseMsg(msg) {
      let parsedMsg = null;
      const time = msg.time * 1000;
      if (msg.type === TIM.TYPES.MSG_TEXT) {
        parsedMsg = {
          id: msg.ID,
          type: 'text',
          content: msg.payload.text,
          from: msg.from,
          time,
        };
      } else if (msg.type === TIM.TYPES.MSG_IMAGE) {
        parsedMsg = {
          id: msg.ID,
          type: 'image',
          content: msg.payload.imageInfoArray[0].url,
          from: msg.from,
          time,
        };
      } else if (msg.type === TIM.TYPES.MSG_CUSTOM) {
        try {
          const data = JSON.parse(msg.payload.data);
          if (data.type === 'patientCard') {
            parsedMsg = {
              id: msg.ID,
              type: 'patientCard',
              info: data.content,
              from: msg.from,
              time,
            };
          }
        } catch (e) {
          console.error('自定义消息解析失败', e);
        }
      }
      return parsedMsg;
    },

    addMessage(msg, countThisSession = false) {
      msg.showTime = false;
      if (!this.lastMessageTime || msg.time - this.lastMessageTime > 5 * 60 * 1000) {
        msg.showTime = true;
        this.lastMessageTime = msg.time;
      }
      this.messageList.push(msg);
      this.lastMsgId = msg.id;

      // 只计算普通消息
      if (!this.serviceEnded && countThisSession && msg.type !== 'patientCard' && msg.from !== 'system') {
        this.currentSessionCount += 1;
        this.remainingCount = 5 - this.currentSessionCount;
        if (this.currentSessionCount >= 5) this.endService();
      }

      // 自动滚动到底部
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('.msg-list').scrollOffset(res => {
          uni.pageScrollTo({
            scrollTop: res.scrollHeight,
            duration: 100
          });
        }).exec();
      });
    },

    async sendTextMsg() {
      if (!this.inputText || this.serviceEnded) return;
      try {
        const timMsg = await imService.sendText(this.doctor.id, this.inputText);
        const parsedMsg = this.parseMsg(timMsg);
        if (parsedMsg) this.addMessage(parsedMsg, true);
        this.inputText = '';
      } catch (e) {
        console.error('发送失败', e);
      }
    },

    endService() {
      if (this.serviceEnded) return;
      this.serviceEnded = true;
      const systemMsg = {
        id: 'end-service-' + Date.now(),
        type: 'text',
        content: '服务已结束，不能再发送消息',
        from: 'system',
        time: Date.now(),
        showTime: true,
      };
      this.addMessage(systemMsg, false);
    },

    formatTime(time) {
      const date = new Date(time);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
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
  padding: 10rpx;
  background: #f7f7f7;
  font-size: 24rpx;
}
.end-btn {
  padding: 4rpx 12rpx;
  background: #ff4d4f;
  color: #fff;
  border-radius: 8rpx;
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
  flex-direction: row-reverse;
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
.ended-tip {
  text-align: center;
  padding: 20rpx;
  color: #ff4d4f;
  font-size: 28rpx;
}
</style>
