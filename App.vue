<script>
	export default {
		onLaunch() {
			uni.removeStorageSync('popupConfirmed')
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



