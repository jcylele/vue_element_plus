<template>
    <el-container>
        <el-aside width="var(--el-aside-width)">
            <el-menu
                mode="vertical"
                text-color="#000000"
                active-text-color="#a0a0fb"
                @select="onMenuItemSelect">
                <el-menu-item index="tag_relatives">Tag Relatives</el-menu-item>
                <el-menu-item index="tag_scores">Tag Scores</el-menu-item>
                <el-menu-item index="score_tags">Score Tags</el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script lang="ts">

import {mapActions} from "pinia";
import {SubMenuStore} from "../store/SubMenuStore";
import {MainMenu} from "../data/Enums";

export default {
    name: "ECharts",
    components: [],
    data() {
        return {}
    },
    computed: {},
    methods: {
        ...mapActions(SubMenuStore, {
            setSubMenu: "set",
            getSubMenu: "get",
        }),
        onMenuItemSelect(key: string) {
            this.setSubMenu(MainMenu.Charts, key)
            this.$router.push(`/echarts/${key}`)
        },
    },
    mounted() {
        let sub_menu = this.getSubMenu(MainMenu.Charts)
        if (sub_menu) {
            this.onMenuItemSelect(sub_menu)
        }
    }
}

</script>

<style scoped>
</style>