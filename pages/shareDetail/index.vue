<template>
	<view class="virtual">
		<view class="head">山东第一医科大学第二附属医院</view>
		<view class="center">
			<scroll-view scroll-y="true" :scroll-top="scrollTop" class="scroll-Y" scroll-with-animation>
				<view id="okk" style="padding-bottom: 52rpx">
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
									<!-- <view class="msg" v-html="markdown(answer)"></view> -->
									<mp-html
									  class="msg"
										:preview-img="true"
									  :content="markdown(answer)"
										show-menu-by-longpress="true"
									  @tap="onMessageClick(x, $event)"
									></mp-html>
									<view class="ai-tips">
										<view>· 此内容由AI生成，仅供参考</view>
										<view class="aiBtn">
											<uni-icons type="hand-up" size="24" @click="likeBtn()" color="#3c466c"></uni-icons>
											<uni-icons type="hand-down" size="24" @click="likeBtn()" color="#3c466c"></uni-icons>
											<button open-type="share" class="share-btn">
												<uni-icons type="redo" size="24" color="#3c466c"></uni-icons>
											</button>
											<uni-icons custom-prefix="iconfont" type="icon-copycopy" size="24" color="#3c466c" @click="copyContent(answer)"></uni-icons>
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
									<view class="ai-tips" style="padding: 0 25rpx">
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
									<view class="ai-tips" style="padding: 0 25rpx">
										<view>· 此内容由AI生成，仅供参考</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<!-- 自定义底部导航栏 -->
			<view class="custom-tabbar">
				<view class="tab-item" @click="goPage('/pages/home/index')">
					<image src="../../static/img/tabBar/home.png"></image>
					<text>首页</text>
				</view>
				<view class="tab-item" @click="goPage('/pages/virtualNurse/index')">
					<image src="../../static/img/tabBar/nurs.png"></image>
					<text>虚拟护士</text>
				</view>
				<view class="tab-item" @click="goPage('/pages/convenient/index')">
					<image src="../../static/img/tabBar/daoyin.png"></image>
					<text>便捷导引</text>
				</view>
				<view class="tab-item" @click="goPage('/pages/user/index')">
					<image src="../../static/img/tabBar/my.png"></image>
					<text>我的</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { Base64 } from 'js-base64';
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
				linkify: true
			}),
			videoLoaded: false,
			videoUrl: 'https://aiwz.sdtyfy.com:8099/img/ai_img/ai_new.mp4',
			isMp: false, // 是否是小程序平台（在 onLoad 设置）
			htmlContent: '', // markdown 渲染后的 HTML（H5/APP 使用）
			nodes: [] // 小程序 rich-text 用的 nodes
		};
	},

	watch: {
		answer(newVal) {
			this.renderAnswerToHtmlNodes(newVal);
		}
	},

	onLoad(query) {
		// #ifdef MP
		this.isMp = true;
		// #endif
		// #ifndef MP
		this.isMp = false;
		// #endif
		if (query.content) {
			const parsed = JSON.parse(decodeURIComponent(query.content));
			let answer = Base64.decode(parsed.answer);
			this.answer = answer.replace(/!\[.*?\]\((.*?)\)/g, "<img src='$1' style='width:100%;margin-top:6px;' />");
			this.question = parsed.question;
			this.patientName = parsed.patientName;
			this.aiType = parsed.aiType;
			this.list = parsed.list;
		}
		this.renderAnswerToHtmlNodes(this.answer);
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
		onMessageClick(item, e) {
			const target = e.target || e.mp?.target;
			if (!target) return;
			if (item.imgs && item.imgs.length > 0) {
				uni.previewImage({
					urls: item.imgs,
					current: item.imgs[0]
				});
			}
		},
		renderAnswerToHtmlNodes(str) {
			const html = this.md.render(str || '');
			this.htmlContent = html;

			if (this.isMp) {
				// 简易 html->nodes 转换：保留文本与 img 标签
				this.nodes = this.htmlToNodes(html);
			} else {
				this.nodes = [];
			}
		},

		htmlToNodes(html) {
			if (!html) return [];

			const nodes = [];
			// 正则：寻找 <img ...>，并分割文本与图片
			const imgRegex = /<img\b[^>]*\bsrc=(?:'|")([^'"]+)(?:'|")[^>]*>/gi;
			let lastIndex = 0;
			let match;

			while ((match = imgRegex.exec(html)) !== null) {
				const imgStart = match.index;
				const imgEnd = imgRegex.lastIndex;
				// 取 img 之前的文本片段，清理掉其它 HTML 标签
				const textSegment = html
					.substring(lastIndex, imgStart)
					.replace(/<[^>]+>/g, '') // 去除其它 HTML 标签
					.replace(/&nbsp;/g, ' ')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&amp;/g, '&')
					.trim();

				if (textSegment) {
					nodes.push({
						name: 'text',
						attrs: {},
						children: [{ type: 'text', text: textSegment }]
					});
				}

				// push 图片节点（match[1] 是 src）
				const src = match[1];
				nodes.push({
					name: 'img',
					attrs: { src }
				});

				lastIndex = imgEnd;
			}

			// 最后剩余文本
			const tail = html
				.substring(lastIndex)
				.replace(/<[^>]+>/g, '')
				.replace(/&nbsp;/g, ' ')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&')
				.trim();

			if (tail) {
				nodes.push({
					name: 'text',
					attrs: {},
					children: [{ type: 'text', text: tail }]
				});
			}

			return nodes;
		},

		copyContent(content) {
		  let html = content; // 渲染数据
			const imgRegex = /<img.*?src=['"](.*?)['"]/g;
		
			let imgs = [];
			let match;
			while ((match = imgRegex.exec(html)) !== null) {
				imgs.push(match[1]);
			}
		
			let text = html.replace(/<[^>]+>/g, '').trim();
		
			// if (imgs.length > 0) {
			// 	text += '\n\n【图片链接】\n' + imgs.join('\n');
			// }
		
			text += '\n\n此内容由AI生成，仅供参考';
		
			uni.setClipboardData({
				data: text,
				success() {
					uni.showToast({ title: '文本复制成功，请长按图片保存', icon: 'none' });
				}
			});
		},
		likeBtn() {
			uni.navigateTo({ url: '/sub_packages/login/index?title=山东第一医科大学第二附属医院' });
		},
		goPage(url) {
			uni.switchTab({ url });
		}
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

.share-btn {
	padding: 0;
	margin: 0;
	border: none;
	background: none;
	box-shadow: none;
	border-radius: 0;
	outline: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: auto;
	height: auto;
	line-height: normal;
}

.share-btn::after {
	border: none; /* 重点：清除小程序按钮自带边框 */
}

.custom-tabbar {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 750rpx;
	padding: 18rpx 0 40rpx;
	background: #fff;
	display: flex;
	justify-content: space-around;
	align-items: center;
	box-shadow: 0 -6rpx 16rpx rgba(0, 0, 0, 0.08);
	z-index: 9999;

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 26rpx;
		color: #666;

		image {
			width: 48rpx;
			height: 48rpx;
			margin-bottom: 6rpx;
		}
	}

	.active {
		color: #2a75ff;
		font-weight: 600;
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
			padding-bottom: 140rpx;
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
