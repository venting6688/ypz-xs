<template>
	<view class="inventory ">
		<customerNav title="填写预约信息" />
		<view class="goBack" :style="{top: barHeight +'px'}" @click="goBack">
			<uni-icons type="back" color="#fff" size="15"></uni-icons>
		</view>
		<view class="form-section">
			<form>
			<view class="form-item">
				<text class="label required">姓名</text>
				<input class="input" placeholder="请输入" v-model="informationObj.PatientName" />
				<view class="btn-select" @click="cutPatient" v-if="physicalExaminer.length">选择体检人</view>
			</view>
			<view class="form-item">
				<text class="label required">证件类型</text>
				<picker mode="selector" :value="informationObj.CertificateType" :range="cardTypeValue" @change="onCardType">
					<text class="picker birth">{{selectedCardType}}</text>
				</picker>
			</view>
			<view class="form-item">
				<text class="label required">证件号</text>
				<input 
				type="idcard" 
				class="input" 
				placeholder="请输入" 
				v-model="informationObj.CertificateNo" 
				@input="parseIdCard" 
				/>
			</view>
			<view class="form-item">
				<text class="label required">性别</text>
				<view class="radio-group">
					<uni-data-checkbox v-model="informationObj.SexCode" :localdata="sexVal" @change="sexChange"></uni-data-checkbox>
				</view>
			</view>
			<view class="form-item">
				<text class="label required">生日</text>
				<picker mode="date" :value="informationObj.PatientDob" :start="startDate" :end="endDate" fields="day" @change="bindDateChange">
				  <text class="picker birth">{{informationObj.PatientDob}}</text>
				</picker>
			</view>
			<!-- <view class="form-item">
				<text class="label required">婚姻状况</text>
				<view class="radio-group">
					<uni-data-checkbox v-model="informationObj.marriage" :localdata="marriage" @change="marriageChange"></uni-data-checkbox>
				</view>
			</view> -->
			<view class="form-item">
				<text class="label required">手机号</text>
				<input type="number" placeholder="请输入手机号" v-model="informationObj.TelephoneNo" class="input" keyboard="number" maxlength="11"  />
			</view>
			</form>
		</view>
		<view class="checkDate">
			<text class="label">检查日期</text>
			<view class="btn-select">{{selectedDate}}</view>
		</view>
		<view class="total">
			<view class="section-title">费用明细</view>
			<view class="form-name">
				<text>山一大二附院体检中心（总院）</text>
				<text style="color: #ccc;">套餐名称: {{packName}}</text>
			</view>
			<view class="form-item">
				<text>应付金额</text>
				<text>￥{{price}}</text>
			</view>
			<view class="form-item">
				<text>实付金额</text>
				<text class="price">小计：￥{{price}}</text>
			</view>
		</view>
		<view class="footer-fixed">
			<text class="total-price">￥{{price}}</text>
			<view class="pay-btn" @click="confirm()">
				<text class="pay-main">提交订单</text>
				<text class="pay-sub">(扫码支付)</text>
			</view>
		</view>
		<uni-popup class="cutPatientDialog" :safe-area="false"  ref="cutPatientPopup" type="bottom">
		  <!-- <view class="center"> -->
			 <scroll-view scroll-y="true" class="center">
		  	<view class="scroll" >
					<view class="middle">
						<view class="li" v-for="(item,index) in physicalExaminer" 
						:key="index" 
						@click="selectedPhysicalExaminer(item)"
						:class="{blue: personageId == item.id}"
						>
							<view class="info">
								<view class="title" :class="{blue: personageId == item.id}">{{item.name}} - {{item.sex}} - {{item.age}}</view>
								<view class="name">手机号码: {{maskCNPhone(item.phone)}}</view>
								<view class="name">身份证号: {{pixelateNumber(item.idNum)}}</view>
							</view>
							
							<view class="img" v-if="personageId == item.id">
								<image src="@/static/image/right.png" mode="widthFix"></image>
							</view>
						</view>
					</view>
		  	</view>
			</scroll-view>
		  <!-- </view> -->
		</uni-popup>
	</view>
</template>
<script>
	import dayjs from "dayjs";
	import { mapState } from 'vuex'
	import mixin from '@/mixins/mixin.js'
	import { getStatusBarHeight } from "@/utils/system.js";
	import customerNav from '@/components/customerNav.vue';
	import detailItem from './components/detailItem.vue';
	import popupFamily from '@/components/popupFamily.vue';
	import physicalExamination from '@/api/physicalExamination.js'

	export default {
		mixins: [mixin],
		components: {
			customerNav,
			detailItem,
			popupFamily
		},
		computed: {
			...mapState(['locId']),
			barHeight() {
				return getStatusBarHeight()+5
			},
		},
		data() {
			return {
				sex: '',
				packName: '',
				openid: '',
				price: 0.00,
				ordSetsId: '',
				personageId: '',
				selectedDate: '',
				selectedType: [],
				detailInfo: [],
				physicalExaminer: [],
				selectedCardType: ['身份证'],
				sexVal: [
					{text: '男', value: '男'},
					{text: '女', value: '女'},
				],
				marriage: [
					{text: '未婚', value: '未婚'},
					{text: '已婚或有性经历', value: '已婚或有性经历'},
				],
				cardTypeValue: [
					'身份证','户口簿','护照','军官证','驾驶证','港澳居民来往内地通行证	',
				  '台湾居民来往内地通行证','出生医学证明','外国人永久居留身份证','新生儿证件（3个月无证件儿童）',
					'港澳台居民居住证','其他法定有效证件'
				],
				informationObj: {
					PatientName: '',
					CertificateType: '01',
					CertificateNo: '',
					SexCode: '',
					PatientDob: '0000-00-00',
					TelephoneNo: '',
					// marriage: '',
				},
			}
		},
		onLoad(e) {
			this.sex = e.sex;
			this.packName = e.packName;
			this.ordSetsId = e.ordSetsId;
			this.selectedDate = e.selectedDate;
			this.selectedType = JSON.parse(e.selectedType);
			this.price = parseFloat(e.price).toFixed(2);
			let login = uni.getStorageSync('loginData');
			login = JSON.parse(login)
			this.openid = login.xcxOpenId;
			this.getPhysicalExaminationPersonList();
			this.getPhysicalExaminationPackageDetail();
		},
		methods: {
			//选择日期
			bindDateChange(e) { 
				this.informationObj.PatientDob = e.detail.value
			},
			//证件类型
			onCardType(e) {
				const index = e.detail.value;
				let val = this.cardTypeValue[index];
				this.selectedCardType = val.toString();
				this.informationObj.CertificateType = index < 10 ? '0'+index : index;
			},
			sexChange(e) {
				this.informationObj.SexCode = e.detail.value;
			},
			// marriageChange(e) {
			// 	this.informationObj.marriage = e.detail.value
			// },
			selectedPhysicalExaminer(val) {
				if (this.sex != '不限' && this.sex != val.sex) {
					uni.showToast({
						title: '当前套餐仅针对'+this.sex+"性检查，请重新选择体检人。",
						icon: 'none'
					})
				} else {
					this.informationObj = {
						PatientName: val.name,
						CertificateType: '01',
						CertificateNo: val.idNum,
						SexCode: val.sex,
						PatientDob: val.dob,
						TelephoneNo: val.phone,
					}
					this.personageId = val.id;
				}
				
				this.$refs.cutPatientPopup.close();
			},
			//通过身份证号获取出生日期+性别
			parseIdCard() {
				if (this.selectedCardType == '身份证') {
					const isValid = /(^\d{15}$)|(^\d{17}[\dXx]$)/.test(this.informationObj.CertificateNo);
					if (!isValid) {
						this.birthday = "";
						return;
					}
						
					if (this.informationObj.CertificateNo.length === 15) {
						const birthPart = "19" + this.informationObj.CertificateNo.substring(6, 12);
						this.birthday = this.formatDate(birthPart);
					} else {
						const birthPart = this.informationObj.CertificateNo.substring(6, 14);
						this.informationObj.PatientDob = this.formatDate(birthPart);
					}
						
					const genderPos = this.informationObj.CertificateNo.length === 15 ? 14 : 16;
					const genderCode = parseInt(this.informationObj.CertificateNo.charAt(genderPos));
					let sex = genderCode % 2 === 1 ? "男" : "女";
					this.informationObj.SexCode = sex;
					this.informationObj.CertificateType = '01';
				}
			},
			formatDate(dateStr) {
				return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
			},
			cutPatient() {
				this.$refs.cutPatientPopup.open('bottom')
			},
			goBack() {
				uni.navigateBack({
					success: () => {
					}, fail: (err) => {
						uni.reLaunch({
							url:'/pages/home/index'
						})
					}
				})
			},
		  isInformationComplete() {
				const obj = this.informationObj;
				for (let key in obj) {
					const value = obj[key];
					if (value === '' || value === null || value === undefined || value === '0000-00-00') {
						return false;
					}
				}
				return true;
			},
			getAgeFromIdCard(idCard) {
				if (!idCard || idCard.length !== 18) {
					return null; // 身份证号格式不对
				}
				// 提取出生年月日
				const year = parseInt(idCard.substr(6, 4));
				const month = parseInt(idCard.substr(10, 2));
				const day = parseInt(idCard.substr(12, 2));
		
				const today = new Date();
				let age = today.getFullYear() - year;
		
				// 如果还没过生日，减 1 岁
				if (
					today.getMonth() + 1 < month ||
					(today.getMonth() + 1 === month && today.getDate() < day)
				) {
					age--;
				}
		
				return age;
			},
			async getPhysicalExaminationPersonList() {
				try {
					let res = await physicalExamination.physicalExaminationPersonList(this.openid);
					this.physicalExaminer = [];
					if (res.data.list.length) {
						res.data.list.map(v => {
							let age = this.getAgeFromIdCard(v.CertificateNo);
							this.physicalExaminer.push({
								id: v.id,
								name: v.PatientName,
								sex: v.SexCode,
								dob: v.PatientDob,
								age,
								idNum: v.CertificateNo,
								phone: v.TelephoneNo,
							})
						})
					}
				} catch (err) {
					console.error(err);
				}
			},
			async getPhysicalExaminationPackageDetail() {
				try {
					let data = {
						locId: this.locId,
						OrdSetsId: this.ordSetsId,
					}
					const res = await physicalExamination.getPhysicalExaminationPackageDetail(data);
					if (res.data.code == 200) {
						let item = res.data.data.StationItem;
						let itemName = [];
						item.map(v => {
							itemName.push(v.StationName)
						})
						let formatDatas = this.formatData(this.selectedType);
						let filterItem = formatDatas.filter(x => itemName.includes(x.stationDesc));
						let other = formatDatas.filter(x => !itemName.includes(x.stationDesc));
						item.map(v => {
							if (filterItem.length) {
								filterItem.forEach(val => {
									if (val.stationDesc == v.StationName && val.children && val.children.length) {
										val.children.forEach(vc => {
											v.PeOrdItemList.PeOrdItem.push({
												ArcimDr: vc.hisItemId,
												Price: vc.price,
												AlertMsg: "",
												Qty: 1,
												Amount: vc.price,
												ArcimDesc: vc.itemDesc
											});
										});
									}
								});
							} 
						})
						let addProject = [];
						if (other.length){
							// 处理未找到匹配项的情况 - 从所有数据中获取
							let addPro = {
								StationName: '',
								StationCode: '',
								PeOrdItemList: { PeOrdItem: [] }, // 确保 PeOrdItemList 有 PeOrdItem 数组
							};
							// 遍历 formatDatas 中的所有项目
							other.forEach(pro => {
								if (pro.children && pro.children.length) {
									let detailPro = [];
									
									pro.children.forEach(v => {
										detailPro.push({
											ArcimDr: v.hisItemId,
											Price: v.price,
											AlertMsg: "",
											Qty: 1,
											Amount: v.price,
											ArcimDesc: v.itemDesc
										});
									});
									
									addPro = {
										StationName: pro.stationDesc,
										StationCode: '', // 你可以根据需要设置 StationCode
										PeOrdItemList: { PeOrdItem: detailPro },
									};
									
									addProject.push(addPro);
								}
							});
						}
						
						this.detailInfo = [...item, ...addProject].flat();
					}
				} catch(err) {
					console.error(err);
				}
			},
			
			formatData(data) {
				const groupedData = data.reduce((acc, item) => {
					const { 
							"@type": type,
							itemCategoryDesc, 
							stationDesc, 
							...childItem 
					} = item;
					const existingGroup = acc.find(group => group.stationDesc === stationDesc);
					if (existingGroup) {
							existingGroup.children.push(childItem);
					} else {
							acc.push({
									"@type": "java.util.HashMap",
									itemCategoryDesc,
									stationDesc,
									children: [childItem]
							});
					}
					return acc;
				}, []);
				return groupedData;
			},
			
			confirm() {
				if (this.informationObj.CertificateNo.length < 18) {
					uni.showToast({
						title: '身份证号错误，请输入至少18位数',
						icon: 'none'
					})
					return;
				}
				if (this.informationObj.TelephoneNo.length < 11) {
					uni.showToast({
						title: '手机号错误，请输入至少11位数',
						icon: 'none'
					})
					return;
				}
				if (!this.isInformationComplete()) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					});
					return;
				} else {
					this.informationObj.SexCode = this.informationObj.SexCode == '男' ? '‘' : '‘';//'M' : 'F';
					this.informationObj.LocID = this.locId;
					this.informationObj.ExamDate = this.selectedDate;
					this.informationObj.openId = this.openid;
					// let endDate = 
					let extGroupInfo = {
						ExtGDesc: "",
						ExtGEndDate: this.selectedDate,
						ExtGBaseId: "",
						ExtTeamId: "",
						ExtTeamDesc: "",
						ExtGid: "",
						ExtGBeginDate: this.selectedDate,
					}
					let physicalExaminationPerson = this.informationObj;
					
					let data = {
						StationItem: this.detailInfo,
						extGroupInfo,
						physicalExaminationPerson: this.informationObj,
						PreType:"ADD", //PRE: 公费
						pmType:"I", //G: 团体
						amountPayable: this.price,
						actualAmountPaid: this.price
					}
					physicalExamination.addPhysicalExaminationRecord(data).then(res => {
						if (res.data.code == 200) {
							uni.showToast({
								title: '预约成功！',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '预约失败！',
								icon: 'none'
							})
						}
					});
				}
			}
		},
	};
</script>

<style lang="less" scoped>
	::v-deep .segmented-control__text {
		font-size: 34rpx !important;
	}
	::v-deep .titleBar {
	  justify-content: center !important;
	}
	.pageBg {
		padding: 0 !important;
	}
	.pageBg::before {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	.homePageBg::before { 
		height: 150rpx;
	}
	
	.inventory {
		width: 100%;
		background-color: #f5f5f5;
		.total {
			background: #fff;
		}
		.checkDate {
			background: #fff;
			margin: 20rpx 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx;
			border-bottom: 1px solid #f0f0f0;
		}
		.section-title {
			padding: 20rpx;
			font-weight: bold;
			color: #666;
			font-size: 30rpx;
			border-bottom: 1px solid #f3f3f3;
		}
		.form-section {
			background-color: #fff;
		}
		.form-name {
			display: flex;
			padding: 20rpx;
			flex-direction: column;
			border-bottom: 1px solid #f3f3f3;
		}
		.form-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx;
			border-bottom: 1px solid #f0f0f0;
		}
		.label {
			width: 160rpx;
		}
		.required::before {
			content: '*';
			color: red;
			margin-right: 6rpx;
		}
		.input {
			flex: 1;
			border: none;
			outline: none;
		}
		.value {
			color: #333;
		}
		.placeholder {
			color: #999;
		}
		.btn-select {
			padding: 6rpx 16rpx;
			border: 1px solid #007aff;
			border-radius: 35rpx;
			color: #007aff;
			font-size: 26rpx;
		}
		.radio-group {
			display: flex;
			gap: 20rpx;
			color: #333;
		}
		
		.footer-fixed {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 120rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
			z-index: 999;
		}
		.total-price {
			color: #e60012;
			font-size: 36rpx;
			font-weight: bold;
		}
		.pay-btn {
			background-color: #3b82f6;
			color: #fff;
			padding: 10rpx 70rpx;
			height: 100rpx;
			border-radius: 45rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		
		.pay-main {
			font-size: 28rpx;
			font-weight: bold;
		}
		
		.pay-sub {
			font-size: 22rpx;
			opacity: 0.9;
		}
		.center {
			width: 750rpx;
			background-color: #ffffff;
			margin-bottom: 75rpx;
			border-radius: 30rpx 30rpx 0 0;
			height: 540rpx;
			overflow-y: auto;
			.top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin: 30rpx 25rpx 0;
				.title {
					display: flex;
					align-items: center;
					font-size: 30rpx;
				}
			}
			.scroll {
				height: 55%;
				padding-bottom: 30rpx;
				.middle {
						padding-top: 20rpx;
						.li {
							color: #666;
							display: flex;
							justify-content: space-between;
							align-items: center;
							// flex-direction: column;
							margin: 20rpx 5rpx;
							min-height: 80rpx;
							padding:0 20rpx 0 40rpx;
							border-bottom: 1px solid #ccc;
							&:first-child{
								margin-top: 10rpx;
							}
							.title {
								font-size: 36rpx;
								color: #333;
								padding-bottom: 15rpx;
							}
							.name {
								font-size: 32rpx;
								line-height: 32rpx;
								padding-bottom: 20rpx;
							}
							.img {
								width: 11%;
								height: 48rpx;
								line-height: 48rpx;
								text-align: center;
								// margin-left:80rpx;
								image {
									width: 46rpx;
									height: 48rpx;
								}
							}
						}
						.blue {
							color: #4286FF !important;
						}
					}
			}
				
			.btn{
				margin-bottom: 20rpx;
				height: 130rpx;
				display: flex;
				justify-content: space-evenly;
				align-items: center;
				
				button {
					transform: translate(0,-10rpx);
					font-size: 38rpx;
					width: 300rpx;
					height: 80rpx;
					background: linear-gradient(351deg,#479cff 0%, rgba(71,216,251,0.80) 100%);
					border-radius: 15rpx;
					color: #ffffff;
				}
			}
				
		}
	}
</style>
