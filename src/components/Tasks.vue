<template>
  <el-container>
    <el-main>
      <el-space direction="vertical">
        <el-table :data="task_list" border class="wrap_line">
          <el-table-column prop="desc" label="task" min-width="300px"/>
          <el-table-column prop="download_limit" label="limit" min-width="200px">
            <template #default="scope">
              <el-space direction="vertical">
                <el-space direction="horizontal">
                  <el-tag v-if="scope.row.download_limit.actor_count > 0" type="success" size="small" effect="dark">
                    {{ scope.row.download_limit.actor_count }} actors
                  </el-tag>
                  <el-tag type="success" size="small" effect="dark">
                    {{ scope.row.download_limit.post_desc() }}
                  </el-tag>
                </el-space>
                <el-space direction="horizontal">
                  <el-tag v-if="scope.row.download_limit.total_file_size > 0" type="success" size="small" effect="dark">
                    Total {{ scope.row.download_limit.total_file_size_desc() }}
                  </el-tag>
                  <el-tag v-if="scope.row.download_limit.file_size > 0" type="success" size="small" effect="dark">
                    Single {{ scope.row.download_limit.file_size_desc() }}
                  </el-tag>
                </el-space>
                <el-space direction="horizontal">
                  <el-tag v-if="scope.row.download_limit.allow_img" type="success" size="small" effect="dark">
                    images
                  </el-tag>
                  <el-tag v-if="scope.row.download_limit.allow_video" type="success" size="small" effect="dark">
                    videos
                  </el-tag>
                </el-space>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="worker_count" label="workers" min-width="200px">
            <template #default="scope">
              <el-space direction="vertical">
                <el-tag size="small" effect="dark" v-for="(count, name) in scope.row.worker_count" :key="name">
                  {{ name }}:{{ count }}
                </el-tag>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="queue_count" label="queues" min-width="200px">
            <template #default="scope">
              <el-space direction="vertical">
                <el-tag size="small" effect="dark" v-for="(count, name) in scope.row.queue_count" :key="name">
                  {{ name }}:{{ count }}
                </el-tag>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column label="Op" min-width="100px">
            <template #default="scope">
              <el-button type="danger" @click="stopTask(scope.row.uid)">Stop</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-space direction="horizontal" :fill="true">
          <el-button type="primary" size="default" @click="getAll">Refresh</el-button>
          <el-button type="danger" size="default" @click="stopAll">Stop All</el-button>
          <el-button type="info" size="default" @click="clean">Remove Outdated Files</el-button>
        </el-space>

      </el-space>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import {getAllTasks, cleanFiles, stopAllTasks, stopTask} from "../ctrls/DownloadCtrl.js";
import TaskData from "../data/TaskData";
import {logInfo} from "../ctrls/FetchCtrl";

export default {
  name: "Tasks",
  data() {
    return {
      task_list: [] as TaskData[],
    }
  },
  methods: {
    async stopTask(uid: number) {
      const [ok, ret] = await stopTask(uid)
      if (ok) {
        logInfo("stop task succeed")
        this.task_list.splice(this.task_list.findIndex((task: any) => task.uid === uid), 1)
      }
    },

    async stopAll() {
      const [ok, _] = await stopAllTasks()
      if (ok) {
        logInfo("stop all task succeed")
        this.task_list = []
      }
    },

    async getAll() {
      const [ok, ret] = await getAllTasks()
      if (ok) {
        this.task_list = ret
      }
    },

    async clean() {
      const [ok, ret] = await cleanFiles()
      if (ok) {
        logInfo("clean outdated files succeed")
      }
    },
  },
  mounted() {
    this.getAll()
  }
}
</script>

<style scoped>

</style>