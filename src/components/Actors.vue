<template>
    <el-space direction="vertical" fill>
        <ActorFilter :filter_condition="filter_condition"
                     @submit="onFilterSubmit"/>
        <el-divider style="margin: 5px 0;"/>
        <!-- tools bar -->
        <el-space direction="horizontal" size="large">
            <div style="display: flex;flex-direction: row;gap: 5px">
                <el-text>Show</el-text>
                <el-select v-model="actor_show_type" style="min-width: 100px">
                    <el-option
                        v-for="option in actor_show_options"
                        :label="option.label"
                        :value="option.value"
                    />

                </el-select>
            </div>
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
            <el-checkbox v-model="is_show_batch_op"
                         label="Batch Ops"
                         @change="onBatchOpChange"
                         size="default" border/>
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
                <el-button type="primary" size="default" @click="linkActors">
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
        <div v-if="actor_show_card" class="card_row">
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
    batchChangeActorGroup, getActor,
    getActorCount,
    getActorIds,
    getLinkedActorIds,
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
import {ActorResult} from "../data/WebData";


export default {
    components: {SvgIcon, Posts, ActorLine, ActorCard, ActorFilter, DownloadLimit},
    data() {
        return {
            filter_condition: new ActorFilterData(),
            locked_actor_list: [] as ActorElement[],
            actor_list: [] as ActorElement[],
            actor_ids: [] as number[],
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
            const [ok, actor_ids] = await getActorIds(this.filter_condition, this.page_size, (this.page_index - 1) * this.page_size)
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
            const [ok, actor_ids] = await getLinkedActorIds(actor_data.data.actor_id)
            if (ok) {
                this.refreshActorIds(actor_ids)
            } else {
                this.refreshActorIds()
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
            const [ok, ar_map] = await linkSameActors(actor_ids)
            if (ok) {
                this.refreshActors(ar_map)
            }
        },

        async unlinkActors() {
            let actor_ids = this.getSelectedActorIds()
            if (actor_ids.length == 0) {
                logWarn("No actor to unlink")
                return
            }

            const [ok, ar_map] = await unlinkSameActors(actor_ids)
            if (ok) {
                this.refreshActors(ar_map)
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
            let [ok, ar_map] = await batchChangeActorGroup(actor_ids, group_id)
            if (ok) {
                this.refreshActors(ar_map)
            }
        },

        innerRefreshActors(ar_map: Map<number, ActorResult>, actor_list: ActorElement[]) {
            for (const actor_data of actor_list) {
                const ar = ar_map.get(actor_data.data.actor_id)
                if (ar) {
                    actor_data.data = ar.actor
                    if (ar.succeed) {
                        logInfo(ar.msg)
                    } else {
                        logWarn(ar.msg)
                    }
                }
            }
        },

        refreshActors(ar_map: Map<number, ActorResult>) {
            this.innerRefreshActors(ar_map, this.locked_actor_list)
            this.innerRefreshActors(ar_map, this.actor_list)
            this.batchSelectAll(false)
        },

        showPosts() {
            this.is_show_post = true
        },

        refreshActorIds(actor_ids: number[] = null) {
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