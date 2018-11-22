<template>
  <div class="app-container">
    <div class="action-container">
      <el-button v-if="can('create')" class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-plus">{{$t('new')}}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleGenerate" type="primary">批量生成</el-button>
      <el-button v-if="can('export')" class="filter-item" type="primary" icon="el-icon-download" :loading="downloadLoading" @click="handleExport">{{$t('export')}}</el-button>
      <el-button v-if="can('delete')" class="filter-item" style="margin-left: 10px;" @click="handleDeleteAll" type="primary" icon="el-icon-plus">{{$t('deleteAll')}}</el-button>
      <el-dropdown style="float: right" @command="handleAddFilter">
        <el-button type="primary">
          {{$t('addFilter')}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in searchableFilters" :key="item" :command="item">
            {{item}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <crud-filter :resourceClass="resourceClass" :searchParams="searchParams" @removeFilter="handleRemoveFilter" @handleSearch="handleSearch" />

    <crud-table :key="nestedKey" :listLoading="listLoading" :resourceClass="resourceClass" :list="list" :filter="colFilter" @handleAction="handleAction" @handleSort="handleSort" />

    <crud-paginate :listQuery="listQuery" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />

    <el-dialog v-if="can('edit') || can('create')" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <crud-form :resourceClass="resourceClass" :formData="activeRow" :status="dialogStatus" @cancel="dialogFormVisible = false" @create="createData" @update="updateData" />
    </el-dialog>

    <el-dialog v-if="can('show')" :visible.sync="showingFormVisible">
      <crud-show :list="showingData" />
    </el-dialog>

    <el-dialog title="Code Generator" :visible.sync="generatorFormVisible">
      <div style="margin: 10px;">
        <span> 生成数: </span>
        <el-input v-model="count" placeholder="Please input" style='width:400px;'></el-input>
      </div>
      <div style="margin: 10px;">
        <span> 券类型: </span>
        <el-select v-model="codeType" @change="total=1">
          <el-option v-for="item in codeTypeOptions" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>
      </div>
      <div style="margin: 10px;">
        <span> 到期时间: </span>
        <el-date-picker v-model="deadline" type="datetime" style='width:400px;' />
      </div>
      <div v-if="isTeamCode" style="margin: 10px;">
        <span> 使用次数: </span>
        <el-input v-model="total" placeholder="Please input" style='width:400px;'></el-input>
      </div>
      <div style="margin: 10px;">
        <span> 电影院组: </span>
        <el-select v-model="cinemaGroupId" filterable remote :remote-method="searchCinemaGroup" :loading="generatorLoading">
          <el-option v-for="item in groupAssociateOptions" :key="item.key" :label="item.value" :value="item.key" />
        </el-select>
      </div>
      <div style="margin: 10px;">
        <span> 备注: </span>
        <el-input v-model="desc" placeholder="Please input" style='width:400px;' type="textarea"></el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="generatorFormVisible = false">cancel</el-button>
        <el-button type="primary" @click="generateData">OK</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import crudMixin from '@/components/BaseCRUD/crud.mixin'
import {
  getResourceClass
} from '@/resources'

export default {
  name: 'VoucherCRUD',
  mixins: [crudMixin],
  data() {
    return {
      count: 10,
      deadline: undefined,
      codeType: '2d',
      cinemaGroupId: undefined,
      desc: '',
      total: 1,
      codeTypeOptions: [
        { key: '2d', value: '2d' },
        { key: '3d', value: '3d' },
        { key: 'all', value: '通兑' },
        { key: 'team', value: '团队' }
      ],
      groupAssociateOptions: [],
      generatorFormVisible: false,
      generatorLoading: false
    }
  },
  computed: {
    isTeamCode() {
      return this.codeType === 'team'
    }
  },
  methods: {
    resetFormData() {
      this.count = 10
      this.deadline = undefined
      this.codeType = '2d'
      this.cinemaGroupId = undefined
      this.desc = ''
      this.total = 1
    },
    async handleGenerate() {
      this.resetFormData()
      await this.searchCinemaGroup('')
      this.generatorFormVisible = true
    },
    async generateData() {
      this.downloadLoading = true
      const list = await this.resourceClass.api().generate(this.count, this.codeType, this.deadline, this.cinemaGroupId, this.total, this.desc)
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = this.resourceClass.exportAttrs().map(item => item.name)
        const data = list.map(data =>
          this.resourceClass
            .exportAttrs()
            .map(col => this.colFilter(col, data[col.name]))
        )
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
        this.generatorFormVisible = false
        this.getList()
      })
    },
    async searchCinemaGroup(query) {
      this.generatorLoading = true
      const queryParam = { 'x-per-page': 50 }
      if (query !== '') {
        queryParam['name-like'] = query + '%'
      }
      const list = await getResourceClass('CinemaGroup').api().list(queryParam)
      this.groupAssociateOptions = list.rows.map(item => {
        return {
          key: item.id,
          value: item.name
        }
      })
      this.generatorLoading = false
    }
  }
}
</script>
