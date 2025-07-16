<script>
	export default {
		onLaunch() {
			uni.removeStorageSync('popupConfirmed')
		},
		
		onShow() {
		  const isConfirmed = uni.getStorageSync('popupConfirmed');
			if (!isConfirmed) {
				this.showNotice = true;
			}
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
	@import "@/colorui/common-style.scss";
	
	page{ height: 100%}
</style>



