<template>
    <el-container>
        <el-aside width="var(--el-aside-width)">
            <el-menu
                mode="vertical"
                text-color="#000000"
                active-text-color="#a0a0fb"
                @select="onNoticeTypeChange">
                <el-menu-item v-for="nt in notice_type_list"
                              :index="nt.value.toString()"
                              style="justify-content: flex-end">
                    <el-badge v-if="getNoticeCount(nt.value) > 0"
                              :value="getNoticeCount(nt.value)">
                        {{ nt.label }}
                    </el-badge>
                    <span v-else>{{ nt.label }}</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <el-space direction="vertical">
                <el-table :data="notice_list" border class="wrap_line">
                    <el-table-column prop="notice_param0" :label="label_names[0]" min-width="180px"/>
                    <el-table-column prop="notice_param1" :label="label_names[1]" min-width="180px"/>
                    <el-table-column prop="notice_param2" :label="label_names[2]" min-width="180px"/>
                    <el-table-column label="Op" min-width="250px">
                        <template #default="scope">
                            <el-button v-if="is_search_actor_name" type="primary"
                                       @click="toActors(scope.row.notice_param0)">
                                Search
                            </el-button>
                            <el-button type="danger" @click="delNotice(scope.row.notice_id)">
                                Delete
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button type="danger" size="default" @click="deleteAll">Delete All</el-button>
            </el-space>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import {Notice_Param_Names, Notice_Type_Options} from "../data/Consts";
import {MainMenu, NoticeType} from "../data/Enums"
import NoticeData from "../data/NoticeData";
import {deleteNotice, delNoticesByType, getNotices} from "../ctrls/NoticeCtrl";
import {mapActions} from "pinia";
import {ActorFilterStore} from "../store/ActorFilterStore";
import {SubMenuStore} from "../store/SubMenuStore";
import ActorFilterData from "../data/ActorFilterData";
import {BadgeStore} from "../store/BadgeStore";

export default {
    name: "Notices",

    data() {
        return {
            cur_notice_type: 0,
            label_names: ["", "", ""],
            notice_list: [] as NoticeData[],
        }
    },

    computed: {
        notice_type_list() {
            return Notice_Type_Options
        },
        is_search_actor_name() {
            return this.cur_notice_type == NoticeType.SameActorName
                || this.cur_notice_type == NoticeType.HasLinkedAccount
        }
    },

    methods: {
        ...mapActions(ActorFilterStore, {
            saveFilterCondition: "setFilter",
        }),
        ...mapActions(SubMenuStore, {
            setSubMenu: "set",
            getSubMenu: "get",
        }),
        ...mapActions(BadgeStore, {
            getNoticeCount: "getNoticeCount",
            setNoticeCount: "setNoticeCount",
        }),

        async onNoticeTypeChange(index: string) {
            this.setSubMenu(MainMenu.Notices, index)

            this.cur_notice_type = parseInt(index)
            this.label_names = Notice_Param_Names[this.cur_notice_type]
            const [ok, new_list] = await getNotices(this.cur_notice_type)
            if (ok) {
                this.notice_list = new_list
                this.setNoticeCount(this.cur_notice_type, new_list.length)
            }
        },

        async delNotice(notice_id: number) {
            const [ok, _] = await deleteNotice(notice_id)
            if (ok) {
                const index = this.notice_list.findIndex((item) => item.notice_id === notice_id)
                if (index !== -1) {
                    this.notice_list.splice(index, 1)
                    this.setNoticeCount(this.cur_notice_type, this.notice_list.length)
                }
            }
        },

        async deleteAll() {
            const [ok, _] = await delNoticesByType(this.cur_notice_type)
            if (ok) {
                this.notice_list = []
                this.setNoticeCount(this.cur_notice_type, 0)
            }
        },

        toActors(actor_name: string) {
            const filter_condition = new ActorFilterData()
            filter_condition.name = actor_name
            filter_condition.show_name = true
            this.saveFilterCondition(filter_condition)
            this.$router.push("/actors")
        },
    },
    async mounted() {
        let sub_menu = this.getSubMenu(MainMenu.Notices)
        if (sub_menu) {
            this.onNoticeTypeChange(sub_menu)
        }
    }
}
</script>

<style scoped>

</style>