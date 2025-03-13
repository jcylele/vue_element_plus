<template>
    <el-space direction="vertical" fill>
        <el-space direction="vertical" size="small" alignment="flex-start">
            <el-text class="title-text">
                Outdated Files
            </el-text>
            <el-text class="desc-text">
                when actor is done, there may be downloading files of this actor
            </el-text>
            <el-button type="primary" size="default" @click="clean">
                Remove Files
            </el-button>
        </el-space>
        <el-divider direction="horizontal" border-style="solid" style="margin: 5px"/>
        <el-space direction="vertical" size="small" alignment="flex-start">
            <el-text class="title-text">
                Similar Actor Names
            </el-text>
            <el-text class="desc-text">
                find actors with similar name and link them
            </el-text>
            <el-button type="primary" size="default" @click="findSimilar">
                Find Similar
            </el-button>
        </el-space>
        <el-divider direction="horizontal" border-style="solid" style="margin: 5px"/>
        <el-space direction="vertical" size="small" alignment="flex-start">
            <el-text class="title-text">
                Manual Ops
            </el-text>
            <el-text class="desc-text">
                reset manual flag for all actors
            </el-text>
            <el-button type="warning" size="default" @click="resetAllManual">
                Reset Manual
            </el-button>
        </el-space>
        <el-divider direction="horizontal" border-style="solid" style="margin: 5px"/>
        <el-space direction="vertical" size="small" alignment="flex-start">
            <el-text class="title-text">
                Logs
            </el-text>
            <el-text class="desc-text">
                open log folder in explorer
            </el-text>
            <el-button type="primary" size="default" @click="openLogFolder">
                Open Log Folder
            </el-button>
        </el-space>
    </el-space>
</template>

<script setup lang="ts">
import {cleanFiles, openLogs} from "../ctrls/DownloadCtrl";
import {logInfo} from "../ctrls/FetchCtrl";
import {findSimilarActorNames, resetManual} from "../ctrls/ActorCtrl";
import {BadgeStore} from "../store/BadgeStore";

const badgeStore = BadgeStore()

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

async function findSimilar() {
    const [ok, _] = await findSimilarActorNames()
    if (ok) {
        logInfo("find similar succeed")
        await badgeStore.fetchAllNoticeCount()
    }
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
</style>