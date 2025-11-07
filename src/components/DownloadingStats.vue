<template>
	<el-table :data="downloading_table_source.list" :default-sort="{ prop: 'percent', order: 'descending' }"
		show-summary :summary-method="downloadingSummaryMethod" :empty-text="downloading_table_source.empty_text"
		row-key="actor_id" max-height="560" scrollbar-always-on border>
		<el-table-column label="Actor Name" prop="actor_name" min-width="250px">
			<template #default="scope">
				<span :style="{ color: getExtraColor(scope.row.actor_group_id) }">
					{{ scope.row.actor_name }}
				</span>
			</template>
		</el-table-column>
		<el-table-column label="File Count" prop="file_count" sortable min-width="150px" />
		<el-table-column label="File Size" prop="file_size" sortable :formatter="formatFileSize" min-width="120px" />
		<el-table-column label="Res Size" prop="res_size" sortable :formatter="formatFileSize" min-width="120px" />
		<el-table-column label="Percent" prop="percent" sortable :formatter="formatPercent" min-width="120px" />
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
</template>
<script setup lang="ts">
// imports
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { ECssVarName, EFilterRow } from "../data/Enums";
import DownloadingVideoStats from "../data/DownloadingVideoStats";
import TableSource from "../data/TableSource";
import { format_file_size, format_percent, getCssVarValue } from "../data/DataUtil";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { removeDownloadingFiles } from "../ctrls/ActorCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { LogMessages } from "../data/Messages";
import { getDownloadingFileStats } from "../ctrls/ChartCtrl";

// emits
const emit = defineEmits(['search'])
// stores/routers
const router = useRouter()
const actorGroupStore = ActorGroupStore()
const actorFilterStore = ActorFilterStore()
// props/models
// variables
const downloading_table_source = ref(new TableSource(DownloadingVideoStats))
// computed
// watch
// methods
function downloadingSummaryMethod(_param: any) {
	return downloading_table_source.value.getSummaries()
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

function formatPercent(row: DownloadingVideoStats, column: any, cellValue: any, index: number) {
	return format_percent(cellValue)
}

function toActor(actor_name: string) {
	emit('search', actor_name)
}

async function removeDownloadingFile(actor_id: number) {
	const [ok, _] = await removeDownloadingFiles(actor_id)
	if (ok) {
		if (downloading_table_source.value.removeByKey(actor_id)) {
			logInfo(LogMessages.RemoveDownloadingFiles())
		}
	}
}

async function fetchDownloadingFileStats() {
	const [ok, list] = await getDownloadingFileStats()
	if (ok) {
		downloading_table_source.value.onLoaded(list)
	}
}

// lifecycle
onMounted(async () => {
	await fetchDownloadingFileStats()
})
</script>
<style scoped></style>