# 具体封装的blog

本篇blog是介绍封装axios的记录，创建项目什么的就跳过了。我们直接安装axios依赖 ，yarn add axios ，开始封装。

我们在项目结构中，新建一个fetch文件夹，里面存放我们的axios请求文件(index.js)和url地址文件urls.js

首先在index.j先定义一个baseConfig用来保存，网络请求的基本信息。

        let baseConfig = {
            // 请求的地址，如果是线上环境改成服务器地址
            baseURL: process.env.NODE_ENV === 'production' ? 'http://192.168.1.21' : './',
            // 接口超时时间
            timeout: 2000,
            // 设置请求头交互的数据格式为json
            headers: {
              'Content-Type': 'application/json'
            },
            // 表示跨域请求时是否需要使用凭证
            withCredentials: true
          }

然后创建一个axios对象，

    let instance = axios.create(baseConfig)

创建post请求函数

    function postHttp (config, funcName, data, baseConfig = {}) {
        // 深拷贝一份数据，
        let newConfig = _.cloneDeep(config[funcName])
        if (data) {
          let cloneData = _.cloneDeep(data)
          newConfig.data = cloneData
        }
        // 把url中的cannotCancel绑定到请求中
        baseConfig.cannotCancel = newConfig.cannotCancel
        return instance.post(newConfig.url, newConfig.data, baseConfig)
      }

请求拦截器函数

    let requestInterceptor = function (config) {
        config.data = qs.stringify(config.data)
      return config
      }





响应拦截器函数

      let responseInterceptor = function (response) {
      let data = response.data
        if (data && data.errCode) {
          let code = data.errCode
          switch (code) {
            case 200:
              return data
            case 300:
              break
            default:
              return 
          }
        }
        return data
        }

绑定请求和响应拦截器

      instance.interceptors.request.use(requestInterceptor)
      instance.interceptors.response.use(responseInterceptor)

在创建好基本请求后，我们在vuex中保存一个请求数组，用来取消网络请求

       state: {
          cancelToken: []
        },
        mutations: {
          PUSH_REQ_TOLEN (state, payload) {
            state.cancelToken.push(payload.cancelToken)
          },
          CLEAR_REQ_TOKEN ({ cancelTokenArr }) {
            cancelTokenArr.map(item => {
              item('turnCancel')
            })
            cancelTokenArr = []
          }
        }

然后在main.js挂载到vue原型链里面

    Vue.prototype.$post = post
    Vue.prototype.$getJson = getJson

在组件中使用

    this.$post('getUserInfo2', {
        a: 11,
        b: 22
      }).then(data => {
        console.log(data)
      })

全部函数

      import axios from 'axios'
      import qs from 'qs'
      import _ from 'lodash'
      import urlInfo from './urls'
      import store from '../store'
      // 基础配置
      const config = urlInfo
      let baseConfig = {
      // 请求的地址，如果是线上环境改成服务器地址
      baseURL: process.env.NODE_ENV === 'production' ? 'http://192.168.1.21' : './',
      // 接口超时时间
      timeout: 2000,
      // 设置请求头为json格式
      headers: {
        'Content-Type': 'application/json'
      },
      // 表示跨域请求时是否需要使用凭证
      withCredentials: true
      }
      // 请求拦截器
      let requestInterceptor = function (config) {
      // 登陆以后保存的token
      let token = window.localStorage.getItem('token') || ''
      if (!config.data) config.data = {}
      // 判断该请求是否为白名单请求
      if (!config.cannotCancel) {
        config.cancelToken = new axios.CancelToken(function (cancel) {
          store.commit('PUSH_REQ_TOLEN', { cancelToken: cancel })
        })
      }
      // 判断请求的类型校验参数，预防异常请客
      if (
        config.method === 'post' &&
        config.headers['Content-Type'] !== 'application/json'
      ) {
        // 把token放到发送的参数中，并序列化数据
        config.data.token = token
        config.data = qs.stringify(config.data)
      }
      return config
      }
      // 响应拦截器
      let responseInterceptor = function (response) {
      let data = response.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          data = {}
          console.log('解析数据出错', e)
        }
      }
      if (data && data.errCode) {
        let code = data.errCode
        switch (code) {
          case 200:
            return data
          case 300:
            // 如果是300拦截掉未完成的请求
            store.commit('CLEAR_REQ_TOKEN')
            break
          default:
            return Promise.reject(data)
        }
      }
      return data
      }
      // 请求错误处理
      let requestError = function (params) {

      }
      // 相应错误处理
      let responseError = function (params) {

      }
      let instance = axios.create(baseConfig)

      const requestInstance = instance.interceptors.request.use(requestInterceptor, requestError)
      // 移除拦截器
      axios.interceptors.request.eject(requestInstance)
      instance.interceptors.response.use(responseInterceptor, responseError)
      // post请求函数体
      function postHttp (config, funcName, data, baseConfig = {}) {
      if (typeof config[funcName] !== 'object') {
        console.log(
          '%c调用api函数函数错误，请检查函数名称是否错误',
          'color: red',
          funcName
        )
        return
      }
      let newConfig = _.cloneDeep(config[funcName])
      if (data) {
        let cloneData = _.cloneDeep(data)
        newConfig.data = cloneData
      }
      baseConfig.cannotCancel = newConfig.cannotCancel
      return instance.post(newConfig.url, newConfig.data, baseConfig)
      }
      // 获取json请求函数
      function getJson (url) {
      return axios.request(url)
      }
      function post (funcName, data, baseConfig) {
      return postHttp(config, funcName, data, baseConfig)
      }
      export { post, getJson }
