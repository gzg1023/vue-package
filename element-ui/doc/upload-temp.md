uploadTemp 上传组件

使用方法

    import uploadTemp from '../components/uploadTemp'
    // 普通图片
    <upload-temp
        :uploadUrl="imgUrl"
        @getUrlHandle="getUrlHandle">
    </upload-temp>
    // mp4
    <upload-temp
    :fileType="2"
    @uploadProgressHandle="uploadStateHandle"
    :uploadUrl="mp4Urls"
    uploadType="mp4"
    :hasDeleteFlag="true"
     @getUrlHandle="getMp4UrlHandle">
    <template v-slot:tips>
    我是slot传进来的内容
    </template>
    </upload-temp>

参数说明

兼容 element-ui 的全部参数

| 属性          | 参数(默认) | 备注                                                                     | 可选性 |
| ------------- | ---------- | ------------------------------------------------------------------------ | ------ |
| uploadUrl     | 文件的地址 | 新增为空，修改为传入的 url                                               | 必选   |
| maxFileSize   | 2          | 传入一个 MB 单位的数字                                                   | -      |
| fileType      | 1          | 1 图片 2 动图 mp4 等 3 是文件                                            | -      |
| btnText       | 上传       | 上传按钮的文本                                                           | -      |
| uploadTip     | ''         | 只允许 xx 图片                                                           | -      |
| hasDeleteFlag | false      | 删除内容是否需要弹窗确认                                                 | -      |
| uploadType    | ''         | 选择文件时 和上传时候的类型限制,规则必须是 jpg,jpeg,png,gif 中文逗号分隔 | -      |

方法说明

getUrlHandle 上传成功的回调，返回的参数是是文件的 url 和文件上传对象

uploadErrHandle 上传失败的回调，返回的参数是是文件的 url 和文件上传对象

uploadProgressHandle 上传过程进度的回调，返回的参数是进度百分比

uploadChangeHandle 上传时间的回到，返回的参数是文件
