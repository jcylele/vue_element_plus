<template>
	<div id="others">
		<el-collapse v-model="activeName" @change="handleChange" accordion>
			<el-collapse-item title="Outdated Files" :name="ETab.OutDated">
				<template #title>
					<el-text class="title-text">Outdated Files</el-text>
				</template>
				<el-space direction="vertical" size="small" alignment="flex-start">
					<el-text class="desc-text">
						when actor is done, there may be downloading files of this actor
					</el-text>
					<el-button type="primary" size="default" @click="clean">
						Remove Files
					</el-button>
				</el-space>
			</el-collapse-item>
			<el-collapse-item title="Validate File Info" :name="ETab.Validate">
				<template #title>
					<el-text class="title-text">Validate File Info</el-text>
				</template>
				<el-space direction="vertical" size="small" alignment="flex-start">
					<el-text class="desc-text">
						correct incorrect file info in database
					</el-text>
					<el-button type="primary" size="default" @click="validate">
						Validate
					</el-button>
				</el-space>
			</el-collapse-item>
			<el-collapse-item :name="ETab.Reset">
				<template #title>
					<el-text class="title-text">Reset Manual</el-text>
				</template>
				<el-space direction="vertical" size="small" alignment="flex-start">
					<el-text class="desc-text">
						reset manual flag for all actors
					</el-text>
					<el-button type="warning" size="default" @click="resetAllManual">
						Reset Manual
					</el-button>
				</el-space>
			</el-collapse-item>
			<el-collapse-item :name="ETab.Log">
				<template #title>
					<el-text class="title-text">Logs</el-text>
				</template>
				<el-space direction="vertical" size="small" alignment="flex-start">
					<el-text class="desc-text">
						open log folder in explorer
					</el-text>
					<el-button type="primary" size="default" @click="openLogFolder">
						Open Log Folder
					</el-button>
				</el-space>
			</el-collapse-item>
			<el-collapse-item :name="ETab.Downloading">
				<template #title>
					<el-text class="title-text">Downloading File Stats</el-text>
				</template>
				<el-space direction="vertical" size="small" alignment="flex-start">
					<el-table :data="downloading_file_stats" row-key="uuid"
						:default-sort="{ prop: 'percent', order: 'descending' }" show-summary
						:summary-method="getSummaries" max-height="560" scrollbar-always-on border>
						<el-table-column label="Actor Name" prop="actor_name" min-width="250px" />
						<el-table-column label="File Count" prop="file_count" sortable min-width="150px" />
						<el-table-column label="File Size" prop="file_size" sortable :formatter="formatFileSize"
							min-width="120px" />
						<el-table-column label="Res Size" prop="res_size" sortable :formatter="formatFileSize"
							min-width="120px" />
						<el-table-column label="Percent" prop="percent" sortable :formatter="formatPercent"
							min-width="120px" />
						<el-table-column label="Op" width="220px">
							<template #default="scope">
								<div class="center-row">
									<el-button type="primary" @click="toActor(scope.row.actor_name)">
										Search
									</el-button>
									<el-button type="danger" @click="removeDownloadingFile(scope.row.actor_id)">
										Remove
									</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</el-space>
			</el-collapse-item>
			<el-collapse-item :name="ETab.Res">
				<template #title>
					<el-text class="title-text">Res Sizes</el-text>
				</template>
				<el-space direction="vertical" size="small" alignment="flex-start">
					<el-text class="desc-text">
						sum of res sizes in each group
					</el-text>
					<el-text class="warn-text">
						clear group folder may take several seconds
					</el-text>
					<el-table :data="actorGroupStore.sorted_list" row-key="uuid">
						<el-table-column label="Name" prop="group_name" min-width="100px" />
						<el-table-column label="Size" min-width="100px">
							<template #default="scope">
								{{ getGroupSize(scope.row.group_id) }}
							</template>
						</el-table-column>
						<el-table-column label="Op" min-width="160px">
							<template #default="scope">
								<el-button v-if="scope.row.has_folder" type="danger"
									@click="clearGroupFolder(scope.row.group_id)">
									Clear Folder
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-space>
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup lang="ts">
import { cleanFiles, openLogs } from "../ctrls/DownloadCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { clearFolderOfGroup, removeDownloadingFiles, resetManual, validateFileInfos } from "../ctrls/ActorCtrl";
import { ref } from "vue";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { getDownloadingFileStats, getGroupSizes } from "../ctrls/ChartCtrl";
import { format_file_size, format_percent } from "../data/DataUtil";
import DownloadingVideoStats from "../data/DownloadingVideoStats";
import { EFilterRow } from "../data/Enums";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { useRouter } from "vue-router";

enum ETab {
	OutDated = "outdated",
	Validate = "validate",
	Similar = "similar",
	Reset = "reset",
	Log = "log",
	Res = "res",
	Downloading = "downloading",
}
const router = useRouter()
const actorGroupStore = ActorGroupStore()
const actorFilterStore = ActorFilterStore()

const activeName = ref("")

const group_sizes = ref(new Map<number, number>())
const downloading_file_stats = ref<DownloadingVideoStats[]>([])
const total_downloading_file = ref<DownloadingVideoStats>(new DownloadingVideoStats())

function getGroupSize(group_id: number): string {
	if (group_id in group_sizes.value) {
		return format_file_size(group_sizes.value[group_id])
	}
	return "0"
}

async function handleChange(val: string) {
	if (val === ETab.Res) {
		await fetchGroupSizes()
	} else if (val === ETab.Downloading) {
		await fetchDownloadingFileStats()
	}
}

async function fetchGroupSizes() {
	const [ok, ret] = await getGroupSizes()
	if (ok) {
		group_sizes.value = ret
	}
}

async function fetchDownloadingFileStats() {
	const [ok, list] = await getDownloadingFileStats()
	if (ok) {
		downloading_file_stats.value = list
		total_downloading_file.value = DownloadingVideoStats.getTotal(list)
	}
}

function formatFileSize(row: DownloadingVideoStats, column: any, cellValue: any, index: number) {
	return format_file_size(cellValue)
}

function formatPercent(row: DownloadingVideoStats, column: any, cellValue: any, index: number) {
	return format_percent(cellValue)
}

function getSummaries(param: any) {
	return [
		total_downloading_file.value.actor_name,
		total_downloading_file.value.file_count,
		format_file_size(total_downloading_file.value.file_size),
		format_file_size(total_downloading_file.value.res_size),
		format_percent(total_downloading_file.value.percent)
	]
}


function toActor(actor_name: string) {
	const filter_condition = new ActorFilterData()
	filter_condition.name = `${actor_name}||`
	filter_condition.setRowVisible(EFilterRow.Name, true)
	actorFilterStore.saveFilter(filter_condition)
	router.push("/actors")
}

async function removeDownloadingFile(actor_id: number) {
	const [ok, _] = await removeDownloadingFiles(actor_id)
	if (ok) {
		const index = downloading_file_stats.value.findIndex(stats => stats.actor_id === actor_id)
		if (index !== -1) {
			const removed_stats = downloading_file_stats.value[index]
			total_downloading_file.value.remove(removed_stats)
			downloading_file_stats.value.splice(index, 1)
			logInfo(`remove downloading file succeed`)
		}
	}
}

async function clearGroupFolder(group_id: number) {
	const [ok, _] = await clearFolderOfGroup(group_id)
	if (ok) {
		group_sizes.value[group_id] = 0
	}
}

async function clean() {
	const [ok, _] = await cleanFiles()
	if (ok) {
		logInfo("remove outdated files succeed")
	}
}

async function validate() {
	const [ok, count] = await validateFileInfos()
	if (ok) {
		logInfo(`validate file info succeed, ${count} actors validated`)
	}
}

async function resetAllManual() {
	const [ok, _] = await resetManual()
	if (ok) {
		logInfo("reset manual succeed")
	}
}

async function openLogFolder() {
	await openLogs()
}
</script>

<style scoped>
.title-text {
	font-size: 28px;
	font-weight: bold;
	margin-left: 10px;
}

.desc-text {
	font-size: 24px;
}

.warn-text {
	font-size: 24px;
	color: darkorange;
}
</style>