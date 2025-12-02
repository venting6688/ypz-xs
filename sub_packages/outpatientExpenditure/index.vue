<template>
	<view class="box" v-if="showState">
		<bar v-if="loginValue.xcxOpenId" />
		<date @handle="show" />
		<view class="information">
			<uni-section type="line">
				<view class="uni-padding-wrap uni-common-mt">
					<uni-segmented-control :current="currentTab" :values="tabs" style-type="text" activeColor="#4286FF" @clickItem="onTabClick" />
				</view>
				<view class="tab-content">
					<view class="content" v-if="currentTab === 0">
						<ul v-if="billList.length > 0">
							<li v-for="(item, index) in billList" :key="index">
								<view class="middle">
									<view class="title">
										<view class="clinic">
										<text>就诊时间：{{ item.admDate }}</text>
									</view>
									<view class="clinic">
										<text>就诊科室：{{ item.admLoc }}</text>
									</view>
									<view class="clinic">
										<text>就诊医生：{{ item.admDoc }}</text>
									</view>
									</view>
									<view class="center" v-for="(i, x) in item.itemList.item" :key="x">
										<view class="no">
											<view class="name">{{ i.itemName }}</view>
											<view class="price">
												<text>单价：{{ parseFloat(i.itemPrice).toFixed(2) }}</text>
												<text>￥{{ i.itemSum }}</text>
											</view>
										</view>
									</view>
								</view>
								<view class="totalMoney">
									<view class="">
										<text>待缴费金额：</text>
										<text>￥{{ item.orderSum }}元</text>
									</view>
								</view>
								<view class="btn">
									<!-- <view class="medical">医保支付</view> -->
									<view class="self-paying" @click="pay(item)">立即缴费</view>
								</view>
							</li>
						</ul>
						<view class="without" v-else>
							<image src="../static/image/wu.png" mode="widthFix"></image>
						</view>
					</view>
					<view class="payment" v-if="currentTab === 1">
						<view v-if="alreadyList.length > 0">
							<view class="detail" v-for="(item, index) in alreadyList" :key="index">
								<view class="dateTime">
									<text>{{ item.invDate }} {{ item.invTime }}</text>
								</view>
								<view class="title">
									<view>
										<text>{{ item.admDept }}</text>
									</view>
									<view>
										<text>{{ item.admDoctor }}</text>
									</view>
								</view>
								<view class="uni-container">
									<uni-table border stripe>
										<uni-tr>
											<uni-th style="width: 40% !important">项目</uni-th>
											<uni-th style="width: 15% !important">数量</uni-th>
											<uni-th style="width: 20% !important">规格</uni-th>
											<uni-th style="width: 25% !important">金额</uni-th>
										</uni-tr>
										<uni-tr v-for="(val, i) in item.detailList" :key="i">
											<uni-td>{{ val.itemName }}</uni-td>
											<uni-td>{{ val.itemQty }}</uni-td>
											<uni-td>{{ val.itemUom }}</uni-td>
											<uni-td>￥{{ parseFloat(val.itemPrice).toFixed(2) }}</uni-td>
										</uni-tr>
									</uni-table>
								</view>
								<view class="total">
									<text>合计：</text>
									<text>{{ item.totalAmt }}元</text>
								</view>
							</view>
						</view>
						<view class="without" v-else>
							<image src="../static/image/wu.png" mode="widthFix"></image>
						</view>
					</view>
				</view>
			</uni-section>
		</view>
		<Toast v-if="toastObj.state" @back="closeToast" :type="toastObj.type" :message="toastObj.message" />
	</view>
</template>

<script>
import dayjs from 'dayjs';
import mixin from '@/mixins/mixin';
import bar from '../components/bar.vue';
import date from '../components/date.vue';
import Toast from '../components/toast.vue';
import { mapState } from 'vuex';
import bus from '@/utils/bus.js';
import healthCard from '@/api/healthCard.js';
import outpatientExpenditureApi from '@/api/outpatientExpenditureApi.js';
export default {
	mixins: [mixin],
	components: {
		bar,
		Toast,
		date
	},
	data() {
		return {
			headIndex: 1,
			currentTab: 0,
			tabs: ['未缴费', '缴费记录'],
			list1: [],
			list2: [],
			billList: [],
			alreadyList: [],
			loading: {
				loadingState: true,
				loadingName: '加载中'
			},
			second: 3,
			message: '',
			toastObj: {
				state: false
			},
			checkState: false,
			date: {},
			loginValue: {}
		};
	},
	computed: {
		...mapState(['footData', 'showState'])
	},
	watch: {
		footData: {
			deep: true,
			handler(newVal, oldVal) {
				if (oldVal && oldVal.patientUniquelyIdentifies && newVal.patientUniquelyIdentifies !== oldVal.patientUniquelyIdentifies) {
					this.queryMedicalRecords();
					this.getPaymentRecord();
				}
			}
		}
	},

	onLoad(option) {
		this.loading.loadingState = false;
		let loginData = uni.getStorageSync('loginData');
		this.loginValue = loginData ? JSON.parse(loginData) : {};
		if (option.checkState) {
			this.checkState = option.checkState;
		}
		this.reportHISData();
	},
	methods: {
		onTabClick(e) {
			this.currentTab = e.currentIndex;
			this.currentTab === 0 ? this.queryMedicalRecords() : this.getPaymentRecord();
		},
		closeToast(state) {
			this.toastObj.state = state;
		},
		particulars(detail) {
			uni.navigateTo({ url: `/sub_packages/outpatientExpenditure/particulars?detail=${encodeURIComponent(JSON.stringify(detail))}` });
		},
		//时间插件
		show(time) {
			const datePattern = /^\d{4}-\d{2}-\d{2}$/.test(time.startTime);
			if (datePattern) {
				this.date = time;
				this.currentTab === 0 ? this.queryMedicalRecords() : this.getPaymentRecord();
			}
		},
		// headBtn(num){
		// 	this.loading.loadingState = false
		// 	this.headIndex = num
		// 	num === 1 ? this.queryMedicalRecords() : this.getPaymentRecord();
		// },
		//检测用卡数据
		async reportHISData() {
			let data = {
				qrCodeText: this.footData.qrCodeText,
				time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				hospitalCode: '40237',
				scene: '0101051',
				department: '',
				cardType: '11',
				cardChannel: '0402',
				cardCostTypes: '0100'
			};
			let res = await healthCard.reportHISData(this.loginValue.xcxOpenId, data);
		},
		//未交费
		async queryMedicalRecords() {
			if (this.footData.patientUniquelyIdentifies) {
				let data = {
					patientID: this.footData.patientUniquelyIdentifies,
					visitNumber: '',
					startDate: this.date.startTime,
					endDate: this.date.endTime
				};
				outpatientExpenditureApi
					.getToBePaid(data)
					.then((res) => {
						if (res.data.code === 200 && res.data.data.payOrdList != null) {
							let data = res.data.data.payOrdList.payOrder;
							this.billList = data;
						}
					})
					.catch((err) => {
						console.log('error：', err);
					});
			}
		},

		//缴费记录
		async getPaymentRecord() {
			try {
				uni.showLoading({
					title: '加载中...',
					mask: true
				});

				let data = {
					patientID: this.footData.patientUniquelyIdentifies,
					startDate: this.date.startTime,
					endDate: this.date.endTime
				};

				this.alreadyList = [];

				const res = await outpatientExpenditureApi.getPaymentRecord(data);
				if (res.data.code === 200) {
					const list = res.data.data || [];

					const promiseList = list.map(async (item) => {
						let detailInfo = {
							patientID: this.footData.patientUniquelyIdentifies,
							invoiceNo: item.invoiceNo
						};

						const detailRes = await outpatientExpenditureApi.getPaymentDetails(detailInfo);
						if (detailRes.data.code === 200 && detailRes.data.data.length) {
							item.detailList = detailRes.data.data;
						} else {
							item.detailList = [];
						}
						return item;
					});
					const finalList = await Promise.all(promiseList);

					const newList = finalList.map((item) => ({
						...item,
						invDateTime: `${item.invDate} ${item.invTime}`
					}));

					newList.sort((a, b) => {
						const timeA = a.invDateTime.replace(/-/g, '/');
						const timeB = b.invDateTime.replace(/-/g, '/');
						return new Date(timeB) - new Date(timeA);
					});

					this.alreadyList = newList;
				}
			} catch (error) {
				console.log(error);
			} finally {
				uni.hideLoading();
			}
		},
		//支付
		pay(item) {
			let loginValue = uni.getStorageSync('loginData');
			let data = JSON.parse(loginValue);
			let msg = {
				patientID: this.footData.patientUniquelyIdentifies,
				patientName: this.footData.patientName,
				patientOpenid: data.xcxOpenId,
				visitNumber: item.adm,
				orderNo: item.orderNo,
				orderSum: item.orderSum
			};
			try {
				outpatientExpenditureApi.toBePaidPreOrder(msg).then((result) => {
					if (result.data.code === 200) {
						let obj = result.data.data.prePayResponse;
						uni.requestPayment({
							provider: 'wxpay', // 服务提提供商
							timeStamp: obj.body.miniPayRequest.timeStamp, // 时间戳
							nonceStr: obj.body.miniPayRequest.nonceStr, // 随机字符串
							package: obj.body.miniPayRequest.pkg,
							signType: obj.body.miniPayRequest.signType, // 签名算法
							paySign: obj.body.miniPayRequest.paySign, // 签名
							success: (res) => {
								this.loading = {
									loadingState: true,
									loadingName: '正在查询支付结果'
								};
								this.queryPayResultForToBePaid(result.data.data);
							},
							fail: (err) => {
								let cancelPreSettlementData = {
									patientID: result.data.data.patientID,
									visitNumber: item.adm,
									orderNo: result.data.data.orderNo
								};
								outpatientExpenditureApi.cancelPreSettlement(cancelPreSettlementData).then((r) => {
									if (r.data.code === 200) {
										this.loading = {
											loadingState: false
										};
										this.toastObj = {
											state: true,
											type: 'fail',
											message: r.data.data.resultMsg
										};
									}
								});
							}
						});
					} else {
						this.toastObj = {
							state: true,
							type: 'fail',
							message: res.data.msg
						};
					}
				});
			} catch (error) {
				this.toastObj = {
					state: true,
					type: 'fail',
					message: error.toString()
				};
				//TODO handle the exception
			}
		},
		queryPayResultForToBePaid(data) {
			outpatientExpenditureApi
				.queryPayResultForToBePaid(data)
				.then((res) => {
					try {
						if (res.data.code === 999) {
							this.queryPayResultForToBePaid(data);
						} else if (res.data.code === 200) {
							this.toastObj = {
								state: true,
								message: res.data.msg
							};
							if (this.checkState) {
								this.timer = setTimeout(() => {
									bus.$emit('refreshGetcheckVisit');
									clearTimeout(this.timer);
									uni.navigateBack();
								}, 4000);
							}

							this.queryMedicalRecords();
							console.log('结果', res);
						} else {
							this.toastObj = {
								state: true,
								type: 'fail',
								message: '缴费失败，已退款'
							};
						}
					} catch (error) {
						this.toastObj = {
							state: true,
							type: 'fail',
							message: error.toString()
						};
					}
				})
				.catch((err) => {
					console.log('errrrrr：', err);
				});
		}
	}
};
</script>

<style lang="less" scoped>
::v-deep .segmented-control__text {
	font-size: 32rpx !important;
}
.box {
	width: 100vw;
	height: 100%;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;

	.head {
		width: 681.3rpx;
		margin: 20rpx auto 0 auto;
		background: #ffffff;
		// height: 120rpx;

		border-radius: 12rpx 12rpx 0 0;
		> view {
			padding-top: 20rpx;
			margin: 0 20rpx;
			display: flex;
			align-items: center;
			border-bottom: 2rpx solid #eeeeee;

			.name {
				display: flex;
				align-items: center;
				margin-right: 40rpx;
				font-family: PingFang SC, PingFang SC-600;
				color: #000000;
				padding: 10rpx 0;
				font-size: 32rpx;
				line-height: 32rpx;
				color: #8a8a8a;
			}

			.wire {
				width: 92rpx;
				height: 8rpx;
				margin: 18rpx auto 0 auto;
				border-radius: 8rpx;
			}
			.blue {
				background: #4286ff;
			}
			.black {
				color: #000000;
			}
		}
	}
	.information {
		margin: 20rpx;
		overflow: auto;
		border-radius: 10rpx;
		.tab-content {
			margin-top: 20rpx;
		}
		.payment {
			margin-top: 20rpx;
			.detail {
				background: #fff;
				padding: 25rpx 25rpx 4rpx;
				margin-bottom: 20rpx;
				border-radius: 16rpx;
				.dateTime {
					font-size: 30rpx;
				}
				.title {
					display: flex;
					color: #666;
					justify-content: space-between;
					align-items: center;
					padding: 10rpx 0 20rpx;
				}
				.total {
					margin-top: 20rpx;
					text-align: right;
					padding-bottom: 20rpx;
					text {
						&:nth-child(2) {
							color: #ec2e50;
							margin-right: 20rpx;
						}
					}
				}
			}
		}
		ul {
			width: 681.3rpx;
			margin: 0 auto;
			background: #ffffff;
			border-radius: 0 0 12rpx 12rpx;
			> li {
				width: 681.3rpx;
				&:first-child {
					> view {
						border: 0;
					}
				}
				.middle {
					padding-bottom: 20rpx;
					margin: 0 20rpx;
					border-top: 2rpx solid #eeeeee;

					.title {
						.time {
							padding: 15rpx 0;
						}
						.clinic {
							padding: 15rpx 0 0;
						}
						.header {
							display: flex;
							justify-content: space-between;
							align-items: center;
							image {
								width: 12rpx;
								height: 18rpx;
								margin-left: 20rpx;
							}
							.delete {
								display: flex;
								align-items: center;
								font-size: 26.72rpx;
								line-height: 26.72rpx;
								font-family: PingFang SC, PingFang SC-400;
								font-weight: 400;
								color: #4286ff;
								padding-top: 15rpx;
							}
						}
					}
					.center {
						display: flex;
						.no {
							width: 100%;
							font-size: 24rpx;
							margin: 14rpx 0;

							.price {
								display: flex;
								justify-content: space-between;
								text {
									&:nth-child(1) {
										color: #999999;
									}
									&:nth-child(2) {
										color: #333333;
									}
								}
							}
						}
					}
					.list {
						font-size: 26rpx;
						> view {
							margin: 10rpx 0;
							> text {
								&:first-child {
									color: #888888;
								}
							}
						}
					}
				}
				.totalMoney {
					text-align: right;
					view {
						padding: 10rpx 0 20rpx 0;
						margin: 0 20rpx;
						text {
							&:last-child {
								color: red;
							}
						}
						.black {
							color: #000000 !important;
						}
					}
				}
				.btn {
					display: flex;
					justify-content: space-around;
					width: 681.3rpx;
					padding-bottom: 60rpx;
					margin: 0 auto;
					view {
						width: 304rpx;
						height: 84rpx;
						border-radius: 46rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						color: #ffffff;
						font-size: 32rpx;
						line-height: 32rpx;

						&:first-child {
							background: #3cd0aa;
						}
						&:last-child {
							background: #4286ff;
						}
					}
				}
			}
		}
		.loading {
			width: 681.3rpx;
			margin: 0 auto;
			background: #ffffff;
			min-height: 500rpx;
			display: flex;
			font-size: 40rpx;
			justify-content: center;
			align-items: center;
		}
	}
	.without {
		font-size: 40rpx;
		width: 681.3rpx;
		height: 500rpx;
		background: #ffffff;
		margin: 0 auto;
		border-bottom-left-radius: 16px;
		border-bottom-right-radius: 16px;
		display: flex;
		justify-content: center;
		align-items: center;
		image {
			width: 75%;
		}
	}
}
</style>
