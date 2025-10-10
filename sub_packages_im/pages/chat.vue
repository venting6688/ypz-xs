<template>
  <view class="chat-page">
		<view class="chat-header">
		  <text class="msg-count" v-if="!sessionEnded">
		    剩余问诊条数 {{ remainingMsg }}/5条
		  </text>
		</view>

    <scroll-view
      scroll-y
      class="msg-list"
      :scroll-into-view="scrollToView"
      scroll-with-animation
    >
      <block v-for="(msg, index) in messageList" :key="msg.id">
        <!-- 时间分隔 -->
        <view v-if="msg.showTime" class="time-tip">
          {{ formatTime(msg.time) }}
        </view>
    
        <!-- 普通消息 -->
        <view
          v-if="msg.type !== 'patientCard'"
          class="msg-item"
          :class="{ self: msg.from === userId }"
          :id="msg.id"
        >
          <!-- 头像 + 气泡 -->
          <image
            class="msg-avatar"
            :src="msg.from === userId ? patient.avatar : doctor.avatar"
          />
          <view class="bubble">
            <template v-if="msg.type === 'text'">{{ msg.content }}</template>
            <template v-else-if="msg.type === 'image'">
              <image :src="msg.content" class="bubble-img" mode="widthFix" />
            </template>
          </view>
        </view>
    
        <!-- 病历卡、系统消息 -->
        <patientCard
          v-else-if="msg.type === 'patientCard'"
          :info="msg.info"
        />
      </block>
    
      <!-- 底部锚点 -->
      <view id="bottom-anchor"></view>
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
			<!-- <button
				class="send-btn send-card-btn"
				:disabled="sessionEnded"
				@click="sendPatientCard"
			>
				发送病历卡
			</button> -->
    </view>
  </view>
</template>

<script>
import TIM from 'tim-wx-sdk';
import tim from '../common/im.js';
import imService from '../common/imService.js';
import systemMsg from '../components/systemMsg.vue';
import patientCard from '../components/patientCard.vue';

export default {
  components: { 
		patientCard, 
		systemMsg 
	},
  data() {
    return {
      doctor: {},
      patient: {},
      userId: "",
      conversationID: "",
      messageList: [],
      inputText: "",
      lastMsgId: "",
      lastTimeShown: null,
			sessionEnded: false,
			remainingMsg: 5,
			timeShowInterval: 1 * 60 * 1000,
			scrollToView: 'bottom-anchor',
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
    // this.addMessage({
    //   id: "init-card",
    //   type: "patientCard",
    //   info: cardInfo,
    //   from: this.userId,
    //   time: Date.now(),
    // }, true);

    await this.initTIM();
  },
  methods: {
    async initTIM() {
      try {
        await imService.login(this.userId);
        const historyList = (await imService.getHistoryMsg(this.conversationID)) || [];
        const parsedHistory = historyList.map(m => this.parseMsg(m)).filter(Boolean);
        const merged = [...this.messageList, ...parsedHistory].filter(Boolean);
        merged.sort((a, b) => (a.time || 0) - (b.time || 0));
        // 重新构建 messageList，并根据 timeShowInterval 计算 showTime
        this.messageList = [];
        let lastShown = null; // 局部变量用于计算历史显示时间
        merged.forEach(msg => {
          msg.showTime = false;
          if (lastShown === null || (msg.time - lastShown) >= this.timeShowInterval) {
            msg.showTime = true;
            lastShown = msg.time;
          }
          this.messageList.push(msg);
        });
    
        this.lastTimeShown = lastShown;
        this.$nextTick(() => {
          if (this.messageList.length) {
            this.lastMsgId = this.messageList[this.messageList.length - 1].id;
          }
        });
        // 监听实时消息
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, event => {
          event.data.forEach(msg => {
            if (msg.conversationID === this.conversationID) {
              const parsed = this.parseMsg(msg);
              if (parsed) this.addMessage(parsed);
              this.lastMsgId = parsed?.id || this.lastMsgId;
            }
          });
        });
      } catch (err) {
        console.error("聊天初始化失败:", err);
      }
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
        this.addMessage(parsedMsg);
        this.lastMsgId = parsedMsg.id;
        this.inputText = "";
      } catch (e) {
        console.error("发送失败", e);
      }
    },
		//自定义消息
		async sendPatientCard() {
		  if (this.sessionEnded) {
		    uni.showToast({ title: "服务已结束，不能发送消息", icon: "none" });
		    return;
		  }
			let customerData = {
				biz: "internet_hospital",
				ver: 2,
				msgType:"patient_info",
				serviceId: "987654",
				doctorId: this.doctor.id,
				patientId: "8888",
				// payload: { desc: "服务已开始，请您详细描述信息。" }
				payload: this.patient
			}
		  try {
		    const timMsg = await imService.sendCustom(this.doctor.id, customerData);
		    const parsedMsg = this.parseMsg(timMsg);
				
		    if (parsedMsg) this.addMessage(parsedMsg);
		    this.lastMsgId = parsedMsg.id;
		  } catch (e) {
		    console.error("发送病历卡失败", e);
		  }
		},
		
		parseMsg(msg) {
		  if (!TIM.TYPES) return null;
		  let parsedMsg = null;
		
		  const timeRaw = msg.time || Date.now();
		  const timeMs = timeRaw < 1e12 ? timeRaw * 1000 : timeRaw;
		
		  if (msg.type === TIM.TYPES.MSG_TEXT) {
		    parsedMsg = {
		      id: msg.ID,
		      type: "text",
		      content: msg.payload.text,
		      from: msg.from,
		      time: timeMs,
		    };
		  } else if (msg.type === TIM.TYPES.MSG_IMAGE) {
		    parsedMsg = {
		      id: msg.ID,
		      type: "image",
		      content: msg.payload.imageInfoArray?.[0]?.url || "",
		      from: msg.from,
		      time: timeMs,
		    };
		  } else if (msg.type === TIM.TYPES.MSG_CUSTOM) {
		    try {
		      const data = JSON.parse(msg.payload.data);
		      if (data.msgType === "patient_info") {
		        parsedMsg = {
		          id: msg.ID,
		          type: "patientCard",
		          msgType: data.msgType,
		          info: data.payload,
		          from: msg.from,
		          time: timeMs,
		        };
		      } else if (["system_tip", "service_start", "service_end"].includes(data.msgType)) {
		        parsedMsg = {
		          id: msg.ID,
		          type: "systemMsg",
		          msgType: data.msgType,
		          content: data.payload?.desc || data.payload || "",
		          from: msg.from,
		          time: timeMs,
		        };
		      } else {
		        // 其他自定义消息也保留原始内容
		        parsedMsg = {
		          id: msg.ID,
		          type: "custom",
		          raw: data,
		          from: msg.from,
		          time: timeMs,
		        };
		      }
		    } catch (e) {
		      console.error("自定义消息解析失败", e);
		    }
		  }
		  return parsedMsg;
		},
		
		addMessage(msg, isHistory = false) {
		  if (!msg.time) msg.time = Date.now();
		  msg.showTime = false;
		
		  if (this.lastTimeShown === null || (msg.time - this.lastTimeShown) >= this.timeShowInterval) {
		    msg.showTime = true;
		    this.lastTimeShown = msg.time;
		  }
		
		  this.messageList.push(msg);
		
		  this.$nextTick(() => {
		    this.scrollToView = '';
		    this.$nextTick(() => {
		      this.scrollToView = 'bottom-anchor';
		    });
		  });
		
		  // 更新消息次数逻辑
		  if (!isHistory && msg.from === this.userId) {
		    this.remainingMsg = Math.max(0, this.remainingMsg - 1);
		    if (this.remainingMsg === 0) this.sessionEnded = true;
		  }
		},

		scrollToBottom() {
		  if (this.messageList.length > 0) {
		    this.lastMsgId = this.messageList[this.messageList.length - 1].id;
		  } else {
		    this.lastMsgId = 'bottom-anchor';
		  }
		},

		formatTime(ms) {
		  const date = new Date(ms); // ms
		  const now = new Date();
		
		  const Y = date.getFullYear();
		  const M = String(date.getMonth() + 1).padStart(2, "0");
		  const D = String(date.getDate()).padStart(2, "0");
		  const h = String(date.getHours()).padStart(2, "0");
		  const m = String(date.getMinutes()).padStart(2, "0");
		
		  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
		
		  if (date >= today) return `${h}:${m}`;
		  if (date >= yesterday) return `昨天 ${h}:${m}`;
		  if (Y === now.getFullYear()) return `${M}-${D} ${h}:${m}`;
		  return `${Y}-${M}-${D} ${h}:${m}`;
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
  margin: 45rpx 0;
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
  background: #f5f5f5;
	padding: 25rpx 0;
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
