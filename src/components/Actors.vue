<template>
	<div class="left-column">
		<ActorFilter ref="actorFilterRef" :filter_condition="editing_filter_condition" @submit="onFilterSubmit" />
		<el-divider style="margin: 1px; width: 100%;" />
		<!-- filter desc -->
		<div>
			<div class="left-row wrap" v-if="!is_filter_normal">
				<ActorFilterItem :item="filter_item" />
				<el-button type="primary" @click="onFilterBack" plain>
					Back to list
				</el-button>
			</div>
			<div class="left-row wrap" v-else-if="can_refresh">
				<ActorFilterItem :item="desc" v-for="desc in page_filter_condition.desc_list" />
				<el-button type="primary" @click="refreshPage" plain>
					Refresh
				</el-button>
			</div>

		</div>
		<!-- tools bar -->
		<div class="left-row">
			<el-pagination v-if="is_filter_normal" v-model:current-page="page_index" :total="actor_count"
				:page-size="page_size" :page-sizes="[6, 8, 10, 12, 14]" :pager-count="5"
				@current-change="onActorPageChange" @size-change="handleSizeChange"
				layout="sizes, total, prev, pager, next" class="page-border" background />
			<el-popover placement="bottom" width="170" trigger="hover" :show-after="200">
				<template #reference>
					<el-button size="large" plain>
						Downloading
					</el-button>
				</template>

				<template #default>
					<div class="fill-column">
						<el-button :disabled="!actorFilterStore.has_downing_actors" type="primary" size="large"
							@click="filterDownloadingActors">
							Actors
						</el-button>
						<el-button type="primary" size="large" @click="showDownloadingFileStats">
							File Stats
						</el-button>
					</div>
				</template>
			</el-popover>

			<el-checkbox v-model="is_show_batch_op" label="Batch Ops" @change="onBatchOpChange" size="large" border />
			<el-switch v-if="is_show_batch_op" v-model="is_batch_select_all" @change="batchSelectAll" active-text="All"
				inactive-text="None" width="60px" size="large" class="common-border" />
		</div>
		<!-- batch tool bar -->
		<el-space direction="horizontal" v-if="is_show_batch_op" spacer="|" class="common-border">

			<!-- set actor group -->
			<el-select placeholder="Set Group" class="batch-op-button" @change="batchSetGroup">
				<el-option v-for="group in actorGroupStore.sorted_list" :label="group.show_content"
					:value="group.group_id" :style="{ 'color': group.group_color, }" />
			</el-select>

			<!-- folder -->
			<div class="center-row" @mouseenter="onHoverChange(HoverType.folder)"
				@mouseleave="onHoverChange(HoverType.none)">
				<div class="center-row" v-if="hover_type == HoverType.folder">
					<el-button type="danger" class="batch-inner-button" @click="batchShowFolderRemove">
						Remove
					</el-button>
					<el-button type="primary" class="batch-inner-button" @click="batchShowFolderAdd">
						Add
					</el-button>
				</div>
				<el-button v-else class="batch-op-button" plain>
					Folder
				</el-button>
			</div>

			<!-- lock/unlock -->
			<div class="center-row" @mouseenter="onHoverChange(HoverType.lock)"
				@mouseleave="onHoverChange(HoverType.none)">
				<div class="center-row" v-if="hover_type == HoverType.lock">
					<el-button type="danger" class="batch-inner-button" @click="lockActors(false)">
						Unlock
					</el-button>
					<el-button type="primary" class="batch-inner-button" @click="lockActors(true)">
						Lock
					</el-button>
				</div>
				<el-button v-else class="batch-op-button" plain>
					Lock/Unlock
				</el-button>
			</div>

			<!-- link/unlink -->
			<div class="center-row" @mouseenter="onHoverChange(HoverType.link)"
				@mouseleave="onHoverChange(HoverType.none)">
				<div class="center-row" v-if="hover_type == HoverType.link">
					<el-button type="danger" class="batch-inner-button" @click="unlinkActors">
						Unlink
					</el-button>
					<el-button type="primary" class="batch-inner-button" @click="onLinkClick">
						Link
					</el-button>
				</div>
				<el-button v-else class="batch-op-button" plain>
					Link/Unlink
				</el-button>
			</div>

			<!-- download -->
			<el-popover placement="bottom" trigger="hover">
				<template #reference>
					<el-button class="batch-op-button" plain>
						Task
					</el-button>
				</template>

				<template #default>
					<div class="fill-column">
						<el-button type="primary" size="large" @click="batchShowDownload">
							Download
						</el-button>
						<el-button type="primary" size="large" @click="toThumbnail">
							Thumbnail
						</el-button>
						<el-button type="warning" size="large" @click="toFixPosts">
							Scan All Posts
						</el-button>
						<el-button type="warning" size="large" @click="toFixRes">
							Fix Video Urls
						</el-button>
					</div>
				</template>
			</el-popover>
		</el-space>
		<!-- a big card per actor -->
		<div class="card_row left-row wrap stretch">
			<!-- TODO change is not triggered, why   -->
			<!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
			<ActorCard v-for="actor_data in actor_data_mgr.locked_actor_list" :actor_data="actor_data"
				:show_select="is_show_batch_op" :key="actor_data.uuid" :locked="true" @refresh="onActorChange"
				@friend="onActorFriendClick" @download="singleShowDownload" @update="refreshActors" />
			<ActorCard v-for="actor_data in actor_data_mgr.actor_list" :actor_data="actor_data"
				:show_select="is_show_batch_op" :key="actor_data.uuid" :locked="false" @refresh="onActorChange"
				@friend="onActorFriendClick" @download="singleShowDownload" @update="refreshActors" />
		</div>
	</div>
	<!-- download  dialog -->
	<el-dialog v-model="actors_dialog.is_show_download" :title="actors_dialog.title">
		<div class="center-column">
			<DownloadLimit :download_limit="download_limit" />
			<div class="center-row">
				<el-button type="primary" @click="onSubmitDownload">
					Download
				</el-button>
				<el-button type="warning" @click="onDownloadClose">
					Cancel
				</el-button>
			</div>
		</div>
	</el-dialog>
	<!-- link preview dialog -->
	<el-dialog v-model="actors_dialog.is_show_link" :title="actors_dialog.title">
		<ActorLinkPreview v-if="actors_dialog.is_show_link" :actors="actors_dialog.selected_actors"
			@submit="onLinkPreviewSubmit" @cancel="onLinkPreviewClose" />
	</el-dialog>
	<!-- folder add dialog -->
	<el-dialog v-model="actors_dialog.is_show_folder_add" :title="actors_dialog.title">
		<FavFolderSelector @select="onFolderAddSubmit" />
	</el-dialog>
	<!-- folder remove dialog -->
	<el-dialog v-model="actors_dialog.is_show_folder_remove" :title="actors_dialog.title">
		<FavFolderSelector @select="onFolderRemoveSubmit" />
	</el-dialog>
	<!-- downloading file stats dialog -->
	<el-dialog v-model="actors_dialog.is_show_downloading" :title="actors_dialog.title">
		<DownloadingStats v-if="actors_dialog.is_show_downloading" @search="onActorSearch" />
	</el-dialog>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import {
	batchChangeActorGroup,
	getActorCount,
	getActorIds,
	getLinkedActorIds,
	linkSameActors, unlinkSameActors
} from "../ctrls/ActorCtrl";
import { downloadByActorIds, downloadThumbnail, fixPosts, fixRes } from "../ctrls/DownloadCtrl";
import { logInfo, logWarn } from "../ctrls/FetchCtrl";
import { batchAddActorToFolder, batchDelActorFromFolder } from "../ctrls/FolderCtrl";
import { ActorData } from "../data/ActorData";
import { ActorDataMgr } from "../data/ActorDataMgr";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorsDialog, EActorsDialog } from "../data/ActorsDialog";
import { ActorElement } from "../data/ArrayElement";
import { format_date } from "../data/DataUtil";
import { DownloadLimitForm } from "../data/DownloadForms";
import { ECardRefresh, EStoreType } from "../data/Enums";
import { LogMessages } from "../data/Messages";
import { FilterItem } from "../data/WebData";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { ActorTagStore } from "../store/ActorTagStore";
import { BadgeStore } from "../store/BadgeStore";
import { FavFolderStore } from "../store/FavFolderStore";
import ActorCard from "./ActorCard.vue";
import ActorFilter from "./ActorFilter.vue";
import ActorFilterItem from "./ActorFilterItem.vue";
import ActorLinkPreview from "./ActorLinkPreview.vue";
import DownloadingStats from "./DownloadingStats.vue";
import DownloadLimit from "./DownloadLimit.vue";
import FavFolderSelector from "./FavFolderSelector.vue";

enum FilterType {
	Normal = "Normal",
	Link = "Linked",
	Download = "Downloading"
}

enum HoverType {
	none = "none",
	link = "link",
	folder = "folder",
	lock = "lock",
}

// emits
// stores/routers
const actorTagStore = ActorTagStore()
const actorFilterStore = ActorFilterStore()
const actorGroupStore = ActorGroupStore()
const favFolderStore = FavFolderStore()
const badgeStore = BadgeStore()
// props/models
// variables
const actorFilterRef = ref<InstanceType<typeof ActorFilter> | null>(null)
const editing_filter_condition = ref<ActorFilterData>(new ActorFilterData())
const page_filter_condition = ref<ActorFilterData>(new ActorFilterData())
const filter_type = ref(FilterType.Normal)
const filter_item = ref(new FilterItem("", ""))
const actor_data_mgr = ref(new ActorDataMgr())
const page_size = ref(12)
const page_index = ref(1)
const actor_count = ref(0)
const download_limit = ref<DownloadLimitForm>(new DownloadLimitForm())
const is_show_batch_op = ref(false)
const is_batch_select_all = ref(false)
const actors_dialog = ref(new ActorsDialog())
const hover_type = ref(HoverType.none)
// computed
const is_filter_normal = computed(() => filter_type.value == FilterType.Normal)
const can_refresh = computed(() => page_filter_condition.value.desc_list.length > 0)
// methods
function onHoverChange(type: HoverType) {
	hover_type.value = type
}
function getNameFunc(store_type: EStoreType, group_id: number): string {
	switch (store_type) {
		case EStoreType.ActorGroup:
			return actorGroupStore.getName(group_id)
		case EStoreType.ActorTag:
			return actorTagStore.getName(group_id)
		case EStoreType.ActorFavFolder:
			return favFolderStore.getName(group_id)
		default:
			throw new Error(`Unknown store type: ${store_type}`)
	}
}

function formatFilterItems(page_filter: ActorFilterData): FilterItem[] {
	const show_group = page_filter.group_id_list.length > 0 && page_filter.group_id_list.length < actorGroupStore.count
	return page_filter.formatFilterItems(getNameFunc, show_group)
}

async function handleSizeChange(val: number) {
	page_size.value = val
	actorFilterStore.page_size = val
	page_index.value = 1
	await onActorPageChange()
}

async function onActorPageChange() {
	actorFilterStore.page_index = page_index.value
	const [ok, actor_ids] = await getActorIds(page_filter_condition.value, page_size.value, (page_index.value - 1) * page_size.value)
	if (ok) {
		refreshActorIds(actor_ids)
		await refreshDownloadingInfos()
	} else {
		refreshActorIds()
	}
}
async function onFilterSubmit() {
	// extra actions to filter
	editing_filter_condition.value.simplifySortItems()
	// create desc_list before saving to store
	editing_filter_condition.value.desc_list = formatFilterItems(editing_filter_condition.value)
	actorFilterStore.saveFilter(editing_filter_condition.value)
	page_filter_condition.value.copy(editing_filter_condition.value)

	// on filter changed
	await onPageFilterChange(true)
}
async function onPageFilterChange(clear: boolean = false) {
	if (clear) {
		refreshActorIds()
		actor_count.value = 0
		page_index.value = 1
	}
	const [ok, count] = await getActorCount(page_filter_condition.value)
	if (ok) {
		actor_count.value = count
		if (!clear) {
			page_index.value = getCachedPageIndex()
		}
		await onActorPageChange()
	}
}
function getCachedPageIndex(): number {
	let cached_page_index = actorFilterStore.page_index

	let max_page_count = Math.ceil(actor_count.value / page_size.value)
	if (cached_page_index > max_page_count) {
		cached_page_index = max_page_count
	}

	if (cached_page_index < 1) {
		cached_page_index = 1
	}

	return cached_page_index
}
async function refreshPage() {
	await onPageFilterChange()
}
async function onFilterBack() {
	await onPageFilterChange()
}
function onActorChange(actor_id: number, refresh: ECardRefresh) {
	if (refresh == ECardRefresh.Group) {
		actorFilterRef.value?.refreshGroupCount()
	}
}
async function onActorFriendClick(actor_data: ActorElement) {
	const [ok, actor_ids] = await getLinkedActorIds(actor_data.data.actor_id)
	if (ok) {
		refreshActorIds(actor_ids as number[], FilterType.Link)
	} else {
		refreshActorIds()
	}
}

async function filterDownloadingActors() {
	await refreshDownloadingInfos()
	refreshActorIds(actorFilterStore.downing_actor_id_list, FilterType.Download)
}

function showDownloadingFileStats() {
	actors_dialog.value.showDialog(EActorsDialog.downloading)
}

async function onActorSearch(actor_name: string) {
	actors_dialog.value.closeDialog(EActorsDialog.downloading)

	const filter_condition = new ActorFilterData()
	filter_condition.setName(`${actor_name}||`)
	// 只能赋值，不要修改内部属性
	editing_filter_condition.value = filter_condition
	await onFilterSubmit()
}

// region batch, select, lock
function getSelectedActors() {
	return actor_data_mgr.value.getSelected().map(actor => actor.data)
}
function getSelectedActorIds() {
	return actor_data_mgr.value.getSelected().map(actor => actor.data.actor_id)
}
function onBatchOpChange(val: boolean) {
	if (!val) {
		is_batch_select_all.value = false
		batchSelectAll(false)
	}
}
function batchSelectAll(val: boolean) {
	actor_data_mgr.value.batchSelectAll(val)
}

async function batchSetGroup(group_id: number) {
	let actor_ids = getSelectedActorIds()
	if (actor_ids.length == 0) {
		logWarn(LogMessages.NoActorSelected())
		return
	}
	let group_name = actorGroupStore.getName(group_id)
	let [ok, actor_map] = await batchChangeActorGroup(actor_ids, group_id, group_name)
	if (ok) {
		refreshActors(actor_map as Map<number, ActorData>)
		onActorChange(0, ECardRefresh.Group)
	}
}

function lockActors(lock: boolean) {
	actor_data_mgr.value.lockActors(lock)
}

// endregion

// region link

function onLinkClick() {
	const link_actor_list = getSelectedActors()
	if (link_actor_list.length < 2) {
		logWarn(LogMessages.NotEnoughActorsToLink())
		return
	}
	actors_dialog.value.showDialog(EActorsDialog.link, undefined, link_actor_list)
}

function onLinkPreviewClose() {
	actors_dialog.value.closeDialog(EActorsDialog.link)
}

async function onLinkPreviewSubmit(score: number, remark: string, tag_list: number[]) {
	const actor_ids = actors_dialog.value.selected_actors.map(actor => actor.actor_id)
	const [ok, actor_map] = await linkSameActors(actor_ids, score, remark, tag_list)
	if (ok) {
		logInfo(LogMessages.LinkActors(actor_ids.length))
		actors_dialog.value.closeDialog(EActorsDialog.link)
		refreshActors(actor_map as Map<number, ActorData>)
	}
}

async function unlinkActors() {
	let actor_ids = getSelectedActorIds()
	if (actor_ids.length == 0) {
		logWarn(LogMessages.NoActorSelected())
		return
	}

	const [ok, actor_map] = await unlinkSameActors(actor_ids)
	if (ok) {
		logInfo(LogMessages.UnlinkActors(actor_ids.length))
		refreshActors(actor_map as Map<number, ActorData>)
	}
}

// endregion

// region download

function showDownloadLimit(actor_ids: number[]) {
	actors_dialog.value.showDialog(EActorsDialog.download, actor_ids, undefined)
}

function singleShowDownload(actor_data: ActorElement) {
	showDownloadLimit([actor_data.data.actor_id])
}

function batchShowDownload() {
	let actor_ids = getSelectedActorIds()
	if (actor_ids.length == 0) {
		logWarn(LogMessages.NoActorSelected())
		return
	}
	showDownloadLimit(actor_ids)
}

async function onSubmitDownload() {
	let [ok, _] = await downloadByActorIds(download_limit.value, actors_dialog.value.selected_actor_ids)
	onDownloadClose()
	if (ok) {
		await refreshDownloadingInfos(true)
	}
}

async function toThumbnail() {
	let actor_ids = getSelectedActorIds()
	const [ok, _] = await downloadThumbnail(actor_ids)
	if (ok) {
		await refreshDownloadingInfos(true)
	}
}

async function toFixPosts() {
	let actor_ids = getSelectedActorIds()
	const [ok, _] = await fixPosts(actor_ids)
	if (ok) {
		await refreshDownloadingInfos(true)
	}
}

async function toFixRes() {
	let actor_ids = getSelectedActorIds()
	const [ok, _] = await fixRes(actor_ids, format_date(new Date()))
	if (ok) {
		await refreshDownloadingInfos(true)
	}
}


async function refreshDownloadingInfos(show_msg: boolean = false) {
	await badgeStore.fetchTaskCount()
	await actorFilterStore.getDowningFromServer()
	if (show_msg) {
		logInfo(LogMessages.TaskStart())
	}
}

function onDownloadClose() {
	actors_dialog.value.closeDialog(EActorsDialog.download)
}

// endregion

//region folder

function batchShowFolderAdd() {
	let actor_ids = getSelectedActorIds()
	if (actor_ids.length == 0) {
		logWarn(LogMessages.NoActorSelected())
		return
	}
	actors_dialog.value.showDialog(EActorsDialog.folder_add, actor_ids, undefined)
}
function batchShowFolderRemove() {
	let actor_ids = getSelectedActorIds()
	if (actor_ids.length == 0) {
		logWarn(LogMessages.NoActorSelected())
		return
	}
	actors_dialog.value.showDialog(EActorsDialog.folder_remove, actor_ids, undefined)
}

async function onFolderAddSubmit(folder_id: number) {
	const [ok, _] = await batchAddActorToFolder(folder_id, actors_dialog.value.selected_actor_ids)
	if (ok) {
		updateActors(actors_dialog.value.selected_actor_ids, actor => actor.addToFolder(folder_id))
		actors_dialog.value.closeDialog(EActorsDialog.folder_add)
	}
}

async function onFolderRemoveSubmit(folder_id: number) {
	const [ok, _] = await batchDelActorFromFolder(folder_id, actors_dialog.value.selected_actor_ids)
	if (ok) {
		updateActors(actors_dialog.value.selected_actor_ids, actor => actor.removeFromFolder(folder_id))
		actors_dialog.value.closeDialog(EActorsDialog.folder_remove)
	}
}

//endregion

function refreshActors(actor_map: Map<number, ActorData>) {
	actor_data_mgr.value.refreshActors(actor_map)
}

function updateActors(actor_ids: number[], update: (actor: ActorData) => void) {
	actor_data_mgr.value.updateActors(actor_ids, update)
}

function refreshActorIds(actor_ids: number[] | undefined = undefined, filter: FilterType = FilterType.Normal) {
	filter_type.value = filter
	is_batch_select_all.value = false

	actor_data_mgr.value.refreshActorIds(actor_ids)

	filter_item.value.label = filter
	filter_item.value.value = `${actor_data_mgr.value.actor_id_count} actors`
}

function restoreFilter() {
	const last_filter = actorFilterStore.last_filter
	if (last_filter) {
		editing_filter_condition.value = last_filter.clone()
	}
}

// lifecycle
onMounted(async () => {
	restoreFilter()
	page_size.value = actorFilterStore.page_size
	page_index.value = actorFilterStore.page_index

	await actorTagStore.getFromServer()
	await actorGroupStore.getFromServer()
	await refreshDownloadingInfos()
})

</script>

<style scoped>
.card_row {
	min-height: 100px;
	min-width: 300px;
	margin-top: 15px;
	gap: 20px 20px;
}

.page-border {
	border: 1px ridge;
	border-color: var(--el-border-color);
	padding: 3px 5px;
}

.sp-filter {
	color: var(--el-button-text-color);
	background-color: var(--el-color-success);
	border-radius: 5px;
	height: 30px;
	padding: 5px 20px;
}

.batch-op-button {
	width: 168px;
}

.batch-inner-button {
	width: 80px;
}
</style>