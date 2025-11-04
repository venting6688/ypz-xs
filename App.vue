// <script>
// 	export default {
// 		onLaunch() {
// 			uni.removeStorageSync('popupConfirmed')
// 		},
		
// 		onHide: function() {
// 			console.log('App Hide')
// 		}
// 	}
// </script>

<script lang="ts">
import { TUILogin } from '@tencentcloud/tui-core';
// #ifdef APP-PLUS || H5
import { TUIChatKit } from './TUIKit';
TUIChatKit.init();
// #endif
﻿
let vueVersion = 2;
// #ifdef VUE3
vueVersion = 3;
// #endif
﻿
// Required information
// You can get userSig from TencentCloud chat console for Testing TUIKit.
// Deploy production environment please get it from your server.
// View https://cloud.tencent.com/document/product/269/32688
uni.$SDKAppID = 0; // Your SDKAppID
uni.$userID = ''; // Your userID
uni.$userSig = ''; // Your userSig
﻿
export default {
  onLaunch: function () {
	 TUILogin.login({
	   SDKAppID: uni.$SDKAppID,
	   userID: uni.$userID, 
	   userSig: uni.$userSig, 
	   useUploadPlugin: true, // If you need to send rich media messages, please set to true.
	   framework: `vue${vueVersion}` // framework used vue2 / vue3
	 }).catch(() => {});
  }
};
</script>

<style>
	@import "@/colorui/main.css";
	@import "@/colorui/animation.css";
	@import "@/colorui/icon.css";
	@import "@/static/css/index-app.css";
	@import "@/colorui/common-style.scss";
	
	page{ height: 100%}
	
	/* common css for page */
	uni-page-body,html,body,page {
	  width: 100% !important;
	  height: 100% !important;
	  overflow: hidden;
	}
	
</style>



