<template>
    <div class="root_div">
        <el-container>
            <el-header>
                <el-menu
                    mode="horizontal"
                    background-color="#545c64"
                    text-color="#fff"
                    active-text-color="#ffd04b"
                    :default-active="$route.path"
                    @select="onMenuItemSelect">
                    <el-menu-item index="/actors">Actors</el-menu-item>
                    <el-menu-item index="/download">Download</el-menu-item>
                    <el-menu-item index="/tasks">
                        <el-badge v-if="all_task_count > 0"
                                  :value="all_task_count"
                                  type="primary"
                                  :offset="[0, 10]">
                            Tasks
                        </el-badge>
                        <span v-else>Tasks</span>
                    </el-menu-item>

                    <el-menu-item index="/notices" style="margin-left: 40px">
                        <el-badge v-if="all_notice_count > 0"
                                  :value="all_notice_count"
                                  :offset="[0, 10]">
                            Notices
                        </el-badge>
                        <span v-else>Notices</span>
                    </el-menu-item>
                    <el-menu-item index="/actor_tags">Actor Tags</el-menu-item>
                    <el-menu-item index="/actor_groups">Actor Groups</el-menu-item>
                    <el-menu-item index="/echarts">Charts</el-menu-item>

                </el-menu>
            </el-header>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script lang="ts">
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "./store/ActorTagStore";
import {ActorGroupStore} from "./store/ActorGroupStore";
import {BadgeStore} from "./store/BadgeStore";

export default {
    computed: {
        ...mapState(BadgeStore, {
            all_task_count: 'all_task_count',
            all_notice_count: 'all_notice_count',
        }),
    },
    components: {},

    data() {
        return {}
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagsFromServer: 'getFromServer',
        }),
        ...mapActions(ActorGroupStore, {
            getGroupsFromServer: 'getFromServer',
        }),
        ...mapActions(BadgeStore, {
            fetchTaskCount: 'fetchTaskCount',
            fetchAllNoticeCount: 'fetchAllNoticeCount',
        }),
        onMenuItemSelect(key: string) {
            this.$router.push(key)
            this.fetchTaskCount()
            this.fetchAllNoticeCount()
        },
    },
    async mounted() {
        await this.getTagsFromServer()
        await this.getGroupsFromServer()
        await this.fetchTaskCount()
        await this.fetchAllNoticeCount()
    }
}
</script>

<style scoped>
.root_div {
    background-color: var(--el-bg-color);
}
</style>

