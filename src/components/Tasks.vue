<template>
    <el-container>
        <el-main>
            <el-space direction="vertical">
                <el-space direction="horizontal" size="large">
                    <el-button type="danger" size="default" @click="stopAll">Stop All</el-button>
                    <el-button type="primary" size="default" @click="getAll">Refresh</el-button>
                </el-space>
                <el-table :data="task_list" border class="wrap_line">
                    <el-table-column prop="desc" label="task" min-width="300px"/>
                    <el-table-column prop="download_limit" label="limit" min-width="280px">
                        <template #default="scope">
                            <el-space direction="vertical">
                                <el-space direction="horizontal">
                                    <el-tag v-if="scope.row.download_limit.actor_count > 0" type="success" size="small"
                                            effect="plain">
                                        {{ scope.row.download_limit.actor_count }} actors
                                    </el-tag>
                                    <el-tag type="success" size="small" effect="plain">
                                        {{ scope.row.download_limit.post_desc() }}
                                    </el-tag>
                                </el-space>
                                <el-space direction="horizontal">
                                    <el-tag v-if="scope.row.download_limit.total_file_size > 0" type="success"
                                            size="small" effect="plain">
                                        Total {{ scope.row.download_limit.total_file_size_desc() }}
                                    </el-tag>
                                    <el-tag v-if="scope.row.download_limit.file_size > 0" type="success" size="small"
                                            effect="plain">
                                        Single {{ scope.row.download_limit.file_size_desc() }}
                                    </el-tag>
                                </el-space>
                                <el-space direction="horizontal">
                                    <el-tag v-if="scope.row.download_limit.allow_img" type="success" size="small"
                                            effect="plain">
                                        images
                                    </el-tag>
                                    <el-tag v-if="scope.row.download_limit.allow_video" type="success" size="small"
                                            effect="plain">
                                        videos
                                    </el-tag>
                                </el-space>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column prop="worker_count" label="workers" min-width="200px">
                        <template #default="scope">
                            <el-space direction="vertical">
                                <el-tag size="small" effect="plain" v-for="(count, name) in scope.row.worker_count"
                                        :key="name">
                                    {{ name }}:{{ count }}
                                </el-tag>
                            </el-space>
                        </template>
                    </el-table-column>
                    <el-table-column prop="queue_count" label="queues" min-width="200px">
                        <template #default="scope">
                            <el-space direction="vertical">
                                <el-tag size="small" effect="plain" v-for="(count, name) in scope.row.queue_count"
                                        :key="name">
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
            </el-space>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import {getAllTasks, stopAllTasks, stopTask} from "../ctrls/DownloadCtrl.js";
import TaskData from "../data/TaskData";
import {logInfo} from "../ctrls/FetchCtrl";
import {mapActions} from "pinia";
import {BadgeStore} from "../store/BadgeStore";

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