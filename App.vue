<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
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



