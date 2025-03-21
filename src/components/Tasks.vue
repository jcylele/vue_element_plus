<template>
    <el-container>
        <el-main>
            <el-space direction="vertical">
                <el-space direction="horizontal" size="large">
                    <el-button type="danger" size="default" @click="stopAll">Stop All</el-button>
                    <el-button type="primary" size="default" @click="getAll">Refresh</el-button>
                </el-space>
                <el-table :data="task_list" fit border class="wrap_line">
                    <el-table-column prop="desc" label="task" align="center" min-width="300px"/>
                    <el-table-column prop="download_limit" label="limit" align="center" min-width="280px">
                        <template #default="scope">
                            <el-space direction="vertical">
                                <el-tag v-for="limit in scope.row.download_limit.limit_desc_list" type="success" size="small"
                                        effect="plain">
                                    {{ limit }}
                                </el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column prop="worker_count" label="workers" align="center" min-width="200px">
                        <template #default="scope">
                            <el-space direction="vertical">
                                <el-tag size="small" effect="plain" v-for="(count, name) in scope.row.worker_count"
                                        :key="name">
                                    {{ name }}:{{ count }}
                                </el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column prop="queue_count" label="queues" align="center" min-width="200px">
                        <template #default="scope">
                            <el-space direction="vertical">
                                <el-tag size="small" effect="plain" v-for="(count, name) in scope.row.queue_count"
                                        :key="name">
                                    {{ name }}:{{ count }}
                                </el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column label="Op" align="center" min-width="100px">
                        <template #default="scope">
                            <el-button type="danger" @click="stopTask(scope.row.uid)">Stop</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-space>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import {getAllTasks, stopAllTasks, stopTask} from "../ctrls/DownloadCtrl.js";
import {logInfo} from "../ctrls/FetchCtrl";
import {mapActions} from "pinia";
import {BadgeStore} from "../store/BadgeStore";
import {TaskData} from "../data/TaskData";

export default {
    name: "Tasks",
    data() {
        return {
            task_list: [] as TaskData[],
        }
    },
    methods: {
        ...mapActions(BadgeStore, {
            setTaskCount: 'setTaskCount',
        }),
        async stopTask(uid: number) {
            const [ok, ret] = await stopTask(uid)
            if (ok) {
                logInfo("stop task succeed")
                this.task_list.splice(this.task_list.findIndex((task: any) => task.uid === uid), 1)
                this.setTaskCount(this.task_list.length)
            }
        },

        async stopAll() {
            const [ok, _] = await stopAllTasks()
            if (ok) {
                logInfo("stop all task succeed")
                this.task_list = []
                this.setTaskCount(0)
            }
        },

        async getAll() {
            const [ok, ret] = await getAllTasks()
            if (ok) {
                this.task_list = ret
                this.setTaskCount(ret.length)
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