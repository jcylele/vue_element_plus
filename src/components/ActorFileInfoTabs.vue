<template>
	<el-tabs type="border-card" v-model="default_tab" @tab-change="onTabChange" style="width: 750px;">
		<el-tab-pane label="All Videos" :name="ETabNames.All" lazy>
			<div class="center-column">
				<VideoSizesChart :actor_id="actor.actor_id" />
				<div class="center-row">
					<el-button type="success" v-if="has_folder" @click="toDownload">
						To Download
					</el-button>
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane label="Downloading Videos" :name="ETabNames.Downloading" lazy>
			<ActorDownloadingFiles :actor_id="actor.actor_id" />
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
import { ActorVideoInfo } from "../data/ActorVideoInfo";

import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { getActorVideoInfo, openActorFolder, removeActorFiles, renameActorFiles } from "../ctrls/ActorCtrl";

import VideoSizesChart from "./Chart/VideoSizesChart.vue";
import ActorDownloadingFiles from "./ActorDownloadingFiles.vue";
import { ActorData } from "../data/ActorData";

enum ETabNames {
	All,
	Downloading,
	Downed
}

// emits
const emit = defineEmits(['download', 'file'])
// stores/routers
// props/models
const props = defineProps({
	actor: {
		type: ActorData,
		required: true
	}
})
// variables
const default_tab = ref(ETabNames.Downed)
// computed
const downed_files = computed(() => props.actor.video_infos)
const downed_video_count = computed(() => downed_files.value.reduce((sum, avi: ActorVideoInfo) => sum + avi.file_count, 0))
const has_folder = computed(() => props.actor.group_abstract.has_folder)
// watch
// methods

function toDownload() {
	emit('download')
}

async function getDownedFiles() {
	const [ok, video_info] = await getActorVideoInfo(props.actor.actor_id)
	if (ok) {
		props.actor.video_infos = video_info
	}
}

async function openFolder() {
	await openActorFolder(props.actor.actor_id)
}

async function renameFiles() {
	const [ok, _] = await renameActorFiles(props.actor.actor_id)
	if (ok) {
		logInfo(LogMessages.RenameFiles())
	}
}

async function removeFiles(is_landscape: boolean) {
	await confirmOp(EConfirmOp.RemoveActorVideos, async () => {
		const [ok, _] = await removeActorFiles(props.actor.actor_id, is_landscape)
		if (ok) {
			logInfo(LogMessages.RemoveFiles(is_landscape))
			emit('file')
			await getDownedFiles()
		}
	}, is_landscape ? "landscape" : "portrait")
}

async function onTabChange(tab_name: number) {
	switch (tab_name) {
		case ETabNames.All:
			break
		case ETabNames.Downloading:
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
</style>