<template>
	<el-space direction="vertical" fill>
		<!-- type line -->
		<el-radio-group v-model="down_type" size="large">
			<el-radio-button v-for="dt in Download_Options" :value="dt.value">
				{{ dt.label }}
			</el-radio-button>
		</el-radio-group>

		<!-- limit block  -->
		<DownloadLimit :download_limit="download_limit" border />

		<!-- actor group line -->
		<el-space direction="horizontal" class="with-border">
			<el-text class="extra-title">
				Actor Group
			</el-text>
			<el-select v-model="actor_group" placeholder="Select" class="extra-select">
				<el-option v-for="group in filtered_group_list" :key="group.group_id" :label="group.group_name"
					:value="group.group_id" />
			</el-select>
			<el-text v-if="by_group">
				(including {{ actor_count }} actors)
			</el-text>
		</el-space>
		<el-space v-if="by_new" direction="horizontal" class="with-border">
			<el-text class="extra-title">
				From Page
			</el-text>
			<el-select v-model="start_page_type" class="extra-select" placeholder="Select"
				@change="onStartPageTypeChange">
				<el-option v-for="sp in Start_Page_Options" :key="sp.value" :label="sp.label" :value="sp.value" />
			</el-select>
			<el-input-number v-if="show_start_page_input" v-model="start_page" :min="1" class="extra-input" />
		</el-space>

		<!-- url block -->
		<el-space direction="vertical" v-if="by_url" class="with-border">
			<!-- title line -->
			<el-space direction="horizontal" size="large">
				<el-text>
					Actor Urls
				</el-text>
				<svg-icon size="24px" name="add" @click="onAddUrl" />
			</el-space>
			<!-- url lines -->
			<el-space v-for="(url, index) in actor_urls" direction="horizontal">
				<el-form :model="url" :inline="true">
					<el-form-item label="Name">
						<el-input v-model="url.actor_name" style="width: 200px;"
							placeholder="ignore if url ends with this" />
					</el-form-item>
					<el-form-item label="Url">
						<el-input v-model="url.full_url" style="width: 400px;" />
					</el-form-item>
					<el-form-item>
						<svg-icon size="30px" name="remove" @click="onRemoveUrl(index)" />
					</el-form-item>
				</el-form>
			</el-space>
		</el-space>

		<!-- button line -->
		<el-button type="primary" @click="download">Download</el-button>
	</el-space>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref, watch } from "vue";
import { ActorUrl, DownloadLimitForm } from "../data/DownloadForms";
import {
	downloadByGroup,
	downloadByUrls,
	downloadNewActors,
	manualDownload,
} from "../ctrls/DownloadCtrl";
import { getCustomPage } from "../ctrls/OtherCtrl";
import DownloadLimit from "./DownloadLimit.vue";
import { getActorCount } from "../ctrls/ActorCtrl";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { DownloadType, EStartPage } from "../data/Enums";
import { logError, logInfo, logWarn } from "../ctrls/FetchCtrl";
import { Download_Options, Start_Page_Options } from "../data/Consts";
import { BadgeStore } from "../store/BadgeStore";
import { LogMessages } from "../data/Messages";


// emits
// stores/routers
const actorGroupStore = ActorGroupStore()
const badgeStore = BadgeStore()
// props/models
// variables
const down_type = ref(DownloadType.New)
const download_limit = ref(new DownloadLimitForm())
const actor_group = ref(0)
const actor_count = ref(0)
const start_page_type = ref(EStartPage.ActorCount)
const start_page = ref(1)
const actor_urls = ref<ActorUrl[]>([])
// computed
// watch
watch(() => actor_group.value, async (new_val, _) => {
	if (down_type.value !== DownloadType.Group) return

	const filter_data = new ActorFilterData()
	filter_data.group_id_list = [new_val]
	const [ok, count] = await getActorCount(filter_data)
	if (ok) {
		actor_count.value = count
	}
})

// methods
const filtered_group_list = computed(() => {
	if (down_type.value === DownloadType.New) {
		return actorGroupStore.sorted_list.filter(group => group.is_initial)
	}
	return actorGroupStore.sorted_list.filter(group => group.has_folder)
})
const by_group = computed(() => {
	return down_type.value === DownloadType.Group
})
const by_url = computed(() => {
	return down_type.value === DownloadType.Url
})
const by_new = computed(() => {
	return down_type.value === DownloadType.New
})
const show_start_page_input = computed(() => {
	return start_page_type.value === EStartPage.Custom
})
function checkActorGroup(): boolean {
	let group = actorGroupStore.get(actor_group.value)
	if (group == undefined) {
		logWarn(LogMessages.ChooseCorrectActorGroup())
		return false
	}
	return true
}
async function onStartPageTypeChange(val) {
	if (val === EStartPage.Custom) {
		const [ok, page] = await getCustomPage()
		if (ok) {
			start_page.value = page
		}
	}
}
async function download() {
	if (!checkActorGroup()) {
		return
	}

	let ok = false
	let ret: any = null
	switch (down_type.value) {
		case DownloadType.New: {
			let real_start_page = 0
			if (start_page_type.value === EStartPage.Custom) {
				real_start_page = start_page.value
			} else {
				real_start_page = start_page_type.value
			}
			[ok, ret] = await downloadNewActors(download_limit.value, actor_group.value, real_start_page)
			break
		}
		case DownloadType.Group:
			[ok, ret] = await downloadByGroup(download_limit.value, actor_group.value)
			break
		case DownloadType.Url:
			if (actor_urls.value.length == 0) {
				logWarn(LogMessages.NoUrlAssigned())
				return
			}
			[ok, ret] = await downloadByUrls(download_limit.value, actor_group.value, actor_urls.value)
			break
		case DownloadType.Manual:
			[ok, ret] = await manualDownload(download_limit.value, actor_group.value)
			break
		default:
			logError(LogMessages.InvalidDownloadType())
			return
	}
	if (ok) {
		await badgeStore.fetchTaskCount()
		logInfo(LogMessages.TaskStart())
	}
}

function onRemoveUrl(index: number) {
	actor_urls.value.splice(index, 1)
}

function onAddUrl() {
	const new_url = new ActorUrl()
	actor_urls.value.push(new_url)
}
// lifecycle
onMounted(async () => {
	await actorGroupStore.getFromServer()
})
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