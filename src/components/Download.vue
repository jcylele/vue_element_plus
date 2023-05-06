<template>
  <el-container>
    <el-main>
      <el-tabs tab-position="left" style="flex: fit-content" class="demo-tabs"
               @tab-change="onTabChange">
        <el-tab-pane label="Restore Record" name="tab_restore">
          <el-space direction="vertical" alignment="left">
            <span>It may take a while...</span>
            <el-button type="primary" @click="restoreRecord">Restore Record</el-button>
          </el-space>
        </el-tab-pane>
        <el-tab-pane label="Download New Actors" name="tab_new">
          <el-space direction="vertical">
            <DownloadLimit :download_limit="download_limit"/>
            <el-button type="primary" @click="downloadNew">Download</el-button>
          </el-space>
        </el-tab-pane>
        <el-tab-pane label="Download By Category" name="tab_category">
          <el-space direction="vertical">
            <DownloadLimit :download_limit="download_limit"/>
            <el-radio-group v-model="actor_category" size="large">
              <el-radio v-for="category in actor_category_list"
                        :label="category.value"
                        border>
                {{ category.name }}
              </el-radio>
            </el-radio-group>
            <span>Number of Actors in Category: {{ actor_count }}</span>
            <el-button type="primary" @click="downloadByCategory">Download</el-button>
          </el-space>
        </el-tab-pane>
        <el-tab-pane label="Download By Names" name="tab_name">
          <el-space direction="vertical">
            <el-steps :active="actor_search_step" finish-status="success" align-center>
              <el-step title="Choose Actors"/>
              <el-step title="Set Download Config"/>
            </el-steps>
            <el-divider/>
            <el-space direction="horizontal" size="large" wrap>
              <el-tag v-for="actor_name in actor_name_list"
                      :key="actor_name"
                      @close="removeActor(actor_name)"
                      closable>
                {{ actor_name }}
              </el-tag>
            </el-space>
            <el-divider/>
            <el-space direction="vertical" v-if="actor_search_step == 0">
              <el-space direction="horizontal">
                <el-input v-model="actor_search_name" size="large" clearable/>
                <el-button @click="searchActors">Search</el-button>
                <el-button type="primary" @click="AddToNameList(actor_search_name)">Add Actor</el-button>
              </el-space>
              <el-table :data="actor_search_list" border>
                <el-table-column type="selection" width="55"/>
                <el-table-column prop="actor_name" label="Name" min-width="200px"/>
                <el-table-column prop="actor_category" label="Category" :formatter="formatter" min-width="100px"/>
                <el-table-column label="Tags" min-width="200px">
                  <template #default="scope">
                    <el-tag v-for="tag_id in scope.row.rel_tags"
                            style="font-size: 18px;background: lightyellow;color: hotpink"
                            round>
                      {{ getTagName(tag_id) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Tags" min-width="100px">
                  <template #default="scope">
                    <el-button type="primary" @click="AddToNameList(scope.row.actor_name)">Add</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-button type="primary" @click="actor_search_step++">Next</el-button>
            </el-space>
            <el-space direction="vertical" v-if="actor_search_step == 1">
              <DownloadLimit :download_limit="download_limit"/>
              <el-button type="primary" @click="downloadByName">Download</el-button>
            </el-space>
          </el-space>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script lang="ts">

import {DownloadLimitForm} from "../data/SimpleForms";
import {downloadByCategory, downloadByNames, downloadNewActors, restoreRecord} from "../ctrls/DownloadCtrl";
import {ElMessage} from "element-plus";
import DownloadLimit from "./DownloadLimit.vue";
import ActorCategory from "../consts/ActorCategory";
import {getActorCount, getActorList} from "../ctrls/ActorCtrl";
import ActorFilterData from "../data/ActorFilterData";
import ActorData from "../data/ActorData";
import {mapActions} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";

export default {

  components: {DownloadLimit},
  data() {
    return {
      download_limit: new DownloadLimitForm(),
      actor_category: ActorCategory.Init.value,
      actor_count: 0,
      actor_search_step: 0,
      actor_search_name: "",
      actor_search_list: [] as ActorData[],
      actor_name_list: [] as string[],
      actor_category_list: [ActorCategory.Init, ActorCategory.Liked]
    }
  },
  watch: {
    async actor_category(new_val, old_val) {
      this.download_limit.resetDefaultValue(new_val)
      //get corresponding actor count
      const filter_data = new ActorFilterData()
      filter_data.category_list = [new_val]
      const [ok, actor_count] = await getActorCount(filter_data)
      if (ok) {
        this.actor_count = actor_count
      } else {
        ElMessage(actor_count as string)
      }
    }
  },
  computed: {
    ActorCategory() {
      return ActorCategory
    }
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagsFromServer: 'getFromServer',
      getTagName: 'getName',
    }),
    AddToNameList(actor_name: string) {
      this.actor_name_list.push(actor_name)
    },
    formatter(row: ActorData, _) {
      return row.actor_category.name
    },
    onTabChange(pane_name) {
      console.log(pane_name)
      switch (pane_name) {
        case 'tab_restore':
          break
        case 'tab_new':
          this.download_limit.resetDefaultValue(ActorCategory.Init.value)
          break
        case 'tab_name':
          this.download_limit.resetDefaultValue(ActorCategory.Enough.value)
          break
        case 'tab_category':
          this.download_limit.resetDefaultValue(this.actor_category)
          break
      }
    },
    async searchActors() {
      const filter_data = new ActorFilterData()
      filter_data.name = this.actor_search_name
      const [ok, actor_list] = await getActorList(filter_data)
      if (ok) {
        this.actor_search_list = actor_list
      } else {
        ElMessage(actor_list as string)
      }
    },
    async downloadNew() {
      const [ok, ret] = await downloadNewActors(this.download_limit)
      if (ok) {
        ElMessage({message: "download started", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
    async downloadByCategory() {
      const [ok, ret] = await downloadByCategory(this.actor_category, this.download_limit)
      if (ok) {
        ElMessage({message: "download started", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
    async downloadByName() {
      const [ok, ret] = await downloadByNames(this.download_limit, this.actor_name_list)
      if (ok) {
        this.actor_name_list = []
        ElMessage({message: "download started", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
    async restoreRecord() {
      const [ok, ret] = await restoreRecord()
      if (ok) {
        ElMessage({message: "restore record succeed", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
  },
  async mounted() {
    await this.getTagsFromServer()
  }
}

</script>

<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

</style>