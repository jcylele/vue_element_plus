<template>
	<el-tabs type="border-card" v-model="default_tab" @tab-change="onTabChange">
		<el-tab-pane label="All Videos" :name="ETabNames.All">
			<VideoSizesChart :actor_id="actor_id" />
		</el-tab-pane>
		<el-tab-pane label="Downloading Videos" :name="ETabNames.Downloading">
			<el-space direction="vertical" size="small" style="width: 100%" fill>
				<el-table :data="downloading_files">
					<el-table-column prop="file_path" label="File Name" min-width="300" />
					<el-table-column prop="str_file_size" label="Cur Size" min-width="100" />
					<el-table-column prop="str_res_size" label="Full Size" min-width="100" />
				</el-table>
				<div v-if="downloading_files.length > 0" class="center-row" style="margin-top: 10px">
					<el-button type="warning" @click="removeDownloading">
						Remove All Files
					</el-button>
					<el-button type="success" @click="resumeDownloading">
						Resume Downloading
					</el-button>
				</div>
			</el-space>
		</el-tab-pane>
		<el-tab-pane label="Downed Videos" :name="ETabNames.Downed">
			<el-space direction="vertical" size="small" style="width: 100%" fill>
				<el-table :data="downed_files">
					<el-table-column prop="str_resolution" label="Orientation" min-width="100" />
					<el-table-column prop="str_file_size" label="Size" min-width="100" />
					<el-table-column prop="str_file_count" label="File Count" min-width="100" />
					<el-table-column prop="str_duration" label="Duration" min-width="100" />
				</el-table>
				<div v-if="downed_video_count > 0" class="center-row" style="margin-top: 10px">
					<el-button type="success" @click="renameFiles">
						Rename Files
					</el-button>
					<el-button type="success" @click="openFolder">
						Open Folder
					</el-button>
				</div>
			</el-space>
		</el-tab-pane>
	</el-tabs>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import VideoSizesChart from "./Chart/VideoSizesChart.vue";
import { ActorVideoInfo, ResFileInfo } from "../data/WebData";
import { getActorDownloadingFiles, getActorVideoInfo, openActorFolder, removeDownloadingFiles, renameActorFiles } from "../ctrls/ActorCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { resumeActorDownload } from "../ctrls/DownloadCtrl";

enum ETabNames {
	All,
	Downloading,
	Downed
}

// emits
const emit = defineEmits(['change'])
// stores/routers

// props/models
const props = defineProps({
	actor_id: {
		type: Number,
		required: true
	}
})
// variables
const default_tab = ref(ETabNames.Downed)
const downloading_files = ref<Array<ResFileInfo>>([])
const downed_files = ref<Array<ActorVideoInfo>>([])
// computed
const downed_video_count = computed(() => downed_files.value.reduce((sum, avi: ActorVideoInfo) => sum + avi.file_count, 0))
// watch
// methods
async function removeDownloading() {
	const [ok, _] = await removeDownloadingFiles(props.actor_id)
	if (ok) {
		downloading_files.value = []
		logInfo("remove downloading files succeed")
	}
}

async function resumeDownloading() {
	const [ok, _] = await resumeActorDownload(props.actor_id)
	if (ok) {
		logInfo("resume downloading succeed")
	}
}

async function getDownloadingFiles() {
	const [ok, ret] = await getActorDownloadingFiles(props.actor_id)
	if (ok) {
		downloading_files.value = ret
	}
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
		logInfo("rename files succeed")
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

<style scoped></style>