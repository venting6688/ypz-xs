<template>
	<view class="box" :animation="animationData">
		<HeaderBar @handle="show" :footState="footState" />
		<view class="scroll-Y">
			<van-grid column-num="4" :border="false" v-for="(i,x) in moduleList" :key="x">
				<view class="title">
					{{i.title}}
				</view>
			  <van-grid-item 
				use-slot 
				@click="toast(item.num,urlList[item.num-1])" 
				link-type="navigateTo" 
				:url="urlList[item.num-1]" 
				v-for="(item,index) in i.list" :key="index"
				v-if="item.active"
				>
			    <view class="img" >
			    	<image :src="item.img" mode=""></image>
			    </view>
			    <view class="name">
			    	{{item.name}}
			    </view>
			  </van-grid-item>
			</van-grid>
		</view>
		<foot :footState="footState" />
		</view>
</template>
<script>
	import bus from "@/utils/bus";
	import foot from '@/components/footer.vue'
	import {mapState,mapMutations} from 'vuex'
	import HeaderBar from '@/components/HeaderBar.vue';
	export default {
		components:{
			foot,
			HeaderBar
		},
		computed: {
			...mapState(['loginStatus']),
			
			moduleList() {
				return [
					{
						title:'门诊服务',
						list: [
							{
								img:'https://aiwz.sdtyfy.com:8099/img/outpatient.png',
								active: this.loginStatus === 'login',
								name:'智能导诊',
								num:1,
							},
							{
								img:'https://aiwz.sdtyfy.com:8099/img/outpatient1.png',
								name:'预约挂号',
								active: true,
								num:2,
							},
							{
								img:'https://aiwz.sdtyfy.com:8099/img/outpatient3.png',
								active: this.loginStatus === 'login',
								name:'门诊缴费',
								num:3,
							},
							{
								img:'https://aiwz.sdtyfy.com:8099/img/outpatient7.png',
								name:'就诊记录',
								active: true,
								num:5,
							},
							{
								img:'https://aiwz.sdtyfy.com:8099/img/outpatient4.png',
								active: this.loginStatus === 'login',
								name:'门诊报告',
								num:6,
							},
						]
					},
					{
						title:'便民服务',
						list: [
							{
								img:'https://aiwz.sdtyfy.com:8099/img/person3.png',
								name:'疾病百科',
								active: true,
								num:10,
							},
							 {
							img:'https://aiwz.sdtyfy.com:8099/img/person2.png',
							name:'药品查询',
							active: true,
							num:11,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/electronicBills.png',
									name:'电子票据',
									active: true,
									num:12,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/health.png',
									name:'医保凭证',
									active: true,
									num:13,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/medicalRecord.png',
									name:'病案通',
									active: true,
									num:14,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/hospitalized4.png',
									name:'营养点餐',
									active: true,
									num:15,
								},
							]
					},
					{
						title:'综合服务',
						list: [
								{
									img:'https://aiwz.sdtyfy.com:8099/img/synthesize3.png',
									name:'健康随访',
									active: true,
									num:22,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/synthesize1.png',
									active: true,
									name:'就诊人管理',
									num:23,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/synthesize4.png',
									active: false,
									name:'在线建档',
									num:24,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/synthesize4.png',
									name:'互联网+护理',
									active: true,
									num:25,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/synthesize6.png',
									name:'我的体检',
									active: true,
									num:26,
								},
							]
					},
					{
						title:'住院服务',
						list: [
								{
									img:'https://aiwz.sdtyfy.com:8099/img/hospitalized.png',
									active: this.loginStatus === 'login',
									name:'入院登记',
									num:30,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/hospitalized5.png',
									name:'住院费用',
									active: true,
									num:31,
								},
								{
									img:'https://aiwz.sdtyfy.com:8099/img/hospitalized7.png',
									name:'住院预交金',
									active: true,
									num:32,
								},
							]
					},
				]
			}
		},
		data() {
			return {
				animationData: {},
				footState:3,
				urlList:[
					'pages/virtualNurse/index',
					'/sub_packages/subscribe/departments',
					'/sub_packages/outpatientExpenditure/index',
					'空',
					'/sub_packages/record/index',
					'/sub_packages/report/index',
					'空',
					'空',
					'空', 
					'pages/virtualNurse/index',//10
					'pages/virtualNurse/index',
					'空',
					'空',
					'空',
					'空',
					'空',
					'空',
					'空',
					'空',
					'空',                      //20
					'空', ///sub_packages/evaluate/index
					'空',
					'/sub_packages/family/familyManage',
					'/sub_packages/filing/identityCard',
					'空',
					'空', ///sub_packages/mine/index
					'空',
					'空',
					'空',
					'/sub_packages/beHospitalizedRegister/index', //30
					'/sub_packages/convenientModule/index', //31
					'/sub_packages/deposit/index',
					'空',
					'空',
					'空',
					'空',
					'空',
					'空',
					'空',
				],
				jumpLinkNum: [12,13,14,15,22,25,26],
			}
		},
		
		methods: {
			skip(num){
				let appId
				let targetUrl
				if(num===12){
					appId = 'wx8e0b79a7f627ca18';
					targetUrl = `pages/index/index?agencyCode=d103b2f4592543e987fffc7f6d75cd03`;
				}else if(num===13){
					appId = 'wx7ec43a6a6c80544d';
					targetUrl = `pages/new_index/index/index`;
				}else if(num===14){
					appId = 'wxff4273542debbc64';
					targetUrl = `pages/index/index?hosId=2119`;
				}else if(num===15){
					appId = 'wx63c30833d698895a';
					targetUrl = `pages/hospital/hospital?hoSpitAl_id=dffc9e5a317c&webtype=2`;
				}else if(num===22){
					appId = 'wxd8f336bfa8545586';
					targetUrl = `pages/index/isCsmUser/isCsmUser?regNo=&hosId=11012&openId=`;
				}else if(num===25){
					appId = 'wx54bf421b03978b4b';
					targetUrl = `pages/homePage/homePage?stationId=717`;
				}else if(num===26){
					appId = 'wx508ee121a3163f4d';
					targetUrl = `pages/index/index?site=sydefy01`;
				}
				wx.navigateToMiniProgram({
				  appId: appId,
				  path: targetUrl,
				  envVersion: 'release',
				  success: function(res) {
				  },
				  fail: function(err) {
				    console.log('跳转失败', err);
				  }
				});
			},
			toast(num,url){
				if(num==1 || num===10 ||num === 11){
					if(num==1){
						wx.reLaunch({
						    url: `/pages/virtualNurse/index?pattern=1`,
						})
					}else {
						wx.reLaunch({
						    url: `/pages/virtualNurse/index?pattern=2`,
						})
					}
				}else if(this.jumpLinkNum.includes(num)){
					this.skip(num)
				}else if(url==='空'){
					uni.showToast({
					    title: '暂未开放',
					    icon: 'none',   
					    duration: 2000 
				    })  
				}	
			},
			toggle() {
			      const animation = uni.createAnimation({
			        duration: 0,
			        timingFunction: 'ease'
			      });
				  animation.opacity(0).step();
			      this.animationData = animation.export();
				  setTimeout(()=>{
				  	const animation = uni.createAnimation({
				    duration: 500,
				    timingFunction: 'linear'
				  });
				  animation.opacity(1).step();
				  this.animationData = animation.export();			  
				  },0)
			    },
			async show(str){
				this.headerEmit = {
					state:'',
					visitNumber:''
				}
				
				if(str.visitNumber){
					setTimeout(()=>{
						this.headerEmit = str
					},0)
					
				}
			},
			
		},
	}
</script>

<style lang="less" scoped>
	
	.box{
		
		width: 100vw;
		height: 100%; 
		// padding-top: 120px; /* 根据导航栏高度调整 */
		// // background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		
		.scroll-Y {
			width: 750rpx;
			text-align: center;
		    flex: auto;
			overflow: auto;
			padding-bottom: 28rpx;
			
			/deep/.van-grid{
				width: 712rpx;
				background: #ffffff;
				border-radius: 12rpx;
				margin:28rpx auto 0 auto;
				
				.title {
					margin: 20rpx 0 10rpx 20rpx;
					font-weight: 700;
					font-size: 34rpx;
					display: flex;
				}
				
				.van-grid-item__content {
						height: 170rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: space-evenly;
						padding: 0;
						
						>.img {
							width: 72rpx;
							height: 72rpx;
							// border-radius: 20rpx;
							margin-top: 10rpx;
							// display: flex;
							// justify-content: center;
							// align-items: center;
							
							image {
								width: 72rpx;
								height: 72rpx;
							}
						}
						>.name {
							font-size: 28rpx;
							margin-bottom: 10rpx;
						}
					}
				
			}
		}
	}
	
	
</style>