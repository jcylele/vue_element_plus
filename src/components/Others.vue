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
						<div class="left-row bottom">
							<el-button type="primary" size="default" @click="onOpClick(op.op)">
								{{ op.btn_text }}
							</el-button>
							<span v-if="op.api_path" class="last-time-text">
								Last Run: {{ getLastApiTime(op.api_path) }}
							</span>
						</div>
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
					<el-table :data="group_size_table_source.list" row-key="group_id" show-summary
						:summary-method="groupSizeSummaryMethod" :empty-text="group_size_table_source.empty_text">
						<el-table-column label="Name" prop="group_name" min-width="100px">
							<template #default="scope">
								<span :style="{ color: getExtraColor(scope.row.group_id) }">
									{{ scope.row.group_name }}
								</span>
							</template>
						</el-table-column>
						<el-table-column label="Size" prop="group_size" :formatter="formatFileSize" min-width="100px" />
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
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
// imports
import { onMounted, ref } from "vue";
import { getLastRunTimes, openLogs, refreshMissingPosts, validateFileInfos } from "../ctrls/OtherCtrl";
import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { clearFolderOfGroup } from "../ctrls/ActorCtrl";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { getGroupSizes } from "../ctrls/ChartCtrl";
import { format_file_size, getCssVarValue } from "../data/DataUtil";
import DownloadingVideoStats from "../data/DownloadingVideoStats";
import { EConfirmOp, ECssVarName, EOtherOp } from "../data/Enums";
import { LogMessages } from "../data/Messages";
import { Other_Ops } from "../data/Consts";
import { cleanFiles, resetManual } from "../ctrls/OtherCtrl";
import Settings from "./Settings.vue";
import { TableSource } from "../data/TableSource";
import { GroupSizeData } from "../data/GroupSizeData";

enum EOtherTab {
	Op = "Op",
	ResSize = "ResSize",
	Settings = "Settings",
}

// emits
// stores/routers
const actorGroupStore = ActorGroupStore()
// props/models
// variables
const default_tab = ref(EOtherTab.Op)
const group_size_table_source = ref<TableSource<GroupSizeData>>(new TableSource(GroupSizeData))
const last_run_times = ref<Record<string, string>>({})
// computed
// watch
// methods

async function onTabChange(val: string) {
	switch (val) {
		case EOtherTab.ResSize:
			await fetchGroupSizes()
			break
		case EOtherTab.Op:
			await fetchLastRunTimes()
			break
		default:
			break
	}
}

async function fetchGroupSizes() {
	const [ok, ret] = await getGroupSizes()
	if (ok) {
		const downloading_group = new GroupSizeData()
		downloading_group.group_id = 0
		downloading_group.group_name = "Downloading"
		downloading_group.group_size = ret[0]

		const group_size_list: GroupSizeData[] = [downloading_group]
		for (const group of actorGroupStore.sorted_list) {
			const size = ret[group.group_id]
			if (size) {
				const group_size_data = new GroupSizeData()
				group_size_data.group_id = group.group_id
				group_size_data.group_name = group.group_name
				group_size_data.group_size = size

				group_size_list.push(group_size_data)
			}
		}

		group_size_table_source.value.onLoaded(group_size_list)
	}
}

function getExtraColor(group_id: number): string {
	if (group_id === 0) {
		return getCssVarValue(ECssVarName.ElTableTextColor)
	}
	return actorGroupStore.get(group_id).group_color
}

function formatFileSize(row: DownloadingVideoStats, column: any, cellValue: any, index: number) {
	return format_file_size(cellValue)
}

function groupSizeSummaryMethod(_param: any) {
	return group_size_table_source.value.getSummaries()
}

async function clearGroupFolder(group_id: number) {
	await confirmOp(EConfirmOp.ClearGroupFolder, async () => {
		const [ok, _] = await clearFolderOfGroup(group_id)
		if (ok) {
			group_size_table_source.value.removeByKey(group_id)
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
				const [ok, _] = await validateFileInfos()
				if (ok) {
					logInfo(LogMessages.ValidateFileInfos(0))
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
		case EOtherOp.MissingPosts:
			{
				await refreshMissingPosts()
			}
			break
		default:
			break
	}
}

async function fetchLastRunTimes() {
	const [ok, ret] = await getLastRunTimes()
	if (ok) {
		last_run_times.value = ret
	}
}

function getLastApiTime(api_path: string) {
	return last_run_times.value[api_path]
}


// lifecycle
onMounted(async () => {
	await onTabChange(default_tab.value)
})
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

.last-time-text {
	font-size: 14px;
	color: var(--el-text-color-regular);
}

.warn-text {
	font-size: 24px;
	color: darkorange;
}
</style>