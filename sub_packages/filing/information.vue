<template>
	<view class="information">
		<form>
			<view class="cu-form-group">
				<view class="x">*</view>
				<view class="title">姓名</view>
				<input v-model="informationObj.name" placeholder="请输入" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="x">*</view>
				<view class="title">手机号码</view>
				<input v-model="informationObj.phone1" placeholder="请输入" name="input" maxlength="11" />
			</view>
			<view class="cu-form-group">
				<view class="x">*</view>
				<view class="title">证件类型</view>
				<picker mode="selector" :value="informationObj.idType" :range="cardTypeValue" @change="onIdTypeChange">
					<text class="picker birth">{{selectedIdType}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="x">*</view>
				<view class="title">证件号码</view>
				<input v-model="informationObj.idNumber" placeholder="请输入" name="input" @input="parseIdCard" maxlength="18" />
			</view>
			<view class="cu-form-group">
				<view class="title">性别</view>
				<picker mode="selector" :value="informationObj.gender" :range="sexs" @change="onSexChange">
					<text class="picker birth">{{selectedSex}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">出生日期</view>
				<picker mode="date" :value="informationObj.birthday" :start="startDate" :end="endDate" fields="day" @change="bindDateChange">
				    <text class="picker birth">{{informationObj.birthday}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">婚姻</view>
				<picker mode="selector" :value="informationObj.marriage" :range="marriage" @change="onSexChange">
					<text class="picker birth">{{selectedMarriage}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="x">*</view>
				<view class="title">民族</view>
				<picker mode="selector" :value="informationObj.nation" :range="nations" @change="onNationChange">
					<text class="picker birth">{{selectedNation}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">职业</view>
				<picker mode="selector" :value="informationObj.career" :range="careerValue" @change="onCareerChange">
					<text class="picker birth">{{selectedCareer}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">现住址</view>
				<picker mode="region" @change="chooseregion" :value="provincesAndMunicipalities">
					<view class="picker">
						<text>{{ provincesAndMunicipalities }}</text>
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">现住址具体地址</view>
				<input v-model="informationObj.currentAddress" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">籍贯</view>
				<picker mode="region" @change="changeNativePlace" :value="selectedNativePlace">
					<view class="picker">
						<text>{{ selectedNativePlace }}</text>
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">户口地址</view>
				<picker mode="region" @change="changeHousehold" :value="selectedHouseholdAddress">
					<view class="picker">
						<text>{{ selectedHouseholdAddress }}</text>
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">户口具体地址</view>
				<input v-model="informationObj.householdAddress" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">出生地址</view>
				<picker mode="region" @change="changeHousehold" :value="selectedBirthplace">
					<view class="picker">
						<text>{{ selectedBirthplace }}</text>
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">出生地具体地址</view>
				<input v-model="informationObj.birthplace" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人姓名</view>
				<input v-model="informationObj.contactName" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人电话</view>
				<input v-model="informationObj.contactPhone" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人证件号</view>
				<input v-model="informationObj.contactIdNum" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人证件类型</view>
				<picker mode="selector" :value="informationObj.contactIdType" :range="cardTypeValue" @change="changeIdType">
					<text class="picker birth">{{selectedContactIdType}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">与联系人关系</view>
				<picker mode="selector" :value="informationObj.relation" :range="relation" @change="onRelationChange">
					<text class="picker birth">{{selectedRelation}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">联系人地址</view>
				<picker mode="region" @change="changeContactAddress" :value="selectedContactAddress">
					<view class="picker">
						<text>{{ selectedContactAddress }}</text>
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">联系人具体地址</view>
				<input v-model="informationObj.contactAddress" name="input" />
			</view>
		</form>
		<view 
		class="confirm" 
		@click="Filing" 
		:class="{unclickable: !informationObj.occupation || !informationObj.patientType || !informationObj.phone || !informationObj.verificationCode }"
		>
			修改信息
		</view>
	</view>
</template>
<script>
	import login from '../../utils/login';
import filingApi from '@/api/filingApi.js'
	import { mapState } from 'vuex'
	
	export default {
		computed: {
			...mapState(['footData']),
		},
		data(){
			return {
				informationObj:{
					name:'',
					gender:'',
					nation:'', //民族
					birthday:'',
					idType: '',
					idNumber:'',
					phone1:'',
					relation:'',
					career: '',
					patientType: 0,
					verificationCode:'',
					openId: '',
					currentAddress: '',
					householdAddress: '',
					birthplace: '',
					contactName: '',
					contactPhone: '',
					contactIdNum: '',
					contactIdType: '',
					contactRelation: '',
					contactAddress: '',
				},
				address: '',
				provincesAndMunicipalities: ['山东省','济南市','历下区'],
				nations: [
					'汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族',
					'满族', '侗族', '瑶族', '白族', '土家族', '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族',
					'傈僳族', '仡佬族', '东乡族', '高山族', '拉祜族', '水族', '佤族', '纳西族', '羌族', '土族',
					'佤族', '畲族', '高山族', '拉祜族', '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族',
					'土族', '达斡尔族', '仫佬族', '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族', '阿昌族',
					'普米族', '塔吉克族', '怒族', '乌孜别克族', '俄罗斯族', '鄂温克族', '德昂族','保安族','裕固族',
					'京族','塔塔尔族','独龙族','鄂伦春族','赫哲族','门巴族','珞巴族','基诺族'
				],
				cardType: [
					{index: '01', value: '居民身份证'},
					{index: '02', value: '居民户口簿'},
					{index: '03', value: '护照'},
					{index: '04', value: '军官证'},
					{index: '05', value: '驾驶证'},
					{index: '06', value: '港澳居民来往内地通行证	'},
					{index: '07', value: '台湾居民来往内地通行证'},
					{index: '08', value: '出生医学证明'},
					{index: '15', value: '外国人永久居留身份证'},
					{index: '16', value: '新生儿证件（3个月无证件儿童）'},
					{index: '17', value: '港澳台居民居住证'},
					{index: '99', value: '其他法定有效证件	'},
				],
				cardTypeValue: [
					'居民身份证','居民户口簿','护照','军官证','驾驶证','港澳居民来往内地通行证	',
				  '台湾居民来往内地通行证','出生医学证明','外国人永久居留身份证','新生儿证件（3个月无证件儿童）',
					'港澳台居民居住证','其他法定有效证件'
				],
				sexs: ['男', '女'],
				marriage: ['未婚','已婚','丧偶','离婚'],
				relation:['本人','父母','子女','夫妻', '亲属', '朋友', '其他'],
				careerValue: [
					'国家公务员', '专业技术人员', '职员', '企业管理人员', '工人', '农民', '学生', 
				  '现役军人', '自由职业者', '个体经营者', '无业人员', '退（离）休人员', '其他'
				],
				career: [
					{index: '11', value: '国家公务员'},
					{index: '13', value: '专业技术人员'},
					{index: '17', value: '职员'},
					{index: '21', value: '企业管理人员'},
					{index: '24', value: '工人'},
					{index: '27', value: '农民'},
					{index: '31', value: '学生'},
					{index: '37', value: '现役军人'},
					{index: '51', value: '自由职业者'},
					{index: '54', value: '个体经营者'},
					{index: '70', value: '无业人员'},
					{index: '80', value: '退（离）休人员'},
					{index: '90', value: '其他'},
				],
				selectedSex: '',
				selectedIdType: '',
				selectedNation: '',
				selectedRelation: '',
				selectedCareer: '',
				selectedContactIdType: '',
				selectedHouseholdAddress: ['山东省','济南市','历下区'],
				selectedBirthplace: ['山东省','济南市','历下区'],
				selectedNativePlace: ['山东省','济南市','历下区'],
				selectedContactAddress: ['山东省','济南市','历下区'],
			}
		},
		onLoad() {
			let loginVal = uni.getStorageSync("loginData");
			loginVal = loginVal ? JSON.parse(loginVal) : {};
			let defaultArchives = loginVal.defaultArchives;
			if (JSON.stringify(loginVal) != "{}" && defaultArchives != undefined) {
				this.informationObj = {
					name: defaultArchives.patientName,
					gender: defaultArchives.sex,
					idType: defaultArchives.idTypeDesc,
					idNumber: defaultArchives.idNum,
					patientTypeDesc: defaultArchives.patientTypeDesc,
					birthday: defaultArchives.dob,
					phone1: defaultArchives.phoneNum,
					relation: defaultArchives.relation,
				}
				this.selectedIdType = this.informationObj.idType;
				this.selectedRelation = this.informationObj.relation;
				this.selectedSex = this.informationObj.gender;
			}
		},
		methods: {
			//选择日期
			bindDateChange(e) { 
				this.informationObj.birthday = e.detail.value
			},
			//省市区
			chooseregion(event){
				this.provincesAndMunicipalities = event.detail.value.toString();
			},
			changeNativePlace(event){
				this.selectedNativePlace = event.detail.value.toString();
			},
			changeHousehold(event){
				this.selectedHouseholdAddress = event.detail.value.toString();
			},
			// chooseregion(event){
			// 	this.provincesAndMunicipalities = event.detail.value.toString();
			// },
			// chooseregion(event){
			// 	this.provincesAndMunicipalities = event.detail.value.toString();
			// },
			//性别
			onSexChange(e) {
				const index = e.detail.value
				this.selectedSex = this.sexs[index]
				this.informationObj.gender = this.selectedSex;
			},
			//民族
			onNationChange(e) {
				const index = e.detail.value
				this.selectedNation = this.nations[index]
				this.informationObj.nation = this.selectedNation;
			},
			//证件类型
			onIdTypeChange(e) {
				const index = e.detail.value;
				let val = this.cardTypeValue[index];
				let filter = this.cardType.filter(x => x.value == val);
				this.selectedIdType = val;
				this.informationObj.idType = filter[0].index;
			},
			//家庭关系
			onRelationChange(e) {
				const index = e.detail.value
				this.selectedRelation = this.relation[index]
				this.informationObj.relation = index;
			},
			//职业
			onCareerChange(e) {
				const index = e.detail.value;
				let val = this.careerValue[index];
				let filter = this.career.filter(x => x.value == val);
				this.selectedCareer = val;
				this.informationObj.career = filter[0].index;
			},
			// 获取验证码
			verificationCodeBtn(){
				this.verificationCodeState = true
				this.count(60)
				filingApi.sendVerificationCode(this.informationObj.phone).then(res => {
				})
				.catch(err => {
					console.log('2：', err);
				})
				
			},
			Filing(){
				let loginValue = uni.getStorageSync("loginData");
				let loginData = JSON.parse(loginValue)
				this.informationObj.cloudUser = loginData
				
				if (!this.informationObj.occupation ||!this.informationObj.patientType ||!this.informationObj.phone || !this.informationObj.verificationCode) {
				    uni.showToast({
				        title: '请完善您的信息',
				        icon: 'none',   
				        duration: 2000 
				    })
				} else {
					filingApi.Filing(this.informationObj).then(res => {
						if(res.data.code===200){
							uni.showToast({
								title: '建档成功',
								duration: 2000
							});
							this.setFootData(res.data.data.defaultArchives)
							this.setLoginStatus('login');
							uni.setStorageSync('loginData', JSON.stringify(res.data.data))
							setTimeout(()=>{
								uni.switchTab({url:`/pages/home/index`})
							},2000)
						}else{
							uni.showToast({
							    title: res.data.msg,
							    icon: 'none',   
							    duration: 3000 
							})
						}
						
					})
					.catch(err => {
						console.log('2：', err);
					})
				}
				
				
			},
			count(time) {
			    if (time) {
			        this.time = time
			    }
			    if (this.time < 2) {
			        this.verificationCodeState = false
			        this.time = 60 
			        
			    } else {
			        this.time--
			        if (this.countTimer) clearTimeout(this.countTimer)
			        this.countTimer = setTimeout(() => {
			            this.count()
			        }, 1000)
			    }
			},
		}
	}
</script>

<style lang="less" scoped>
	.unclickable{
		background: #beccff !important;
	}
	
	.information {
		width: 100vw;
		height: 100%; 
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
		
		.authorization {
			font-size: 26.72rpx;
			text-align: center;
			color: #4286ff;
			margin: 20rpx 0;
		}
		.bar {
			margin: 0 30rpx;
			display: flex;
			justify-content: space-between;
			
			view {
				width: 118.32rpx;
				height: 72.52rpx;
				background: #ffffff;
				border-radius: 11.45rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 26.72rpx;
				font-weight: 500;
				color: #000000;
				line-height: 26.72rpx;
			}
			.b {
				background: #4286ff !important;
				color: #ffffff !important;
			}
			
		}
		form {
			margin:30rpx;
			overflow: auto;
			
			.cu-form-group {
				min-height: 86rpx;
				.title {
					width: 160rpx;
				}
				.answer {
					color: #999999;
				}
				.birth{
					height: 86rpx;
					display: inline-block;
					text-align: left;
					width: 420rpx;
					color: #999999;
				}
				.verificationCode {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 148.85rpx;
					height: 49.62rpx;
					border: 1.91rpx solid #4286ff;
					border-radius: 30.53rpx;
					font-size: 22.9rpx;
					color: #4286ff;
					line-height: 22.9rpx;
				}
				.x {
					color: red;
					margin-right: 10rpx;
				}
			}
		}
		
		.tips {
			font-size: 26.72rpx;
			color: #333333;
			margin: 0 30rpx;
			
			.tips-title {
				margin-bottom: 20rpx;
			}
			.center {
				view {
					font-size: 22.9rpx;
					color: #333333;
					margin: 15rpx 0;
				}
			}
		}
		.confirm {
			width: 681.3rpx;
			height: 87.79rpx;
			background: #4286ff;
			border-radius: 43.89rpx;
			margin:30rpx auto 60rpx auto;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 30.53rpx;
			font-family: PingFang SC, PingFang SC-600;
			font-weight: 600;
			color: #ffffff;
			line-height: 30.53rpx;
			
		}
	}
</style>