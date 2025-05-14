<template>
    <el-collapse v-model="activeName" @change="handleChange" accordion>
        <el-collapse-item title="Outdated Files" :name="ETab.OutDated">
            <template #title>
                <el-text class="title-text">Outdated Files</el-text>
            </template>
            <el-space direction="vertical" size="small" alignment="flex-start">
                <el-text class="desc-text">
                    when actor is done, there may be downloading files of this actor
                </el-text>
                <el-button type="primary" size="default" @click="clean">
                    Remove Files
                </el-button>
            </el-space>
        </el-collapse-item>
        <el-collapse-item :name="ETab.Reset">
            <template #title>
                <el-text class="title-text">Reset Manual</el-text>
            </template>
            <el-space direction="vertical" size="small" alignment="flex-start">
                <el-text class="desc-text">
                    reset manual flag for all actors
                </el-text>
                <el-button type="warning" size="default" @click="resetAllManual">
                    Reset Manual
                </el-button>
            </el-space>
        </el-collapse-item>
        <el-collapse-item :name="ETab.Log">
            <template #title>
                <el-text class="title-text">Logs</el-text>
            </template>
            <el-space direction="vertical" size="small" alignment="flex-start">
                <el-text class="desc-text">
                    open log folder in explorer
                </el-text>
                <el-button type="primary" size="default" @click="openLogFolder">
                    Open Log Folder
                </el-button>
            </el-space>
        </el-collapse-item>
        <el-collapse-item :name="ETab.Res">
            <template #title>
                <el-text class="title-text">Res Sizes</el-text>
            </template>
            <el-space direction="vertical" size="small" alignment="flex-start">
                <el-text class="desc-text">
                    sum of res sizes in each group
                </el-text>
                <el-text class="warn-text">
                    clear group folder may take several seconds
                </el-text>
                <el-table :data="actorGroupStore.sorted_list" row-key="uuid">
                    <el-table-column label="Name" prop="group_name" min-width="100px"/>
                    <el-table-column label="Size" min-width="100px">
                        <template #default="scope">
                            {{ getGroupSize(scope.row.group_id) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Op" min-width="160px">
                        <template #default="scope">
                            <el-button v-if="scope.row.has_folder"
                                       type="danger" @click="clearGroupFolder(scope.row.group_id)">
                                Clear Folder
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-space>
        </el-collapse-item>
    </el-collapse>
</template>

<script setup lang="ts">
import {cleanFiles, openLogs} from "../ctrls/DownloadCtrl";
import {logInfo} from "../ctrls/FetchCtrl";
import {clearFolderOfGroup, findSimilarActorNames, resetManual} from "../ctrls/ActorCtrl";
import {BadgeStore} from "../store/BadgeStore";
import {ref} from "vue";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {getGroupSizes} from "../ctrls/ChartCtrl";
import {format_file_size} from "../data/DataUtil";

enum ETab {
    OutDated = "outdated",
    Similar = "similar",
    Reset = "reset",
    Log = "log",
    Res = "res",
}

const badgeStore = BadgeStore()
const actorGroupStore = ActorGroupStore()

const activeName = ref("")

const group_sizes = ref(new Map<number, number>())

function getGroupSize(group_id: number): string {
    if (group_id in group_sizes.value) {
        return format_file_size(group_sizes.value[group_id])
    }
    return "0"
}

async function handleChange(val: string) {
    if (val === ETab.Res) {
        await fetchGroupSizes()
    }
}

async function fetchGroupSizes() {
    const [ok, ret] = await getGroupSizes()
    if (ok) {
        group_sizes.value = ret
    }
}

async function clearGroupFolder(group_id: number) {
    const [ok, _] = await clearFolderOfGroup(group_id)
    if (ok) {
        group_sizes.value[group_id] = 0
    }
}

async function clean() {
    const [ok, ret] = await cleanFiles()
    if (ok) {
        logInfo("remove outdated files succeed")
    }
}

async function resetAllManual() {
    const [ok, _] = await resetManual()
    if (ok) {
        logInfo("reset manual succeed")
    }
}

async function openLogFolder() {
    await openLogs()
}
</script>

<style scoped>
.title-text {
    font-size: 28px;
    font-weight: bold;
}

.desc-text {
    font-size: 24px;
}

.warn-text {
    font-size: 24px;
    color: darkorange;
}
</style>