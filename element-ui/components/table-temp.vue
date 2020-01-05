<template>
  <div class="table-temp"
       ref="tableTempWrap">
    <el-table class="farm-table-temp"
              ref="elTable"
              v-loading="innerLoading"
              loadingText='正在加载表格数据'
              :empty-text="emptyText"
              :data="cloneConfig.tableData"
              :border="cloneConfig.border ? cloneConfig.border : (cloneConfig.expand ? false : true)"
              :row-key="cloneConfig.rowKey"
              lazy
              :load="cloneConfig.loadFn"
              :stripe="typeof cloneConfig.stripe == 'undefined' ? true: cloneConfig.stripe"
              size="small"
              @row-click="rowClick"
              @expand-change="expandChange"
              @selection-change="handleSelectionChange">
      <el-table-column v-if="cloneConfig.selection"
                       type="selection"
                       align="center"
                       width="55">
      </el-table-column>
      <el-table-column v-if="cloneConfig.serialNumber"
                       type="index"
                       align="center"
                       width="55">
      </el-table-column>
      <el-table-column v-if="cloneConfig.expand"
                       type="expand">
        <template slot-scope="scope">
          <slot name="expand"
                :row="scope.row"
                :index="scope.$index"></slot>
        </template>
      </el-table-column>
      <el-table-column class="column"
                       v-for="(item, index) in cloneConfig.tableSetting"
                       :key="index"
                       :label="item.label"
                       :prop="item.prop"
                       :align="item.align || 'center'"
                       :min-width="item.minWidth || 120"
                       :width="item.width"
                       :fixed="item.fixed"
                       show-overflow-tooltip
                       :filters="item.filters"
                       :filter-method="item.filterMethod"
                       :sortable="item.sortable || false">
        <template slot-scope="scope">
          <slot :name="item.slot"
                :row="scope.row">
            <span :style="item.style ? (typeof item.style === 'function' ? item.style(scope.row) : item.style) : {}">
              {{ typeof item.formatter === 'function' ? item.formatter(scope.row, scope.column, scope.row[item.prop], index) : scope.row[item.prop] }}
            </span>
          </slot>
        </template>
      </el-table-column>
      <el-table-column v-if="cloneConfig.operation"
                       align="center"
                       :fixed="cloneConfig.operation.fixed || 'right'"
                       :label="cloneConfig.operation.label || '操作'"
                       :min-width="cloneConfig.operation.minWidth || 150"
                       :width="cloneConfig.operation.width">
        <template slot-scope="scope">
          <slot name="btn"
                :row="scope.row">
            <el-button v-for="(item, index) in cloneConfig.operation.btns"
                       :key="index"
                       v-show="typeof item.show === 'function' ? item.show(scope.row) : (item.show === false ? false : true)"
                       :disabled="item.disabled ? (typeof item.disabled === 'function') ? item.disabled(scope.row) : (item.disabled === false ? false : true) : false"
                       :size="item.size || 'mini'"
                       :type="item.type || 'text'"
                       @click="item.fn(scope.row)">
              <a v-if="item.href"
                 :href="item.href"
                 :style="(typeof item.style === 'function') ? item.style(scope.row) : item.style">
                {{ (typeof item.label === 'function') ? item.label(scope.row) : item.label }}
              </a>
              <span :style="(typeof item.style === 'function') ? item.style(scope.row) : item.style"
                    v-else>
                {{ (typeof item.label === 'function') ? item.label(scope.row) : item.label }}
              </span>
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>
    <div class="report-nav"
         v-if="cloneConfig.page"
         ref="reportNav">
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page.sync="cloneConfig.page.pageIndex"
                     :page-size="cloneConfig.page.pageSize"
                     :page-sizes="cloneConfig.page.pageSizes"
                     :layout="layout"
                     :total="cloneConfig.page.total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
/**
 * 封装表格
 * @prop [Object] config 表格的配置  config = {tableData, tableSetting, operation, selection}
 * @prop [Object] tableData 表格绑定的数据
 * @prop [Function] cell-style 单元格样式
 * @prop [Array] tableSetting 每行数据的设置
 * @prop [Object] operation 是否显示操作栏 operation = { btns: [<Object>], width: 100 }
 * @prop [Array] selection 是否显示复选框
 * @prop [Object] page 是否显示分页栏 page = { pageIndex = 1, pageSize = 15, total: 100 }
 * @prop [Object] condition 挂载的表单搜索条件， 会存在请求中发出去
 * @prop [String] fetchUrl 必须参数, 请求表格的地址
 * @prop [Boolean] resetIndex 当触发fetch时候,是否自动重置页码 默认自动重置
 * @prop [Object] map 请求数据返回的映射，根据映射设置来获取数组和分页信息  默认 {children: 'list', total: 'total'}
 * @emit [Function] afterFetch 数据返回后的执行的函数
 */

import { clone, merge } from '@/utils/obj-operation'
import { Table } from 'element-ui'
export default {
  name: 'TableTemp',
  props: {
    config: {
      type: Object,
      require: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    ...Table.props
  },
  watch: {
    'config.tableData' () {
      this.init()
    }
  },
  data () {
    return {
      responseData: null,
      showSelectList: false,
      cloneConfig: {
        map: {
          data: 'data.items',
          total: 'data.total'
        },
        resetIndex: true
      },
      layout: 'prev, pager, next, jumper',
      clientMaxHeight: 200,
      isSizeOrIndexChange: false, // 判断是否为页码获取，如果不是，则将重置currentIndex为1
      innerLoading: false // 默认开启表格得loading
    }
  },
  methods: {
    getLayout () {
      if (this.cloneConfig.page && this.cloneConfig.page.pageSizes) {
        this.layout = 'sizes, ' + this.layout
      }
      if (this.cloneConfig.page && (this.cloneConfig.page.total === 0 || this.cloneConfig.page.total)) {
        this.layout = 'total, ' + this.layout
      }
    },
    handleSelectionChange (selection) {
      this.$emit('selection-change', selection)
    },
    handleSizeChange (index) {
      if (this.cloneConfig.page) {
        this.cloneConfig.page.pageSize = index
        this.cloneConfig.page.pageIndex = 1
        this.isSizeOrIndexChange = true
      }
      if (this.cloneConfig.fetchUrl !== 'undefined') {
        this.fetch()
      } else {
        this.splitData()
      }
    },
    handleCurrentChange (index) {
      if (this.cloneConfig.page) {
        this.cloneConfig.page.pageIndex = index
        this.isSizeOrIndexChange = true
      }
      if (this.cloneConfig.fetchUrl !== 'undefined') {
        this.fetch()
      } else {
        this.splitData()
      }
    },
    // 请求表格的方法
    fetch () {
      if (!this.cloneConfig.fetchUrl) {
        console.log('%c没有fetchUrl，请检查', 'color: red')
        return
      }
      try {
        if (this.cloneConfig.resetIndex) {
          this.resetIndex()
        }
        let postData = {
          ...this.cloneConfig.condition
        }
        if (this.cloneConfig.page) {
          let size = 'pageSize'
          let index = 'pageIndex'
          if (this.cloneConfig.page.map) {
            size = this.cloneConfig.page.map.size || 'pageSize'
            index = this.cloneConfig.page.map.index || 'pageIndex'
          }
          postData[size] = this.cloneConfig.page.pageSize || 15
          postData[index] = this.cloneConfig.page.pageIndex || 1
        }

        this.innerLoading = true
        this.$emit('update:loading', true)
        let promise = this.$http(this.config.fetchUrl, postData)
        // console.log('postData', postData)
        promise
          .then(
            (data) => {
              // 保存结果
              this.responseData = data
              let tableData = this.dataMap(data, this.cloneConfig.map.data) || []
              // 数据处理函数, 传入请求返回的数据，输出处理后的数组
              if (this.cloneConfig.dataProcess) {
                tableData = this.cloneConfig.dataProcess(tableData)
              }
              // todo merge合并之后，作用于为cloneConfig，直接覆盖会使config无法响应
              this.cloneConfig.tableData = tableData
              this.config.tableData = tableData
              if (this.config.page) {
                if (this.config.page.total === 0 ? true : this.config.page.total) {
                  let total = this.dataMap(data, this.cloneConfig.map.total) || 0
                  this.cloneConfig.page && (this.$set(this.cloneConfig.page, 'total', total))
                }
              }
            },
            (data) => {
              this.clearData()
            }
          )
          .finally(() => {
            this.$emit('afterFetch', this.responseData)
            this.$emit('update:loading', false)
            this.innerLoading = false
          })
      } catch (e) {
        this.innerLoading = false
        this.$emit('update:loading', false)
        console.log('%c%s', 'color: red', e)
      }
    },
    clearData () {
      this.cloneConfig.tableData = []
      this.cloneConfig.page && (this.cloneConfig.page.pageIndex = 1) && (this.cloneConfig.page.total = 0)
    },
    dataMap (resData, map) {
      try {
        let mapArr = map.split('.')
        let data = clone(resData)
        while (mapArr.length > 0) {
          data = data[mapArr.shift()]
        }
        return data
      } catch (e) {
        console.log('数据映射出错%c%s', 'color: red', e)
      }
    },
    rowClick (row, event, column) {
      this.$emit('row-click', row, event, column)
    },
    expandChange (row, expandedRows) {
      this.$emit('expand-change', row, expandedRows)
    },
    resetIndex () {
      // 重置页码为1
      if (this.cloneConfig.page && !this.isSizeOrIndexChange) {
        this.$set(this.cloneConfig.page, 'pageIndex', 1)
        this.isSizeOrIndexChange = false
      } else {
        this.isSizeOrIndexChange = false
      }
    },
    getMaxHeight () {
      let tableTempWrap = this.$refs.tableTempWrap
      let reportNav = this.$refs.reportNav
      this.clientMaxHeight = tableTempWrap.clientHeight - (reportNav ? reportNav.offsetHeight : 0)
    },
    splitData () {
      let index = this.cloneConfig.page ? (this.cloneConfig.page.pageIndex || 1) : 1
      let size = this.cloneConfig.page ? (this.cloneConfig.page.pageSize || 15) : 15
      let last = this.config.tableData.length > size ? size : this.config.tableData.length
      this.cloneConfig.tableData = this.config.tableData.slice((index - 1) * size, (index - 1) * size + last)
      if (this.config.page) {
        this.cloneConfig.page.total = this.config.tableData.length
      }
    },
    init () {
      if (typeof this.config.fetchUrl === 'undefined' && this.config.page) {
        this.cloneConfig = clone(this.config)
        this.splitData()
      } else {
        this.cloneConfig = merge(this.config, this.cloneConfig)
      }
      if (this.loading) {
        this.innerLoading = this.loading
      }
    }
  },
  // 如果不是分页接口，而是全部返回的模式，自动分割数据形成分页
  created () {
    this.init()
    this.getLayout()
  },
  mounted () {
    // let table = this.$refs.elTable
    // console.log(table.$listeners)
  }
}
</script>

<style lang="scss" scoped>
.table-temp {
  position: relative;
}
.farm-table-temp {
  width: 100%;
  position: relative;
}

.report-nav {
  margin: 15px 0;
}

.report-nav:after {
  content: "";
  display: table;
  clear: both;
}
.column {
  padding: 0 10px;
}
.report-nav .el-pagination {
  float: right;
}
.select-column-wrap {
  position: absolute;
  top: 10px;
  right: 25px;
  z-index: 8;
  .select-column-opener {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4T62S4Q3CIBSE301gR2EFN3hsoBs4Am6iE/A2qCM4Sp3gDElpaEsTWuUfgfu4dwfkx4Wk997zCCfGiAmQNkcg/3PQ+jrJJwAVkdNshBYAyauZPVRVAcRdgELciUgPwC0BH5IBQEj2Skc1cTqfAUjezSyoqgPwypAtcQ0wiMjZzN4ZQvI2zjzZLp2tMiBZQjozG1S1Kl45yOQlJAdWa2mzhQQBcBlDdVsV76pxl4OWTzXLoFVQu/cFw8iYEWa3XFsAAAAASUVORK5CYII=")
      center center no-repeat;
    cursor: pointer;
    z-index: 8;
    .active {
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAyUlEQVQ4T62SzQ2CQBCFv9EClAT7oAU7oATtQC8GbnhTL7agFViClmAhJODRRB0Dhl9ZA+qcNtl93743M8KPJal+FepXHM+WAuDZr3PH+qODtj8rewQXGFCJ0AagTPHtHevQRTl0A2TibTTkejuCOHXABZEA1SC1V64mcXJfiaC6xB8FbCKHx/2UQ0ziNwDE9PpjFtY5hyizNHPZdtlZQxMLSCKaW7FR3OAgY1chWcOapvRhjDEwgaSh4hgn3HkP6qT/AdpsoeHNEyCmdRG0SxEsAAAAAElFTkSuQmCC")
        center center no-repeat;
    }
  }
  .select-column-list {
    position: absolute;
    top: 42px;
    right: 0;
    width: 160px;
    overflow: auto;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 23;
    .select-column-item {
      font-size: 12px;
      color: #666;
      line-height: 2;
      text-indent: 10px;
      position: relative;
    }
    .select-column-status {
      position: absolute;
      top: 4px;
      right: 10px;
      width: 16px;
      height: 16px;
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABAElEQVQ4T6VT0U3DMBC95wXoBi1S7F86QpmAdgLEBLQbwAR0hI4QRsgG+bYtmRHgP9FDFyVRa4HUNCf5w757796zz5AsUkqLtm2fSG5FZKFpkl8ASmvtZ16P84MQwpuIvA7AvFiJjDGHoijKITcSeO9PAJ5z0F97ki/OuZPmOoIY45Gkdr46AOxUCVJKq6Zp0tXIvlDtOOfucUv30T+wg/e+BvAwVUFf/44QAm8EK6yaTzDbwpxLFJHH4RlrEbmbeBeVtXbTDVIIYS8iHxMIfkhunHP1OMoTrCh4fzHKQ+cY45bkUUSW/6iperBa7uLiN2ZEa5IrY8w3SV2lSs6JfwGzII2KRxeE/gAAAABJRU5ErkJggg==");
    }
    .required .select-column-status {
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABM0lEQVQ4T51Ty1HDMBDVi+U7dIBmLF9JCdBB6MAdJFRAqACnAkgHUAEuIbnKnjElcPdnmdVYHkUh4ES31c57bz9vIYJX1/VN27ZLIroDMOc0Ee0AFFLKjVLqy4fAD6qqyoloGZIGca61fnR/I4ExhlVu/wG7dKG1vufAEkxUHrmJaA/gXWu9xtBzPVGZ57FN0zQry3ItpXzDOeoObIyZA/gEsMXU3j1wBuBFCHFlt1OWJXnlPxPRIhxmAH49WKNPIKW85mTTNIUj+Qtst+C3wCXFcWzXwyRCiB0PzBjDZR8oDwbbHw3RJ1FKfZ8CW3Vg8+saB5KHtm0zIcTTqRVLKdVFRnLqSZKsLrXyh9Z6MVrZlTjFVNw3Kx8dk/tga3ddt+r7ns/ZHhd7fzabFVEU5eE5/wDggs2uByZ5sAAAAABJRU5ErkJggg==");
    }
    .selected .select-column-status {
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABJklEQVQ4T52TQU7CUBRFz0ubMLVJmesKZAm6A9xBdyDM2pE4gjixrEDZga7ALqFdgc4hwalJ8Zn+T0sLlFT+rH3/3vvev/cJ+2e6vkTye+AGZGDLmgIJ6s6JvK86RBr42SoGCvCJozFhf1xe2BHMlinI9WlwVU0I/dviyxJ0Uq5Ta4byRtSfCGbmzWdHZVAWRH7AdDkB91X+pV6Cn9YDfjcfwELoOnulvAoQnoGLwp2iA63aV31EGB48ZhP80rSxTtBzPFP8yZOK5ATYutAYQVN6rrHHkKik9sFM2w3lbcCyI49YIxl73+1gQzFvsVFT1L2DPEDkodVida7ODJJVJ/RH50b5ndAf7qJc9tgt0kb5cJnKPzbaI9BinbfLpRlIgjrx/jr/AbD0gLAZujQ+AAAAAElFTkSuQmCC");
    }
  }
}
</style>
