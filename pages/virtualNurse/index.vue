<template>
	<view class="virtual">
		<view class="" :animation="anData" style="height: 0rpx"></view>
		<view class="head">山东第一医科大学第二附属医院</view>
		<view class="center">
			<scroll-view scroll-y="true" :scroll-top="scrollTop" class="scroll-Y" scroll-with-animation>
				<view class="video-wrap">
					<video
						id="myVideo"
						class="background-video"
						:src="videoUrl"
						autoplay
						muted
						loop
						playsinline
						webkit-playsinline
						:controls="false"
						:show-play-btn="false"
						show-center-play-btn="false"
						show-progress="false"
						enable-progress-gesture="false"
						show-fullscreen-btn="false"
						@loadeddata="onVideoReady"
						@timeupdate="forceShow"
						:style="{ opacity: videoLoaded ? 1 : 0 }"
					></video>
					<!-- 底部遮挡黑线 -->
					<view class="video-bottom-cover" v-if="videoLoaded"></view>
				</view>
				<view class="aiTitle">
					<view class="aiName">Hi~ {{ siginVal.patientName != undefined ? siginVal.patientName : '' }}</view>
					<view class="aiTip">我是"安好"，与您温暖同行，让关爱时刻在线</view>
				</view>
				<view id="okk" style="padding-bottom: 52rpx; margin-top: 27%">
					<view class="msgList" v-for="(x, i) in msgList" :key="i" :class="{ padd: i === msgList.length - 1 }">
						<!-- 用户消息 -->
						<view class="my" v-if="x.my">
							<view class="my-box">
								<view class="center">
									<text class="msg">{{ x.msg }}</text>
								</view>
							</view>
						</view>
						<!-- AI消息 -->
						<view class="robot" v-else>
							<view class="robot-box" v-if="x.type !== 2">
								<view class="center" style="opacity: 0.95">
									<view class="loading" v-if="x.msgLoad">
										<text>思考中</text>
										<view class="dot">
											<view class="stage">
												<view class="dot-typing"></view>
											</view>
										</view>
									</view>
									<view v-else class="msg" v-html="markdown(x.msg)"></view>
									<view v-if="x.type == 1">
										<scroll-view scroll-x class="tabs-scroll" :scroll-left="scrollLeft" scroll-with-animation>
											<view class="tab-list">
												<view v-for="(item, index) in tabs" :key="index" class="tab-item" :class="{ active: current === index }" @click="changeTab(index)">
													{{ item }}
													<view v-if="current === index" class="active-bottom">
														<image src="../../static/image/arc.png" />
													</view>
												</view>
											</view>
										</scroll-view>
										<swiper :current="current" @change="onSwiperChange" class="swiper-body">
											<swiper-item v-for="(item, i) in tabs" :key="i">
												<view class="page-content">
													<view class="top1" v-if="x.type == 1">
														<view class="answer" v-for="msgItem in msgList" :key="msgItem.msg">
														<view class="answer" v-for="(question, idx) in getQuestionsByType(msgItem, item)" :key="idx" @click="answer(question)">
															<view class="tipContent">
																<view>{{ question }}</view>
																<image src="../../static/img/arrow.png" />
															</view>
														</view>
														</view>
													</view>
												</view>
											</swiper-item>
										</swiper>
									</view>
									<view class="ai-tips" v-if="pattern !== 1 && !x.msgLoad && x.type !== 1">· 此内容由AI生成，仅供参考</view>
								</view>
							</view>
							<!-- 推荐科室 -->
							<view class="top2" v-if="x.type == 2 && x.department">
								<view class="top2-content">
									<view class="department">
										<view class="title">推荐科室</view>
										<view class="dept-tips">{{ x.tips }}</view>
										<view class="top2-center" v-for="(clinic, u) in x.department" :key="u">
											<text>{{ clinic.name }}</text>
											<view class="registeredBtn" @click="footType(clinic, 'department')">去挂号</view>
										</view>
									</view>
									<view class="ai-tips" v-if="!x.msgLoad">· 此内容由AI生成，仅供参考</view>
								</view>
							</view>
							<!-- 医生排班 -->
							<view class="doctor" v-if="x.type == 2 && x.scheduling">
								<view class="top2-content">
									<view class="title">医生排班</view>
									<view class="scheduling" v-for="(item, index) in x.scheduling" :key="index" v-show="x.scheduling">
										<view class="name">
											<view class="price">
												<view class="doctName">{{ item.DoctorName }} ({{ item.DoctorSessType }})</view>
												<view class="fee">￥{{ parseFloat(item.Fee).toFixed(2) }}</view>
											</view>
											<view class="ks">{{ item.DepartmentName }}</view>
											<view class="desc">
												剩余号源：
												<text v-for="(sch, i) in item.scheduling" :key="i">
													{{ sch.SessionName }}
													<text class="space"></text>
													{{ sch.AvailableLeftNum }}
													<text v-if="i < item.scheduling.length - 1">
														<text class="space"></text>
														|
														<text class="space"></text>
													</text>
												</text>
											</view>
											<!-- <view class="desc">
												{{ item.DoctorSpec ? formatText(item.DoctorSpec, 35) : '暂无简介信息' }}
											</view> -->
										</view>
										<view class="registeredBtn" @click="footType(item, 'doctor')">去挂号</view>
									</view>
									<view class="noData" v-show="x.scheduling.length == 0">很抱歉，暂无当前科室排班</view>
									<view class="ai-tips" v-if="!x.msgLoad">· 此内容由AI生成，仅供参考</view>
								</view>
							</view>
							<!-- 地图导航 -->
							<!-- <view class="doctor" v-if="x.type == 2 && x.address">
								<view class="top2-content">
									<view class="title">导航</view>
									<view class="noData" v-html="markdown(x.address)"></view>
									<view class="noData"><image v-if="x.image" :src="x.image" /></view>
									<view class="ai-tips" v-if="!x.msgLoad">· 此内容由AI生成，仅供参考</view>
								</view>
							</view> -->
						</view>
					</view>
				</view>
			</scroll-view>
			<!-- 选择症状、疾病 弹窗 -->
			<uni-popup class="Dialog" :mask-click="false" ref="popup" type="bottom" mask-background-color="transparent" :safeArea="false">
				<view class="center">
					<scroll-view class="scroll" scroll-y="true">
						<view class="middle">
							<text v-for="(item, index) in DataList.main" :key="index" @click="clickItem(index)" :class="{ colour: item.bOn }">
								{{ item.value }}
							</text>
						</view>
					</scroll-view>
				</view>
				<view class="foot-choice">
					<view @click="choice(2)">手动输入</view>
					<view @click="choice(1)">确定</view>
				</view>
			</uni-popup>
			<view class="foot">
				<view v-if="voiceState" class="foot-center">
					<view class="image">
						<image @click="voiceState = false" src="@/static/image/keyword.png" mode=""></image>
					</view>
					<view class="btn">
						<button hover-class="is-hover" @touchmove="handleTouchMove" @touchstart="startMic" @touchend="stopMic">按住说话</button>
					</view>
				</view>
				<view v-else class="foot-center">
					<view class="image">
						<image @click="voiceState = true" src="@/static/image/voice.png" mode=""></image>
					</view>
					<view class="input" :class="{ w: msg }">
						<input
							v-if="inputState"
							:class="{ ws: msg }"
							:focus="Focus"
							@blur="onblur"
							type="text"
							cursor-spacing="10"
							v-model="msg"
							style="background-color: #f0f0f0"
							@confirm="sendMsg"
							confirm-type="send"
						/>
					</view>
					<view class="sendMsg" @click="sendMsg" v-if="msg">
						<text>发送</text>
						<image src="../../static/image/Rectangle 346@2x.png" mode=""></image>
					</view>
				</view>
			</view>
		</view>
		<!--------------------- 语音  ------------------- -->
		<view class="flex-column-center" style="position: fixed; bottom: 0px">
			<view class="bottom-dh-char flex-row-around" style="font-size: 55rpx; padding: 60rpx 0 100rpx 0">
				<view class="record-layer">
					<!-- 语音遮罩层 -->
					<view class="voice-mask" v-show="mask" catchtouchmove="true">
						<!-- 语音音阶动画 -->
						<view class="voice-bar" :class="{ voiceDel: needCancel }">
							<view :class="{ volumeDel: needCancel }" class="prompt-layer prompt-layer-1" v-if="longPress == '2'">
								<view class="prompt-loader">
									<view class="em" v-for="(item, index) in 15" :key="index"></view>
								</view>
								<!-- <text class="span">松手结束录音</text> -->
							</view>
							<view class="trangle-bottom" :class="{ trangleDel: needCancel }"></view>
						</view>
						<!-- 底部区域 -->
						<view class="voice-send">
							<!-- 取消和转文字图标 -->
							<view class="voice-middle-wrapper">
								<!-- 取消 -->
								<view class="voice-left-wrapper">
									<view class="cancel-del" :class="{ delTip: needCancel }">松开 取消</view>
									<view class="close" :class="{ bigger: needCancel }">
										<image src="@/static/image/icon-close.png" class="close-icon"></image>
									</view>
								</view>

								<view class="send-tip" :class="{ sendTipNone: needCancel }">松开 转文字</view>
							</view>
							<!-- 底部语音按钮 -->
							<view class="mask-bottom" :class="{ 'mask-bottom-close': needCancel }">
								<image src="@/static/image/v.png"></image>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// rpx和px的比率
var l;
// 可用窗口高度
var wh;
// 顶部空盒子的高度
var mgUpHeight;

import dayjs from 'dayjs';
import bus from '@/utils/bus';
import { mapActions } from 'vuex';
import MarkdownIt from 'markdown-it';
import mixin from '@/mixins/mixin.js';
import login from '@/utils/login.js';
import { parse } from 'best-effort-json-parser';
import { safeParseJSON } from '@/utils/jsonHelper.js';

export default {
	mixins: [mixin],
	data() {
		return {
			siginVal: {},
			tipMsg: 'normal',
			showMsg: false,
			typewriterTimer: null,
			messages: [],
			md: new MarkdownIt({
				html: true,
				breaks: true,
				linkify: true,
			}),
			pattern: 2,
			showComponent: true,
			text: '',
			number: 1,
			msg: '',
			anData: {},
			go: 0,
			scrollTop: 0,
			conversation_id: '',
			mode: '',
			msgList: [
				{
					my: false,
					type: 1,
					msg: '猜您想问：',
					questionList: [
						{ type: '综合', question: ['医院导航', '明天口腔科排班', '门诊就诊流程'] },
						{ type: '查药品', question: ['阿莫西林的作用', '布洛芬缓释片口服剂量', '抗生素可以和酒精一起服用吗'] },
						{ type: '找医生', question: ['头疼挂什么科', '明天消化内科排班', '耳鼻喉科医生今天上班吗'] },
						{ type: '院内导航', question: ['急诊位置', '医院地址交通指南', '神经内科在哪，具体导航'] },
						{ type: '知识问答', question: ['出入院流程', '口腔修复科负责什么', '糖尿病患者，空腹血糖控制在多少算达标'] }
					]
				}
			], //消息集合
			DataList: {}, //底部弹窗
			voiceState: false, //底部切换状态
			reply: [],
			Focus: false, //输入框聚焦
			footState: 1,
			needCancelState: false, //关闭语音
			needCancel: false, //关闭动画
			startX: '', //按住录音时的位置
			startY: '',
			mask: false, //语音状态
			longPress: '1', // 1显示 按住说话 2显示 说话中
			manager: null,
			test1: '',
			test2: '',
			patient: {
				patientName: '',
				sex: '',
				age: ''
			},
			inputState: true,
			secondDepartment: [],
			current: 0,
			tabs: ['综合', '查药品', '找医生', '院内导航', '知识问答'],
			scrollLeft: 0, // 用来控制 scroll-view 的滑动距离
			tabWidth: 180, // 单个 tab 的宽度(px 换算 rpx 自行调整)
			viewWidth: 750, // scroll-view 宽度 rpx
			videoLoaded: false,
			videoUrl: 'https://aiwz.sdtyfy.com:8099/img/ai_img/ai_new.mp4',
		};
	},
	onShow() {
		const options = this.$mp.query;
		if (options && options.patient) {
			this.patient = JSON.parse(decodeURIComponent(options.patient));
		}
	},
	onReady() {
		this.$nextTick(() => {
			if (this.$refs.notice && this.$refs.notice.open) {
				this.$refs.notice.open();
			}
		});
	},
	methods: {
		onVideoReady() {
			this.videoLoaded = true;
		},
		forceShow() {
			this.videoLoaded = true;
		},
		getQuestionsByType(msgItem, type) {
			if (!msgItem.questionList) return [];
			const q = msgItem.questionList.find((q) => q.type === type);
			return q ? q.question : [];
		},
		changeTab(index) {
			this.current = index;
			this.scrollToTab(index);
		},
		onSwiperChange(e) {
			const index = e.detail.current;
			this.current = index;
			this.scrollToTab(index);
		},
		scrollToTab(index) {
			const totalWidth = this.tabs.length * this.tabWidth;
			const halfView = this.viewWidth / 2;

			let target = index * this.tabWidth + this.tabWidth / 2 - halfView;

			// 边界处理
			if (target < 0) target = 0;
			if (target > totalWidth - this.viewWidth) target = totalWidth - this.viewWidth;

			this.scrollLeft = target;
		},

		formatText(str, len) {
			if (!str) return '';
			return str.length > len ? str.slice(0, len) + '...' : str;
		},
		handleConfirm() {
			this.showMsg = true;
		},
		tipsBtn(index) {
			// 使用 this.$set 修改数组中某一项的属性
			this.$set(this.msgList[index], 'tipsState', !this.msgList[index].tipsState);
		},
		markdown(content) {
			const safeContent = typeof content === 'string' ? content : String(content || '');
			return this.md.render(safeContent);
		},

		previewImage(url) {
			uni.previewImage({
				current: url,
				urls: [url]
			})
		},
		
		more() {
			uni.navigateTo({
				url: `/sub_packages/subscribe/departments`
			});
		},
		// 登录成功后重新渲染foot
		updateData() {
			this.showComponent = false;
			this.$nextTick(() => {
				this.showComponent = true;
			});
		},
		onblur() {
			this.Focus = false;
		},
		footType(item, type) {
			let name = '',
				id = '';
			let date = item.ServiceDate ? item.ServiceDate : dayjs().format('YYYY-MM-DD');
			let today = date == dayjs().format('YYYY-MM-DD') ? true : false;
			let week = this.getWeekday(date);
			let timeObj = {};
			let url = '';
			if (type == 'doctor') {
				name = item.DepartmentName;
				id = item.specialtyGroupId;
				timeObj = {
					date,
					week
				};
				url = `/sub_packages/subscribe/doctors?title=${name}&CLGRPRowId=${id}&timeObj=${JSON.stringify(timeObj)}&thatDay=${today}`;
			} else {
				name = item.name;
				id = item.id;
				url = `/sub_packages/subscribe/doctors?title=${name}&CLGRPRowId=${id}`;
			}
			uni.navigateTo({ url });
		},
		getWeekday(date) {
			const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
			return weekMap[dayjs(date).day()];
		},
		// 保持消息体可见
		msgGo(i) {
			const query = uni.createSelectorQuery().in(this);
			// 延时保证是最新的高度
			setTimeout(
				() => {
					// 获取消息体高度
					query
						.select('#okk')
						.boundingClientRect((data) => {
							// 如果超过scorll高度就滚动scorll
							if (data.height - wh > -240) {
								this.go = data.height - wh + 300;
								this.$nextTick(function () {
									this.scrollTop = this.go;
								});
							}
							// 保证键盘第一次拉起时消息体能保持可见
							var moveY = wh - data.height + 600;
							// 超出页面则缩回空盒子
							if (moveY - mgUpHeight < 0) {
								// 小于0则视为0
								moveY < 0 ? this.msgMove(0, 0) : this.msgMove(moveY, 0);
							}
						})
						.exec();
				},
				i ? 0 : 100
			);
		},
		msgMove(x, t) {
			var animation = uni.createAnimation({
				duration: t,
				timingFunction: 'ease'
			});
			this.animation = animation;
			animation.height(x).step();
			this.anData = animation.export();
		},
		// 回答问题
		answer(msg) {
			if (this.siginVal) {
				this.msg = msg;
				this.sendMsg();
			} else {
				login.loginData().catch((error) => {});
			}
		},
		sendMsg() {
			// 消息为空不做任何操作
			if (this.msg == '') {
				return 0;
			}
			// 显示消息 msg消息文本,my鉴别是谁发的消息(不能用俩个消息数组循环,否则消息不会穿插)
			this.msgList.push({ msg: this.msg, my: true });
			// 保证消息可见
			this.msgGo();
			//发送消息
			if (this.siginVal) {
				this.msgKf(this.msg);
			} else {
				login.loginData().catch((error) => {});
			}
			// 清除消息
			this.msg = '';
		},

		msgKf(msg) {
			if (JSON.stringify(this.siginVal) == '{}') {
				uni.navigateTo({ url: '/sub_packages/login/index?title=山东第一医科大学第二附属医院' });
			} else {
				this.msgList.push({ msgLoad: true });
				this.inputState = false;
				const requestTask = wx.request({
					url: 'https://www.chinzsoft.com/api/v1/chat-messages', // 流式接口的URL
					method: 'POST',
					data: {
						query: msg,
						inputs: {
							sex: this.siginVal.sex,
							age: this.calculateAge(this.siginVal.idNum),
							patient_id: this.siginVal.patientUniquelyIdentifies
						},
						response_mode: 'streaming',
						conversation_id: this.conversation_id,
						user: this.siginVal.patientName
					},
					enableChunked: true,
					header: {
						Authorization: `Bearer app-npuPoa4gDRhUohTtu74UaLUp`, //app-JNpgkClVaG84M8HzwNoHwm0R`,
						'content-type': 'application/json'
					},
					success: (res) => {
						if (this.pattern === 1) {
							this.test1 = '';
							if (!this.test2.is_complete) {
								this.mode = this.test2.mode;
								if (this.test2.option.length) {
									this.DataList.main = this.test2.option.map((item) => {
										return { value: item };
									});
									this.$refs.popup.open('bottom'); //弹框
								}
							} else {
								this.conversation_id = '';
							}
						} else {
							this.test1 = '';
						}
						this.msgGo();
						this.inputState = true;
					},
					fail: (err) => {
						console.log('err', err);
						this.inputState = true;
					}
				});
				let buffer = '';
				let partialAnswer = '';
				let lastAnswer = '';
				let messageStarted = false;

				requestTask.onChunkReceived((res) => {
					try {
						const responseText = this.arrayBufferToString(res.data);
						buffer += responseText;
						let lines = buffer.split('\n');
						buffer = lines.pop();

						for (const line of lines) {
							if (!line.startsWith('data:')) continue;
							const jsonStr = line.replace(/^data:\s*/, '').trim();
							if (!jsonStr) continue;

							// 流式结束信号
							if (jsonStr === '[DONE]' || jsonStr.includes('message_end')) {
								messageStarted = false;
								lastAnswer = '';
								partialAnswer = '';
								break;
							}

							const obj = safeParseJSON(jsonStr);
							if (!obj) continue;

							// 错误处理
							if (obj.event === 'error') {
								this.msgList.splice(this.msgList.length - 1, 1, {
									my: false,
									msgLoad: false,
									msg: '很抱歉，您的问题暂时没查询到，我还在努力学习中...'
								});
								continue;
							}

							this.conversation_id = obj.conversation_id || this.conversation_id;

							const answer = obj.answer || obj.data?.outputs?.answer;
							if (!answer) continue;
							const jsonData = safeParseJSON(answer);
							if (!jsonData || !jsonData.intent || jsonData.content == null) continue;
							const type = jsonData.intent;
							const content = jsonData.content;

							if (type === 'A001') {
								const originalTipsState = this.msgList[this.msgList.length - 1]?.tipsState;
								this.msgList.splice(this.msgList.length - 1, 1, {
									my: false,
									type: 2,
									msgLoad: false,
									department: content.option,
									tips: content.reason,
									tipsState: originalTipsState
								});
							} else if (type === 'A002' && content.code != 500) {
								this.msgList.splice(this.msgList.length - 1, 1, {
									my: false,
									type: 2,
									msgLoad: false,
									scheduling: this.mergeDoctorSessions(content)
								});
							} else if (type === 'A002' && content.code == 500) {
								this.msgList.splice(this.msgList.length - 1, 1, {
									my: false,
									msgLoad: false,
									msg: content.msg
								});
							} else {
								//['A004', 'A005', 'A006', 'A999', 'A998']
								const safeContent = typeof content === 'string' ? content : String(content || '');
								if (typeof lastAnswer !== 'string') lastAnswer = String(lastAnswer || '');

								const newPart = safeContent.slice(lastAnswer.length);
								if (typeof newPart !== 'string' || !newPart.trim()) return;

								lastAnswer = safeContent;
								const lastMsg = this.msgList[this.msgList.length - 1];
								console.log(newPart,'=w=w=w=w=w=w==w=w=ww');
								if (lastMsg && lastMsg.msgLoad) {
									lastMsg.msgLoad = false;
									this.showTypewriterEffect(newPart, lastMsg);
								} else if (lastMsg && !lastMsg.msgLoad) {
									this.showTypewriterEffect(newPart, lastMsg);
								} else {
									const msgObj = { my: false, msgLoad: false, msg: '' };
									this.msgList.push(msgObj);
									this.showTypewriterEffect(newPart, msgObj);
								}
								this.$forceUpdate();
							}
							// else if (type === 'A003') {
							// 	// let images = [...content.matchAll(/!\[.*?\]\((.*?)\)/g)].map((m) => m[1]);
							// 	// images = images != '' ? 'https://www.chinzsoft.com/api' + images : '';
							// 	// let text = content.replace(/!\[.*?\]\(.*?\)/g, '').trim();
							// 	this.msgList.splice(this.msgList.length - 1, 1, {
							// 		my: false,
							// 		type: 2,
							// 		msgLoad: false,
							// 		address: content,
							// 		// image: images
							// 	});
							// }
						}
					} catch (e) {
						console.error('解析流式返回数据异常:', e);
					}
				});
			}
		},

		//弹窗事件
		choice(index) {
			let reply = this.reply.join(',');
			if (index == 1) {
				if (!reply) {
					uni.showToast({
						title: `您还未选择内容`,
						icon: 'none'
					});
					return;
				}
				this.answer(reply);
			} else if (index == 2) {
				this.Focus = true;
			}
			this.$refs.popup.close();
			this.reply = [];
			this.msgGo();
		},
		//弹窗多选
		clickItem(index) {
			if (this.mode) {
				// 多选
				const temp = this.DataList.main[index];
				temp.bOn = !this.DataList.main[index].bOn;
				this.$set(this.DataList.main, index, temp);
				if (this.reply.indexOf(temp.value) !== -1) {
					this.reply.splice(this.reply.indexOf(temp.value), 1);
				} else {
					this.$set(this.reply, this.reply.length, temp.value);
				}
			} else {
				// 单选
				this.DataList.main.forEach((item, i) => {
					item.bOn = false;
					this.$set(this.DataList.main, i, item);
				});
				const temp = this.DataList.main[index];
				temp.bOn = true;
				this.$set(this.DataList.main, index, temp);
				this.reply = [temp.value];
			}
		},
		// 监听语音
		setManagerLisener() {
			this.manager.onRecognize = (res) => {
				this.msg += res.result;
			};
			this.manager.onStop = (res) => {
				if (this.needCancelState == true) {
					this.needCancelState = false;
					return;
				}
				if (res.result == '') {
					uni.showToast({
						title: '未检测到声音，请重试',
						icon: 'none'
					});
				} else {
					this.msg = res.result.replace('.', '').replace('，', '').replace('。', '').replace('！', '').replace('？', '');
					this.voiceState = false;
				}
			};
			this.manager.onError = (res) => {
				console.error('error msg', res.retcode, res.msg);
			};
		},
		startMic(e) {
			this.manager.start({
				duration: 30 * 1000,
				lang: 'zh_CN'
			});
			this.longPress = '2';
			this.mask = true;
			this.startX = e.touches[0].pageX;
			this.startY = e.touches[0].pageY;
		},
		stopMic() {
			this.msgGo(true);
			if (this.needCancel == true) {
				//取消语音发送 因为取消时微信和动画有延迟  所以 在这里直接关闭动画   新增加一个变量去关闭语音
				this.needCancel = false;
				this.needCancelState = true;
			}
			this.manager.stop();
			this.longPress = '1';
			this.mask = false;
		},
		// 语音录制时滑动事件
		handleTouchMove(e) {
			if (this.startX - e.touches[0].pageX > 14 && this.startY - e.touches[0].pageY > 50) {
				this.needCancel = true;
			} else {
				this.needCancel = false;
			}
		}
	},
	mounted() {
		let loginValue = uni.getStorageSync('loginData');
		let data = loginValue ? JSON.parse(loginValue) : {};
		this.siginVal = data ? data.defaultArchives : {};
		uni.onKeyboardHeightChange((res) => {
			const query = uni.createSelectorQuery().in(this);
			query
				.select('#okk')
				.boundingClientRect((data) => {
					var up = res.height * 2 - data.height - l * 200; //110
					if (up > 0) {
						this.msgMove(up, 100);
					}
					// 收回
					if (res.height == 0) {
						this.msgMove(0, 0);
					}
				})
				.exec();
		});
		var query = uni.getSystemInfoSync();
		l = query.screenWidth / 750;
		wh = query.windowHeight;

		// 同声传译
		var plugin = requirePlugin('WechatSI');
		this.manager = plugin.getRecordRecognitionManager();
		this.setManagerLisener();
		this.msgGo();
		const videoCtx = uni.createVideoContext('myVideo', this);
		if (!this.played) {
			videoCtx.play();
		}
	}
};
</script>

<style lang="less" scoped>
.tabs-scroll {
	white-space: nowrap;
}
.swiper-body {
	height: 300rpx;
}
.tab-list {
	display: flex;
}
.tab-item {
	position: relative;
	font-size: 32rpx;
	color: #666;
	padding: 24rpx 18rpx 18rpx;
}

.tab-item:nth-child(1) {
	padding-left: 0;
}

.tab-item.active {
	color: #007aff;
	font-weight: bold;
}

// .active-bottom {
//   width: 30px;       /* 波浪线长度 */
// 	height: 3px;       /* 波浪线高度 */
// 	background: #007aff;
// 	border-top-left-radius: 50% 100%;
// 	border-top-right-radius: 50% 100%;
// 	border-bottom-left-radius: 50% 100%;
// 	border-bottom-right-radius: 50% 100%;
// 	transform: rotate(-20deg); /* 旋转调整弧度方向 */
// }

.active-bottom {
	display: flex;
	justify-content: center;
	image {
		width: 56rpx;
		height: 12rpx;
	}
}

.virtual {
	height: 100%;
	position: relative;
	// background: linear-gradient(333deg, #9bc9ff 0%, #c9e2ff 41%, #deedff 100%);
	// background: linear-gradient(180deg,#deedff, #c4dcf5 50%, #9bc9ff 100%);
	background: linear-gradient(180deg, #c5ddf8, #cfe2fa 50%, #9bc9ff 100%);
	display: flex;
	flex-direction: column;

	.background {
		position: absolute;
		width: 786rpx;
		height: 560rpx;
	}
	.video-wrap {
		top: -16%;
		width: 100vw;
		height: 560rpx;
		overflow: hidden;
		position: absolute;
	}

	.background-video {
		width: 100%;
		height: 560rpx;
		object-fit: cover;
	}

	/* 底部覆盖黑线 */
	.video-bottom-cover {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 3px; /* 调整覆盖黑线高度 */
		background-color: #c9e0f7;
	}
	// .background-video {
	// 	top: -1%;
	// 	width: 100%;
	// 	height: 560rpx;
	// 	position: absolute;
	// 	object-fit: cover;
	// 	transition: opacity .3s;
	// }

	.head {
		position: absolute;
		top: 115rpx;
		left: 32rpx;
		height: 50rpx;
		font-size: 36rpx;
		text-align: left;
		color: #000;
	}

	.aiTitle {
		width: 64%;
		top: 3%;
		left: 5%;
		position: absolute;
	}
	.aiName {
		color: #4286ff;
		font-size: 34rpx;
		font-weight: bold;
		font-style: italic;
		margin-bottom: 15rpx;
	}

	.aiTip {
		color: #798eb3;
		font-size: 30rpx;
		font-weight: bold;
	}

	.center {
		z-index: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		.scroll-Y {
			margin-top: 185rpx;
			width: 750rpx;
			flex: auto;
			overflow: auto;

			.padd {
				padding-bottom: 180rpx !important;
			}
			.msgList {
				font-size: 37rpx;
				color: #000;
				&:nth-of-type(1) {
					padding-bottom: 0 !important;
				}
				.my {
					width: 100%;
					display: flex;
					justify-content: flex-end;
					align-items: flex-start;

					.my-box {
						display: flex;
						justify-content: flex-end;
						align-items: center;
						width: 630rpx;
						margin: 20rpx 25rpx 20rpx 0;

						.center {
							color: #ffffff;
							background: linear-gradient(224deg, #5fa8ff 0%, #4286ff 100%);
							padding: 20rpx 24rpx;
							border-radius: 40rpx;
							border-top-right-radius: 0;

							.msg {
								font-size: 32rpx;
								text-align: left;
								line-height: 37rpx;
							}
						}
					}
				}

				.robot {
					width: 100%;
					display: flex;
					justify-content: flex-start;
					align-items: flex-start;

					.robot-box {
						width: 97%;
						display: flex;
						justify-content: flex-start;
						align-items: center;
						margin: 20rpx 24rpx;

						.center {
							width: 100%;
							color: #333333;
							font-size: 34rpx;
							padding: 20rpx 24rpx;
							border-radius: 40rpx;
							border-top-left-radius: 0;
							background: rgba(255, 255, 255, 0.8);

							.msg {
								text-align: left;
								// margin-bottom: 20rpx;
							}

							.top1 {
								// margin-top: 30rpx;
								text-align: left;
								color: #02134e;
								display: flex;
								flex-wrap: wrap;
								.answer {
									width: 100%;
									.tipContent {
										display: flex;
										padding: 20rpx 25rpx 20rpx 20rpx;
										font-size: 32rpx;
										color: #02134e;
										background: #fff;
										border-radius: 50rpx;
										margin-bottom: 20rpx;
										align-items: center;
										justify-content: space-between;
										/* 半透明白色 + 毛玻璃效果 */
										background: rgba(255, 255, 255, 0.6);
										backdrop-filter: blur(10px);
										-webkit-backdrop-filter: blur(10px);
										/* 阴影和边框，提升立体感 */
										box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
										border: 1rpx solid rgba(255, 255, 255, 0.4);
										image {
											width: 42rpx;
											height: 17rpx;
										}
									}
								}
							}

							.ai-tips {
								margin-top: 20rpx;
								text-align: left;
								font-size: 26rpx;
								color: #919191;
							}
						}
					}

					.top2 {
						width: 93%;
						display: flex;
						justify-content: flex-start;
						align-items: center;
						position: relative;
						padding-bottom: 20rpx;
						border-radius: 40rpx;
						border-top-left-radius: 0;
						margin: 20rpx 0 20rpx 25rpx;
						background: rgba(255, 255, 255, 0.8);

						> image {
							position: absolute;
							width: 560rpx;
							height: 380rpx;
						}

						.top2-content {
							position: relative;
							.department {
								width: 100%;
								color: #000000;

								.title {
									display: flex;
									align-items: center;
									height: 30%;
									font-weight: 600;
									font-size: 34rpx;
									background: #e3edff;
									border-radius: 0 40rpx 0 0;
									padding: 15rpx 0 15rpx 15rpx;
								}

								.top2-center {
									// width: 100%;
									margin: 0 20rpx;
									height: 70%;
									display: flex;
									justify-content: space-between;
									align-items: center;
									font-size: 38rpx;
									overflow: hidden;
									padding: 20rpx 0;
									border-bottom: 1px solid #c9e2ff;
									.img {
										transform: translate(16rpx, 0);
										width: 52rpx;
										height: 52rpx;

										> image {
											display: block;
											width: 52rpx;
											height: 52rpx;
										}
									}

									text {
										font-size: 32rpx;
										text-align: left;
										display: block;
										width: 220px;
										margin-left: 20rpx;
									}

									.top2-btn {
										transform: translate(-16rpx, 0);
										color: #ffffff;
										width: 120rpx;
										height: 53rpx;
										background: linear-gradient(3deg, #489dff 0%, #50bfff 100%);
										border-radius: 8rpx;
										font-size: 30rpx;
										display: flex;
										align-items: center;
										justify-content: space-evenly;

										.top2-img {
											width: 22rpx;
											height: 22rpx;

											> image {
												display: block;
												width: 22rpx;
												height: 22rpx;
											}
										}

										.text {
											line-height: 30rpx;
										}
									}
								}
							}

							.more {
								// width: 100%;
								color: #02134e;
								margin: 0 20rpx;
								display: flex;
								align-items: center;
								justify-content: space-between;

								> text {
									border-bottom: 2rpx solid #02134e;
								}

								> image {
									width: 45rpx;
									height: 45rpx;
								}
							}

							.dept-tips {
								margin: 20rpx 20rpx 10rpx 20rpx;
								font-size: 28rpx;
								color: #666;
							}
						}

						.ai-tips {
							margin-top: 20rpx;
							text-align: left;
							font-size: 26rpx;
							color: #919191;
							margin-left: 20rpx;
						}
					}

					.doctor {
						width: 93%;
						display: flex;
						justify-content: flex-start;
						align-items: center;
						margin: 20rpx 24rpx;
						position: relative;
						padding-bottom: 20rpx;
						background: rgba(255, 255, 255, 0.8);
						border-radius: 40rpx;

						.top2-content {
							width: 100%;
							position: relative;

							.title {
								color: #000;
								font-weight: bold;
								font-size: 36rpx;
								padding: 15rpx 20rpx;
								background: #e3edff;
								border-radius: 0 40rpx 0 0;
							}

							.noData {
								font-size: 32rpx;
								padding: 15rpx 20rpx;
								color: #666;
							}

							.scheduling {
								flex: 1;
								gap: 10rpx;
								display: flex;
								margin: 25rpx 15rpx;
								padding: 10rpx 0 10rpx 15rpx;
								background: #e3edff;
								justify-content: space-between;
								align-items: center;
								border-radius: 20rpx;

								.name {
									flex: 1;
									gap: 10rpx;
									display: flex;
									font-size: 30rpx;
									flex-direction: column;
									padding-top: 15rpx;

									.price {
										display: flex;
										gap: 15%;
										.doctName {
											font-size: 32rpx;
										}
										.fee {
											font-size: 34rpx;
											color: #4286ff;
										}
									}
									.ks {
										color: #666;
										font-size: 30rpx;
									}
									.desc {
										color: #666;
										font-size: 28rpx;
										.space {
											display: inline-block;
											width: 20rpx; /* 调整想要的间距 */
										}
									}
								}
							}
						}

						.ai-tips {
							margin-top: 20rpx;
							text-align: left;
							font-size: 26rpx;
							color: #919191;
							margin-left: 25rpx;
						}
					}
				}
			}
		}

		.registeredBtn {
			transform: translate(-16rpx, 0);
			color: #ffffff;
			padding: 10rpx 22rpx;
			margin-left: 18rpx;
			background: #4286ff;
			border-radius: 30rpx;
			font-size: 30rpx;
			display: flex;
			align-items: center;
			justify-content: space-evenly;
		}
		/* 选择症状、疾病 弹窗 */
		.Dialog {
			width: 750rpx;
			.center {
				width: 750rpx;
				background-color: #ffffff;
				border-radius: 30rpx 30rpx 0 0;
				height: 250rpx;
				overflow: hidden;
				.scroll {
					height: 100%;
					.middle {
						margin: 30rpx 20rpx 0 20rpx;
						display: flex;
						flex-wrap: wrap;
						text {
							border-radius: 4px;
							flex-grow: 1;
							display: flex;
							justify-content: center;
							align-items: center;
							padding: 12rpx 30rpx;
							margin: 16rpx;
							color: #004eae;
							font-size: 38rpx;
							background: rgba(7, 106, 255, 0.04);
							border: 2rpx solid #479cff;
							border-radius: 40rpx;
						}
						.colour {
							background: #479cff !important;
							color: #ffffff;
						}
					}
				}
			}
			.foot-choice {
				background-color: #ffffff;
				// height: 120rpx;
				padding: 10rpx 0 45rpx 0;
				font-size: 40rpx;
				display: flex;
				margin: 0;
				align-items: center;
				border-top: 2rpx solid #dddddd;
				position: relative;
				view {
					color: #0085ff;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 40rpx;
					width: 50%;
					height: 80rpx;
					border: none;
					&:nth-of-type(1) {
						color: #797979;
						border-right: 2rpx solid #e7e7e7;
					}
				}
			}
		}
		.foot {
			width: 750rpx;
			padding: 30rpx 0 15rpx;
			background: rgba(255, 255, 255, 0.6);
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);

			.foot-bar {
				margin-left: 12rpx;
				width: 726rpx;
				display: flex;
				margin: 20rpx 12rpx;

				> view {
					width: 150rpx;
					height: 60rpx;
					background: rgba(255, 255, 255, 0.9);
					border-radius: 8rpx;
					line-height: 28rpx;
					margin-right: 24rpx;
					color: #000000;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 30rpx;
				}

				.blue {
					color: #ffffff;
					background: #9a7546;
				}
			}

			.foot-center {
				margin-left: 12rpx;
				width: 726rpx;
				height: 115rpx;
				background: rgba(255, 255, 255, 0.9);
				border-radius: 8rpx;
				display: flex;
				align-items: center;
				justify-content: space-evenly;

				.image {
					width: 63rpx;
					height: 63rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					background: #ffffff;
					border: 2rpx solid transparent;
					background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(108deg, #499eff 0%, #7b5afd 100%);
					border-radius: 40rpx;
					background-origin: border-box;
					background-clip: content-box, border-box;

					image {
						width: 45rpx;
						height: 45rpx;
					}
				}

				.sendMsg {
					width: 104rpx;
					height: 56rpx;
					position: relative;
					display: flex;
					justify-content: center;
					align-items: center;

					text {
						position: absolute;
					}

					image {
						width: 104rpx;
						height: 56rpx;
					}
				}

				.btn {
					button {
						width: 580rpx;
						height: 71rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						background: linear-gradient(336deg, #479cff 10%, rgba(71, 216, 251, 0.8) 100%);
						border-radius: 8rpx;
						font-size: 36rpx;
						color: #ffffff;
					}

					.is-hover {
						background: #7ebdff;
					}
				}

				.w {
					width: 520rpx !important;
				}

				.input {
					width: 580rpx;
					height: 71rpx;
					border: 2rpx solid transparent;
					border-radius: 8rpx;
					background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(101deg, #49a1ff 0%, #55bbfd 100%);
					background-origin: border-box;
					background-clip: content-box, border-box;

					input {
						width: 550rpx;
						height: 71rpx;
						background-color: transparent !important;
						font-size: 34rpx;
						line-height: 34rpx;
						margin: 0 15rpx;
					}

					.ws {
						width: 490rpx !important;
					}
				}
			}
		}
	}
	/*---------------------------------- 语音样式 ------------------------------ */
	.voice-mask {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.8);
	}
	.voice-bar {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -80%);
		/* width: 230rpx; */
		height: 150rpx;
		background-color: #51ff50;
		border-radius: 26rpx;
		margin-bottom: 220rpx;
	}
	.voiceDel {
		left: 80rpx;
		top: 50%;
		width: 170rpx !important;
		transform: translateX(0%);
		transform: translateY(-80%);
		background-color: red;
	}

	.trangle-bottom {
		position: absolute;
		bottom: -38rpx;
		left: 50%;
		transform: translateX(-50%);
		border-width: 20rpx;
		border-style: solid;
		border-color: #95ea6c transparent transparent transparent;
	}
	.trangleDel {
		border-color: red transparent transparent transparent;
	}
	.voice-send {
		position: absolute;
		bottom: 0;
		width: 100%;
	}
	.voice-middle-wrapper {
		width: 100%;
		display: flex;
		position: relative;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 40rpx;
	}
	.voice-left-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;
	}
	.cancel-del {
		display: none;
	}
	.delTip {
		display: block;
		color: #bfbfbf;
		margin: 0 -30rpx 18rpx 46rpx;
	}

	.close {
		font-size: 100rpx;
		position: relative !important;
		width: 140rpx;
		height: 140rpx;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.2);
		transform: rotate(350deg);
		margin: 0 0 30rpx 80rpx;
		border-radius: 50%;
		line-height: 1; /* 设置行高为1 */
	}
	.close-icon {
		width: 80rpx;
		height: 80rpx;
	}
	.bigger {
		width: 150rpx;
		height: 150rpx;
		/* display: flex;
				align-items: center;
				justify-content: center; */
		background: #f9f9f9;
		font-size: 120rpx;
		color: #333;
	}

	.send-tip {
		position: absolute;
		left: 50%;
		bottom: 0rpx;
		transform: translate(-50%, 36%);
		color: #bfbfbf;
	}
	.sendTipNone {
		display: none;
	}
	.mask-bottom {
		position: relative;
		width: 100%;
		height: 300rpx;
		border-top: #bababb 8rpx solid;
		border-radius: 50% 50% 0 0;
		background-image: linear-gradient(#949794, #e1e3e1);
	}
	.mask-bottom-close {
		background: rgba(0, 0, 0, 0.2) !important;
		border-top: rgba(0, 0, 0, 0.2) 8rpx solid;
	}
	.mask-bottom image {
		position: absolute;
		width: 60rpx;
		height: 60rpx;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		margin: auto;
	}

	/* 提示小弹窗 */
	.prompt-layer {
		border-radius: 8px;
		background: #95ea6c;
		padding: 53rpx 20rpx;
		box-sizing: border-box;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.prompt-layer-1 {
		font-size: 36rpx;
		width: 280rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.volumeDel {
		background: #ff0000;
		width: 240rpx;
	}
	.prompt-layer-1 .p {
		color: #000000;
	}
	.prompt-layer-1 .span {
		color: rgba(0, 0, 0, 0.6);
	}
	.prompt-loader .em {
	}
	/* 语音音阶------------- */
	.prompt-loader {
		width: 96px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}
	.prompt-loader .em {
		display: block;
		background: #333333;
		width: 1px;
		height: 10%;
		margin-right: 2.5px;
		float: left;
	}
	.prompt-loader .em:last-child {
		margin-right: 0px;
	}
	.prompt-loader .em:nth-child(1) {
		animation: load 2s 1.4s infinite linear;
	}
	.prompt-loader .em:nth-child(2) {
		animation: load 2s 1.2s infinite linear;
	}
	.prompt-loader .em:nth-child(3) {
		animation: load 2s 1s infinite linear;
	}
	.prompt-loader .em:nth-child(4) {
		animation: load 2s 0.8s infinite linear;
	}
	.prompt-loader .em:nth-child(5) {
		animation: load 2s 0.6s infinite linear;
	}
	.prompt-loader .em:nth-child(6) {
		animation: load 2s 0.4s infinite linear;
	}
	.prompt-loader .em:nth-child(7) {
		animation: load 2s 0.2s infinite linear;
	}
	.prompt-loader .em:nth-child(8) {
		animation: load 2s 0s infinite linear;
	}
	.prompt-loader .em:nth-child(9) {
		animation: load 2s 0.2s infinite linear;
	}
	.prompt-loader .em:nth-child(10) {
		animation: load 2s 0.4s infinite linear;
	}
	.prompt-loader .em:nth-child(11) {
		animation: load 2s 0.6s infinite linear;
	}
	.prompt-loader .em:nth-child(12) {
		animation: load 2s 0.8s infinite linear;
	}
	.prompt-loader .em:nth-child(13) {
		animation: load 2s 1s infinite linear;
	}
	.prompt-loader .em:nth-child(14) {
		animation: load 2s 1.2s infinite linear;
	}
	.prompt-loader .em:nth-child(15) {
		animation: load 2s 1.4s infinite linear;
	}
	@keyframes load {
		0% {
			height: 20%;
		}
		50% {
			height: 100%;
		}
		100% {
			height: 20%;
		}
	}

	/*---------------------------------- 语音样式结束------------------------------ */

	.loading {
		display: flex;
		align-items: center;
		color: #888;
		.dot {
			width: 45rpx;
			.stage {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 12rpx 0 0 0;
				overflow: hidden;
				transform: translate(0, 8rpx);
				.dot-typing {
					position: relative;
					left: -9995px;
					width: 3px;
					height: 3px;
					border-radius: 3px;
					background-color: #888;
					color: #888;
					box-shadow: 9988px 0 0 0 #888, 9994px 0 0 0 #888, 10000px 0 0 0 #888;
					animation: dotTyping 1.5s infinite linear;
				}
				@keyframes dotTyping {
					0% {
						box-shadow: 9988px 0 0 0 #888, 9994px 0 0 0 #888, 10000px 0 0 0 #888;
					}
					16.667% {
						box-shadow: 9988px -3px 0 0 #888, 9994px 0 0 0 #888, 10000px 0 0 0 #888;
					}
					33.333% {
						box-shadow: 9988px 0 0 0 #888, 9994px 0 0 0 #888, 10000px 0 0 0 #888;
					}
					50% {
						box-shadow: 9988px 0 0 0 #888, 9994px -3px 0 0 #888, 10000px 0 0 0 #888;
					}
					66.667% {
						box-shadow: 9988px 0 0 0 #888, 9994px 0 0 0 #888, 10000px 0 0 0 #888;
					}
					83.333% {
						box-shadow: 9988px 0 0 0 #888, 9994px 0 0 0 #888, 10000px -3px 0 0 #888;
					}
					100% {
						box-shadow: 9988px 0 0 0 #888, 9994px 0 0 0 #888, 10000px 0 0 0 #888;
					}
				}
			}
		}
	}
}
</style>
