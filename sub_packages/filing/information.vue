<template>
	<view class="information">
		<form>
			<view class="cu-form-group">
				<view class="title">姓名</view>
				<text>{{informationObj.patientName}}</text>
			</view>
			<view class="cu-form-group">
				<view class="title">手机号码</view>
				<input v-model="informationObj.phoneNum" placeholder="请输入" name="input" maxlength="11" />
			</view>
			<view class="cu-form-group">
				<view class="title">证件类型</view>
				<text>{{informationObj.idType}}</text>
			</view>
			<view class="cu-form-group">
				<view class="title">证件号码</view>
				<text>{{informationObj.idNum}}</text>
			</view>
			<view class="cu-form-group">
				<view class="title">性别</view>
				<picker mode="selector" :value="informationObj.sex" :range="sexs" @change="onSexChange">
					<text class="picker birth">{{selectedSex}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">出生日期</view>
				<picker mode="date" :value="informationObj.dob" :start="startDate" :end="endDate" fields="day" @change="bindDateChange">
				    <text class="picker birth">{{informationObj.dob}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">婚姻</view>
				<picker mode="selector" :value="informationObj.marriage" :range="marriageVal" @change="onMarriageChange">
					<text class="picker birth">{{selectedMarriage}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">民族</view>
				<picker mode="selector" :value="informationObj.nationality" :range="nations" @change="onNationChange">
					<text class="picker birth">{{selectedNation}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">职业</view>
				<picker mode="selector" :value="informationObj.occupation" :range="careerValue" @change="onCareerChange">
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
				<input v-model="informationObj.currentAddressDetail" name="input" />
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
				<input v-model="informationObj.hukouAddressDetail" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">出生地址</view>
				<picker mode="region" @change="changeBirthplace" :value="selectedBirthplace">
					<view class="picker">
						<text>{{ selectedBirthplace }}</text>
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">出生地具体地址</view>
				<input v-model="informationObj.birthplaceDetail" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人姓名</view>
				<input v-model="informationObj.contactPersonName" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人电话</view>
				<input v-model="informationObj.contactPersonPhone" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人证件号</view>
				<input v-model="informationObj.contactPersonIdNumber" name="input" />
			</view>
			<view class="cu-form-group">
				<view class="title">联系人证件类型</view>
				<picker mode="selector" :value="informationObj.contactIdType" :range="cardTypeVal" @change="onIdTypeChange">
					<text class="picker birth">{{selectedContactIdType}}</text>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">与联系人关系</view>
				<picker mode="selector" :value="informationObj.relation" :range="relationVal" @change="onRelationChange">
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
				<input v-model="informationObj.contactPersonAddressDetail" name="input" />
			</view>
		</form>
		<view class="btnStyle bigBtn" @click="Filing">修改信息</view>
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
				siginVal: {},
				informationObj:{
					patientName:'',
					sex:'',
					nationality:'',
					marriage: '',
					dob:'',
					idType: '',
					idNum:'',
					phoneNum:'',
					relation:'',
					occupation: '',
					patientType: 0,
					verificationCode:'',
					openId: '',
					currentAddressDetail: '',
					hukouAddressDetail: '',
					birthplaceDetail: '',
					contactPersonName: '',
					contactPersonPhone: '',
					contactPersonIdNumber: '',
					contactIdType: '',
					contactRelation: '',
					contactPersonAddressDetail: '',
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
				cardTypeVal: [],
				cardType: [],
				sexs: ['男', '女'],
				marriageVal: [],
				marriage: [],
				relationVal:[],
				relation: [],
				careerValue: [],
				career: [],
				selectedSex: '',
				selectedIdType: '',
				selectedNation: '',
				selectedRelation: '',
				selectedCareer: '',
				selectedContactIdType: '',
				selectedMarriage: '',
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
			this.siginVal = defaultArchives;
			
			if (JSON.stringify(loginVal) != "{}" && defaultArchives != undefined) {
				this.informationObj = {
					patientName: defaultArchives.patientName,
					sex: defaultArchives.sex,
					idType: defaultArchives.idTypeDesc,
					idNum: defaultArchives.idNum,
					hukouAddressDetail: defaultArchives.hukouAddressDetail,
					birthplaceDetail: defaultArchives.birthplaceDetail,
					currentAddressDetail: defaultArchives.currentAddressDetail,
					contactPersonName: defaultArchives.contactPersonName,
					contactPersonPhone: defaultArchives.contactPersonPhone,
					contactPersonIdNumber: defaultArchives.contactPersonIdNumber,
					contactPersonIdType: defaultArchives.contactPersonIdType,
					contactPersonAddressDetail: defaultArchives.contactPersonAddressDetail,
					dob: defaultArchives.dob,
					phoneNum: defaultArchives.phoneNum,
					relation: defaultArchives.relationshipWithContact,
				}
				this.selectedIdType = this.informationObj.idType;
				this.selectedSex = this.informationObj.sex;
				this.selectedMarriage = defaultArchives.marriage ? defaultArchives.marriage : '';
				this.selectedNation = defaultArchives.nationality ? defaultArchives.nationality : '';
				this.selectedCareer = defaultArchives.occupation ? defaultArchives.occupation : '';
				
				let hukouAddress = defaultArchives.hukouAddress;
				this.selectedHouseholdAddress = hukouAddress ? hukouAddress.split(',') : ['山东省','济南市','历下区'];
				let birthplace = defaultArchives.birthplace;
				this.selectedBirthplace = birthplace ? birthplace.split(',') : ['山东省','济南市','历下区'];
				let jiguan = defaultArchives.jiguan;
				this.selectedNativePlace = jiguan ? jiguan.split(',') : ['山东省','济南市','历下区'];
				let currentAddress = defaultArchives.currentAddress;
				this.provincesAndMunicipalities = currentAddress ? currentAddress.split(',') : ['山东省','济南市','历下区'];
				let contactPersonAddress = defaultArchives.contactPersonAddress;
				this.selectedContactAddress = contactPersonAddress ? contactPersonAddress.split(',') : ['山东省','济南市','历下区'];
				this.selectedContactIdType = defaultArchives.contactPersonIdType ? defaultArchives.contactPersonIdType : '';
				this.selectedRelation = defaultArchives.relationshipWithContact ? defaultArchives.relationshipWithContact : '';
			}
			
			this.getInfoType();
		},
		methods: {
			//选择日期
			bindDateChange(e) { 
				this.informationObj.dob = e.detail.value
			},
			//省市区
			chooseregion(event){
				this.provincesAndMunicipalities = event.detail.value.toString();
			},
			changeNativePlace(event){
				this.selectedNativePlace = event.detail.value.toString();
				this.informationObj.jiguan = this.selectedNativePlace;
			},
			changeHousehold(event){
				this.selectedHouseholdAddress = event.detail.value.toString();
			},
			changeContactAddress(event){
				this.selectedContactAddress = event.detail.value.toString();
			},
			changeBirthplace(event){
				this.selectedBirthplace = event.detail.value.toString();
			},
			
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
				this.informationObj.nationality = this.selectedNation;
			},
			//证件类型
			onIdTypeChange(e) {
				const index = e.detail.value;
				let val = this.cardTypeVal[index];
				let filter = this.cardType.filter(x => x.value == val);
				this.selectedContactIdType = val;
			},
			onMarriageChange(e) {
				const index = e.detail.value;
				let val = this.marriageVal[index];
				let filter = this.marriage.filter(x => x.value == val);
				this.selectedMarriage = val;
				this.informationObj.marriage = val;
				this.informationObj.marriageCode = filter[0].index;
			},
			//关系
			onRelationChange(e) {
				const index = e.detail.value
				let val = this.relationVal[index];
				let filter = this.relation.filter(x => x.value == val);
				this.selectedRelation = val;
				this.informationObj.relationshipWithContact = val;
				this.informationObj.relationshipWithContactCode = filter[0].index;
			},
			//职业
			onCareerChange(e) {
				const index = e.detail.value;
				let val = this.careerValue[index];
				let filter = this.career.filter(x => x.value == val);
				this.selectedCareer = val;
				this.informationObj.occupation = val;
				this.informationObj.occupationCode = filter[0].index; 
			},
			
			async getInfoType() {
			  try {
			    const res = await filingApi.getInforCategory('*');
			    if (res.data.code === 200) {
			      const data = res.data.data;
			      let careerValue = data.filter(x => x.dictType == 'cloud_archives_occupation');
						careerValue.map(v => {
							this.careerValue.push(v.dictLabel);
							this.career.push({
								index: v.dictCode,
								value: v.dictLabel
							})
						})
			      let marriage = data.filter(x => x.dictType == 'cloud_archives_marriage');
						marriage.map(v => {
							this.marriageVal.push(v.dictLabel);
							this.marriage.push({
								index: v.dictCode,
								value: v.dictLabel
							})
						})
			      let cardType = data.filter(x => x.dictType == 'cloud_archives_id_type');
						cardType.map(v => {
							this.cardTypeVal.push(v.dictLabel);
							this.cardType.push({
								index: v.dictCode,
								value: v.dictLabel
							})
						})
			      let relation = data.filter(x => x.dictType == 'cloud_archives_contact');
						relation.map(v => {
							this.relationVal.push(v.dictLabel);
							this.relation.push({
								index: v.dictCode,
								value: v.dictLabel
							})
						})
			      this.dictLoaded = true;
			    }
			  } catch (err) {
			    console.error('获取字典失败', err);
			  }
			},
			
			Filing(){
				let loginValue = uni.getStorageSync("loginData");
				let loginData = JSON.parse(loginValue)
				
				this.informationObj.patientUniquelyIdentifies = this.siginVal.patientUniquelyIdentifies;
				this.informationObj.patientCard = this.siginVal.patientCard;
				this.informationObj.currentAddress = this.provincesAndMunicipalities.toString();
				this.informationObj.hukouAddress = this.selectedHouseholdAddress.toString();
				this.informationObj.birthplace = this.selectedBirthplace.toString();
				this.informationObj.contactPersonIdType = this.selectedContactIdType;
				this.informationObj.contactPersonAddress = this.selectedContactAddress.toString();
				
				filingApi.replenishArchives(this.informationObj).then(res => {
					if(res.data.code===200){
						uni.showToast({
							title: '信息更新成功',
							icon: 'success',
							duration: 2000 
						})
					}else{
						uni.showToast({
							title: res.data.msg,
							icon: 'none',
							duration: 3000 
						})
					}
				}).catch(err => {
					console.log('2：', err);
				})
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
	.bigBtn {
		margin: 20rpx auto;
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
				// .title {
				// 	width: 160rpx;
				// }
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