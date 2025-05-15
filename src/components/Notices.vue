<template>
    <el-container>
        <el-aside width="var(--el-aside-width)" style="padding: 0 10px">
            <el-menu
                mode="vertical"
                class="el-aside-menu"
                @select="onNoticeTypeChange">
                <el-menu-item v-for="nt in notice_type_list"
                              :index="nt.value.toString()"
                              class="el-aside-menu-item">
                    <el-badge v-if="getNoticeCount(nt.value) > 0"
                              :value="getNoticeCount(nt.value)"
                              :max="999">
                        {{ nt.label }}
                    </el-badge>
                    <span v-else>{{ nt.label }}</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <el-space v-if="notice_count == 0" direction="vertical" fill>
                <el-text style="font-size: 24px">
                    No Notice Found
                </el-text>
                <el-space v-if="is_similar" direction="vertical" size="small" alignment="flex-start">
                    <el-divider style="margin: 5px 0;"/>
                    <el-text style="font-size: 24px;color: darkorange;">
                        this operation may take several seconds
                    </el-text>
                    <el-button type="primary" size="default" @click="findSimilar">
                        Find Similar Actor Names
                    </el-button>
                </el-space>
            </el-space>
            <el-space v-else direction="vertical">
                <el-pagination
                    v-model:current-page="page_index"
                    :page-size="page_size"
                    :total="notice_count"
                    @current-change="onPageChange"
                    layout="total, prev, pager, next"
                    background
                    style="margin: 5px"
                />
                <el-table :data="notice_list"
                          class="wrap_line"
                          border>
                    <el-table-column
                        v-for="(label, index) in label_names"
                        :key="index"
                        :prop="`notice_param${index}`"
                        :label="label"
                        :width="200"
                    />
                    <el-table-column label="Op" :width="200">
                        <template #default="scope">
                            <el-space direction="horizontal" size="small">
                                <el-button v-if="is_search_actor_name" type="primary"
                                           @click="toActors(scope.row)">
                                    Search
                                </el-button>
                                <el-button type="danger" @click="delNotice(scope.row.notice_id)">
                                    Delete
                                </el-button>
                            </el-space>
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
import {findSimilarActorNames} from "../ctrls/ActorCtrl";
import {logInfo} from "../ctrls/FetchCtrl";

export default {
    name: "Notices",

    data() {
        return {
            cur_notice_type: 0,
            label_names: [] as string[],
            notice_list: [] as NoticeData[],
            notice_count: 0,
            page_index: 1,
            page_size: 50,
        }
    },

    computed: {
        notice_type_list() {
            return Notice_Type_Options
        },
        is_search_actor_name(): boolean {
            return this.cur_notice_type != NoticeType.InvalidPost
        },
        is_similar(): boolean {
            return this.cur_notice_type == NoticeType.SimilarActorName
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
            fetchAllNoticeCount: "fetchAllNoticeCount"
        }),

        async onNoticeTypeChange(index: string) {
            this.setSubMenu(MainMenu.Notices, index)

            this.cur_notice_type = parseInt(index)
            this.label_names = Notice_Param_Names[this.cur_notice_type]
            this.notice_count = this.getNoticeCount(this.cur_notice_type)
            this.page_index = 1

            await this.onPageChange()
        },

        async delNotice(notice_id: number) {
            const [ok, _] = await deleteNotice(notice_id)
            if (ok) {
                const index = this.notice_list.findIndex((item) => item.notice_id === notice_id)
                if (index !== -1) {
                    this.notice_list.splice(index, 1)
                    this.notice_count -= 1
                    this.setNoticeCount(this.cur_notice_type, this.notice_count)
                }
            }
        },

        async deleteAll() {
            const [ok, _] = await delNoticesByType(this.cur_notice_type)
            if (ok) {
                this.notice_count = 0
                this.notice_list = []
                this.setNoticeCount(this.cur_notice_type, 0)
            }
        },

        formatActorName(notice: NoticeData): string {
            switch (this.cur_notice_type) {
                case NoticeType.SameActorName:
                    return `${notice.notice_param0}`
                case NoticeType.UnlinkedActor:
                    return `${notice.notice_param0}||${notice.notice_param1}`
                case NoticeType.HasLinkedAccount:
                case NoticeType.SimilarActorName:
                    return [notice.notice_param0, notice.notice_param1, notice.notice_param2, notice.notice_param3]
                        .filter(param => param != null && param != "")
                        .join("||")
                default:
                    return ""
            }
        },

        toActors(notice: NoticeData) {
            const actor_name = this.formatActorName(notice)
            const filter_condition = new ActorFilterData()
            filter_condition.name = actor_name
            filter_condition.show_name = true
            this.saveFilterCondition(filter_condition)
            this.$router.push("/actors")
        },

        async onPageChange() {
            const [ok, new_list] = await getNotices(this.cur_notice_type, this.page_size, (this.page_index - 1) * this.page_size)
            if (ok) {
                this.notice_list = new_list
            }
        },

        async findSimilar() {
            const [ok, _] = await findSimilarActorNames()
            if (ok) {
                await this.fetchAllNoticeCount()
                logInfo("find similar actor names finished")
                await this.onNoticeTypeChange(this.cur_notice_type.toString())
            }
        }
    }
    ,
    async mounted() {
        let sub_menu = this.getSubMenu(MainMenu.Notices)
        if (sub_menu) {
            await this.onNoticeTypeChange(sub_menu)
        }
    }
}
</script>

<style scoped>

</style>