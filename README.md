# vue-package
本项目用于，记录封装vue框架相关工具，如axios，elementUI等

### axios文件夹，包括封装axios的源码(code)和具体封装步骤的blog

1. 封装了$getJson，$post请求，用于读取本地json文件和发送post请求
2. 对post请求统一添加了请求，响应 ，拦截器
3. 支持取消网络请求操作(支持白名单)
4. 网络请求url统一管理
5. 添加axios的polyfil(最新版已经不需要)

使用方法demo

    this.$http('urlObj',{
      data1:'',
      data2:''
    }).then((data)=>{
      
    }).catch((data)=>{

    }).finally((data)=>{ // pilyfill见code文件夹

    })

     this.$getJson('./cofig.json').then((data)=>{
      
    })

### element文件夹，封装的element组件

* table-temp表格组件
* date-temp 时间组件
* upload-temp上传组件（基于七牛云）