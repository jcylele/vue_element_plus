<template>
    <el-container>
        <el-aside width="140px">
            <el-menu
                mode="vertical"
                text-color="#000000"
                active-text-color="#a0a0fb"
                @select="onNoticeTypeChange">
                <el-menu-item v-for="nt in notice_type_list"
                              :index="nt.value">
                    {{ nt.label }}
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <el-space direction="vertical">
                <el-table :data="notice_list" border class="wrap_line">
                    <el-table-column prop="notice_param0" label="param0" min-width="180px"/>
                    <el-table-column prop="notice_param1" label="param1" min-width="180px"/>
                    <el-table-column prop="notice_param2" label="param2" min-width="180px"/>
                    <el-table-column v-if="is_unlinked_actor" prop="sub_string01" label="sub_string" min-width="180px"/>
                    <el-table-column label="Op" min-width="250px">
                        <template #default="scope">
                            <el-button v-if="is_unlinked_actor" type="primary"
                                       @click="toActors(scope.row.sub_string01)">Search</el-button>
                            <el-button type="danger" @click="delNotice(scope.row.notice_id)">Delete</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-space>
        </el-main>
    </el-container>
</template>

<script lang="ts">
import {Notice_Type_Options} from "../data/Consts";
import {NoticeType} from "../data/Enums"
import NoticeData from "../data/NoticeData";
import {deleteNotice, getNotices} from "../ctrls/NoticeCtrl";
import {mapActions} from "pinia";
import {ActorFilterStore} from "../store/ActorFilterStore";
import ActorFilterData from "../data/ActorFilterData";

export default {
    name: "Notices",

    data() {
        return {
            cur_notice_type: 0,
            notice_list: [] as NoticeData[]
        }
    },

    computed: {
        notice_type_list() {
            return Notice_Type_Options
        },
        is_unlinked_actor() {
            return this.cur_notice_type === NoticeType.UnlinkedActor
        }
    },

    methods: {
        ...mapActions(ActorFilterStore, {
            saveFilterCondition: "setFilter",
        }),
        async onNoticeTypeChange(index: string) {
            this.cur_notice_type = parseInt(index)
            const [ok, new_list] = await getNotices(this.cur_notice_type)
            if (ok) {
                this.notice_list = new_list
            }
        },

        async delNotice(notice_id: number) {
            const [ok, _] = await deleteNotice(notice_id)
            if (ok) {
                const index = this.notice_list.findIndex((item) => item.notice_id === notice_id)
                if (index !== -1) {
                    this.notice_list.splice(index, 1)
                }
            }
        },

        async toActors(sub_string: string) {
            const filter_condition = new ActorFilterData()
            filter_condition.name = sub_string
            filter_condition.show_name = true
            this.saveFilterCondition(filter_condition)
            this.$router.push("/actors")
        }
    }
}
</script>

<style scoped>

</style>