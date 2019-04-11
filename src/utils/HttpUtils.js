/**
 * Created by marven on 2017/09/23.
 */
import Vue from 'vue';
import axios from 'axios';
import Config from './Config';
import MyRouter from '@/router';
import toastr from 'toastr';
// import { debug } from 'util';
// 处理Raw纯json字符串得请求
axios.defaults.baseURL = Config.HTTPBASEURL;
axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
Vue.prototype.$ajax = axios;
class Http {
  /**
   * 发起ajax请求
   * @param _url
   * @param method 请求方式
   * @param _data
   * @param isNeedLogin 是否需要登录token默认为需要，不需要传递false即可
   */
  request(_url, _data = {}, method, isNeedLogin = true) {
    if (Config.XHRLOG) {
      /* eslint-disable */
      console.info(`----来自${_url}的${method}请求----`);
      console.info(JSON.stringify(_data));
      /* eslint-disable */
    }
    let _headers = {};
    if (isNeedLogin) {
      _headers = {
        // 'token': '' + UserLogin.getLoginToken()
      };
    }
    let ajaxDataKey = method === 'post' ? 'data' : 'params';
    let ajaxOptions = {
      url: _url,
      withCredentials: true,
      dataType: 'json',
      [ajaxDataKey]: _data,
      headers: _headers,
      method: method,
    };
    return axios(ajaxOptions).then(res => {
      let code = res.data.code.substr(res.data.code.length - 4); // 截取code的后四位
      if (code === '0004') {
        toastr.error('session已经过期，请重新登录!', '错误提示：');
        MyRouter.push(
          {
            name: 'login'
          }
        );
        let data = res.data;
        data.success = false;
        return data;
      } else if (code === '0000') {
        let data = res.data;
        data.success = true;
        return data;
      } else {
        let errorMsg = Config.XHRLOG ? _url + '<br/>' + res.data.code + ' <br/> ' + res.data.desc : res.data.desc;
        toastr.error(errorMsg, '错误提示：');
        let data = res.data;
        data.success = false;
        return data;
      }
    }).catch(err => {
      toastr.error('网络错误', '错误提示：');
    });
  }
  /**
   * 发起post请求
   * @param _url
   * @param _data
   * @param isNeedLogin 是否需要登录token默认为需要，不需要传递false即可
   */
  post(_url, _data, isNeedLogin = true) {
    return this.request(_url, _data, 'post', isNeedLogin);
  }
  /**
   * 发起get请求
   * @param _url
   * @param _params get参数
   * @param isNeedLogin 是否需要登录token默认为需要，不需要传递false即可
   */
  get(_url, _params = {}, isNeedLogin = true) {
    return this.request(_url, _params, 'get', isNeedLogin);
  }
}
export default Http;
