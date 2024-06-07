<template>
  <el-container>
    <el-main>
      <el-space direction="vertical">
        <el-table :data="task_list" border class="wrap_line">
          <el-table-column prop="desc" label="task" min-width="300px"/>
          <el-table-column prop="download_limit" label="limit" min-width="200px">
            <template #default="scope">
              <el-space direction="vertical">
                <el-tag v-if="scope.row.download_limit.actor_count > 0" type="success" size="small" effect="dark">
                  {{ scope.row.download_limit.actor_count }} actors
                </el-tag>
                <el-tag type="success" size="small" effect="dark">
                  {{ scope.row.download_limit.post_desc() }}
                </el-tag>
                <el-tag v-if="scope.row.download_limit.total_file_size > 0" type="success" size="small" effect="dark">
                  Total {{ scope.row.download_limit.total_file_size_desc() }}
                </el-tag>
                <el-tag v-if="scope.row.download_limit.file_size > 0" type="success" size="small" effect="dark">
                  Single {{ scope.row.download_limit.file_size_desc() }}
                </el-tag>
                <el-tag v-if="scope.row.download_limit.allow_img" type="success" size="small" effect="dark">
                  images
                </el-tag>
                <el-tag v-if="scope.row.download_limit.allow_video" type="success" size="small" effect="dark">
                  videos
                </el-tag>
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
          <el-button type="danger" size="large" @click="stopAllTask()">Stop All</el-button>
          <el-button type="primary" @click="restore">Remove Outdated Downloading Files</el-button>
        </el-space>

      </el-space>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import {getAllTasks, restoreFiles, stopAllTasks, stopTask} from "../ctrls/DownloadCtrl.js";
import {ElMessage} from "element-plus";
import TaskData from "../data/TaskData";
import {DownloadLimitForm} from "../data/SimpleForms";

export default {
  name: "Tasks",
  data() {
    return {
      task_list: [] as TaskData[],
      timer: null,
    }
  },
  methods: {
    async stopTask(uid: number) {
      const [ok, ret] = await stopTask(uid)
      if (ok) {
        ElMessage({message: "stop task succeed", type: "success"})
        this.task_list.splice(this.task_list.findIndex((task: any) => task.uid === uid), 1)
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },

    async stopAllTask() {
      const [ok, ret] = await stopAllTasks()
      if (ok) {
        ElMessage({message: "stop all task succeed", type: "success"})
        this.task_list = []
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },

    async getAllTasks() {
      const [ok, ret] = await getAllTasks()
      if (ok) {
        this.task_list = ret
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },

    async restore() {
      const [ok, ret] = await restoreFiles()
      if (ok) {
        ElMessage({message: "restore succeed", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
  },
  mounted() {
    this.getAllTasks()
    if (this.timer) {
      clearInterval(this.timer)
    } else {
      this.timer = setInterval(this.getAllTasks, 5000)
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>

</style>