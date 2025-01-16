<template>
    <el-space direction="vertical" fill>
        <ActorFilter :filter_condition="filter_condition"
                     @submit="onFilterSubmit"/>
        <el-divider style="margin: 5px 0;"/>
        <!-- tools bar -->
        <el-space direction="horizontal" size="large" spacer="|">
            <el-pagination
                v-model:current-page="page_index"
                :page-size="page_size"
                :page-sizes="[6, 8, 10, 12, 14]"
                :total="actor_count"
                @current-change="onActorPageChange"
                @size-change="handleSizeChange"
                layout="sizes, total, prev, pager, next"
                background
                style="margin: 5px"
            />
            <el-button type="primary" @click="showPosts">
                Search Posts
            </el-button>
        </el-space>
        <el-space direction="horizontal" size="large" spacer="|">
            <el-select v-model="actor_show_type" style="min-width: 100px">
                <el-option
                    v-for="option in actor_show_options"
                    :label="option.label"
                    :value="option.value"
                />
            </el-select>
            <el-checkbox v-model="is_show_lock"
                         label="Lock"
                         @change="onLockChange"
                         size="default" border/>
            <div>
                <el-checkbox v-model="is_show_batch_op"
                             label="Batch Ops"
                             @change="onBatchOpChange"
                             size="default" border/>
                <el-switch
                    v-if="is_show_batch_op"
                    v-model="is_batch_select_all"
                    @change="batchSelectAll"
                    active-text="All"
                    inactive-text="None"
                    style="margin: 0 20px"
                />
            </div>

        </el-space>
        <!-- batch tool bar -->
        <el-space direction="horizontal" v-if="is_show_batch_op" size="large" spacer="|">
            <!-- download -->
            <el-button @click="batchShowDownload" style="width: 200px">
                Batch Download
            </el-button>
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
            <div style="gap: 5px">
                <el-button type="danger" size="default" @click="unlinkActors">
                    Unlink Actors
                </el-button>
                <el-button type="primary" size="default" @click="linkActors">
                    Link Actors
                </el-button>
            </div>
        </el-space>
        <!-- a big card per actor -->
        <div v-if="actor_show_card" class="card_row">
            <!-- TODO change is not triggered, why   -->
            <!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
            <ActorCard v-for="actor_data in locked_actor_list"
                       :actor_data="actor_data"
                       :show_select="is_show_batch_op"
                       :key="actor_data.uuid"
                       :show_lock="is_show_lock"
                       :locked="true"
                       @refresh="onActorChange"
                       @friend="onActorFriendClick"
                       @download="singleShowDownload"
                       @lock="onActorLockClick"/>
            <ActorCard v-for="actor_data in actor_list"
                       :actor_data="actor_data"
                       :show_select="is_show_batch_op"
                       :key="actor_data.uuid"
                       :show_lock="is_show_lock"
                       :locked="false"
                       @refresh="onActorChange"
                       @friend="onActorFriendClick"
                       @download="singleShowDownload"
                       @lock="onActorLockClick"/>
        </div>
        <!-- a line per actor -->
        <el-space v-if="actor_show_line"
                  class="line_row"
                  direction="vertical" size="small" fill>
            <ActorLine v-for="actor_data in actor_list"
                       :actor_data="actor_data"
                       :key="actor_data.uuid"/>
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
import {ActorShowType} from "../data/Enums";
import {Actor_Show_Options} from "../data/Consts";
import ActorLine from "./ActorLine.vue";
import Posts from "./Posts.vue";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import ActorData from "../data/ActorData";
import {BadgeStore} from "../store/BadgeStore";


export default {
    components: {SvgIcon, Posts, ActorLine, ActorCard, ActorFilter, DownloadLimit},
    data() {
        return {
            filter_condition: new ActorFilterData(),
            locked_actor_list: [] as ActorElement[],
            actor_list: [] as ActorElement[],
            // actor_cards: {} as Map<Number, ActorCard>,
            page_size: 12,
            page_index: 1,
            actor_count: 0,
            active_parts: ['filter'],
            download_actor_ids: [] as number[],
            download_limit: null as DownloadLimitForm,
            actor_show_type: ActorShowType.Card,
            is_show_post: false,
            is_show_batch_op: false,
            is_batch_select_all: false,
            is_show_lock: false
        }
    },
    computed: {
        ...mapState(ActorFilterStore, {
            cached_filter_condition: 'filter_condition',
            cached_page_size: "page_size",
            cached_page_index: "page_index",
        }),
        ...mapState(ActorGroupStore, {group_list: 'sorted_list'}),
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
            savePageIndex: "setPageIndex",
            savePageSize: "setPageSize",
            getDowningFromServer: "getDowningFromServer",
            is_actor_downing: "is_downing",
        }),
        ...mapActions(BadgeStore, {
            fetchTaskCount: 'fetchTaskCount',
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
                await this.getDowningFromServer()
            } else {
                this.actor_list = []
            }
        },
        async onFilterSubmit() {
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
        getSelectedActorIds() {
            let actor_ids = []
            for (const actor of this.locked_actor_list) {
                if (actor.selected) {
                    actor_ids.push(actor.data.actor_id)
                }
            }
            for (const actor of this.actor_list) {
                if (actor.selected) {
                    actor_ids.push(actor.data.actor_id)
                }
            }
            return actor_ids
        },
        onLockChange(val: boolean) {
            if (!val) {
                this.locked_actor_list = []
            }
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
        async linkActors() {
            let actor_ids = this.getSelectedActorIds()
            if (actor_ids.length < 2) {
                logWarn("Not enough actors to link")
                return
            }
            const [ok, actor_map] = await linkSameActors(actor_ids)
            if (ok) {
                this.refreshActors(actor_map)
                this.batchSelectAll(false)
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
                this.batchSelectAll(false)
            }
        },

        onActorLockClick(actor_data: ActorElement, val: boolean) {
            if (val) {
                this.locked_actor_list.push(actor_data)

                for (let i = 0; i < this.actor_list.length; i++) {
                    if (this.actor_list[i].data.actor_id == actor_data.data.actor_id) {
                        this.actor_list.splice(i, 1)
                        break
                    }
                }
            } else {
                this.actor_list.unshift(actor_data)

                for (let i = 0; i < this.locked_actor_list.length; i++) {
                    if (this.locked_actor_list[i].data.actor_id == actor_data.data.actor_id) {
                        this.locked_actor_list.splice(i, 1)
                        break
                    }
                }
            }
        },

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

        async batchSetGroup(group_id: number) {
            let actor_ids = this.getSelectedActorIds()
            if (actor_ids.length == 0) {
                logWarn("No actor to set group")
                return
            }
            let [ok, actor_map] = await batchChangeActorGroup(actor_ids, group_id)
            if (ok) {
                this.refreshActors(actor_map)
                this.batchSelectAll(false)
            }
        },

        refreshActors(actor_map: Map<number, ActorData>) {
            for (const actor_data of this.locked_actor_list) {
                const actor = actor_map.get(actor_data.data.actor_id)
                if (actor) {
                    actor_data.data = actor
                    console.log(`actor replaced: ${actor.actor_name}`)
                }
            }
            for (const actor_data of this.actor_list) {
                const actor = actor_map.get(actor_data.data.actor_id)
                if (actor) {
                    actor_data.data = actor
                    console.log(`actor replaced: ${actor.actor_name}`)
                }
            }
        },

        showPosts() {
            this.is_show_post = true
        },
    },
    watch: {},
    async mounted() {
        this.filter_condition = this.cached_filter_condition.clone()
        this.page_size = this.cached_page_size
        this.page_index = this.cached_page_index

        await this.getTagsFromServer()
        await this.getGroupsFromServer()
        await this.getDowningFromServer()
    }
}

</script>

<style scoped>

.card_row {
    min-height: 100px;
    min-width: 300px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 15px;
    gap: 10px 10px;
    align-items: stretch;
}

.line_row {
    margin-top: 15px;
    gap: 15px 15px;
}
</style>