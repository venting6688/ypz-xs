<template>
  <view class="apply-container">
		<bar v-if="loginData.defaultArchives" />
		<view class="form-item">
			<view class="des">
				<text class="label">病情描述</text>
				<textarea 
					v-model="desc" 
					maxlength="200" 
					placeholder="详细描述发病时间、诱因、主要症状等..."
				></textarea>
				<text class="count">{{ desc.length }}/200</text>
			</view>
			
			<view class="uploadImg">
				<text class="label">上传图片（最多上传9张）</text>
				<view class="img-list">
					<view v-for="(img, index) in imgList" :key="index" class="img-item">
						<image :src="img" mode="aspectFill"></image>
						<view class="del" @click="delImg(index)">×</view>
					</view>
					<view v-if="imgList.length < 9" class="img-add" @click="uploadImg">+</view>
				</view>
			</view>
		</view>
		
    <view class="tips">温馨提示：为确保医生能够准确判断病情，上传图片保持信息内容完整、清晰可辨。</view>
    <button class="btn-next" @click="submitOrder">下一步</button>
  </view>
</template>

<script>
	// import TIM from 'tim-wx-sdk';
	// import tim from '../common/im.js';
	import mixin from '@/mixins/mixin.js'
	import imService from '../common/imService.js';
	import bar from '../../sub_packages/components/bar.vue'
	
export default {
	mixins: [mixin],
	components:{
		bar,
	},
  data() {
    return {
			desc: '',
      userID: 'qinze2',
			doctorId: 'qinze3',
			loginData: {},
			defaultData: {},
			patientInfo: {},
			imgList: []
    }
  },
	onLoad() {
		let data = uni.getStorageSync('loginData');
		this.loginData = data ? JSON.parse(data) : {};
		this.defaultData = this.loginData != undefined ? this.loginData.defaultArchives : {};
	},
  methods: {
    uploadImg() {
			uni.chooseImage({
				count: 9 - this.imgList.length,
				success: async (res) => {
					// 这里应该调用后端上传接口
					for (let tempPath of res.tempFilePaths) {
						// 简单模拟上传成功后得到线上地址
						this.imgList.push(tempPath);
					}
				}
			})
		},
    delImg(index) {
      this.imgList.splice(index, 1);
    },
		
		async submitOrder() {
			if (!this.defaultData.idNum || !this.desc) {
				return uni.showToast({ title: '请填写完整信息', icon: 'none' });
			}
			let data = {
				doctor: {
					id: this.doctorId,
					name: "李医生",
					department: "心内科",
					avatar: "../../static/image/doctor.png",
				},
				patient: {
					id: this.userID,
					name: this.defaultData.patientName,
					gender: this.defaultData.sex,
					avatar: "../../static/image/doctor.png",
					age: this.calculateAge(this.defaultData.idNum),
					chiefComplaint: this.desc,
					images: this.imgList,
				},
				orderId: '654123'
			};
			try {
	//         const res = await uni.request({
	//           url: 'https://api.xxx.com/im/createOrder',
	//           method: 'POST',
						
	//         });
	
	//         if (res.data.success) {
	//           const { orderId, doctorId } = res.data;
					let orderId = '123456'
					uni.showToast({ title: '申请已提交，等待医生接诊', icon: 'success' });

					// 等待医生接诊（这里可以轮询订单状态，也可以通过IM系统消息）
					this.waitForDoctor(orderId, this.doctorId, data);
					// }
				} catch (e) {
					console.error(e);
					uni.showToast({ title: '提交失败', icon: 'none' });
				}
			},
		
		    // 等待医生接诊
		    waitForDoctor(orderId, doctorId, data) {
		      // this.pollingTimer = setInterval(async () => {
		        // const res = await uni.request({
		        //   url: `https://api.xxx.com/im/orderStatus?orderId=${orderId}`
		        // });
		        // if (res.data.status === 'accepted') {
		        //   clearInterval(this.pollingTimer);
						
		          uni.navigateTo({
								url: `/sub_packages_im/pages/chat?data=${encodeURIComponent(JSON.stringify(data))}`
		          });
		        // }
		      // }, 3000);
		    }
		  }
	}
</script>

<style scoped lang="less">
.apply-container { 
	.form-item {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		margin: 20rpx;
	}
	
	.uploadImg {
		margin-top: 35rpx;
		padding-top: 30rpx;
		border-top: 1px solid #F5F5F5;
	}
}

.label { 
	font-weight: bold; 
	margin-bottom: 15rpx; 
	display: block; 
	font-size: 28rpx;
}
.select-patient {
  border: 1px solid #4286FF;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  color: #4286FF;
}
.placeholder { 
	color: #aaa; 
}
.textarea {
	width: 100%;
  border: 1px solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  min-height: 200rpx;
}
.count { 
	text-align: right; 
	font-size: 24rpx; 
	color: #888; 
}
.img-list { 
	display: flex; 
	flex-wrap: wrap; 
}
.img-item {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  position: relative;
}
.img-item image { 
	width: 100%; 
	height: 100%; 
	border-radius: 12rpx; 
}
.del {
  position: absolute; top: 0; right: 0;
  background: rgba(0,0,0,.5);
  color: #fff; padding: 0 10rpx;
}
.img-add {
  width: 160rpx; height: 160rpx;
  border: 1px dashed #ccc;
  display: flex; align-items: center; justify-content: center;
  font-size: 50rpx; color: #ccc;
}
.tips { 
	color: #666; 
	font-size: 26rpx; 
	margin: 20rpx 0; 	
	padding: 0 20rpx;
}
.btn-next {
  color: #fff;
  background: #4286FF;
  border-radius: 50rpx;
  margin: 30rpx;
}
</style>
