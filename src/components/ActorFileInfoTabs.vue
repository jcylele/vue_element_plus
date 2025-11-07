<template>
	<el-tabs type="border-card" v-model="default_tab" @tab-change="onTabChange" style="width: 750px;">
		<el-tab-pane label="Post Fetch Time" :name="ETabNames.PostFetchTime" lazy>
			<div class="center-column">
				<PostFetchTimeChart :actor_id="actor_id" />
				<div class="center-row">
					<el-button type="warning" @click="toFixPosts">
						Fix Posts
					</el-button>
					<el-button type="warning" @click="toFixRes">
						Fix Res
					</el-button>
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane label="All Videos" :name="ETabNames.All" lazy>
			<div class="center-column">
				<VideoSizesChart :actor_id="actor_id" />
				<div class="center-row">
					<el-button type="success" v-if="has_folder" @click="toDownload">
						To Download
					</el-button>
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane label="Downloading Videos" :name="ETabNames.Downloading" lazy>
			<div class="center-column">
				<el-table :data="downloading_table_source.list" :default-sort="{ prop: 'percent', order: 'descending' }"
					show-summary :summary-method="downloadingSummaryMethod"
					:empty-text="downloading_table_source.empty_text" max-height="360" scrollbar-always-on border>
					<el-table-column prop="file_path" label="File Name" min-width="300" />
					<el-table-column prop="file_size" label="Cur Size" sortable :formatter="formatFileSize"
						min-width="100" />
					<el-table-column prop="res_size" label="Full Size" sortable :formatter="formatFileSize"
						min-width="100" />
					<el-table-column prop="percent" label="Percent" sortable :formatter="formatPercent"
						min-width="100" />
				</el-table>
				<div v-if="downloading_table_source.count > 0" class="center-row">
					<el-button type="warning" @click="removeDownloading">
						Remove All Files
					</el-button>
					<el-button type="success" v-if="has_folder" @click="resumeDownloading">
						Resume Downloading
					</el-button>
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane v-if="has_folder" label="Downed Videos" :name="ETabNames.Downed" lazy>
			<div class="center-column">
				<el-table :data="downed_files" style="width: 100%;">
					<el-table-column prop="str_resolution" label="Orientation" min-width="100" />
					<el-table-column prop="str_file_size" label="Size" min-width="100" />
					<el-table-column prop="str_file_count" label="File Count" min-width="100" />
					<el-table-column prop="str_duration" label="Duration" min-width="100" />
				</el-table>
				<div v-if="downed_video_count > 0" class="split-row">
					<div class="center-row">
						<el-button type="success" style="width: 130px;" @click="renameFiles">
							Rename Files
						</el-button>
						<el-button type="primary" style="width: 130px;" @click="openFolder">
							Open Folder
						</el-button>
					</div>
					<div class="center-row">
						<span style="margin-right: 5px;color: orangered;font-size: var(--el-font-size-large);">
							Remove
						</span>
						<el-button type="warning" style="width: 100px;" @click="removeFiles(true)">
							Landscape
						</el-button>
						<el-button type="warning" style="width: 100px;" @click="removeFiles(false)">
							Portrait
						</el-button>
					</div>
				</div>
			</div>
		</el-tab-pane>
	</el-tabs>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";

import { EConfirmOp } from "../data/Enums";
import { LogMessages } from "../data/Messages";
import { format_file_size, format_percent } from "../data/DataUtil";
import { ActorVideoInfo } from "../data/ActorVideoInfo";
import { ResFileInfo } from "../data/ResFileInfo";
import TableSource from "../data/TableSource";

import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { getActorDownloadingFiles, getActorVideoInfo, openActorFolder, removeActorFiles, removeDownloadingFiles, renameActorFiles } from "../ctrls/ActorCtrl";
import { fixPosts, fixRes, resumeActorDownload } from "../ctrls/DownloadCtrl";

import VideoSizesChart from "./Chart/VideoSizesChart.vue";
import PostFetchTimeChart from "./Chart/PostFetchTimeChart.vue";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { BadgeStore } from "../store/BadgeStore";

enum ETabNames {
	PostFetchTime,
	All,
	Downloading,
	Downed
}

// emits
const emit = defineEmits(['download', 'close'])
// stores/routers
const actorFilterStore = ActorFilterStore()
const badgeStore = BadgeStore()
// props/models
const props = defineProps({
	actor_id: {
		type: Number,
		required: true
	},
	has_folder: {
		type: Boolean,
		required: true
	}
})
// variables
const default_tab = ref(ETabNames.Downed)
const downloading_table_source = ref<TableSource<ResFileInfo>>(new TableSource(ResFileInfo))
const downed_files = ref<Array<ActorVideoInfo>>([])
// computed
const downed_video_count = computed(() => downed_files.value.reduce((sum, avi: ActorVideoInfo) => sum + avi.file_count, 0))
// watch
// methods
function refreshDownloadInfo() {
	badgeStore.fetchTaskCount()
	actorFilterStore.getDowningFromServer()
}

async function removeDownloading() {
	await confirmOp(EConfirmOp.RemoveDownloading, async () => {
		const [ok, _] = await removeDownloadingFiles(props.actor_id)
		if (ok) {
			downloading_table_source.value.onLoaded([])
			logInfo(LogMessages.RemoveDownloadingFiles())
		}
	})
}

async function resumeDownloading() {
	const [ok, _] = await resumeActorDownload(props.actor_id)
	if (ok) {
		logInfo(LogMessages.ResumeDownloading())
	}
}

async function toFixPosts() {
	const [ok, _] = await fixPosts(props.actor_id)
	if (ok) {
		refreshDownloadInfo()
		logInfo(LogMessages.TaskFixPosts())
		emit('close')
	}
}

async function toFixRes() {
	const [ok, _] = await fixRes(props.actor_id)
	if (ok) {
		refreshDownloadInfo()
		logInfo(LogMessages.TaskFixRes())
		emit('close')
	}
}

function toDownload() {
	emit('download')
}

async function getDownloadingFiles() {
	const [ok, list] = await getActorDownloadingFiles(props.actor_id)
	if (ok) {
		downloading_table_source.value.onLoaded(list)
	}
}

function formatFileSize(row: ResFileInfo, column: any, cellValue: any, index: number) {
	return format_file_size(cellValue)
}

function formatPercent(row: ResFileInfo, column: any, cellValue: any, index: number) {
	return format_percent(cellValue)
}

function downloadingSummaryMethod(_param: any) {
	return downloading_table_source.value.getSummaries()
}

async function getDownedFiles() {
	const [ok, video_info] = await getActorVideoInfo(props.actor_id)
	if (ok) {
		downed_files.value = video_info
	}
}

async function openFolder() {
	await openActorFolder(props.actor_id)
}

async function renameFiles() {
	const [ok, _] = await renameActorFiles(props.actor_id)
	if (ok) {
		logInfo(LogMessages.RenameFiles())
	}
}

async function removeFiles(is_landscape: boolean) {
	const [ok, _] = await removeActorFiles(props.actor_id, is_landscape)
	if (ok) {
		logInfo(LogMessages.RemoveFiles(is_landscape))
		await getDownedFiles()
	}
}

async function onTabChange(tab_name: number) {
	switch (tab_name) {
		case ETabNames.All:
		case ETabNames.PostFetchTime:
			break
		case ETabNames.Downloading:
			await getDownloadingFiles()
			break
		case ETabNames.Downed:
			await getDownedFiles()
			break
	}
}

// lifecycle
onMounted(() => {
	onTabChange(default_tab.value)
})
</script>

<style scoped>
.center-row> :deep(.el-button) {
	flex: 1;
}
</style>