<template>
	<view class="details">
		<view class="middle">
			<view class="personal-1">
				<view class="title1">
					<view class="name">
						<text>{{ footData.patientName }}</text>
						<text>{{ footData.sex }}</text>
					</view>
				</view>
				<view class="center">
					<view class="no">
						<text>文档ID：</text>
						<text>{{ report.documentID ? report.documentID : '' }}</text>
					</view>
					<view class="no">
						<text>检查项目：</text>
						<text>{{ report.documentTitle ? report.documentTitle : '' }}</text>
					</view>
					<view class="no" v-if="report.department">
						<text>申请科室：</text>
						<text>{{ report.department ? report.department : '' }}</text>
					</view>
					<view class="no two">
						<text>检查时间：</text>
						<text>{{ report.updateDate ? report.updateDate : '' }} {{ report.updateTime ? report.updateTime : '' }}</text>
					</view>
					<view class="no">
						<text>报告医师：</text>
						<text>{{ report.reportDoctor ? report.reportDoctor : '' }}</text>
					</view>
					<view class="no">
						<text>审核医师：</text>
						<text>{{ report.auditDoctor ? report.auditDoctor : '' }}</text>
					</view>
				</view>
				<view class="tips">温馨提示：本报告仅供临床医师结合临床参考</view>
				<ul>
					<li @click="navigator(index)" v-for="(item, index) in modulesList" :key="index">
						<template>
							<view class="img">
								<image :src="item.img" mode=""></image>
							</view>
							<view class="name">
								{{ item.name }}
							</view>
						</template>
						<!-- <web-view v-else :src="webUrl"></web-view> -->
					</li>
				</ul>
			</view>
		</view>
		<uni-popup class="redReport" :safe-area="false" ref="cutPatientPopup" type="bottom">
			<view class="msgList">
				<view class="title">
					<view class="aiText">· 此内容由AI生成，仅供参考</view>
					<uni-icons type="closeempty" size="26" color="#4286FF" @click="closeRedReport"></uni-icons>
				</view>
				<view class="msg" v-html="markdown(msgList.msg)"></view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import MarkdownIt from 'markdown-it';
import mixin from '@/mixins/mixin.js';
import { safeParseJSON } from '@/utils/jsonHelper.js';

export default {
	mixins: [mixin],
	props: {
		title: String,
		report: Object
	},
	data() {
		return {
			siginVal: {},
			conversation_id: '',
			requestTask: null,
			msgList: {},
			md: new MarkdownIt(),
			webUrl: 'https://m.yzhcloud.com/pf/SYYEFY/?f=wechatpid&amp;sd=xC4I5c6TqaKcIvtd++dhpA==&amp;fp=5pyx6Zuo54aZ',
			modulesList: [
				{
					img: require('../../static/image/caseHistory1.png'),
					name: '智能解读'
				}
			],
		};
	},
	computed: {
		...mapState(['footData'])
	},
	methods: {
		markdown(content) {
			const safeContent = typeof content === 'string' ? content : String(content || '');
			return this.md.render(safeContent);
		},
		closeRedReport() {
			this.$refs.cutPatientPopup.close()
		}, 
		navigator(index) {
			
			console.log(this.report.manifestation, 'd=d=d=d=d');
			this.msgList = {};
			uni.showLoading({
				title: '智能分析解读中，请稍后...',
				mask: true 
			})
			const requestTask = wx.request({
				url: 'https://www.chinzsoft.com/api/v1/chat-messages', // 流式接口的URL
				method: 'POST',
				data: {
					query: this.report.manifestation,
					inputs: {
						sex: this.siginVal.sex,
						age: this.calculateAge(this.siginVal.idNum),
						examination: this.report.documentTitle
					},
					response_mode: 'streaming',
					conversation_id: this.conversation_id,
					user: this.siginVal.patientName
				},
				enableChunked: true,
				header: {
					Authorization: `Bearer app-Vc0BGWwE7gzB48sLo20YXtRj`,
					'content-type': 'application/json'
				},
				success: (res) => {
					this.test1 = '';
				},
				fail: (err) => {
					console.log('err', err);
					this.inputState = true;
				}
			});

			let buffer = '';
			
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
			
			      if (jsonStr === '[DONE]' || jsonStr.includes('message_end')) {
			        return;
			      }
			
			      const obj = safeParseJSON(jsonStr);
			      if (!obj) continue;
			
			      const answer = obj.answer || obj.data?.outputs?.answer;
			      if (!answer) continue;
			      if (obj.event === 'node_finished') {
							uni.hideLoading();
			        this.msgList = {
			          my: false,
			          msgLoad: false,
			          msg: answer
			        };
							this.$refs.cutPatientPopup.open('bottom');
			      }
			    }
			
			  } catch (e) {
			    console.error('解析流式返回数据异常:', e);
			  }
			});
		}

		// wx.reLaunch({ url: `/pages/virtualNurse/index?pattern=2&&manifestation=${this.report.manifestation}` });
	},

	mounted() {
		let loginValue = uni.getStorageSync('loginData');
		let data = loginValue ? JSON.parse(loginValue) : {};
		this.siginVal = data ? data.defaultArchives : {};
	}
};
</script>

<style lang="less" scoped>
.details {
	width: 100vw;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
	.middle {
		overflow: auto;

		.personal-1 {
			background: #ffffff;
			width: 722rpx;
			margin: 16rpx auto 0 auto;
			border-radius: 12rpx;
			padding-bottom: 20rpx;
			.title1 {
				margin: 0 20rpx;
				height: 70rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.name {
					display: flex;
					align-items: center;
					font-size: 40rpx;
					line-height: 40rpx;
					font-family: PingFang SC, PingFang SC-600;
					font-weight: 600;
					color: #000000;
					padding: 10rpx 0;
					text {
						margin-right: 60rpx;
					}
				}
			}
			.center {
				margin: 0 20rpx;
				display: flex;
				flex-wrap: wrap;
				.no {
					min-width: 50%;
					margin: 12rpx 0;
					text {
						&:nth-child(1) {
							color: #888888;
						}
					}
				}
				.two {
					min-width: 100%;
				}
			}
			.tips {
				margin: 25rpx 20rpx 0 20rpx;
				font-size: 20rpx;
				color: #4286ff;
				line-height: 20rpx;
			}
			ul {
				width: 704rpx;
				margin: 30rpx auto 0 auto;
				height: 132rpx;
				background: #f0f8ff;
				border-radius: 20rpx;
				display: flex;
				// justify-content: center;
				align-items: center;
				li {
					width: 25%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					.img {
						width: 64rpx;
						height: 64rpx;
						background: rgba(75, 168, 255, 0.14);
						border-radius: 50%;
						display: flex;
						justify-content: center;
						align-items: center;

						image {
							width: 36rpx;
							height: 36rpx;
						}
					}
					.name {
						margin-top: 6rpx;
						font-size: 20rpx;
					}
				}
			}
		}
	}
	.msgList {
		height: 60vh;
		padding: 20rpx 24rpx;
		border-radius: 40rpx;
		background: #fff;
		overflow: auto;
		.title {
			display: flex;
			margin-bottom: 20rpx;
			justify-content: space-between;
			border-bottom: 1px solid #9BC9FF;
			.aiText {
				color: #4286FF;
			}
		}
		.msg {
			color: #333;
			font-size: 26rpx;
			text-align: left;
			line-height: 40rpx;
		}
	}
}
</style>
