<template>
	<view class="box">
		<!-- 头文件 -->
		<HeaderBar 
			@handle="show" 
			v-if="showState && departmentList != undefined && departmentList.length > 0" 
			:footState="footState" 
			:data="departmentList" 
		/>
		<HeaderBar
			@handle="show" 
			v-if="showState && departmentList == undefined || departmentList.length == 0" 
			:footState="footState" 
			:data="departmentList" 
		/>
		<!-- 预约、挂号部分 -->
		<view v-if="showState && departmentList != undefined && departmentList.length > 0 && ['初诊','查验','回诊','处方'].includes(headerEmit.state)" class="scroll-Y" :animation="animationData" @touchmove='touchMove'>
			<first @handle="show" v-if="headerEmit.state=='初诊'" :emit="headerEmit" ref="firstCom" />
		  <check @handle="show" v-if="headerEmit.state=='查验'" :headerEmit="headerEmit" />
			<answer @handle="show" v-if="headerEmit.state=='回诊'" :headerEmit="headerEmit" />
			<prescription @handle="show" v-if="headerEmit.state=='处方'" :headerEmit="headerEmit" />
		</view>
		<!-- 住院部分 -->
		<view class="scroll-Y" v-if="hospitalRecord != undefined && hospitalRecord.length && ['住院信息','住院事项','住院日清单'].includes(headerEmit.state)">
			<prepare v-if="headerEmit.state=='住院信息'" :headerEmit="headerEmit" />
			<doing v-if="headerEmit.state=='住院事项'" :headerEmit="headerEmit" />
			<inventory v-if="headerEmit.state=='住院日清单'" :headerEmit="headerEmit" />
		</view>
		<!-- 没有数据 -->
		<view class="img scroll-Y" v-if="!signData || departmentList == undefined || departmentList.length == 0">
			<image src="../../static/image/wu.png" mode="widthFix" />
		</view>
	</view>
</template>
<script>
	import {mapState, mapMutations} from 'vuex'
	import HeaderBar from '@/components/HeaderBar.vue';
	import first from '../../sub_packages/convenientModule/components/outpatient/first.vue'
	import check from '../../sub_packages/convenientModule/components/outpatient/check.vue'
	import answer from '../../sub_packages/convenientModule/components/outpatient/answer.vue'
	import prescription from '../../sub_packages/convenientModule/components/outpatient/prescription.vue'
	import prepare from '../../sub_packages/convenientModule/components/beHospitalized/prepare.vue'
	import doing from '../../sub_packages/convenientModule/components/beHospitalized/doing.vue'
	import inventory from '../../sub_packages/convenientModule/components/beHospitalized/inventory.vue'
	import hospitalizationApi from '@/api/hospitalizationApi.js';
	import guideApi from '@/api/guideApi.js'
	import bus from '@/utils/bus.js'
	import dayjs from 'dayjs';
	
	export default {
		components:{
			HeaderBar,
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
				moveState:true,
				expand:false,
				timer:null,
				convenientState:true,
				signData: uni.getStorageSync("loginData"),
				departmentList: [],
				hospitalRecord: [{
					queueName: '',
					orderCode: '',
					isHospitalized: false,
					doctorName: '住院'
				}],
				isRequest: false,
				firstState: false,
				effectState: false,
				isHospitalRecord: false
			}
		},
		computed: {
			...mapState({ 
				footData: state => state.footData,
				showState: state => state.showState,
				visitNumber: state => state.department.visitNumber,
				department: state => state.department,
			}),
		},
		onShow() {
			if (this.$refs.firstCom && this.$refs.firstCom.getPreConsultation) {
				this.$refs.firstCom.getPreConsultation(); // 调用组件方法
			}
		},
		async created() {
			this.departmentList = this.getFirstVisit();
			this.$store.watch(
				state => state.showState,(newVal, oldVal) => {
					this.isRequest = true;
					this.firstState = true;
					this.effectState = true;
					this.departmentList = this.getFirstVisit();
				}
			);
			if(this.footState === 2 && uni.getStorageSync("loginData") != ''){
				bus.$on('refreshGetFirstVisit',(data)=>{
					if(data.callingInterface){
						// 取消挂号或取消预约后马上调用接口更新数据
						this.isRequest = true;
						this.firstState = data.firstState;
						this.effectState = data.effectState;
						this.getFirstVisit(data)
					} else{
						this.refreshData(data)
					}
				})
			}
		},
		methods: {
			...mapMutations({
				setDepartment:'SET_DEPARTMENT',
			}),
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
			
			refreshData(data){
				let msg = {
					data:this.departmentList,
					effectState:data.effectState,
				}
				bus.$emit('complex-data-passed',msg)
			},
			//获取是否有挂号
			async getFirstVisit() {
				try{
					let registrationList = []
					let patientID = this.footData.patientUniquelyIdentifies
					
					const res = await guideApi.getFirstVisit(patientID).then((res) => {
						if(res.data.code === 200){
							registrationList = res.data.data.orders.order || [];
							registrationList.map((v) => {
								v.isHospitalized = false;
								return v;
							})
						} else {
							registrationList = [];
						}
					})
					//获取住院、预住院信息
					let preHospitalization = await this.getAppointment();
					this.hospitalRecord = preHospitalization;
					this.getBookingRecord(registrationList, this.hospitalRecord)// 当日挂号+预约merge
					
				} catch(e){
					console.log(e);
				}
			},
			
			//获取预住院信息
			async getAppointment () {
				let id = this.footData.patientUniquelyIdentifies
				let res = await hospitalizationApi.getHospitalization(id);
				this.hospitalRecord = [];
				if (res.data.code === 200) {
					this.hospitalRecord = [{
						queueName: res.data.data && res.data.data.admInfo != undefined ? res.data.data.admInfo.admWardDesc : '',
						orderCode: res.data.data.ipBook,
						isHospitalized: true,
						doctorName: '住院',
					}];
					return this.hospitalRecord;
				} else {
					return this.getHospitalRecord();
				}
			},
			//获取住院信息
			async getHospitalRecord () {
				let data = {
					AimFlag: 'Dep',
					patientID: this.footData.patientUniquelyIdentifies
				}
				
				let res = await hospitalizationApi.getHospitalRecord(data);
				this.hospitalRecord = [];
				if (res.data.code === 200 && res.data.data.admInfoList != undefined) {
					this.hospitalRecord = [{
						queueName: res.data.data.admInfoList.admInfo[0].admDept,
						orderCode: res.data.data.admInfoList.admInfo[0].admID,
						isHospitalized: true,
						doctorName: '住院',
					}];
				}
				return this.hospitalRecord;
			},
			
			//获取是否有预约数据
			getBookingRecord (registrationList, list) {
				try{
					let startDate = dayjs().format('YYYY-MM-DD');
					let edcDate = dayjs().add('7', 'days').format('YYYY-MM-DD');
					const msg = {
					  patientID: this.footData.patientUniquelyIdentifies, //'0000111227',
					  startTime: startDate,
					  endTime: edcDate
					};
					let subscribeList = [];
					guideApi.getBookingRecord(msg).then((res) => {
							if (res.data.code === 200) {
								subscribeList = res.data.data.orders && res.data.data.orders.order.map(item => {
									return {
										...item,
										queueName:item.department,
										doctorName:item.doctor,
										isHospitalized: false,
									}
								}) || []
							} 
							this.departmentList = [];
							this.departmentList = [...registrationList,...subscribeList];
							
							if (list != undefined && list.length > 0 && list[0].queueName != '') {
								this.departmentList.push(list[0]);
							}
							if (this.isRequest && this.departmentList.length) {
 									let found = false
									// 判断存下的visitNumber和数组中有没有匹配的如果没有重新赋值
									this.departmentList.forEach(item => {
										if (item.visitNumber === this.headerEmit.visitNumber || item.orderCode === this.headerEmit.visitNumber) {
										  found = true;
										}
									})
									if(!found || !this.headerEmit.visitNumber || this.departmentList.length===1) {
										if(this.departmentList[0].orderCode){
											this.headerEmit.orderCode = this.departmentList[0].orderCode
										} else {
											this.headerEmit.orderCode = ''
										}
										this.$set(this.headerEmit,'visitNumber',this.departmentList[0].visitNumber || this.departmentList[0].orderCode)
									}
									
									let number = '';
									if (this.departmentList[0].visitNumber != undefined) {
										number = this.departmentList[0].visitNumber
									} else {
										number = this.departmentList[0].orderCode
									}
									
									let msg = {
										length: this.departmentList.length,
										data: this.departmentList[0],
										visitNumber: number,
									}
									this.setDepartment(msg)
									if(this.firstState){
										let data = {effectState: this.effectState}
										this.refreshData(data)
									}
							}
					})
				} catch(e) {
					this.toastObj = {
						state:true,
						type:'fail',
						message:e,
					}
				}
			}
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
			width: 750rpx;
			text-align: center;
			flex: auto;
			overflow: auto;
			.img {
				height: 100%;
				display: flex;
				align-items: center;
			}
			image {
				width: 75%;
			}
		}
		
	}
</style>