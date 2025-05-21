<template>
    <el-space direction="vertical" size="small" fill>
        <ActorFilter :filter_condition="editing_filter_condition"
                     @submit="onFilterSubmit"/>
        <el-divider style="margin: 1px 0;"/>
        <!-- filter desc -->
        <el-space direction="horizontal" size="large" wrap>
            <div v-if="is_filter_normal">
                <div v-for="desc in page_filter_desc"
                     class="desc-item">
                    <el-text class="desc-label">{{ desc.label }}</el-text>
                    <el-text class="desc-value">{{ desc.value }}</el-text>
                </div>
            </div>
            <el-text v-else class="desc-label">{{ filter_type_name }}</el-text>
        </el-space>
        <!-- tools bar -->
        <el-space direction="horizontal" size="large">
            <el-pagination
                v-if="is_filter_normal"
                v-model:current-page="page_index"
                :total="actor_count"
                :page-size="page_size"
                :page-sizes="[6, 8, 10, 12, 14]"
                :pager-count="5"
                @current-change="onActorPageChange"
                @size-change="handleSizeChange"
                layout="sizes, total, prev, pager, next"
                class="page-border"
                background
            />
            <el-button v-if="has_downing_actors"
                       type="success" size="large"
                       @click="onDowningClick">
                Downloading Actors
            </el-button>
            <el-checkbox v-model="is_show_batch_op"
                         label="Batch Ops"
                         @change="onBatchOpChange"
                         size="large" border/>
        </el-space>
        <!-- batch tool bar -->
        <el-space direction="horizontal" v-if="is_show_batch_op" size="large" spacer="|">
            <el-space direction="vertical" size="small" fill>
                <el-button type="danger" @click="lockActors(false)">
                    Unlock
                </el-button>
                <el-button type="primary" @click="lockActors(true)">
                    Lock
                </el-button>
            </el-space>

            <el-space direction="vertical" size="small" fill>
                <!-- set actor category -->
                <el-select placeholder="Batch Set Group"
                           style="width: 200px"
                           @change="batchSetGroup">
                    <el-option
                        v-for="group in group_list"
                        :label="group.show_content"
                        :value="group.group_id"
                        :style="{'color': group.group_color, }"
                    />
                </el-select>
                <!-- download -->
                <el-button @click="batchShowDownload" style="width: 200px">
                    Batch Download
                </el-button>
            </el-space>
            <el-space direction="vertical" size="small" fill>
                <el-button type="danger" size="default" @click="unlinkActors">
                    Unlink
                </el-button>
                <el-button type="primary" size="default" @click="onLinkClick">
                    Link
                </el-button>
            </el-space>
            <el-switch
                v-if="is_show_batch_op"
                v-model="is_batch_select_all"
                @change="batchSelectAll"
                active-text="All"
                inactive-text="None"
                width="60px"
                size="large"/>
        </el-space>
        <!-- a big card per actor -->
        <div class="card_row">
            <!-- TODO change is not triggered, why   -->
            <!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
            <ActorCard v-for="actor_data in locked_actor_list"
                       :actor_data="actor_data"
                       :show_select="is_show_batch_op"
                       :key="actor_data.uuid"
                       :locked="true"
                       @refresh="onActorChange"
                       @friend="onActorFriendClick"
                       @download="singleShowDownload"
                       @update="refreshActors"/>
            <ActorCard v-for="actor_data in actor_list"
                       :actor_data="actor_data"
                       :show_select="is_show_batch_op"
                       :key="actor_data.uuid"
                       :locked="false"
                       @refresh="onActorChange"
                       @friend="onActorFriendClick"
                       @download="singleShowDownload"
                       @update="refreshActors"/>
        </div>
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
    <el-dialog v-model="is_show_link_preview"
               title="Link Preview"
               :before-close="onLinkPreviewClose"
               width="720px">
        <ActorLinkPreview :actors="link_actor_list"
                          @submit="onLinkPreviewSubmit"
                          @cancel="onLinkPreviewClose"/>
    </el-dialog>
</template>

<script lang="ts">
import {ActorFilterData} from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import {ActorElement} from "../data/ArrayElement";
import {
    batchChangeActorGroup, getActor,
    getActorCount,
    getActorIds,
    getLinkedActorIds,
    linkSameActors, unlinkSameActors
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorFilterStore} from "../store/ActorFilterStore";
import {DownloadLimitForm} from "../data/DownloadForms";
import {downloadByActorIds} from "../ctrls/DownloadCtrl";
import DownloadLimit from "./DownloadLimit.vue";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {MAX_SCORE} from "../data/Consts";
import ActorLine from "./ActorLine.vue";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import ActorData from "../data/ActorData";
import {BadgeStore} from "../store/BadgeStore";
import ActorLinkPreview from "./ActorLinkPreview.vue";

interface FilterItem {
    label: string,
    value: string
}

enum FilterType {
    Normal = "normal",
    Link = "linked actors",
    Download = "downloading"
}

export default {
    components: {ActorLinkPreview, SvgIcon, ActorLine, ActorCard, ActorFilter, DownloadLimit},
    data() {
        return {
            editing_filter_condition: new ActorFilterData(),
            page_filter_condition: new ActorFilterData(),
            filter_type: FilterType.Normal,
            locked_actor_list: [] as ActorElement[],
            actor_list: [] as ActorElement[],
            actor_ids: [] as number[],
            page_size: 12,
            page_index: 1,
            actor_count: 0,
            active_parts: ['filter'],
            download_actor_ids: [] as number[],
            download_limit: null as DownloadLimitForm,
            link_actor_list: [] as ActorData[],
            is_show_batch_op: false,
            is_batch_select_all: false,
        }
    },
    computed: {
        ...mapState(ActorFilterStore, {
            cached_filter_condition: 'filter_condition',
            cached_page_size: "page_size",
            cached_page_index: "page_index",
            downing_actor_ids: "downing_actors",
            has_downing_actors: "has_downing_actors"
        }),
        ...mapState(ActorGroupStore, {group_list: 'sorted_list'}),
        is_show_download() {
            return this.download_actor_ids.length > 0
        },
        download_title() {
            const count = this.download_actor_ids.length
            return `${count} actors`
        },
        is_show_link_preview() {
            return this.link_actor_list.length > 0
        },
        is_filter_normal() {
            return this.filter_type == FilterType.Normal
        },
        filter_type_name() {
            return this.filter_type
        },
        page_filter_desc(): FilterItem[] {
            const page_filter = this.page_filter_condition
            const desc_list: FilterItem[] = []
            if (page_filter.group_id_list.length > 0) {
                const group_name_list = page_filter.group_id_list.map(group_id => this.getGroupName(group_id))
                desc_list.push({
                    label: "group",
                    value: group_name_list.join(", ")
                })

                if (page_filter.no_tag) {
                    desc_list.push({
                        label: "tag",
                        value: "No"
                    })
                } else {

                }

                if (page_filter.min_score > 0 && page_filter.max_score < MAX_SCORE) {
                    desc_list.push({
                        label: "score",
                        value: `${page_filter.min_score} - ${page_filter.max_score}`
                    })
                }
            } else if (page_filter.min_score > 0) {
                desc_list.push({
                    label: "score",
                    value: `>= ${page_filter.min_score}`
                })
            } else if (page_filter.max_score < MAX_SCORE) {
                desc_list.push({
                    label: "score",
                    value: `<= ${page_filter.max_score}`
                })
            }

            if (page_filter.name.length > 0) {
                desc_list.push({
                    label: "name",
                    value: page_filter.name
                })
            }

            if (page_filter.linked) {
                desc_list.push({
                    label: "linked",
                    value: "Yes"
                })
            }

            if (page_filter.remark_str.length > 0) {
                desc_list.push({
                    label: "remark",
                    value: page_filter.remark_str
                })
            }

            return desc_list
        }
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagsFromServer: 'getFromServer',
            getTagName: 'getName',
        }),
        ...mapActions(ActorFilterStore, {
            savePageIndex: "setPageIndex",
            savePageSize: "setPageSize",
            getDowningFromServer: "getDowningFromServer",
            is_actor_downing: "is_downing"
        }),
        ...mapActions(BadgeStore, {
            fetchTaskCount: 'fetchTaskCount',
        }),
        ...mapActions(ActorGroupStore, {
            getGroupsFromServer: 'getFromServer',
            getGroupName: 'getName',
        }),

        async handleSizeChange(val: number) {
            this.page_size = val
            this.savePageSize(val)
            this.page_index = 1
            await this.onActorPageChange()
        },

        async onActorPageChange() {
            this.savePageIndex(this.page_index)
            const [ok, actor_ids] = await getActorIds(this.page_filter_condition, this.page_size, (this.page_index - 1) * this.page_size)
            if (ok) {
                this.refreshActorIds(actor_ids)
                await this.getDowningFromServer()
            } else {
                this.refreshActorIds()
            }
        },
        async onFilterSubmit() {
            this.refreshActorIds();
            this.actor_count = 0
            this.page_filter_condition.copy(this.editing_filter_condition)
            const [ok, actor_count] = await getActorCount(this.page_filter_condition)
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
            const [ok, actor_ids] = await getLinkedActorIds(actor_data.data.actor_id)
            if (ok) {
                this.refreshActorIds(actor_ids, FilterType.Link)
            } else {
                this.refreshActorIds()
            }
        },

        async onDowningClick() {
            await this.getDowningFromServer()
            this.refreshActorIds(this.downing_actor_ids, FilterType.Download)
        },

        // region batch, select, lock

        _getSelected(converter: Function) {
            let result_list = []
            for (const actor of this.locked_actor_list) {
                if (actor.selected) {
                    result_list.push(converter(actor))
                }
            }
            for (const actor of this.actor_list) {
                if (actor.selected) {
                    result_list.push(converter(actor))
                }
            }
            return result_list
        },
        getSelectedActors() {
            return this._getSelected(actor => actor.data)
        },
        getSelectedActorIds() {
            return this._getSelected(actor => actor.data.actor_id)
        },
        onBatchOpChange(val: boolean) {
            if (!val) {
                this.is_batch_select_all = false
                this.batchSelectAll(false)
            }
        },
        batchSelectAll(val: boolean) {
            for (const actor of this.locked_actor_list) {
                actor.selected = val
            }
            for (const actor of this.actor_list) {
                actor.selected = val
            }
        },

        async batchSetGroup(group_id: number) {
            let actor_ids = this.getSelectedActorIds()
            if (actor_ids.length == 0) {
                logWarn("No actor to set group")
                return
            }
            let [ok, actor_map] = await batchChangeActorGroup(actor_ids, group_id)
            if (ok) {
                this.refreshActors(actor_map)
            }
        },

        lockActors(lock: boolean) {
            let locked_actor_list = []
            let actor_list = []
            if (lock) {
                locked_actor_list = [...this.locked_actor_list]
                for (const actor of this.actor_list) {
                    if (actor.selected) {
                        locked_actor_list.push(actor)
                    } else {
                        actor_list.push(actor)
                    }
                }
            } else {
                for (const actor of this.locked_actor_list) {
                    if (actor.selected) {
                        actor_list.push(actor)
                    } else {
                        locked_actor_list.push(actor)
                    }
                }
                actor_list.push(...this.actor_list)
            }

            this.locked_actor_list = locked_actor_list
            this.actor_list = actor_list
            this.batchSelectAll(false)
        },

        // endregion

        // region link

        onLinkClick() {
            const link_actor_list = this.getSelectedActors()
            if (link_actor_list.length < 2) {
                logWarn("Not enough actors to link")
                return
            }
            this.link_actor_list = link_actor_list
        },

        onLinkPreviewClose() {
            this.link_actor_list = []
        },

        async onLinkPreviewSubmit(score: number, remark: string, tag_list: number[]) {
            console.log("link preview submit")
            const actor_ids = this.link_actor_list.map(actor => actor.actor_id)
            const [ok, actor_map] = await linkSameActors(actor_ids, score, remark, tag_list)
            if (ok) {
                this.link_actor_list = []
                this.refreshActors(actor_map)
            }
        },

        async unlinkActors() {
            let actor_ids = this.getSelectedActorIds()
            if (actor_ids.length == 0) {
                logWarn("No actor to unlink")
                return
            }

            const [ok, actor_map] = await unlinkSameActors(actor_ids)
            if (ok) {
                this.refreshActors(actor_map)
            }
        },

        // endregion

        // region download

        showDownloadLimit(actor_ids: number[]) {
            this.download_actor_ids = actor_ids
            if (this.download_limit == null) {
                this.download_limit = new DownloadLimitForm()
            }
        },

        singleShowDownload(actor_data: ActorElement) {
            this.showDownloadLimit([actor_data.data.actor_id])
        },

        batchShowDownload() {
            let actor_ids = this.getSelectedActorIds()
            if (actor_ids.length == 0) {
                logWarn("No actor to download")
                return
            }
            this.showDownloadLimit(actor_ids)
        },

        async onSubmitDownload() {
            let [ok, _] = await downloadByActorIds(this.download_limit, this.download_actor_ids)
            this.onDownloadClose()
            if (ok) {
                await this.fetchTaskCount()
                await this.getDowningFromServer()
                logInfo("download started")
            }
        },

        onDownloadClose() {
            this.download_actor_ids = []
        },

        // endregion

        innerRefreshActors(ar_map: Map<number, ActorData>, actor_list: ActorElement[]) {
            for (const actor_data of actor_list) {
                const new_actor = ar_map.get(actor_data.data.actor_id)
                if (new_actor) {
                    actor_data.data = new_actor
                }
            }
        },

        refreshActors(actor_map: Map<number, ActorData>) {
            this.innerRefreshActors(actor_map, this.locked_actor_list)
            this.innerRefreshActors(actor_map, this.actor_list)
            this.batchSelectAll(false)
        },

        refreshActorIds(actor_ids: number[] = null, filter: FilterType = FilterType.Normal) {
            this.filter_type = filter
            this.is_batch_select_all = false

            if (actor_ids == null) {
                this.actor_list = []
                this.actor_ids = []
            } else {
                this.actor_list = []
                this.actor_ids = actor_ids
                this.asyncFetchActors()
            }
        },

        async asyncFetchActors() {
            for (let i = 0; i < this.actor_ids.length; i++) {
                let actor_id = this.actor_ids[i]
                const [ok, actor] = await getActor(actor_id)
                if (ok) {
                    // check if outdated
                    if (this.actor_ids[i] != actor_id
                        || this.actor_list.length != i) {
                        return
                    }
                    this.actor_list.push(new ActorElement(actor))
                    // wait a moment
                    await new Promise(resolve => {
                        setTimeout(resolve, 100)
                    })
                } else {
                    return
                }
            }
        }
    },
    watch: {},
    async mounted() {
        this.editing_filter_condition = this.cached_filter_condition.clone()
        this.page_size = this.cached_page_size
        this.page_index = this.cached_page_index

        await this.getTagsFromServer()
        await this.getGroupsFromServer()
        await this.getDowningFromServer()
    }
}

</script>

<style scoped>

.page-border {
    border: 1px ridge;
    border-color: var(--el-border-color);
    padding: 3px 5px;
}

.card_row {
    min-height: 100px;
    min-width: 300px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 15px;
    gap: 20px 20px;
    align-items: stretch;
}

.desc-item {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
}

.desc-label {
    font-size: var(--el-font-size-large);
    font-weight: bold;
    color: black;
    background-color: burlywood;
    padding: 4px 4px;
}

.desc-value {
    font-size: var(--el-font-size-base);
    background-color: antiquewhite;
    padding: 4px 8px;
}

</style>