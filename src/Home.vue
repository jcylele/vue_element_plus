<template>
    <div class="root_div">
        <el-container>
            <el-header class="top_menu">
                <el-space direction="horizontal" size="large">
                    <el-menu
                        mode="horizontal"
                        :default-active="route.path"
                        @select="onMenuItemSelect"
                        :ellipsis="false">
                        <el-menu-item index="/actors">Actors</el-menu-item>
                        <el-menu-item index="/download">Download</el-menu-item>
                        <el-menu-item index="/tasks">
                            <el-badge v-if="badgeStore.all_task_count > 0"
                                      :value="badgeStore.all_task_count"
                                      type="primary"
                                      :offset="[0, 10]">
                                Tasks
                            </el-badge>
                            <span v-else>Tasks</span>
                        </el-menu-item>
                        <el-menu-item index="/notices">
                            <el-badge v-if="badgeStore.all_notice_count > 0"
                                      :value="badgeStore.all_notice_count"
                                      :max="999"
                                      :offset="[0, 10]">
                                Notices
                            </el-badge>
                            <span v-else>Notices</span>
                        </el-menu-item>
                        <el-sub-menu index="/">
                            <template #title>Others</template>
                            <el-menu-item index="/actor_groups">Actor Groups</el-menu-item>
							<el-menu-item index="/fav_folders">Fav Folders</el-menu-item>
							<el-menu-item index="/actor_tags">Actor Tags</el-menu-item>
                            <el-menu-item index="/actor_tag_groups">Actor Tag Groups</el-menu-item>
                            <el-menu-item index="/echarts">Charts</el-menu-item>
                            <el-menu-item index="/others">Others</el-menu-item>
                        </el-sub-menu>
                    </el-menu>

                    <el-switch v-model="isDark"
                               size="large"
                               width="80px"
                               active-text="Dark"
                               inactive-text="Light"
                               inline-prompt/>

                </el-space>
            </el-header>
            <el-main style="margin-top: 50px">
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import {ActorTagStore} from "./store/ActorTagStore";
import {ActorGroupStore} from "./store/ActorGroupStore";
import {BadgeStore} from "./store/BadgeStore";
import {onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useDark} from '@vueuse/core'
import { FavFolderStore } from "./store/FavFolderStore";
import { ActorTagGroupStore } from "./store/ActorTagGroupStore";

const isDark = useDark()
const router = useRouter()
const route = useRoute()
const badgeStore = BadgeStore()
const actorTagStore = ActorTagStore()
const actorGroupStore = ActorGroupStore()
const actorTagGroupStore = ActorTagGroupStore()
const favFolderStore = FavFolderStore()

function onMenuItemSelect(key: string) {
    router.push(key)
    badgeStore.fetchTaskCount()
    badgeStore.fetchAllNoticeCount()
}

onMounted(async () => {
    await actorTagStore.getFromServer()
    await actorGroupStore.getFromServer()
    await actorTagGroupStore.getFromServer()
    await favFolderStore.getFromServer()
    await badgeStore.fetchTaskCount()
    await badgeStore.fetchAllNoticeCount()
})
</script>

<style scoped>
.root_div {
    background-color: var(--el-bg-color);
}

.top_menu {
    z-index: 100;
    position: fixed;
    top: 0;
    width: 100%;

    background-color: var(--el-menu-bg-color);
    border-bottom: 1px solid var(--el-menu-border-color);
}
</style>

