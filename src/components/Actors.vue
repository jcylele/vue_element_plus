<template>
    <el-space direction="vertical" :fill="true">
        <el-collapse v-model="active_parts" @change="onActivePartChange">
            <!-- link actors group -->
            <el-collapse-item name="link" title="">
                <template #title>
                    <el-text style="font-size: 24px;font-style: oblique;margin-right: 10px">
                        Link Actors
                    </el-text>
                    <svg-icon size="24px" name="link"/>
                </template>
                <el-space direction="horizontal">

                    <el-space direction="vertical" :alignment="'stretch'">
                        <el-button type="primary" size="large" @click="linkActors">Link</el-button>
                        <el-button type="warning" size="large" @click="clearLinkedActors">Clear</el-button>
                        <el-button type="danger" size="large" @click="unlinkActors">Unlink</el-button>
                    </el-space>

                    <!-- linked actors -->

                    <el-space v-if="actor_show_card" direction="horizontal"
                              class="card_row" alignment="stretch">
                        <ActorCard v-for="actor_data in linked_list"
                                   :actor_data="actor_data"
                                   :show_link="false"
                                   :key="actor_data.id"/>
                    </el-space>
                </el-space>
            </el-collapse-item>
            <!-- filter conditions -->
            <el-collapse-item name="filter">
                <template #title>
                    <el-text style="font-size: 24px;font-style: oblique;margin-right: 10px">
                        Actor Filter
                    </el-text>
                    <svg-icon size="24px" name="filter"/>
                </template>
                <el-space direction="vertical">
                    <ActorFilter :filter_condition="filter_condition"
                                 @submit="onFilterSubmit"/>
                </el-space>
            </el-collapse-item>
        </el-collapse>
        <!-- tools menu -->
        <el-space direction="horizontal" size="large" spacer="|">
            <el-pagination
                v-model:current-page="page_index"
                :page-size="page_size"
                :page-sizes="[12, 14]"
                :total="actor_count"
                @current-change="onActorPageChange"
                @size-change="handleSizeChange"
                layout="sizes, total, prev, pager, next"
                background
                style="margin: 5px"
            />
            <el-popover trigger="click" placement="right" width="200px">
                <template #reference>
                    <el-button>Operate These Actors</el-button>
                </template>
                <template #default>
                    <el-space direction="vertical" style="width: 180px" :fill="true">
                        <!-- download -->
                        <el-button @click="batchShowDownload">
                            Batch Download
                        </el-button>
                        <!-- actor category -->
                        <el-select placeholder="Batch Set Group"
                                   @change="batchSetGroup">
                            <el-option
                                v-for="group in group_list"
                                :label="group.show_content"
                                :value="group.group_id"
                                :style="{'color': group.group_color, }"
                            />
                        </el-select>
                    </el-space>
                </template>
            </el-popover>
            <!--        <el-text style="font-style: italic;font-weight: bold;margin-left: 10px;">-->
            <!--          Show Type-->
            <!--        </el-text>-->
            <el-select v-model="actor_show_type" style="min-width: 100px">
                <el-option
                    v-for="option in actor_show_options"
                    :label="option.label"
                    :value="option.value"
                />
            </el-select>
            <el-button type="primary" @click="showPosts">
                Posts
            </el-button>
        </el-space>
        <!-- a big card per actor -->
        <el-space v-if="actor_show_card" direction="horizontal"
                  class="card_row" alignment="stretch" style="gap: 15px 15px">
            <!-- TODO change is not triggered, why   -->
            <!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
            <ActorCard v-for="actor_data in actor_list"
                       :actor_data="actor_data"
                       :show_link="show_link"
                       :key="actor_data.id"
                       @refresh="onActorChange"
                       @friend="onActorFriendClick"
                       @link="onActorLinkClick"
                       @download="singleShowDownload"/>
        </el-space>
        <!-- a line per actor -->
        <el-space v-if="actor_show_line" direction="vertical" size="small" :fill="true">
            <ActorLine v-for="actor_data in actor_list"
                       :actor_data="actor_data"
                       :key="actor_data.id"/>
        </el-space>
    </el-space>
    <!-- download  dialog -->
    <el-dialog v-model="is_show_download"
               :title="download_title"
               :before-close="onDownloadClose"
               width="640px">
        <el-space direction="vertical">
            <DownloadLimit :download_limit="download_limit"/>
            <el-space direction="horizontal" alignment="center">
                <el-button type="primary" @click="onSubmitDownload">
                    Download
                </el-button>
                <el-button type="warning" @click="onDownloadClose">
                    Cancel
                </el-button>
            </el-space>
        </el-space>
    </el-dialog>
    <el-dialog v-model="is_show_post"
               title="Posts"
               width=720px>
        <Posts :specific_actor_id="0"></Posts>
    </el-dialog>
</template>

<script lang="ts">
import ActorFilterData from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import {ActorElement, ToActorElements} from "../data/ArrayElement";
import {
    batchChangeActorGroup,
    getActorCount,
    getActorList,
    getLinkedActors,
    linkSameActors, unlinkSameActors
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorFilterStore} from "../store/ActorFilterStore";
import {DownloadLimitForm} from "../data/SimpleForms";
import {downloadByActorIds} from "../ctrls/DownloadCtrl";
import DownloadLimit from "./DownloadLimit.vue";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {ActorShowType, LimitPreset} from "../data/Enums";
import {Actor_Show_Options} from "../data/Consts";
import ActorLine from "./ActorLine.vue";
import Posts from "./Posts.vue";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import SvgIcon from "./SvgIcon/index.vue";

export default {
    components: {SvgIcon, Posts, ActorLine, ActorCard, ActorFilter, DownloadLimit},
    data() {
        return {
            filter_condition: new ActorFilterData(),
            actor_list: [] as ActorElement[],
            // actor_cards: {} as Map<Number, ActorCard>,
            page_size: 12,
            page_index: 1,
            actor_count: 0,
            active_parts: ['filter'],
            linked_list: [] as ActorElement[],
            download_actor_ids: [] as number[],
            download_limit: null as DownloadLimitForm,
            actor_show_type: ActorShowType.Card,
            is_show_post: false,
        }
    },
    computed: {
        ...mapState(ActorFilterStore, {
            cached_filter_condition: 'filter_condition',
            cached_page_size: "page_size",
            cached_page_index: "page_index",
        }),
        ...mapState(ActorGroupStore, {group_list: 'sorted_list'}),
        show_link() {
            return this.active_parts.includes('link')
        },
        is_show_download() {
            return this.download_actor_ids.length > 0
        },
        download_title() {
            const count = this.download_actor_ids.length
            return `${count} actors`
        },
        actor_show_options() {
            return Actor_Show_Options
        },
        actor_show_card() {
            return this.actor_show_type == ActorShowType.Card
        },
        actor_show_line() {
            return this.actor_show_type == ActorShowType.Line
        }
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagsFromServer: 'getFromServer',
        }),
        ...mapActions(ActorFilterStore, {
            saveFilterCondition: "setFilter",
            savePageIndex: "setPageIndex",
            savePageSize: "setPageSize",
        }),
        ...mapActions(ActorGroupStore, {
            getGroupsFromServer: 'getFromServer',
        }),

        async handleSizeChange(val: number) {
            this.page_size = val
            this.savePageSize(val)
            this.page_index = 1
            await this.onActorPageChange()
        },

        async onActorPageChange() {
            this.savePageIndex(this.page_index)
            const [ok, actor_list] = await getActorList(this.filter_condition, this.page_size, (this.page_index - 1) * this.page_size)
            if (ok) {
                this.actor_list = ToActorElements(actor_list)
            } else {
                this.actor_list = []
            }
        },
        onFilterChange() {
            // console.log("on filter change")
            this.savePageIndex(1)
            this.page_index = 1
            this.actor_list = []
            this.actor_count = 0
        },
        async onFilterSubmit() {
            this.saveFilterCondition(this.filter_condition)

            this.actor_list = []
            this.actor_count = 0
            const [ok, actor_count] = await getActorCount(this.filter_condition)
            if (ok) {
                this.actor_count = actor_count
                this.refreshPageIndex()
                await this.onActorPageChange()
            }
        },
        refreshPageIndex() {
            let max_page_count = Math.ceil(this.actor_count / this.page_size)
            this.page_index = this.cached_page_index
            if (this.page_index > max_page_count) {
                this.page_index = max_page_count
            }
            if (this.page_index < 1) {
                this.page_index = 1
            }
        },
        onActorChange(actor_data: ActorElement) {
            console.log(`actor changed: ${actor_data.data.actor_name}`)
        },
        async onActorFriendClick(actor_data: ActorElement) {
            console.log(`actor friend clicked: ${actor_data.data.actor_name}`)
            const [ok, actor_list] = await getLinkedActors(actor_data.data.actor_id)
            if (ok) {
                this.actor_list = ToActorElements(actor_list)
            } else {
                this.actor_list = []
            }
        },
        async onActorLinkClick(actor_data: ActorElement) {
            this.linked_list.push(actor_data)
        },
        async linkActors() {
            if (this.linked_list.length < 2) {
                logWarn("No actor to link")
                return
            }

            const actor_ids = this.linked_list.map((actor) => actor.data.actor_id)
            const [ok, actor_map] = await linkSameActors(actor_ids)
            if (ok) {
                for (const actor_data of this.linked_list) {
                    const actor_id = actor_data.data.actor_id
                    if (actor_id in actor_map) {
                        actor_data.data = actor_map[actor_id]
                    }
                }
            } else {
                this.linked_list = []
            }
        },

        async unlinkActors() {
            if (this.linked_list.length == 0) {
                logWarn("No actor to unlink")
                return
            }

            const actor_ids = this.linked_list.map((actor) => actor.data.actor_id)
            const [ok, actor_map] = await unlinkSameActors(actor_ids)
            if (ok) {
                for (const actor_data of this.linked_list) {
                    const actor_id = actor_data.data.actor_id
                    if (actor_id in actor_map) {
                        actor_data.data = actor_map[actor_id]
                    }
                }
            } else {
                this.linked_list = []
            }
        },

        clearLinkedActors() {
            this.linked_list = []
        },

        showDownloadLimit(actor_ids: number[]) {
            this.download_actor_ids = actor_ids
            if (this.download_limit == null) {
                this.download_limit = new DownloadLimitForm()
                this.download_limit.resetDefaultValue(LimitPreset.All)
            }
        },

        singleShowDownload(actor_data: ActorElement) {
            this.showDownloadLimit([actor_data.data.actor_id])
        },

        batchShowDownload() {
            let name_list = this.actor_list.map(element => element.data.actor_id)
            this.showDownloadLimit(name_list)
        },

        async onSubmitDownload() {
            let [ok, _] = await downloadByActorIds(this.download_limit, this.download_actor_ids)
            this.onDownloadClose()
            if (ok) {
                logInfo("download started")
            }
        },

        onDownloadClose() {
            this.download_actor_ids = []
        },

        async batchSetGroup(group_id: number) {
            let id_list = this.actor_list.map(element => element.data.actor_id)
            let [ok, actor_list] = await batchChangeActorGroup(id_list, group_id)
            if (ok) {
                this.actor_list = ToActorElements(actor_list)
            } else {
                this.actor_list = []
            }
        },

        showPosts() {
            this.is_show_post = true
        },

        onActivePartChange() {
            if (!this.show_link) {
                this.linked_list = []
            }
        }
    },
    watch: {},
    async mounted() {
        this.filter_condition = this.cached_filter_condition
        this.page_size = this.cached_page_size
        this.page_index = this.cached_page_index

        await this.getTagsFromServer()
        await this.getGroupsFromServer()
    }
}

</script>

<style scoped>

.card_row {
    min-height: 100px;
    min-width: 300px;
    display: flex;
    flex-wrap: wrap;
    size: 0
}
</style>