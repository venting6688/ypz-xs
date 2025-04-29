<template>
	<view class="doing">
		<view class="center">
			<view class="title">
				<view @click="matter(i.type)" :class="{b:type===i.type}" v-for="(i,x) in titleList" :key="x">{{i.name}}({{type == i.type ? matterList.length : 0}}项)</view>
			</view>
			<ul class="today" v-if="type ==='today'">
				<li v-for="(item, index) in matterList" :key="index">
					<view class="time">
						<view>治疗时间:</view>
						<view><view>{{item.date}}</view></view>
					</view>
					<uni-table border stripe>
						<uni-tr>
							<uni-th>项目</uni-th>
							<uni-th>状态</uni-th>
						</uni-tr>
						<uni-tr v-for="(val,key) in item.detail" :key="key">
							<uni-td>{{val.OrdDesc}}</uni-td>
							<uni-td>{{val.ExStatus}}</uni-td>
						</uni-tr>
					</uni-table>
				</li>
			</ul>
			
			<ul class="today" v-else>
				<li style="border-bottom: 1px solid #eee;">
					<view class="project">
						<view><uni-icons type="info-filled"></uni-icons>注意:</view>
						<view>
							<view>请提前半个小时到检查科室等候检查</view>
						</view>
					</view>
				</li>
				<li v-for="(item, index) in matterList" :key="index" style="border-bottom: 1px solid #eee;">
					<view class="time">
						<view>预约时间:</view>
						<view>
							<view>{{item.date}}</view>
						</view>
					</view>
					<view v-for="(val, key) in item.detail" :key="key">
						<view class="project">
							<view>预约项目:</view>
							<view>
								<view>{{val.OrdDesc}}</view>
							</view>
						</view>
						<view class="project">
							<view>检查科室:</view>
							<view>
								<view>放射科</view>
							</view>
						</view>
						<view class="project">
							<view>检查地点:</view>
							<view>
								<view>二楼西区</view>
							</view>
						</view>
					</view>
				</li>
			</ul>
		</view>
	</view>
</template>

<script>
	import moment from 'moment';
	import bus from "@/utils/bus.js";
	import { mapState } from 'vuex';
	import hospitalizationApi from '@/api/hospitalizationApi.js';
	export default {
		props: { headerEmit: Object },
		data() {
			return {
				matterList: [],
				otherNum: 0,
				type: 'today',
				titleList:[
					{
						name:'今日事项',
						type:'today',
					},
					{
						name:'预约事项',
						type:'other',
					},
				],
			}
		},
		computed: {
			...mapState(['footData','department']),
		},
		mounted() {
			this.getMattersList('today')
		},
		
		methods: {
			matter(val){
				this.type = val
				this.getMattersList(this.type)
			},
			// 获取事项
			async getMattersList(type) {
				let res = await hospitalizationApi.getHospitalRecord(this.footData.patientUniquelyIdentifies);
				if (res.data.code === 200) {
					let admId = res.data.data.admInfoList.admInfo[0].admID;
					let nowDate = moment().format('YYYY-MM-DD');
					let sendDate = moment().add(1, 'days').format('YYYY-MM-DD');
					let nextDate = moment(sendDate).add(7, 'days').format('YYYY-MM-DD');
					let str = {
						admId,
						startTime: type == 'today' ? nowDate : sendDate,
						endTime: type == 'today' ? nowDate : nextDate,
					}
					let matterRes = await hospitalizationApi.getMattersRecord(str);
					matterRes.data.code = 200
					if (matterRes.data.code === 200){
						// this.matterList = matterRes.data.data.Data
						let data = {
							"2025-03-19 11:34": [
								{
									"OrdDesc": "心内科护理常规",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "低盐低脂饮食",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "常规心电图检查(含床旁)",
									"ExStatus": "已执行"
								}
							],
							"2025-03-19 11:35": [
								{
									"OrdDesc": "(日间常规)心脏彩超+左心功能测定+室壁运动分析",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "(心内科专用)双侧颈动脉+双侧椎动脉彩超",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "256排CT平扫(胸部)",
									"ExStatus": "已执行"
								}
							],
							"2025-03-19 11:39": [
								{
									"OrdDesc": "病毒四项",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "中性粒细胞载脂蛋白(HNL)检测(自费)",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "糖化血红蛋白",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "甲功三项",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "粪便隐血试验",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "尿一般检查",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "尿沉渣定量检测",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "白蛋白",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "总蛋白",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "同型半胱氨酸(HCY)",
									"ExStatus": "已执行"
								},
								{
									"OrdDesc": "备血用输血相容性检测",
									"ExStatus": "已执行"
								}
							],
							"2025-03-19 11:41": [
								{
									"OrdDesc": "肌钙蛋白Ⅰ",
									"ExStatus": "未执行"
								}
							],
							"2025-03-19 11:49": [
								{
									"OrdDesc": "双侧下肢动脉+双侧足动脉彩超",
									"ExStatus": "未执行"
								}
							],
							"2025-03-19 12:00": [
								{
									"OrdDesc": "尼可地尔片[5mgx24片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "0.9%氯化钠注射液[0.9% 250ml/袋]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "注射用盐酸地尔硫卓[10mg/瓶](石药)",
									"ExStatus": "未执行"
								}
							],
							"2025-03-19 12:01": [
								{
									"OrdDesc": "地奥心血康软胶囊[0.35gx30粒/盒]",
									"ExStatus": "未执行"
								}
							],
							"2025-03-19 16:00": [
								{
									"OrdDesc": "单硝酸异山梨酯片[20mgx60片/瓶]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "尼可地尔片[5mgx24片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "地奥心血康软胶囊[0.35gx30粒/盒]",
									"ExStatus": "未执行"
								}
							],
							"2025-03-19 20:00": [
								{
									"OrdDesc": "阿托伐他汀钙片[20mgx14片/盒]",
									"ExStatus": "未执行"
								}
							],
							"2025-03-20 08:00": [
								{
									"OrdDesc": "单硝酸异山梨酯片[20mgx60片/瓶]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "阿司匹林肠溶片[100mgx30片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "硫酸氢氯吡格雷片[75mgx7片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "尼可地尔片[5mgx24片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "0.9%氯化钠注射液[0.9% 250ml/袋]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "注射用盐酸地尔硫卓[10mg/瓶](石药)",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "地奥心血康软胶囊[0.35gx30粒/盒]",
									"ExStatus": "未执行"
								}
							],
							"2025-03-20 12:00": [
								{
									"OrdDesc": "尼可地尔片[5mgx24片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "地奥心血康软胶囊[0.35gx30粒/盒]",
									"ExStatus": "未执行"
								}
							],
							"2025-03-20 16:00": [
								{
									"OrdDesc": "单硝酸异山梨酯片[20mgx60片/瓶]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "尼可地尔片[5mgx24片/盒]",
									"ExStatus": "未执行"
								},
								{
									"OrdDesc": "地奥心血康软胶囊[0.35gx30粒/盒]",
									"ExStatus": "未执行"
								}
							],
							"2025-03-20 20:00": [
								{
									"OrdDesc": "阿托伐他汀钙片[20mgx14片/盒]",
									"ExStatus": "未执行"
								}
							]
						}
						this.matterList = Object.entries(data).map(([date, detail]) => ({
						  date,
						  detail
						}));
					} else {
						this.matterList = [];
					}
					
					console.log(JSON.stringify(this.matterList));
				}
			},
		},
	}
</script>

<style lang="less" scoped>
	.moveR-enter-active,  .moveR-leave-active {
	    transition: all 4s linear;
	    transform: translateX(0);
	  }
	   .moveR-enter,  .moveR-leave {
	    transform: translateX(100%);
	  }
	   .moveR-leave-to{
	     transform: translateX(100%);
	   }
	   .b {
	   	background: #f0f7ff;
			color: #0B69B6;
	   }
	.doing{
		// background: fuchsia;
		.center {
			margin:28rpx 33rpx 28rpx 33rpx;
			width: 684rpx;
			background: #ffffff;
			border-radius: 12rpx;
			.title {
				display: flex;
				align-items: center;
				justify-content: space-evenly;
				padding: 10rpx 0;
				margin: 0 20rpx;
				border-bottom: 2rpx solid #eeeeee;
				color: #7D7D7D;
				view {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 312rpx;
					height: 64rpx;
				}
			}
			.today {
				text-align: left;
				padding-bottom: 10rpx;
				> li {
					margin: 0 20rpx;
					padding: 20rpx 0;
					
					&:last-child{
						border: 0;
					}
					// width: 100%;
					.time {
						display: flex;
						padding: 10rpx 0 20rpx;
						font-weight: 600;
						>view {
							&:first-child{
								margin-right: 10rpx;
							}
						}
					}
					.project {
						display: flex;
						padding: 10rpx 0;
						>view {
							.text-red {
							  color: red;
							}
							&:first-child{
								width: 20%;
								color: #999999;
								margin-right: 10rpx;
							}
							&:last-child{
								margin-right: 10rpx;
								width: 80%;
								
								.list {
									margin-top: 20rpx;
									display: flex;
									justify-content: space-between;
								}
							}
						}
					}
				}
			}
			.subscribe {
				padding: 28rpx 0;
				> li {
					margin:0 4% 0 4%;
					width: 92%;
					display: flex;
					
					&:first-child{
						// margin:3% 6% 0 4%;
						.attribute{
							color: #000 !important;
						}
					}
					
					.attribute{
						color: #888888;
						width: 22%;
						display: flex;
						margin-bottom:2%;
						justify-content: left;
					}
					
					.name {
						min-height: 36rpx;
						display: flex;
						text-align: left;
						margin-bottom:2%;
						width: 78%;
					}
				}
			}
		}
	}
</style>
