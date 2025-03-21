<template>
    <el-space direction="vertical" fill>
        <!-- type line -->
        <el-radio-group v-model="down_type" size="large">
            <el-radio-button v-for="dt in down_type_list"
                             :value="dt.value">
                {{ dt.label }}
            </el-radio-button>
        </el-radio-group>

        <!-- limit block  -->
        <DownloadLimit :download_limit="download_limit" border/>

        <!-- actor category line -->
        <el-space v-if="show_category" direction="horizontal" class="with-border">
            <el-text>
                Actor Category
            </el-text>
            <el-select
                v-model="actor_category"
                placeholder="Select"
                style="width: 130px"
            >
                <el-option
                    v-for="group in down_group_list"
                    :key="group.group_id"
                    :label="group.group_name"
                    :value="group.group_id"
                />
            </el-select>
            <el-text v-if="by_category">
                (including {{ actor_count }} actors)
            </el-text>
            <el-checkbox v-else-if="by_new"
                         v-model="from_start"
                         label="From Start"
                         style="margin-left: 10px;font-size: 24px;"
                         border/>
        </el-space>

        <!-- url block -->
        <el-space direction="vertical" v-if="by_url" class="with-border">
            <!-- title line -->
            <el-space direction="horizontal" size="large">
                <el-text>
                    Actor Urls
                </el-text>
                <svg-icon size="24px" name="add"
                          @click="onAddUrl"/>
            </el-space>
            <!-- url lines -->
            <el-space v-for="(url, index) in actor_urls"
                      direction="horizontal">
                <el-form :model="url" :inline="true">
                    <el-form-item label="Name">
                        <el-input v-model="url.actor_name"/>
                    </el-form-item>
                    <el-form-item label="Url">
                        <el-input v-model="url.full_url"/>
                    </el-form-item>
                    <el-form-item>
                        <svg-icon size="30px" name="remove"
                                  @click="onRemoveUrl(index)"/>
                    </el-form-item>
                </el-form>
            </el-space>
        </el-space>

        <!-- button line -->
        <el-button type="primary" @click="download">Download</el-button>
    </el-space>
</template>

<script lang="ts">

import {ActorUrl, DownloadLimitForm} from "../data/DownloadForms";
import {
    downloadByGroup,
    downloadByUrls,
    downloadNewActors,
    manualDownload,
    resumeDownload,
} from "../ctrls/DownloadCtrl";
import {mapActions, mapState} from "pinia";
import DownloadLimit from "./DownloadLimit.vue";
import {getActorCount} from "../ctrls/ActorCtrl";
import ActorFilterData from "../data/ActorFilterData";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {DownloadType} from "../data/Enums";
import {logError, logInfo, logWarn} from "../ctrls/FetchCtrl";
import {Download_Options} from "../data/Consts";
import {CommonOption} from "../data/Interfaces";
import {BadgeStore} from "../store/BadgeStore";

export default {

    components: {DownloadLimit},
    data() {
        return {
            down_type: DownloadType.New,
            download_limit: new DownloadLimitForm(),
            actor_category: 0,
            actor_count: 0,
            from_start: false,
            actor_urls: [] as ActorUrl[],
        }
    },
    watch: {
        async actor_category(new_val, _) {
            if (this.down_type !== DownloadType.Category) return

            const filter_data = new ActorFilterData()
            filter_data.group_id_list = [new_val]
            const [ok, actor_count] = await getActorCount(filter_data)
            if (ok) {
                this.actor_count = actor_count
            }
        }
    },
    computed: {
        ...mapState(ActorGroupStore, {
            group_list: 'sorted_list',
            down_group_list: 'down_list',
        }),
        by_category(): boolean {
            return this.down_type === DownloadType.Category
        },
        by_url(): boolean {
            return this.down_type === DownloadType.Url
        },
        by_new(): boolean {
            return this.down_type === DownloadType.New
        },
        down_type_list(): CommonOption[] {
            return Download_Options
        },
        show_category(): boolean {
            return this.down_type !== DownloadType.Resume
        },
    },
    methods: {
        ...mapActions(BadgeStore, {
            fetchTaskCount: 'fetchTaskCount',
        }),
        ...mapActions(ActorGroupStore, {
            getGroupsFromServer: 'getFromServer',
            getGroup: 'get',
        }),
        checkActorCategory(): boolean {
            let group = this.getGroup(this.actor_category)
            if (group == undefined) {
                logWarn("choose correct category")
                return false
            }
            return true
        },
        async download() {
            if (this.show_category && !this.checkActorCategory()) {
                return
            }

            let ok = false
            let ret = ""
            switch (this.down_type) {
                case DownloadType.New: {
                    [ok, ret] = await downloadNewActors(this.download_limit, this.actor_category, this.from_start)
                    break
                }
                case DownloadType.Category:
                    [ok, ret] = await downloadByGroup(this.download_limit, this.actor_category)
                    break
                case DownloadType.Url:
                    if (this.actor_urls.length == 0) {
                        logWarn("no url is assigned")
                        return
                    }
                    [ok, ret] = await downloadByUrls(this.download_limit, this.actor_category, this.actor_urls)
                    break
                case DownloadType.Resume:
                    [ok, ret] = await resumeDownload(this.download_limit)
                    break
                case DownloadType.Manual:
                    [ok, ret] = await manualDownload(this.download_limit, this.actor_category)
                    break
                default:
                    logError("invalid download type")
                    break
            }
            if (ok) {
                await this.fetchTaskCount()
                logInfo("download started")
            }
        },

        onRemoveUrl(index: number) {
            this.actor_urls.splice(index, 1)
        },

        onAddUrl() {
            const new_url = new ActorUrl()
            this.actor_urls.push(new_url)
        },
    },
    async mounted() {
        await this.getGroupsFromServer()
    }
}

</script>

<style scoped>
.with-border {
    border: 1px solid;
    padding: 5px;
}
</style>