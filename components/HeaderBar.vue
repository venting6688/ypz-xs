<template>
	<view class="head" :class="{convenient:footState===2}">
		<image class="background" src="https://aiwz.sdtyfy.com:8099/img/Group.png" mode="widthFix"></image>
		<view class="text">
			<view class="title">您好！"安好" 为您服务</view>
			<view class="news">
				{{ animatedText.slice(0,39) }}
			</view>
		</view>
		<view class="dist">
			<ul  v-if="footState===2 && (departmentList.length || hospitalRecord.length)">
				<li v-if="departmentList.length" v-for="(item,index) in departmentList" :key="index">
					<view class="test" @click="departmentBtn(item,index)"  :class="{ barBackground: headerEmit.visitNumber==item.visitNumber || headerEmit.visitNumber == item.orderCode }">
						<view>{{item.queueName?item.queueName.replace('门诊',''):''}}</view>
						<view>{{item.doctorName?item.doctorName:''}}</view>
					</view>
					<view class="wire"></view>
				</li>
			</ul>
		</view>
		<view class="bar" v-if="footState===2">
			<view v-for="(item,index) in barList" @click="throttle_btns(index, item.number, item.type)" class="barList" :key="index">
				<view class="bar-name"  :class="{ barColor:item.number==1 }">
					<view>
						<text :class="{ barBackground: item.state==item.name }">{{ item.name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import HeaderbarApi from '@/api/HeaderbarApi.js'
	import guideApi from '@/api/guideApi.js'
	import mixin from '@/mixins/mixin'
	import bus from "@/utils/bus.js";
	import {mapState,mapMutations} from 'vuex'
	
export default {
	props:{
		footState:Number,
		data: {
			type: Array,
			default: () => []
		}
	},
	mixins: [mixin],
	data() {
		return {
			barListData:null,
			barList: [],
			hospitalizedBarList:[],
			headerEmit:{
				visitNumber:'',
				orderCode:'',
				userId:'',
				state:'',
			},
			animatedText: '',
			interval: null,
			nanbers: null,
			departmentList:[],
			hospitalRecord:[],
			userId:'',
			userIdList:[],
			throttle_btns:null,
			index:0,
			timer:null,
		}
	},
	watch: {
		"data": {
			immediate: true,
			handler(newVal) {
				if (newVal.length > 0) {
					this.departmentList = newVal;
				}
			}
		},
		
		'headerEmit.visitNumber': {
			handler: function (newVal, oldVal) {
				let msg = {
					length: this.departmentList.length,
					data: this.departmentList[this.index],
					visitNumber:newVal,
				}
				this.setDepartment(msg)
				if(oldVal){
					this.getTreatmentStageNew(3)
				}
			},
		},
	},
	computed: {
		...mapState(['footData','department']),
	},
	async created() {
		if(this.footState===2 && uni.getStorageSync("loginData") != ''){
			//接收到数据之后进行处理
			if(this.departmentList.length) {
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
				
				let msg = {
					length: this.departmentList.length,
					data: this.departmentList[this.index],
					visitNumber: this.departmentList[this.index].visitNumber,
				}
				this.setDepartment(msg)
			}
			
			this.getTreatmentStageNew(3)
			this.animateText()
		}
	},
	beforeDestroy() {
		if(this.footState){
			bus.$off('refreshGetFirstVisit')
			clearInterval(this.interval)
			clearInterval(this.timer)
			this.timer = null
		}
		
	},
	mounted() {
		this.throttle_btns = this.throttle(this.btns, 1200)
	},
	methods: {
		...mapMutations({
			setDepartment:'SET_DEPARTMENT',
		}),
		//获取就诊阶段(上方横条)
		async getTreatmentStageNew(state) {
			try{
				//住院服务横条
				if (this.department.data && this.department.data.isHospitalized && this.departmentList.length) {
					let data = {
						data:{
							'住院信息':'1',
							'住院事项':'0',
							'住院日清单':'0',
						}
					}
					this.barList = [];
					for (let key in data.data) {
					  this.barList.push({name: ' ', number: data.data[key], state:false, type: 'hospitalization'},{name: key, number: data.data[key], state:false, type: 'hospitalization'});
					}
					this.barList.shift()
					
					let lastIndex = this.barList.findLastIndex(item => item.number === '1');
					
					if(lastIndex>=0){
						this.barList[lastIndex].state=this.barList[lastIndex].name
						this.$set(this.headerEmit,'state',this.barList[lastIndex].name)
					}
					this.$emit('handle',this.headerEmit)
				} else {
					if(!this.headerEmit.orderCode){
						let data = {
							visitNumber:this.headerEmit.visitNumber,
							patientID: this.footData.patientUniquelyIdentifies, 
							departmentCode:(this.department.data && this.department.data.queueId)||'',
						}
						const res = await HeaderbarApi.getTreatmentStageNew(data,state).then((res) => {
							if(res.data.code === 200){
								if (this.barListData===null || JSON.stringify(res.data.data) !== JSON.stringify(this.barListData)) {
									this.barListData = res.data.data;
									this.barList = []
									for (let key in res.data.data) {
									  this.barList.push({name: '》》', number: res.data.data[key],state:false, type: 'outpatient'},{name: key, number: res.data.data[key],state:false, type: 'outpatient'});
									}
									this.barList.shift()
									let lastIndex = this.barList.findLastIndex(item => item.number === '1');
									if(lastIndex>=0){
										this.barList[lastIndex].state=this.barList[lastIndex].name
										this.$set(this.headerEmit,'state',this.barList[lastIndex].name)
									}
									this.$emit('handle',this.headerEmit)
								} 
							}
						})
					} else {
						let data = [
								{
									name:'预约',
									number:'1',
									state:'预约',
									type: 'outpatient'
								}
							]
						if (this.barListData===null || JSON.stringify(data) !== JSON.stringify(this.barListData)) {
							this.barListData = data
							this.barList = data
							this.$set(this.headerEmit,'state','初诊')
							this.$emit('handle',this.headerEmit)
						}
					}
				}
				
			}catch(e){
				console.log(e);
			}
		},
		btns(i, num, type) {
			if (type == 'outpatient') {
				if(i % 2 === 0 && num ==1){
					this.barList.forEach((v,x)=>{
						if(i==x){
							v.state = v.name
							if(v.name==='预约'){
								this.headerEmit.state = '初诊'
							}else{
								this.headerEmit.state = v.name
							}
						}else {
							v.state = false
						}
					})
					this.$emit('handle',this.headerEmit)
				} else {
					return
				}
			} else {
				this.barList.forEach((v,x)=>{
					if(i==x){
						v.state = v.name
						this.headerEmit.state = v.name
					} else {
						v.state = false
					}
				})
				this.$emit('handle',this.headerEmit)
			}
			
		},
		//切换科室
		departmentBtn(item,index){
			if(item.visitNumber){
				if(this.headerEmit.visitNumber !== item.visitNumber){
					this.barListData=null
					this.headerEmit.visitNumber = item.visitNumber
					this.headerEmit.orderCode = ''
					this.index = index
				}
			}else {
				if(this.headerEmit.visitNumber !== item.orderCode){
					this.barListData=null
					this.headerEmit.visitNumber = item.orderCode
					this.headerEmit.orderCode = item.orderCode
					this.index = index
				}
			}
		},
		animateText() {
			if (this.interval) {
				clearInterval(this.interval)
			}
		}
	},
	
}
</script>

<style lang="less">
	.convenient {
		height: 397rpx !important;
	}
.head {
	position: relative;
	flex: 0 0 auto;
	width: 100%;
	min-height: 325rpx;
	.text {
		position: absolute;
		width: 480rpx;
		color: #ffffff;
		font-weight: 600;
		margin: 46rpx 0 0 32rpx;

		.title {
			font-size: 32rpx;
		}

		.news {
			margin-top: 10rpx;
			font-size: 37rpx;
		}
	}

	.background {
		display: block;
		position: absolute;
		height: 325rpx;
		width: 100%;
	}

	.icon {
		position: absolute;
		top: 10rpx;
		left: 340rpx;
		width: 100rpx;
		height: 44rpx;
	}
	.dist {
		width: 100%;
		transform: translate(0,232rpx);
		display: flex;
		overflow: auto;
		white-space: nowrap;
		padding:0 30rpx 10rpx 30rpx;
		>ul {
			display: flex;
			align-items: center;
			margin:0 6rpx;
			
			li {
				background: #edfeff;
				border-top: 2rpx solid #499eff;
				border-bottom: 2rpx solid #499eff;
				// padding:0 6rpx;
				height: 78rpx;
				display: flex;
				align-items: center;
				&:first-child{
					padding-left:3rpx;
					border-radius: 32rpx 0 0 32rpx;
				}
				&:last-child{
					padding-right:3rpx;
					border-radius: 0 32rpx 32rpx 0;
				}
				&:only-child{
					padding: 0 3rpx;
					border-radius: 32rpx;
				}
				.test {
					min-width: 160rpx;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					align-items: center;
					padding: 0 18rpx;
				    height: 71rpx;
				    margin:  0;
				    border-radius: 32rpx;
				    font-size: 28rpx;
					line-height: 28rpx;
				    font-weight: 400;
				  
			    }
				.wire {
					width: 2rpx;
					height: 56rpx;
					margin: 0 6rpx;
					background: #cacaca;
				}
				&:last-child{
					.wire {
						margin: 0;
						width: 0;
					}
					
				}
			}
		}
			
	}
	.bar {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 72rpx;
		background: rgba(255, 255, 255, 0.82);
		box-shadow: 0rpx 4rpx 8rpx 0rpx rgba(31, 104, 135, 0.14);
		// filter: blur(40rpx);
		display: flex;
		justify-content: space-around;
		align-items: center;
		color: #888888;

		.barList {
			display: flex;
			justify-content: center;
			width: 100%;
			&:nth-of-type(even){
				max-width: 60rpx;
				 .bar-name {
					 >view {
						  >text {
							  padding: 0;
							  padding: 0 0 0 15rpx;
				 }
					 }
				 }
				
			}
			.bar-name {
				display: flex;
				justify-content: center;
				align-items: center;
				text-align: center;
				width: 70%;
				height: 60rpx;
				
				>view {
					display: flex;
					align-items: center;
					white-space: nowrap;
					justify-content: center;
					height: 52rpx;
					font-size: 32rpx;
					line-height: 32rpx;
					
					>text {
						border-radius: 10rpx;
						padding: 10rpx 20rpx;
						// width: 110rpx;
					}
				}
				
				
				.icons {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 30%;
					background: #222;
					font-size: 28rpx;
					height: 60rpx;
					letter-spacing: -10rpx;
				
					text {
						display: block;
						line-height: 28rpx;
					}
				}
			}
			
		}
	}
	// .barColor {
	// 	color: #0f74c8 !important;
	// }
	.barBackground {
		background: #1b98ff !important;
		color: #ffffff;
	}
}
</style>
