<template>
  <div class="demo">
    <el-transfer
      v-model="value"
      filterable
      :data="mainData"
      :filter-method="filterMethod"
      :target-order="'push'"
      :titles="['待选标签', '已选标签']"
      :props="{ key: 'labelId', label: 'labelName' }"
      :left-default-checked="hasCheckedWHLeftData"
      @left-check-change="handleWHLeftChange"
      :right-default-checked="hasCheckedWHRightData"
      @right-check-change="handleWHRightChange"
      @change="changeHandle"
    ></el-transfer>
    <el-alert
      v-show="canDrop"
      class="tips"
      title="【已选标签】可以直接拖动排序"
      type="warning"
      :closable="false"
    >
    </el-alert>
    <div slot="footer" class="dialog-footer">
      <el-button @click="confirmHandle('close')">取 消</el-button>
      <el-button type="primary" @click="confirmHandle('confirm')">确 定</el-button>
    </div>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
export default {
  name: 'transfer-list',
  props: {
    transferData: {
      type: Array,
      default: []
    },
    selectTrabsferData: {
      type: Array,
      default: []
    },
    canDrop: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterMethod(query, item) {
        let regStr = query.replace(/\*/g, '.*')
        let reg = new RegExp(regStr)
        return reg.test(item.labelName)
      },
      hasCheckedWHLeftData: [], // 数据左边选中的数据
      hasCheckedWHRightData: [], // 数据右边选中的数据,
      value: []
    }
  },
  computed: {
    mainData() {
      return this.transferData
    }
  },
  created() {
    // 传进来的是字符串数组，要处理成数字
    this.value = this.selectTrabsferData.map(item => item / 1)
  },
  mounted() {
    if (this.canDrop) {
      let el = document.querySelector('.el-transfer').querySelectorAll('.el-checkbox-group')[1]
      let sortObj = new Sortable(el, {
        forceFallback: false,
        onUpdate: event => {
          let box = this.$el.querySelector('.el-transfer').querySelectorAll('.el-checkbox-group')[1]
          let nums = this.$el
            .querySelector('.el-transfer')
            .querySelectorAll('.el-checkbox-group')[1].childNodes.length
          console.log(nums, event.newIndex)
          if (event.newIndex >= nums) {
            return
          }
          let newIndex = event.newIndex
          let oldIndex = event.oldIndex
          let $label = box.children[newIndex]
          let $oldLabel = box.children[oldIndex]
          box.removeChild($label)
          if (newIndex < oldIndex) {
            box.insertBefore($label, $oldLabel)
          } else {
            box.insertBefore($label, $oldLabel.nextSibling)
          }
          let item = this.value.splice(oldIndex, 1)
          this.value.splice(newIndex, 0, item[0])
        }
      })
      console.log('sortObj', sortObj)
    }
  },
  methods: {
    // 数据左侧列表元素被用户选中 / 取消选中时触发
    handleWHLeftChange(key, key1) {},
    // 数据右侧列表元素被用户选中 / 取消选中时触发
    handleWHRightChange(key, key1) {},
    changeHandle(val, sort, keyArr) {},
    confirmHandle(type) {
      this.$emit('backData', type, this.value)
    }
  }
}
</script>

<style lang="less" scoped>
.tips {
  margin-top: 10px;
}
.dialog-footer {
  margin: 50px 0 0 300px;
}
</style>
