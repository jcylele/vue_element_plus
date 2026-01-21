<template>
	<div v-if="show_percent" class="center-column">
		<el-table :data="percent_files_stats" border>
			<el-table-column prop="file_path" label="Stats" min-width="100" />
			<el-table-column prop="file_count" label="File Count" min-width="100" />
			<el-table-column prop="file_size" label="Cur Size" :formatter="formatFileSize" min-width="100" />
			<el-table-column prop="res_size" label="Full Size" :formatter="formatFileSize" min-width="100" />
			<el-table-column prop="percent" label="Percent" :formatter="formatPercent" min-width="100" />
		</el-table>
		<div v-if="downloading_table_source.count > 0" class="split-row">
			<el-button @click="switchShow" plain>
				<div class="center-row">
					<svg-icon size="24px" name="switch" />
					<span>To File List</span>
				</div>
			</el-button>
			<div class="center-row">
				<el-input-number v-model="threshold_percent" min="0" max="100" step="10" step-strictly>
					<template #suffix>
						<span>%</span>
					</template>
				</el-input-number>
				<el-button type="warning" @click="removeDownloading">
					Remove Below Files
				</el-button>
			</div>
		</div>
	</div>
	<div v-else class="center-column">
		<el-table :data="downloading_table_source.list" :default-sort="{ prop: 'percent', order: 'descending' }"
			show-summary :summary-method="downloadingSummaryMethod" :empty-text="downloading_table_source.empty_text"
			max-height="360" scrollbar-always-on border>
			<el-table-column prop="file_path" label="File Name" min-width="300" />
			<el-table-column prop="file_size" label="Cur Size" sortable :formatter="formatFileSize" min-width="100" />
			<el-table-column prop="res_size" label="Full Size" sortable :formatter="formatFileSize" min-width="100" />
			<el-table-column prop="percent" label="Percent" sortable :formatter="formatPercent" min-width="100" />
		</el-table>
		<div v-if="downloading_table_source.count > 0" class="split-row">
			<el-button @click="switchShow" plain>
				<div class="center-row">
					<svg-icon size="24px" name="switch" />
					<span>To Percent View</span>
				</div>
			</el-button>
			<div class="center-row">
				<el-button type="warning" @click="removeDownloading">
					Remove All Files
				</el-button>
				<el-button type="success" @click="resumeDownloading">
					Resume Downloading
				</el-button>
			</div>
		</div>
	</div>

</template>
<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import { TableSource } from "../data/TableSource";
import { ResFileInfo } from "../data/ResFileInfo";
import { getActorDownloadingFiles, removeDownloadingFiles } from "../ctrls/ActorCtrl";
import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { EConfirmOp } from "../data/Enums";
import { LogMessages } from "../data/Messages";
import { format_file_size, format_percent } from "../data/DataUtil";
import { resumeActorDownload } from "../ctrls/DownloadCtrl";
import { BadgeStore } from "../store/BadgeStore";
import { ActorFilterStore } from "../store/ActorFilterStore";

// emits
// stores/routers
const badgeStore = BadgeStore()
const actorFilterStore = ActorFilterStore()
// props/models
const props = defineProps({
	actor_id: {
		type: Number,
		required: true
	}
})
// variables
const downloading_table_source = ref<TableSource<ResFileInfo>>(new TableSource(ResFileInfo))
const threshold_percent = ref(50)
const show_percent = ref(false)
// computed
const percent_files_stats = computed(() => {
	const above = new ResFileInfo()
	above.file_path = "Above"
	above.file_count = 0
	const below = new ResFileInfo()
	below.file_path = "Below"
	below.file_count = 0
	const threshold = threshold_percent.value / 100.0
	for (const file of downloading_table_source.value.list) {
		if (file.percent > threshold) {
			above.add(file)
		} else {
			below.add(file)
		}
	}
	return [above, below]
})
// watch
// methods

function switchShow() {
	show_percent.value = !show_percent.value
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

async function _removeDownloading(percent: number) {
	const [ok, _] = await removeDownloadingFiles(props.actor_id, percent)
	if (ok) {
		downloading_table_source.value.onLoaded([])
		logInfo(LogMessages.RemoveDownloadingFiles())
		await getDownloadingFiles()
	}
}

async function removeDownloading() {
	if (show_percent.value) {
		await confirmOp(EConfirmOp.RemoveDownloading, async () => {
			await _removeDownloading(threshold_percent.value)
		}, threshold_percent.value)
	} else {
		await confirmOp(EConfirmOp.RemoveDownloadingAll, async () => {
			await _removeDownloading(100)
		})
	}
}

async function resumeDownloading() {
	const [ok, _] = await resumeActorDownload(props.actor_id)
	if (ok) {
		logInfo(LogMessages.ResumeDownloading())
		refreshDownloadInfo()
	}
}

function refreshDownloadInfo() {
	badgeStore.fetchTaskCount()
	actorFilterStore.getDowningFromServer()
}

// lifecycle
onMounted(async () => {
	await getDownloadingFiles()
})
</script>
<style scoped></style>