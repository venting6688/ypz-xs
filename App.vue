<script>
	export default {
		onLaunch: function() {
			const isLoggedIn = uni.getStorageSync("loginData") ? true : false;
			const targetPage = isLoggedIn ? '/pages/virtualNurse/index' : '/pages/more/index';
			// 避免首页闪烁（先跳转再显示）
			setTimeout(() => {
				uni.reLaunch({ url: targetPage });
			}, 100);
		},
		onShow: function() {
			console.log('App Show')
			  wx.hideTabBar();
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>


<style>
	@import "@/colorui/main.css";
	@import "@/colorui/animation.css";
	@import "@/colorui/icon.css";
	@import "@/static/css/index-app.css";
	page{ height: 100%}
</style>



