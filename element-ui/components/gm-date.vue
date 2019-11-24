<template>
  <div>
    <el-date-picker v-model="value"
                    :type="type"
                    unlink-panels
                    :disabled="disabled"
                    :readonly="readonly"
                    :clearable="clearable"
                    :editable="editable"
                    :value-format="valueFormat"
                    :format="format"
                    :size="size"
                    :align="align"
                    :range-separator="rangeSeparator"
                    @change="selectHandle"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="hasOption?pickerOption:{}">
    </el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'gm-date',
  props: {
    type: {
      type: String,
      default: 'daterange'
    },
    valueFormat: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: true
    },
    hasOption: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small'
    },
    align: {
      type: String,
      default: 'left'
    },
    rangeSeparator: {
      type: String,
      default: '-'
    },
    isDisabledDate: {
      type: Boolean,
      default: false
    }
  },
  data () {
    let that = this
    return {
      pickerOption: {
        disabledDate (time) {
          return that.isDisabledDate ? time.getTime() > Date.now() : ''
        },
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value: '',
    }
  },
  methods: {
    selectHandle () {
      this.$emit('callbackDate', this.value)
    }
  }
}
</script>
<style scoped lang='scss'>
</style>