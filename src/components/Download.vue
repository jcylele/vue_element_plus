<template>
    <el-space direction="vertical" fill>
        <!-- type line -->
        <el-radio-group v-model="down_type" size="large">
            <el-radio-button v-for="dt in down_type_list" :value="dt.value">
                {{ dt.label }}
            </el-radio-button>
        </el-radio-group>

        <!-- limit block  -->
        <DownloadLimit :download_limit="download_limit" border/>

        <!-- actor group line -->
        <el-space v-if="show_group" direction="horizontal" class="with-border">
            <el-text class="extra-title">
                Actor Group
            </el-text>
            <el-select v-model="actor_group" placeholder="Select" class="extra-select">
                <el-option v-for="group in down_group_list" :key="group.group_id" :label="group.group_name"
                           :value="group.group_id"/>
            </el-select>
            <el-text v-if="by_group">
                (including {{ actor_count }} actors)
            </el-text>
        </el-space>
        <el-space v-if="by_new" direction="horizontal" class="with-border">
            <el-text class="extra-title">
                From Page
            </el-text>
            <el-select v-model="start_page_type"
                       class="extra-select"
                       placeholder="Select"
                       @change="onStartPageTypeChange">
                <el-option v-for="sp in start_page_list" :key="sp.value" :label="sp.label" :value="sp.value"/>
            </el-select>
            <el-input-number v-if="show_start_page_input" v-model="start_page" :min="1" class="extra-input"/>
        </el-space>

        <!-- url block -->
        <el-space direction="vertical" v-if="by_url" class="with-border">
            <!-- title line -->
            <el-space direction="horizontal" size="large">
                <el-text>
                    Actor Urls
                </el-text>
                <svg-icon size="24px" name="add" @click="onAddUrl"/>
            </el-space>
            <!-- url lines -->
            <el-space v-for="(url, index) in actor_urls" direction="horizontal">
                <el-form :model="url" :inline="true">
                    <el-form-item label="Name">
                        <el-input v-model="url.actor_name"/>
                    </el-form-item>
                    <el-form-item label="Url">
                        <el-input v-model="url.full_url"/>
                    </el-form-item>
                    <el-form-item>
                        <svg-icon size="30px" name="remove" @click="onRemoveUrl(index)"/>
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
    downloadNewActors, getCustomPage,
    manualDownload,
    resumeDownload,
} from "../ctrls/DownloadCtrl";
import {mapActions, mapState} from "pinia";
import DownloadLimit from "./DownloadLimit.vue";
import {getActorCount} from "../ctrls/ActorCtrl";
import {ActorFilterData} from "../data/ActorFilterData";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {DownloadType, EStartPage} from "../data/Enums";
import {logError, logInfo, logWarn} from "../ctrls/FetchCtrl";
import {Download_Options, Start_Page_Options} from "../data/Consts";
import {CommonOption} from "../data/Interfaces";
import {BadgeStore} from "../store/BadgeStore";
import ActorGroupData from "../data/ActorGroupData";

export default {

    components: {DownloadLimit},
    data() {
        return {
            down_type: DownloadType.New,
            download_limit: new DownloadLimitForm(),
            actor_group: 0,
            actor_count: 0,
            start_page_type: EStartPage.ActorCount,
            start_page: 1,
            actor_urls: [] as ActorUrl[],
        }
    },
    watch: {
        async actor_group(new_val, _) {
            if (this.down_type !== DownloadType.Group) return

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
        }),
		down_group_list(): ActorGroupData[] {
			return this.group_list.filter(group => group.has_folder)
		},
        by_group(): boolean {
            return this.down_type === DownloadType.Group
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
        show_group(): boolean {
            return this.down_type !== DownloadType.Resume
        },
        start_page_list(): CommonOption[] {
            return Start_Page_Options
        },
        show_start_page_input(): boolean {
            return this.start_page_type === EStartPage.Custom
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
        checkActorGroup(): boolean {
            let group = this.getGroup(this.actor_group)
            if (group == undefined) {
                logWarn("choose correct group")
                return false
            }
            return true
        },
        async onStartPageTypeChange(val) {
            if (val === EStartPage.Custom) {
                const [ok, page] = await getCustomPage()
                if (ok) {
                    this.start_page = page
                }
            }
        },
        async download() {
            if (this.show_group && !this.checkActorGroup()) {
                return
            }

            let ok = false
            let ret = ""
            switch (this.down_type) {
                case DownloadType.New: {
                    let real_start_page = 0
                    if (this.start_page_type === EStartPage.Custom) {
                        real_start_page = this.start_page
                    } else {
                        real_start_page = this.start_page_type
                    }
                    [ok, ret] = await downloadNewActors(this.download_limit, this.actor_group, real_start_page)
                    break
                }
                case DownloadType.Group:
                    [ok, ret] = await downloadByGroup(this.download_limit, this.actor_group)
                    break
                case DownloadType.Url:
                    if (this.actor_urls.length == 0) {
                        logWarn("no url is assigned")
                        return
                    }
                    [ok, ret] = await downloadByUrls(this.download_limit, this.actor_group, this.actor_urls)
                    break
                case DownloadType.Resume:
                    [ok, ret] = await resumeDownload(this.download_limit)
                    break
                case DownloadType.Manual:
                    [ok, ret] = await manualDownload(this.download_limit, this.actor_group)
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

.extra-title {
    width: 150px;
    font-weight: bold;
}

.extra-select {
    width: 150px;
}

.extra-input {
    width: 150px;
}
</style>