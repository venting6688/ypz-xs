<template>
	<view class="doctors">
		<van-notice-bar text="温馨提示：开放7天号源，每天18：00放出第八天号源" />
		<view class="timeCard">
			<scroll-view 
				:scroll-x="true" 
				:show-scrollbar="true"
				scroll-with-animation
				class="scroll-container"
			>
				<view 
					v-for="(item,index) in timeList" 
					:key="index" 
					class="scroll-item"
					:class="{back:timeObj.date===item.date}"
					@click="getScheduleDetail(item,index)"
				>
					<view>{{item.week}}</view>
					<view>{{item.date.substring(item.date.indexOf("-") + 1)}}</view>
					<view :class="{col:item.status==='无号'}">{{item.status}}</view>
				</view>
			</scroll-view>
		</view>
		<view class="middle">
			<view class="center" v-for="(item,index) in doctorList" :key="index">
				<view class="datum">
					<view class="img">
						<image :src="item[0].DoctorImg" v-if="item[0].DoctorImg" mode="aspectFit"></image>
						<image src="../../static/image/doctor.png" mode="" v-else></image>
					</view>
					<view class="message">
						<view class="name">
						    <text>{{item[0].DoctorName}}</text>
						    <text>{{item[0].DoctorSessType}}</text>
					    	<text  class="expert" v-if="item.expert">{{item.expert}}</text>
						    <!-- <text class="money">￥{{item[0].Fee}}</text> -->
					    </view> 
						<view class="synopsis">{{item[0].DoctorSpec ? item[0].DoctorSpec : '暂无简介'}}</view>
					</view>
				</view>
				<view class="footer">
					<view class="subscribe" v-for="(i,x) in item" :key="x">
						<view class="num">
							<view class="subscribe-time">{{i.ServiceDate}}</view>
							<view class="subscribe-am">{{i.SessionName}}</view>
							<!-- <view class="subscribe-number">
								<text>剩余</text>
								<text>{{i.AvailableLeftNum}}</text>
							</view> -->
						</view>
						
						<view>
							<text class="money">￥{{item[0].Fee}}</text>
						</view>
						
						<view>
							<button
								v-if="i.AvailableLeftNum > 0"
								type="primary" 
								size="mini" 
								style="background-color: #007AFF; color: white; margin-right: 10rpx;" 
								@click="getNumSource(i,item,x)"
							>
								剩余{{i.AvailableLeftNum}}
							</button>
							<button
								v-else
								type="primary" 
								size="mini" 
								style="background-color: #ccc; color: white; margin-right: 10rpx;" 
							>
								剩余0
							</button>
						</view>
						
						<!-- <view class="subscribe-btn">预约</view> -->
					</view>
				</view>
			</view>
		</view>
		<!-- 选择时间 -->
		<uni-popup class="Dialog" :mask-click="false" ref="popup" type="bottom"  :safeArea="false" >
		  <view class="center">
			  <view class="Dialog-title">
			  	<view class="title-time">
			  		{{timeObj.date}} {{timeObj.week}}
			  	</view>
			  	<view class="title-img" @click="close">
			  		<image src="@/static/image/icon-close.png" mode=""></image>
			  	</view>
			  </view>
			  <view class="Dialog-m_a">
			  	<text  v-for="(i,x) in optList" :key="x" :class="{colour:doctor.SessionName===i.SessionName}" @click="getNumSource(i,optList,x)">{{i.SessionName}}</text>
			  </view>
			<scroll-view class="scroll" :enhanced="true" :scroll-y="true" :show-scrollbar="true">
			<view class="middle">
				<view @click="doctorDetails(item)" class="list" hover-class="is-hover" hover-stay-time="200" v-for="(item,index) in doctorTimeList" :key="index">
					{{item.StartTime}} - {{item.EndTime}}
				</view>
			</view>
			</scroll-view>
			
		  </view>
		  
		</uni-popup>
	</view>
</template>

<script>
	import {mapState} from 'vuex'
	import login from '@/utils/login.js'
	import registrationApi from '@/api/registrationApi.js'
	export default {
		
		data() {
			return {
				checked: true,
				CLGRPRowId:'',
				departmentName:'',
				timeList:[],
				title:'',
				timeObj:{
					week:'',
					date:'',
				},
				optList:[],
				doctorList:[],
				doctor:{},
				doctorTimeList:[],
				today:true,   //是否是当天的
				}
		},
		computed: {
			...mapState(['footData']),
		},
		methods: {
			// 获取号源
			getScheduleDates(){
				uni.showLoading({
				  title: '加载中...',
				  mask: true 
				})
				registrationApi.getScheduleDates({
					patientID:this.footData.patientUniquelyIdentifies,
					days:6,
					specialtyGroupId:this.CLGRPRowId
				}).then(res => {
					this.timeList = res.data.data
					this.getScheduleDetail(this.timeList[0],0)
				}).catch(err => {
					console.log('2：', err);
				}).finally(() => {
					uni.hideLoading();
				});
				
			},
			// 获取医生
			getScheduleDetail(item,index){
				this.timeObj = item
				if(index===0){
					this.today = true
				}else{
					this.today = false
				}
				uni.showLoading({
				  title: '加载中...',
				  mask: true 
				})
				registrationApi.getScheduleDetail({
					patientID: this.footData.patientUniquelyIdentifies, //'0000111227',
					dateStr:item.date,
					specialtyGroupId:this.CLGRPRowId
				}).then(res => {
					this.doctorList = res.data.data
				}).catch(err => {
					console.log('2：', err);
				}).finally(() => {
					uni.hideLoading();
				});
			},
			onChange(detail) {
				this.checked = detail.detail
			},
			
			// 获取医生号源
			getNumSource(half,day,index){
				let loginValue = uni.getStorageSync("loginData");
				if (!loginValue) {
					login.loginData().catch((error) => {});
				} else {
					if(day){
						this.optList = day
					}
					this.doctor = {
						DoctorName:day[index].DoctorName?day[index].DoctorName:'',
						DoctorSessType:day[index].DoctorSessType?day[index].DoctorSessType:'',
						AdmitAddress:day[index].AdmitAddress?day[index].AdmitAddress:'',
						Fee:day[index].Fee?day[index].Fee:'',
						ServiceDate:half.ServiceDate,
						SessionName:half.SessionName,
						clinic:this.title,
						today:this.today,
						scheduleItemCode:half.ScheduleItemCode,
					}
					registrationApi.getNumSource({
						patientID: this.footData.patientUniquelyIdentifies,
						dateStr:half.ServiceDate,
						scheduleItemCode:half.ScheduleItemCode
					}).then(res => {
						this.doctorTimeList = res.data.data
					})
					.catch(err => {
						console.log('2：', err);
					})
					this.$refs.popup.open('bottom')
				}
			},
			doctorDetails(item){
				let loginValue = uni.getStorageSync("loginData");
				if (!loginValue) {
					login.loginData().catch((error) => {});
				} else {
					let filterDoctor = {};
					this.doctorList.map(val => {
						val.map(v => {
							if (v.ScheduleItemCode == item.ScheduleItemCode) {
								filterDoctor = v
							}
						})
					})
					this.$refs.popup.close()
					this.doctor.DoctorSpec = filterDoctor && filterDoctor.DoctorSpec != undefined ? filterDoctor.DoctorSpec : '';
					this.doctor.DoctorImg = filterDoctor && filterDoctor.DoctorImg != undefined ? filterDoctor.DoctorImg : '';
					this.doctor.StartTime = item.StartTime
					this.doctor.EndTime = item.EndTime
					uni.navigateTo({
						url: `/sub_packages/subscribe/doctorDetails?title=${this.title}&doctor=${encodeURIComponent(JSON.stringify(this.doctor))}&department=${this.departmentName}`
					})
				}
			},
			close(){
				this.$refs.popup.close()
			},
			
		},
		onLoad(e) {
			this.title = e.title
			wx.setNavigationBarTitle({
				title: e.title
			})
			this.CLGRPRowId = e.CLGRPRowId
			this.departmentName = e.departmentName;
		},
		mounted() {
			this.getScheduleDates()
		},
		
	}
</script>

<style lang="less" scoped>
	.col{
		color: #999999 !important;
	}
	.colour{
		color: #4286FF !important;
	}
	.back{
		background: #4286FF !important;
		view {
			color: #ffffff !important;
		}
	}
    .doctors {
	    width: 100vw;
	    height: 100%; 
	    background-color: #f5f5f5;
	    display: flex;
		// align-items: center;
	    flex-direction: column;
		
		/deep/.van-notice-bar{
			background: #f0f7ff;
			height: 58rpx;
			font-size: 25rpx;
			line-height: 25rpx;
			.van-notice-bar__wrap {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #4286ff;
			}
		}
		.timeCard{
			.scroll-container {
			  width: 100%;
			  white-space: nowrap; /* 防止子元素换行 */
			}
			.scroll-item {
				display: inline-block;
				margin:18rpx 10rpx;
				width: 130rpx;
				height: 123rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				text-align: center;
				view {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 33.33%;
					
					&:nth-of-type(1){
						font-size: 23rpx;
						line-height: 23rpx;
						color: #666666;
					}
					&:nth-of-type(2){
						font-size: 27rpx;
						line-height: 26rpx;
					}
					&:nth-of-type(3){
						font-size: 23rpx;
						line-height: 23rpx;
						color: #4286ff;
					}
				}
			}
		}
		
		.head {
			margin-bottom: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 27rpx;
			height: 40rpx;
			line-height: 5rpx;
			margin:10rpx 34rpx;
			
			.left {
				.time {
					margin-right: 15rpx;
				}
			}
			.right {
				display: flex;
				align-items: center;
				
				>text {
					display: inline-block;
					margin-right: 15rpx;
				}
			}
		}
		
		.middle {
			overflow: auto;
			margin: 15rpx  0 50rpx 0;
			
			.center {
				width: 680rpx;
				// height: 350rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				margin: 25rpx auto;
				padding: 20rpx 0;
				
				&:nth-of-type(1){
					margin-top: 5rpx;
				}
				&:last-of-type{
					margin-bottom: 20rpx;
				}
				
				.datum{
					margin:0 10rpx;
					padding: 17rpx 0;
					display: flex;
					
					.img{
						width: 122.14rpx;
						height: 152.67rpx;
						border-radius: 9.54rpx;
						image{
							width: 122.14rpx;
							height: 152.67rpx;
							border-radius: 9.54rpx;
						}
					}
					.message {
						margin-left:24rpx;
						padding-top: 20rpx;
						.name {
							display: flex;
							align-items: center;
							position: relative;
							text {
								
								&:nth-of-type(1){
									font-size: 36rpx;
									line-height: 27rpx;
									margin-right: 20rpx;
								}
								&:nth-of-type(2){
									font-size: 30rpx;
									line-height: 23rpx;
									color: #999999;
									margin-right: 20rpx;
								}
								
							}
							.expert{
								display: inline-block;
								width: 95.42rpx;
								height: 30.53rpx;
								background: #f3fffc;
								border: 0.95rpx solid #3cd0aa;
								border-radius: 7.63rpx;
								font-size: 19.08rpx;
								line-height: 19.08rpx;
								color: #3cd0aa;
								display: flex;
								justify-content: center;
								align-items: center;
							}
							
							
						}
						.synopsis {
							width: 508rpx;
							height: 99rpx;
							margin-top: 18rpx;
							font-size: 23rpx;
							line-height: 26rpx;
							color: #999999;
							overflow: hidden;
							display: -webkit-box; //将元素设为盒子伸缩模型显示
							-webkit-box-orient: vertical; //伸缩方向设为垂直方向
							-webkit-line-clamp: 4;  //超出3行隐藏，并显示省略号
							
						}
					}
				}
				
				.footer {
					.subscribe{
						display: flex;
						justify-content: space-between;
						align-items: center;
						height: 57.25rpx;
						margin: 20rpx;
						.money {
							font-size: 32rpx;
							color: #FAAA03;
						}
						.num {
							display: flex;
							align-items: center;
							
							.subscribe-time{
								margin-right: 80rpx;
							}
							.subscribe-number{
								text {
									&:last-of-type{
										color: #4286FF;
									}
								}
							}
						}
						.subscribe-btn {
							width: 137.4rpx;
							height: 57.25rpx;
							background: rgba(66,134,255,0.08);
							border-radius: 38.17rpx;
							color: #4286FF;
							font-size: 26.72rpx;
							line-height: 26.72rpx;
							display: flex;
							justify-content: center;
							align-items: center;
							margin-right: 20rpx;
						}
					}
				}
			}
		}
		.Dialog {
						width: 750rpx;
						
						.center {
							width: 750rpx;
							background-color: #ffffff;
							border-radius: 30rpx 30rpx 0 0;
							height: 720rpx;
							overflow: hidden;
							
							.Dialog-title {
								margin: 10rpx 30rpx;
								display: flex;
								justify-content: space-between;
								align-items: center;
								
								.title-time {
									letter-spacing: 2rpx;
								}
								.title-img {
									width: 63rpx;
									height: 63rpx;
									display: flex;
									justify-content: center;
									align-items: center;
									image {
										width: 45.8rpx;
										height: 45.8rpx;
									}
								}
							}
							.Dialog-m_a{
								margin: 20rpx 30rpx 10rpx 30rpx;
								color: #666666;
								> text {
									display: inline-block;
									margin: 0 30rpx;
									padding: 10rpx;
									
									&:first-of-type{
										margin: 0 30rpx 0 0;
									}
								}
							}
							
						.scroll {
								height: 72%;
								
								.middle {
									    margin: 0 20rpx 0 20rpx;
										display: flex;
										flex-wrap: wrap;
										> .list {
											border-radius: 4px;
											flex-grow: 1;
											display: flex;
											justify-content: center;
											align-items: center;
											padding: 12rpx 30rpx;
											margin: 16rpx;
											color: #4286FF;
											font-size: 27rpx;
											background: #F3F8FF;
											border-radius: 40rpx;
											
										}
										.is-hover {
											background: #4286FF;
											color: #fff;
										}
										
									}
								}
								
							}
					}
					
	}
</style>

