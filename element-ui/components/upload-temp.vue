<template>
  <div class="upload-temp">
    <el-upload
      ref="upLoadRef"
      :action="action"
      :multiple="multiple"
      :data="updataToken"
      :with-credentials="withCredentials"
      :show-file-list="showFileList"
      :drag="drag"
      :accept="accept"
      :list-type="listType"
      :file-list="fileList"
      :disabled="disabled"
      :limit="limit"
      :before-upload="beforeUpload"
      :on-remove="onRemove"
      :on-success="onSuccess"
      :on-error="onError"
      :on-progress="onProgress"
      :on-change="onChange"
      :before-remove="beforeRemove"
      :on-exceed="onExceed"
    >
      <el-button slot="trigger" class="upload_btn" size="small" type="primary">{{
        btnText
      }}</el-button>
      <br />
      <el-button
        size="small"
        class="upload_btn"
        type="primary"
        @click="deleteInfoHandle"
        v-show="dialogImageUrl || dialogvideoUrl || dialogfileUrl"
        >删除</el-button
      ><br />
      <el-button
        size="small"
        class="upload_btn"
        type="primary"
        @click="cancelUploadHandle"
        v-if="filePercentage > 0 && filePercentage != 100"
        >取消</el-button
      >
      <div slot="tip" class="el-upload__tip">{{ uploadTip }}</div>
      <main class="el-upload-main-info"><slot name="tips"></slot></main>
    </el-upload>
    <div>
      <!-- 装进度条 -->
      <div v-if="filePercentage > 0 && filePercentage != 100" class="upload-progress">
        <!-- 上传的进度条 -->
        <el-progress :width="120" type="circle" :percentage="filePercentage"></el-progress>
      </div>
      <!-- 装图片或者文字的盒子 -->
      <div v-else class="upload-info-box">
        <!-- 预览图片的盒子 -->
        <div class="upload-img-box" v-if="dialogImageUrl">
            <img :src="dialogImageUrl" />
        </div>
        <!-- 预览视频的盒子 -->
        <div class="upload-video-box" v-if="dialogvideoUrl">
          <a :href="dialogvideoUrl" class="upload-video-link" target="_blank"
            ><video :src="dialogvideoUrl" class="upload-video-content" controls="controls"></video
          ></a>
        </div>
        <!-- 文件名和url的盒子 -->
        <div class="upload-file-box" v-if="dialogfileUrl">
          <a :href="dialogfileUrl" class="upload-file-link flow-wave" target="_blank">
            {{ fileName || dialogfileUrl.substring(dialogfileUrl.lastIndexOf('/') + 1) }}(点我查看)
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
// 配置需要请求的公司的后端地址
const API_PATH = 'upload.xxx.com'
// 需要上传的云服务器地址
const uploadAction = '//upload.qiniu.com'
// 普通图片上传的接口地址
const uploadFetchUrl1 = '/api/upload/image/'
// 动态图片上传的接口地址
const uploadFetchUrl2 = '/api/upload/image2/'
// 文件内容上传的接口地址
const uploadFetchUrl3 = '/api/upload/file/'

export default {
  name: '画pload',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    withCredentials: {
      type: Boolean,
      deafult: false
    },
    showFileList: {
      type: Boolean,
      deafult: true
    },
    drag: {
      type: Boolean,
      deafult: false
    },
    listType: {
      type: String,
      default: 'text'
    },
    disabled: {
      type: Boolean,
      deafult: false
    },
    // 上传文件的次数限制
    limit: {
      type: Number,
      deafult: null
    },
    // 单位是MB
    maxFileSize: {
      type: Number,
      default: 200
    },
    // 1 是图片 2 是动图或者其他属性 3 是文件
    fileType: {
      type: Number,
      default: 1
    },
    btnText: {
      type: String,
      default: '上传'
    },
    uploadTip: {
      type: String,
      default: ''
    },
    hasDeleteFlag: {
      type: Boolean,
      deafult: false
    },
    uploadType: {
      type: String,
      default: ''
    },
    uploadUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      action: uploadAction,
      dialogImageUrl: '',
      dialogvideoUrl: '',
      dialogfileUrl: '',
      updataToken: {},
      fileList: [],
      uploadData: null,
      fileDefaultType: '',
      filePercentage: 0,
      accept: '',
      uploadTypeList: [],
      fileName: ''
    }
  },
  methods: {
    getToken(_params) {
      let _url = ''
      // 根据不同的文件类型切换url
      if (this.fileType === 1) {
        _url = uploadFetchUrl1
      } else if (this.fileType === 2) {
        _url = uploadFetchUrl2
      } else if (this.fileType === 3) {
        _url = uploadFetchUrl3
      }
      return axios({
        url: API_PATH + _url,
        method: 'get',
        withCredentials: true,
        params: _params
      })
        .then(response => {
          return response.data
        })
        .catch(er => {
          return {
            error: true,
            url: er
          }
        })
    },
    onRemove() {},
    onSuccess(response, file, fileList) {
      this.$message.success('上传成功')
      // 如果是mp4，本地预览时候的显示视频预览框。否则展示图片或者文本
      if (this.fileType === 2 && this.fileDefaultType.indexOf('mp4') !== -1) {
        this.dialogvideoUrl = this.uploadData[0].url
      } else if (this.fileType === 1 || this.fileType === 2) {
        this.dialogImageUrl = this.uploadData[0].url
      } else if (this.fileType === 3) {
        this.dialogfileUrl = this.uploadData[0].url
      }
      this.$emit('getUrlHandle', this.uploadData[0].url, file)
    },
    onError(err, file, fileList) {
      this.$message.error('上传失败')
      this.$emit('uploadErrHandle', err, file, fileList)
    },
    onProgress(event, file, fileList) {
      let perCentNumber = event.percent
      this.filePercentage = Number(perCentNumber.toFixed(0))
      // let uploadFlag = false
      this.$emit('uploadProgressHandle', this.filePercentage)
    },
    onChange(file, fileList) {
      console.log('onChange', file, fileList)
      this.$emit('uploadChangeHandle', this.filePercentage)
    },
    beforeUpload(file) {
      console.log('beforeUpload', file)
      let sizeObj = file.size / 1024
      let typeObj = file.type
      let paramsType = typeObj.substring(typeObj.lastIndexOf('/') + 1) || 'png'
      // 控制上传文件的大小
      if (sizeObj > this.maxFileSize * 1024) {
        this.$message.warning(`上传文件大小不能超过${this.maxFileSize}MB!`)
        return false
      }
      // 控制上传文件的类型
      // 如果上传的类型和调用组件时候传入的类型 不一致，则禁止上传
      console.log('typeObj', typeObj)
      this.fileDefaultType = typeObj
      // 处理上传的参数
      let params = {
        num: 1,
        type: paramsType
      }
      // 如果是文件类型则只需要fileExt参数
      if (this.fileType === 3) {
        params = {}
        params.fileExt = this.checkFileType(typeObj)
        paramsType = this.checkFileType(typeObj)
      }
      let uploadTypeFlag = false
      // 如果存在需要校验的情况，则进行类型校验
      if (this.uploadType !== '') {
        this.uploadTypeList.forEach(item => {
          if (item === paramsType) {
            uploadTypeFlag = true
          }
        })
        if (!uploadTypeFlag) {
          this.$message.warning(`请上传指定格式类型的文件!`)
          return false
        }
      }
      this.fileName = file.name
      return new Promise((resolve, reject) => {
        this.getToken(params).then(res => {
          this.updataToken = res.data[0]
          this.uploadData = res.data
          resolve()
        })
      })
    },
    beforeRemove() {},
    onExceed() {},
    clearFilesHandle() {},
    abortHandle() {},
    submitHandle() {},
    checkFileType(typeObj) {
      let typeList = [
        {
          key: 'text',
          value: 'txt'
        },
        {
          key: 'excel',
          value: 'xls'
        },
        {
          key: 'word',
          value: 'doc'
        },
        {
          key: 'excel',
          value: 'xls'
        }
      ]
      let typeValue
      typeList.forEach(item => {
        if (typeObj.indexOf(item.key) !== -1) {
          typeValue = item.value
        }
      })
      return typeValue || 'png'
    },
    deleteInfoHandle() {
      if (this.hasDeleteFlag) {
        this.confirmClearData()
      } else {
        this.clearData()
      }
    },
    clearData() {
      this.resetData()
      console.log(this.uploadData)
      this.$emit('getUrlHandle', '', null)
      this.$message.success('删除成功')
    },
    confirmClearData() {
      this.$confirm('确认删除上传的文件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.clearData()
        })
        .catch(() => {
          this.$message('已取消删除')
        })
    },
    cancelUploadHandle() {
      this.filePercentage = 0
      this.$refs.upLoadRef.abort()
    },
    resetData() {
      this.dialogImageUrl = ''
      this.dialogvideoUrl = ''
      this.dialogfileUrl = ''
      this.uploadData = null
    },
    setData() {
      this.$nextTick(() => {
        if (this.fileType === 1) {
          this.dialogImageUrl = this.uploadUrl
        } else if (this.fileType === 2) {
          this.dialogvideoUrl = this.uploadUrl
        } else if (this.fileType === 3) {
          this.dialogfileUrl = this.uploadUrl
        }
      })
    }
  },
  mounted() {
    // 传入了需要校验的类型
    if (this.uploadType !== '') {
      this.uploadTypeList = this.uploadType.split(',')
      let acceptStr = ''
      this.uploadTypeList.forEach(item => {
        acceptStr += `.${item},`
      })
      this.accept = acceptStr
    }
    this.setData()
  },
  watch: {
    uploadUrl() {
      this.setData()
    }
  }
}
</script>

<style lang="less" scoped>
.upload-temp {
  padding: 10px;
  display: flex;
  .upload_btn {
    margin: 3px;
  }
  .upload-img-box {
    width: 120px;
    height: 120px;
    img {
      width: 120px;
      height: 120px;
    }
  }
  .upload-progress {
    margin-left: 50px;
  }
  .upload-info-box {
    margin-left: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60px;
  }
  .el-upload-main-info {
    max-width: 100px;
  }
  .upload-video-box {
    width: 120px;
    height: 120px;
    .upload-video-link {
      display: inline-block;
    }
    .upload-video-content {
      pointer-events: none;
    }
    video {
      width: 120px;
      height: 120px;
    }
  }
  .upload-file-box {
    .upload-file-link {
      font-size: 16px;
      color: #000;
    }
  }
}
.flow-wave {
  background: radial-gradient(
      circle at 10px 27px,
      transparent 8px,
      currentColor 8px,
      currentColor 9px,
      transparent 9px
    )
    repeat-x;
  background-size: 20px 20px;
  background-position: -10px calc(100% + 16px), 0 calc(100% - 4px);
  animation: waveFlow 1s infinite linear;
}
@keyframes waveFlow {
  from {
    background-position-x: -10px, 0;
  }
  to {
    background-position-x: -30px, -20px;
  }
}
</style>
