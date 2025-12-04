<template>
	<view class="virtual">
		<view class="head">山东第一医科大学第二附属医院</view>
		<view class="center">
			<scroll-view scroll-y="true" :scroll-top="scrollTop" class="scroll-Y" scroll-with-animation>
				<view id="okk" style="padding-bottom: 52rpx;">
					<view class="msgList">
						<view class="my">
							<view class="my-box">
								<view class="center">
									<text class="msg">{{ question }}</text>
								</view>
							</view>
						</view>
						
						<view class="robot">
							<view class="robot-box" v-if="aiType == 'message'">
								<view class="center" style="opacity: 0.95">
									<view class="msg" v-html="markdown(answer)"></view>
									<view class="ai-tips">
										<view>· 此内容由AI生成，仅供参考</view>
										<view class="aiBtn">
											<uni-icons custom-prefix="iconfont" type="icon-copycopy" size="24" color="#9DACC6" @click="copyContent(answer)"></uni-icons>
										</view>
									</view>
								</view>
							</view>
							
							<view class="top2" v-if="aiType == 'department'">
								<view class="top2-content">
									<view class="department">
										<view class="title">推荐科室</view>
										<view class="dept-tips">{{ x.tips }}</view>
										<view class="top2-center" v-for="(clinic, u) in list" :key="u">
											<text>{{ clinic.name }}</text>
										</view>
									</view>
									<view class="ai-tips" style="padding: 0 25rpx;">
										<view>· 此内容由AI生成，仅供参考</view>
									</view>
								</view>
							</view>
							
							<view class="doctor" v-if="aiType == 'doctor'">
								<view class="top2-content">
									<view class="title">医生排班</view>
									<view class="scheduling" v-for="(item, index) in list" :key="index" v-show="list">
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
										</view>
									</view>
									<view class="noData" v-show="list.length == 0">很抱歉，暂无当前科室排班</view>
									<view class="ai-tips" style="padding: 0 25rpx;">
										<view>· 此内容由AI生成，仅供参考</view>
									</view>
								</view>
							</view>
							
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import MarkdownIt from 'markdown-it';

export default {
	data() {
		return {
			answer: '',
			question: '',
			patientName: '',
			aiType: '',
			list: [],
			md: new MarkdownIt({
				html: true,
				breaks: true,
				linkify: true,
			}),
			videoLoaded: false,
			videoUrl: 'https://aiwz.sdtyfy.com:8099/img/ai_img/ai_new.mp4',
		};
	},
	
	onLoad(query) {
		if (query.content) {
			const parsed = JSON.parse(decodeURIComponent(query.content))
			this.answer = parsed.answer
			this.question = parsed.question
			this.patientName = parsed.patientName
			this.aiType = parsed.aiType
			this.list = parsed.list
		}
	},
	
	methods: {
		onVideoReady() {
			this.videoLoaded = true;
		},
		forceShow() {
			this.videoLoaded = true;
		},
		markdown(str) {
			return this.md.render(str);
		},
		
		copyContent(content) {
		  let html = content;
			const imgRegex = /<img.*?src=['"](.*?)['"]/g;
		
			let imgs = [];
			let match;
			while ((match = imgRegex.exec(html)) !== null) {
				imgs.push(match[1]);
			}
		
			let text = html.replace(/<[^>]+>/g, '').trim();
		
			if (imgs.length > 0) {
				text += '\n\n【图片链接】\n' + imgs.join('\n');
			}
		
			text += '\n\n此内容由AI生成，仅供参考';
		
			uni.setClipboardData({
				data: text,
				success() {
					uni.showToast({ title: '文本复制成功，图片请保存到相册', icon: 'none' });
				}
			});
		},
	}
		
};
</script>

<style lang="scss">
	.ai-tips {
		display: flex;
		margin-top: 20rpx;
		text-align: left;
		font-size: 26rpx;
		color: #919191;
		flex-direction: column;
		.aiTitle {
			padding-bottom: 25rpx;
		}
		.aiBtn {
			gap: 32rpx;
			display: flex;
			align-items: center;
			border-top: 1px solid #ccc;
			padding-top: 25rpx;
			margin-top: 25rpx;
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
	
		.head {
			position: absolute;
			top: 115rpx;
			left: 32rpx;
			height: 50rpx;
			font-size: 36rpx;
			text-align: left;
			color: #000;
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
				.msgList{
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
						}
				
					}
				}
			}
		}
	}
	
	
</style>
