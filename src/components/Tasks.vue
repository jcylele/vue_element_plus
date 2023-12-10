<template>
  <el-table :data="task_list" border class="wrap_line">
    <el-table-column prop="desc" label="task" min-width="200px"/>
    <el-table-column prop="downloadLimit" label="limit" :formatter="formatLimit" min-width="100px"/>
    <el-table-column prop="worker_count" label="workers" :formatter="formatWorkers" min-width="100px"/>
    <el-table-column prop="queue_count" label="queues" :formatter="formatQueues" min-width="100px"/>
    <el-table-column label="Op" min-width="100px">
      <template #default="scope">
        <el-button type="danger" @click="stopTask(scope.row.uid)">Stop</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import {getAllTasks, stopTask} from "../ctrls/DownloadCtrl.js";
import {ElMessage} from "element-plus";

export default {
  name: "Tasks",
  data() {
    return {
      task_list: [],
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
    
    async getAllTasks() {
      const [ok, ret] = await getAllTasks()
      if (ok) {
        this.task_list = ret
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },

    formatLimit(row: any, _) {
      const limit = row.downloadLimit
      return `${limit.actor_count}/${limit.post_count}/${limit.file_size / (1024 * 1024)}`
    },
    formatWorkers(row: any, _) {
      const map = row.worker_count
      return Object.keys(map).reduce((a, b, i) => {
        return `${a} ${i ? '\n' : ''}${b}:${map[b]}`
      }, "")
    },
    formatQueues(row: any, _) {
      const map = row.queue_count
      return Object.keys(map).reduce((a, b, i) => {
        return `${a} ${i ? '\n' : ''}${b}:${map[b]}`
      }, "")
    },
  },
  mounted() {
    this.getAllTasks()
  },
}
</script>

<style scoped>

</style>