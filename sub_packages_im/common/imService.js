// sub_packages_im/common/imService.js
import tim from './im.js';
import TIM from 'tim-wx-sdk';

const imService = {
  /**
   * 登录 IM
   * @param {String} userID - 用户ID
   * @returns {Promise}
   */
	async login(userID) {
	  try {
      const userSig = await this.getUserSig(userID);
	    await tim.login({ userID, userSig });
	    await new Promise((resolve) => {
	      tim.on(TIM.EVENT.SDK_READY, () => {
	        console.log('SDK_READY: SDK 已准备好');
	        resolve();
	      });
	    });
	    return true;
	  } catch (err) {
	    console.error('IM 登录失败:', err);
	    throw err;
	  }
	},

  /**
   * 退出登录
   */
  async logout() {
    try {
      const res = await tim.logout();
      console.log('IM 已登出:', res);
      return res;
    } catch (err) {
      console.error('IM 登出失败:', err);
    }
  },

  /**
   * 获取历史消息
   */
  async getHistoryMsg(conversationID, count = 20) {
    try {
      const res = await tim.getMessageList({ conversationID, count });
      return res.data.messageList;
    } catch (err) {
      console.error('获取历史消息失败:', err);
      return [];
    }
  },

  /**
   * 发送文本消息
   */
  async sendText(to, text) {
    const message = tim.createTextMessage({
      to,
      conversationType: TIM.TYPES.CONV_C2C,
      payload: { text }
    });
    const res = await tim.sendMessage(message);
    return res.data.message;
  },

  /**
   * 发送图片消息
   */
  async sendImage(to, file) {
    if (!file || !file.path) throw new Error('图片文件对象不合法');
    
    const message = tim.createImageMessage({
      to,
      conversationType: TIM.TYPES.CONV_C2C,
      payload: { file } // 注意这里是 { file }，file 包含 path + name + type
    });
  
    const res = await tim.sendMessage(message);
    return res.data.message;
  },

  /**
   * 发送自定义消息（例如处方单）
   */
  async sendCustom(to, data) {
    const message = tim.createCustomMessage({
      to,
      conversationType: TIM.TYPES.CONV_C2C,
      payload: {
        data: JSON.stringify(data), // 自定义数据
        description: data.chiefComplaint,
        extension: "patientCard"
      }
    });
    const res = await tim.sendMessage(message);
    return res.data.message;
  },

  /**
   * ⚠️ 模拟获取 userSig（真实项目要调用后端）
   */
  async getUserSig(userID) {
    // TODO: 这里要替换成接口请求
    //当前使用写死的 userSig，仅用于测试，正式环境请调用后端接口获取！
    return "eJwtzc0KwjAQBOB3yVWpa0hoLHjoQRDxog0WwYuatW5bY2yDVMV31-4c5xuY*TC9ToInVixiPAA27jIZtJ4u1PGD7Bv50NSmODpHhkVTAaC4UEL1DTaOKvy7lJIDQK*ebq2FMpRyxgUfVihr-zRtUzpMYnP1paLXvd4no5XOM1jaU1O4FBdnW7pil*Nmzr4-p2wzTQ__";
  }
};

export default imService;
