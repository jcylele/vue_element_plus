<template>
	<el-tabs type="border-card" v-model="default_tab" @tab-change="onTabChange" style="width: 750px;">
		<el-tab-pane label="All Videos" :name="ETabNames.All">
			<div class="center-column">
				<VideoSizesChart :actor_id="actor_id" />
				<div class="center-row">
					<el-button type="warning" @click="toFixPosts">
						Fix Posts
					</el-button>
					<el-button type="success" v-if="has_folder" @click="toDownload">
						To Download
					</el-button>
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane label="Downloading Videos" :name="ETabNames.Downloading">
			<div class="center-column">
				<el-table :data="downloading_files" :default-sort="{ prop: 'percent', order: 'descending' }"
					show-summary :summary-method="getSummaries" max-height="360" scrollbar-always-on border>
					<el-table-column prop="file_path" label="File Name" min-width="300" />
					<el-table-column prop="file_size" label="Cur Size" sortable :formatter="formatFileSize"
						min-width="100" />
					<el-table-column prop="res_size" label="Full Size" sortable :formatter="formatFileSize"
						min-width="100" />
					<el-table-column prop="percent" label="Percent" sortable :formatter="formatPercent"
						min-width="100" />
				</el-table>
				<div v-if="downloading_files.length > 0" class="center-row" >
					<el-button type="warning" @click="removeDownloading">
						Remove All Files
					</el-button>
					<el-button type="success" v-if="has_folder" @click="resumeDownloading">
						Resume Downloading
					</el-button>
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane v-if="has_folder" label="Downed Videos" :name="ETabNames.Downed">
			<div class="center-column">
				<el-table :data="downed_files" style="width: 100%;">
					<el-table-column prop="str_resolution" label="Orientation" min-width="100" />
					<el-table-column prop="str_file_size" label="Size" min-width="100" />
					<el-table-column prop="str_file_count" label="File Count" min-width="100" />
					<el-table-column prop="str_duration" label="Duration" min-width="100" />
				</el-table>
				<div v-if="downed_video_count > 0" class="center-row">
					<el-button type="success" @click="renameFiles">
						Rename Files
					</el-button>
					<el-button type="success" @click="openFolder">
						Open Folder
					</el-button>
				</div>
			</div>
		</el-tab-pane>
	</el-tabs>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import VideoSizesChart from "./Chart/VideoSizesChart.vue";
import { ActorVideoInfo } from "../data/ActorVideoInfo";
import { ResFileInfo } from "../data/ResFileInfo";
import { getActorDownloadingFiles, getActorVideoInfo, openActorFolder, removeDownloadingFiles, renameActorFiles } from "../ctrls/ActorCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { fixPosts, resumeActorDownload } from "../ctrls/DownloadCtrl";
import { format_file_size, format_percent } from "../data/DataUtil";
import { LogMessages } from "../data/Messages";

enum ETabNames {
	All,
	Downloading,
	Downed
}

// emits
const emit = defineEmits(['download', 'close'])
// stores/routers

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
const downloading_files = ref<Array<ResFileInfo>>([])
const total_downloading_file = ref<ResFileInfo>(ResFileInfo.getTotal([]))
const downed_files = ref<Array<ActorVideoInfo>>([])
// computed
const downed_video_count = computed(() => downed_files.value.reduce((sum, avi: ActorVideoInfo) => sum + avi.file_count, 0))
// watch
// methods
async function removeDownloading() {
	const [ok, _] = await removeDownloadingFiles(props.actor_id)
	if (ok) {
		downloading_files.value = []
		total_downloading_file.value = ResFileInfo.getTotal([])
		logInfo(LogMessages.RemoveDownloadingFiles())
	}
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
		logInfo(LogMessages.TaskFixPosts())
		emit('close')
	}
}

function toDownload() {
	emit('download')
}

async function getDownloadingFiles() {
	const [ok, list] = await getActorDownloadingFiles(props.actor_id)
	if (ok) {
		downloading_files.value = list
		total_downloading_file.value = ResFileInfo.getTotal(list)
	}
}

function formatFileSize(row: ResFileInfo, column: any, cellValue: any, index: number) {
	return format_file_size(cellValue)
}

function formatPercent(row: ResFileInfo, column: any, cellValue: any, index: number) {
	return format_percent(cellValue)
}

function getSummaries(param: any) {
	return [
		total_downloading_file.value.file_path,
		format_file_size(total_downloading_file.value.file_size),
		format_file_size(total_downloading_file.value.res_size),
		format_percent(total_downloading_file.value.percent)
	]
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

async function onTabChange(tab_name: number) {
	switch (tab_name) {
		case ETabNames.All:
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