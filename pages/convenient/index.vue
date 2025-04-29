<template>
	<view class="box" >
		<HeaderBar @handle="show" v-if="showState && departmentList.length > 0" :footState="footState" :data="departmentList" />
		<!-- <report @handle="expandBtn" :expand="expand" v-if="visitNumber!=='1358799' && (headerEmit.state=='查验' || headerEmit.state=='回诊')" /> -->
		<view v-if="showState" class="scroll-Y" :animation="animationData" @touchmove='touchMove'>
			<first @handle="show" v-if="headerEmit.state=='初诊'" :headerEmit="headerEmit" />
		  <check @handle="show" v-if="headerEmit.state=='查验'" :headerEmit="headerEmit" />
			<answer @handle="show" v-if="headerEmit.state=='回诊'" :headerEmit="headerEmit" />
			<prescription @handle="show" v-if="headerEmit.state=='处方'" :headerEmit="headerEmit" />
		</view>
		
		<view class="scroll-Y" :animation="animationData" v-else>
			<prepare v-if="headerEmit.state=='住院信息'" :headerEmit="headerEmit" />
			<doing v-if="headerEmit.state=='住院事项'" :headerEmit="headerEmit" />
			<inventory v-if="headerEmit.state=='住院日清单'" :headerEmit="headerEmit" />
		</view>
		
		<view class="img" v-if="!headerEmit.state || !signData">
			<image src="https://aiwz.sdtyfy.com:8099/img/wu.png" mode="widthFix"></image>
		</view>
		<foot :footState="footState"/>
	</view>
</template>
<script>
	import {mapState} from 'vuex'
	import HeaderBar from '@/components/HeaderBar.vue';
	import foot from '@/components/footer.vue'
	import report from '../../sub_packages/convenientModule/components/report.vue'
	import first from '../../sub_packages/convenientModule/components/outpatient/first.vue'
	import check from '../../sub_packages/convenientModule/components/outpatient/check.vue'
	import answer from '../../sub_packages/convenientModule/components/outpatient/answer.vue'
	import prescription from '../../sub_packages/convenientModule/components/outpatient/prescription.vue'
	import prepare from '../../sub_packages/convenientModule/components/beHospitalized/prepare.vue'
	import doing from '../../sub_packages/convenientModule/components/beHospitalized/doing.vue'
	import inventory from '../../sub_packages/convenientModule/components/beHospitalized/inventory.vue'
	import guideApi from '@/api/guideApi.js'
	import bus from '@/utils/bus.js'
	import moment from 'moment';
	
	export default {
		components:{
			HeaderBar,
			foot,
			report,
			first,
			check,
			answer,
			prescription,
			prepare,
			doing,
			inventory,
		},
		data() {
			return {
				animationData: {},
				headerEmit:{
					state:'初诊',
					userId:'',
					visitNumber:'',
					orderCode:'',
					userId:'',
				},
				footState:2,
				message:'',
				moveState:true,
				expand:false,
				timer:null,
				convenientState:true,
				departmentList: [],
				signData: uni.getStorageSync("loginData"),
			}
		},
		computed: {
			...mapState({ 
				footData: state => state.footData,
				showState: state => state.showState,
				visitNumber: state => state.department.visitNumber,
			}),
		},
		
		async created() {
			this.departmentList = this.getFirstVisit();
		},
		methods: {
			expandBtn(state){
				this.expand = state
			},
			touchMove(){
				if(this.moveState && (this.headerEmit.state==='查验'||this.headerEmit.state==='回诊') && this.expand){
					this.expand = false
					this.moveState = false
					this.timer = setTimeout(()=> {
						this.moveState = true
						clearTimeout(this.timer)
						this.timer = null
					},1000)
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
						duration: 800,
						timingFunction: 'linear'
					});
					animation.opacity(1).step();
					this.animationData = animation.export();			  
				},0)
			},
			async show(str){
				this.touchMove()
				if(!str) {
					await this.toggle()
				} else {
					this.headerEmit = { state:'', visitNumber:'' }
					setTimeout(()=>{
						this.headerEmit = str
					},0)
				}
			},
			
			//获取是否有挂号
			async getFirstVisit() {
				try{
					let registrationList = []
					let patientID = this.footData.patientUniquelyIdentifies
					
					const res = await guideApi.getFirstVisit(patientID).then((res) => {
						if(res.data.code===200){
							registrationList = res.data.data.orders.order || []
						} else {
							registrationList = []
						}
					})
					console.log(JSON.stringify(registrationList),'registrationList');
					this.getBookingRecord(registrationList)// 当日挂号+预约merge
					
				}catch(e){
					console.log(e)
					//TODO handle the exception
				}
			},
			
			//获取是否有预约数据
			getBookingRecord (registrationList) {
				try{
					let startDate = moment().format('YYYY-MM-DD');
					let edcDate = moment().add('7', 'days').format('YYYY-MM-DD');
					const msg = {
					  patientID: this.footData.patientUniquelyIdentifies, //'0000111227',
					  startTime: startDate,
					  endTime: edcDate
					};
					guideApi.getBookingRecord(msg).then((res) => {
						if (res.data.code === 200) {
							let subscribeList = res.data.data.orders && res.data.data.orders.order.map(item => {
								return {
									...item,
									queueName:item.department,
									doctorName:item.doctor,
								}
							})||[]
							this.departmentList = [...registrationList,...subscribeList]
		console.log(JSON.stringify(registrationList),'registrationList+++++');
							if(this.departmentList.length){
								let found = false
								// 判断存下的visitNumber和数组中有没有匹配的如果没有重新赋值
								this.departmentList.forEach(item=>{
									if (item.visitNumber === this.headerEmit.visitNumber || item.orderCode === this.headerEmit.visitNumber) {
									    found = true;
									}
								})
								if(!found || !this.headerEmit.visitNumber || this.departmentList.length===1){
								    	if(this.departmentList[0].orderCode){
								    		this.headerEmit.orderCode = this.departmentList[0].orderCode
								    	}else {
											this.headerEmit.orderCode = ''
										}
										this.$set(this.headerEmit,'visitNumber',this.departmentList[0].visitNumber || this.departmentList[0].orderCode)
								}
							}else {
								this.barList = []
							}
							
							
						} 
					});
				}catch(e){
					this.toastObj = {
						state:true,
						type:'fail',
						message:e,
					}
				}
			},
		},
		mounted(){
			
		},
	}
</script>

<style lang="less">
	.box{
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
	
		.scroll-Y {
			// margin-top: 30rpx;
			width: 750rpx;
			text-align: center;
		    flex: auto;
			overflow: auto;
			.img {
				height: 100%;
				display: flex;
				align-items: center;
				image {
					width: 60%;
					margin: 0 auto;
				}
			}
			
		}
	}
</style>