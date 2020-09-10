
layui.define(['&md5','jquery','&common'],(exports) => {
	const $ = layui.$;
	const gc= layui['&common'];
	function Main(config) {
		var self         = this;
		this.v           = '1';
		this.url         = '/';
		this.sign_method = 'md5';
		this.app_key     = '5f534709eb6ff';
		 this.appSecret   = '5f534709eb7001.06028873';
		this.homeCenter  = 'center.html';
		this.debug       = false;
		if (typeof (config) == 'object' && $.isEmptyObject(config) == false) {
			$.extend(this, config);
		}
	
		this.format = function () {
			var date  = new Date();
			var year  = date.getFullYear();
			var month = date.getMonth() + 1;
			if (month < 10) {
				month = '0' + month;
			}
			var day = date.getDate();
			if (day < 10) {
				day = '0' + day;
			}
			var hour = date.getHours();
			if (hour < 10) {
				hour = '0' + hour;
			}
			var minute = date.getMinutes();
			if (minute < 10) {
				minute = '0' + minute;
			}
			var second = date.getSeconds();
			if (second < 10) {
				second = '0' + second;
			}
			return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
		};
	
		this.host            = this.url + 'rest';
		this.token           = gc('user_info');
		this.sortKey         = function (data) {
			var newKey  = [];
			var newData = {};
			for (var key in data) {
				newKey.push(key);
			}
			newKey.sort();
			for (var key in newKey) {
				newData[newKey[key]] = data[newKey[key]];
			}
			return newData;
		};
		this.crc             = function (obj, type) {
			if (!self.debug) {
				delete obj['debug'];
			}
			// var filterData = self.sortKey(obj);
			var filterData = Object.keys(obj).sort();
			var stringData = [];
			// for (var key in filterData) {
			// 	stringData.push(key + filterData[key]);
			// }
			for (var key in filterData) {
				var values = obj[filterData[key]];
				if(typeof(values) == 'object'){
					var vkeys = Object.keys(values).sort();
					for(var key1 in vkeys){
						stringData.push(filterData[key] + '[' + vkeys[key1] + ']' + values[vkeys[key1]]);
					}
				}else{
					stringData.push(filterData[key] + values);
				}
			}
			stringData.push(self.appSecret);
			var str = stringData.join('');
			if (type == 'md5') {
				var crcString = md5(str);
			} else {
				var crcString = sha1(str);
			}
			return crcString;
		};
		this.formatReq       = function (data) {
			if (!self.debug) {
				delete data['debug'];
			}
			//console.log(data);
			//data['device_from'] = 3;
			data['app_key']     = self.app_key;
			data['sign_method'] = self.sign_method;
			data['timestamp']   = self.format();
			data['format']      = 'json';
			data['v']           = self.v;
			data['sign']        = self.crc(data, self.sign_method);
			return data;
		};
		this.milSecondToDate = function (milSecond) {
			var s = parseInt(milSecond / 1e3 / 60 / 60 % 60), r = parseInt(milSecond / 1e3 / 60 % 60),
				a = parseInt(milSecond / 1e3 % 60), c = parseInt(milSecond % 1e3), l = c, u = {
					h : 10 > s ? "0" + s : s + "",
					m : 10 > r ? "0" + r : r + "",
					s : 10 > a ? "0" + a : a + "",
					ms: 10 > l ? "00" + l : 100 > l ? "0" + l : l + ""
				};
			return u;
		}
		this.checkToken      = function (cb) {
			if (!this.token || this.token == "null") {
				gotoLoginPage();
			} else {
				return this.token;
			}
		};
		var gotoLoginPage    = function () {
			var from = decodeURIComponent(window.location.href);
			var ua   = navigator.userAgent.toLowerCase();
			if (ua.match(/MicroMessenger/i) == "micromessenger") {
				window.location.href = '/weixin/login?from='
					+ encodeURIComponent(window.location.href);
			} else if (window.sjdb) {
				sjdb.native_Login(window.location.href);
			} else {
				window.location.href = "/login.html?come_from="
					+ encodeURIComponent(window.location.href);
			}
		};
		this.alert           = function (msg) {
			alert(msg);
		};
	
		this.okAlert    = function (msg) {
			self.alert(msg);
		};
		this.errorAlert = function (msg) {
			self.alert(msg);
		};
	}
	exports('&main',Main)
})



