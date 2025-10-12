<template>
	<div id="others">
		<el-tabs v-model="default_tab" tab-position="left" type="border-card" @tab-change="onTabChange">
			<el-tab-pane label="Operations" :name="EOtherTab.Op">
				<div class="fill-column">
					<div v-for="op in Other_Ops" class="common-group-item">
						<span class="common-group-name">{{ op.label }}</span>
						<span class="common-group-desc">
							{{ op.desc }}
						</span>
						<el-button type="primary" size="default" @click="onOpClick(op.op)">
							{{ op.btn_text }}
						</el-button>
					</div>
				</div>
			</el-tab-pane>
			<el-tab-pane label="Settings" :name="EOtherTab.Settings">
				<Settings />
			</el-tab-pane>
			<el-tab-pane label="Res Size Stats" :name="EOtherTab.ResSize">
				<div class="left-column">
					<span class="desc-text">
						sum of res sizes in each group
					</span>
					<span class="warn-text">
						clear group folder may take several seconds
					</span>
					<el-table :data="group_size_list" row-key="uuid">
						<el-table-column label="Name" prop="group_name" min-width="100px" />
						<el-table-column label="Size" prop="str_size" min-width="100px" />
						<el-table-column label="Op" min-width="160px">
							<template #default="scope">
								<el-button v-if="scope.row.group_id !== 0" type="danger"
									@click="clearGroupFolder(scope.row.group_id)">
									Clear Folder
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-tab-pane>
			<el-tab-pane label="Downloading Stats" :name="EOtherTab.Downloading">
				<el-table :data="downloading_file_stats" row-key="uuid"
					:default-sort="{ prop: 'percent', order: 'descending' }" show-summary :summary-method="getSummaries"
					max-height="560" scrollbar-always-on border>
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
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
// imports
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { openLogs } from "../ctrls/OtherCtrl";
import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { clearFolderOfGroup, removeDownloadingFiles, validateFileInfos } from "../ctrls/ActorCtrl";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { getDownloadingFileStats, getGroupSizes } from "../ctrls/ChartCtrl";
import { format_file_size, format_percent } from "../data/DataUtil";
import DownloadingVideoStats from "../data/DownloadingVideoStats";
import { EConfirmOp, EFilterRow, EOtherOp } from "../data/Enums";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { LogMessages } from "../data/Messages";
import { Other_Ops } from "../data/Consts";
import { cleanFiles, resetManual } from "../ctrls/OtherCtrl";
import Settings from "./Settings.vue";

enum EOtherTab {
	Op = "Op",
	ResSize = "ResSize",
	Downloading = "Downloading",
	Settings = "Settings",
}

interface IGroupSize {
	group_id: number
	group_name: string
	str_size: string
}

const downloading_group: IGroupSize = {
	group_id: 0,
	group_name: "Downloading",
	str_size: "0"
}

// emits
// stores/routers
const router = useRouter()
const actorGroupStore = ActorGroupStore()
const actorFilterStore = ActorFilterStore()
// props/models
// variables
const default_tab = ref(EOtherTab.Op)
const group_size_list = ref<IGroupSize[]>([])
const downloading_file_stats = ref<DownloadingVideoStats[]>([])
const total_downloading_file = ref<DownloadingVideoStats>(new DownloadingVideoStats())
// computed
// watch
// methods

async function onTabChange(val: string) {
	if (val === EOtherTab.ResSize) {
		await fetchGroupSizes()
	} else if (val === EOtherTab.Downloading) {
		await fetchDownloadingFileStats()
	}
}

async function fetchGroupSizes() {
	const [ok, ret] = await getGroupSizes()
	if (ok) {
		downloading_group.str_size = format_file_size(ret[0])
		group_size_list.value = [downloading_group]
		for (const group of actorGroupStore.sorted_list) {
			const size = ret[group.group_id]
			if (size) {
				group_size_list.value.push({
					group_id: group.group_id,
					group_name: group.group_name,
					str_size: format_file_size(size)
				})
			}
		}
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
			logInfo(LogMessages.RemoveDownloadingFiles())
		}
	}
}

async function clearGroupFolder(group_id: number) {
	await confirmOp(EConfirmOp.ClearGroupFolder, async () => {
		const [ok, _] = await clearFolderOfGroup(group_id)
		if (ok) {
			const index = group_size_list.value.findIndex(group => group.group_id === group_id)
			if (index !== -1) {
				group_size_list.value.splice(index, 1)
			}
		}
	})
}

async function onOpClick(op: EOtherOp) {
	switch (op) {
		case EOtherOp.Outdated:
			{
				const [ok, _] = await cleanFiles()
				if (ok) {
					logInfo(LogMessages.RemoveOutdatedFiles())
				}
			}
			break
		case EOtherOp.Validate:
			{
				const [ok, count] = await validateFileInfos()
				if (ok) {
					logInfo(LogMessages.ValidateFileInfos(count))
				}
			}
			break
		case EOtherOp.Manual:
			{
				const [ok, _] = await resetManual()
				if (ok) {
					logInfo(LogMessages.ResetManual())
				}
			}
			break
		case EOtherOp.Logs:
			{
				await openLogs()
			}
			break
		default:
			break
	}
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