import TIM from 'tim-wx-sdk';
import TIMUploadPlugin from 'tim-upload-plugin';

const tim = TIM.create({
  SDKAppID: 1400824848 // 替换为你的 SDKAppID
});
tim.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });

// 建议只在调试时设置 0，正式环境设为 1
tim.setLogLevel(0);

export default tim;

