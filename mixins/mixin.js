export default {

	methods: {
		// 节流
		throttle(fn, interval) {
			let lastTime = 0
			return function(...args) {
				const nowTime = +new Date()
				const remainTime = nowTime - lastTime
				if (remainTime >= interval) {
					fn.apply(this, args)
					lastTime = nowTime
				}
			}
		},
		convertString(str) {
			if (/^[+-]?\d+$/.test(str)) {
				return parseFloat(str).toFixed(2);
			} else {
				return str;
			}
		},
		// 根据身份证计算年龄
		calculateAge(idCard) {
			if (idCard.length === 18) {
				const birthYear = parseInt(idCard.slice(6, 10), 10);
				const birthMonth = parseInt(idCard.slice(10, 12), 10);
				const birthDay = parseInt(idCard.slice(12, 14), 10);

				const now = new Date();
				const currentYear = now.getFullYear();
				const currentMonth = now.getMonth() + 1;
				const currentDay = now.getDate();

				let age = currentYear - birthYear;
				// 如果当前月份小于出生月份，或者当前月份等于出生月份但当前日期小于出生日期，年龄减 1
				if (
					currentMonth < birthMonth ||
					(currentMonth === birthMonth && currentDay < birthDay)
				) {
					age--;
				}
				return age;
			} else {
				return null;
			}
		},
		// 获取近一周的时间
		getWeek(type) {
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth() + 1;
			const day = now.getDate();
			let dateRange = {};
			let startDate;
			let endDate;
			const oneDayMs = 24 * 60 * 60 * 1000;
			if (type === '上一周') {
				const sevenDaysAgo = now.getTime() - 7 * oneDayMs;
				startDate = new Date(sevenDaysAgo);
				endDate = new Date(now.getTime());
			} else if (type === '下一周') {
				startDate = new Date(now.getTime());
				endDate = new Date(now.getTime() + 7 * oneDayMs);
			}
			const startYear = startDate.getFullYear();
			const startMonth = startDate.getMonth() + 1;
			const startDay = startDate.getDate();
			dateRange.startDate = `${startYear}-${this.padDate(startMonth)}-${this.padDate(startDay)}`;
			const endYear = endDate.getFullYear();
			const endMonth = endDate.getMonth() + 1;
			const endDay = endDate.getDate();
			dateRange.endDate = `${endYear}-${this.padDate(endMonth)}-${this.padDate(endDay)}`;
			return dateRange;
		},
		padDate(value) {
			return value < 10 ? '0' + value : value
		},
		pixelateNumber(value) {
			let firstFour = value.slice(0, 4);
			let lastFour = value.slice(-4);
			return `${value.slice(0, 4)}${'*'.repeat(value.length - 10)}${value.slice(-2)}`;
		},
		maskCNPhone(p) {
			return String(p).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
		},
		pixelate(value) {
			if (value) {
				// 判断括号
				let bracket = ''
				if (value.search(/\( | （/)) {
					let result = /[(,（].*[),）]/.exec(value)
					if (result) bracket = result[0]
					value = value.replace(/[(,（].*[),）]/, '')
				}
				if (value.length === 2) {
					return `${value[0]}*${bracket}`
				}
				if (value.length > 2) {
					return `${value[0]}*${value[value.length - 1]} ${bracket}`
				}
			} else {
				return value
			}
		},
		getDate(type) { //年月日
			const date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let day = date.getDate();

			if (type === 'start') {
				year = year - 100;
			} else if (type === 'end') {
				year = year;
			}
			month = month > 9 ? month : '0' + month;
			day = day > 9 ? day : '0' + day;
			return `${year}-${month}-${day}`;
		},

		showTypewriterEffect(newText, lastMsg) {
		  if (!lastMsg || typeof newText !== 'string' || !newText.length) return;
		
		  if (this.typewriterTimer) clearInterval(this.typewriterTimer);
		
		  // 按文字和图片分段
		  const regex = /!\[image\]\((https?:\/\/[^\s)]+)\)/g;
		  const segments = [];
		  let lastIndex = 0;
		  let match;
		
		  while ((match = regex.exec(newText)) !== null) {
		    if (match.index > lastIndex) {
		      segments.push({ type: 'text', content: newText.slice(lastIndex, match.index) });
		    }
		    segments.push({ type: 'image', content: match[1] });
		    lastIndex = regex.lastIndex;
		  }
		  if (lastIndex < newText.length) {
		    segments.push({ type: 'text', content: newText.slice(lastIndex) });
		  }
		
		  // 初始化 lastMsg.msg
		  if (typeof lastMsg.msg !== 'string') lastMsg.msg = '';
		
		  let segIndex = 0;
		  let charIndex = 0;
		  const speed = 25;
		
		  this.typewriterTimer = setInterval(() => {
		    if (segIndex >= segments.length) {
		      clearInterval(this.typewriterTimer);
		      this.typewriterTimer = null;
		      return;
		    }
		
		    const seg = segments[segIndex];
		
		    if (seg.type === 'text') {
		      if (charIndex < seg.content.length) {
		        const nextChar = seg.content[charIndex];
		        lastMsg.msg += nextChar;
		        charIndex++;
		        // 每 5 个字符或段落结束更新一次，减少渲染压力
		        if (charIndex % 5 === 0 || charIndex === seg.content.length) {
		          this.$forceUpdate();
		        }
		      } else {
		        segIndex++;
		        charIndex = 0;
		      }
		    } else if (seg.type === 'image') {
		      // 图片直接追加 Markdown 图片语法
					lastMsg.msg += `\n\n<img src="${seg.content}" style="width:100%;margin-top:6px;" />\n\n`;
		      segIndex++;
		      charIndex = 0;
		      this.$forceUpdate();
		    }
		  }, speed);
		},
		arrayBufferToString(buffer) {
			const bytes = new Uint8Array(buffer);
			let out = '',
				i = 0,
				len = bytes.length;
			while (i < len) {
				let c = bytes[i++];
				if (c >> 7 === 0) {
					// 单字节
					out += String.fromCharCode(c);
				} else if (c >> 5 === 0b110) {
					// 双字节
					let c2 = bytes[i++];
					out += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
				} else if (c >> 4 === 0b1110) {
					// 三字节
					let c2 = bytes[i++];
					let c3 = bytes[i++];
					out += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f));
				} else {
					// 四字节 (surrogate pair)
					let c2 = bytes[i++];
					let c3 = bytes[i++];
					let c4 = bytes[i++];
					let codepoint = ((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f);
					codepoint -= 0x10000;
					out += String.fromCharCode(0xd800 + (codepoint >> 10));
					out += String.fromCharCode(0xdc00 + (codepoint & 0x3ff));
				}
			}
			return out;
		},
		
		mergeDoctorSessions(arr) {
		  const map = new Map();
		
		  arr.forEach(item => {
		    const code = item.DoctorCode;
		
		    if (!map.has(code)) {
		      // 首次出现时建立医生基础信息
		      map.set(code, {
		        DoctorName: item.DoctorName,
		        DoctorSessType: item.DoctorSessType,
		        Fee: item.Fee,
		        DepartmentName: item.DepartmentName,
		        DoctorSpec: item.DoctorSpec,
		        specialtyGroupId: item.specialtyGroupId,
						ServiceDate: item.ServiceDate,
		        scheduling: [] // 用于存放多个排班
		      });
		    }
		
		    map.get(code).scheduling.push({
		      SessionName: item.SessionName,
		      AvailableLeftNum: item.AvailableLeftNum,
		    });
		  });
		
		  return Array.from(map.values());
		},

	},
}