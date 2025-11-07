<template>
	<el-space direction="vertical" size="small" alignment="start" fill>
		<ActorFilter ref="actorFilterRef" :filter_condition="editing_filter_condition" @submit="onFilterSubmit" />
		<el-divider style="margin: 1px; width: 100%;" />
		<!-- filter desc -->
		<div>
			<el-space v-if="is_filter_normal" direction="horizontal" size="large" wrap>
				<ActorFilterItem :item="desc" v-for="desc in page_filter_condition.desc_list" />
				<el-button type="primary" @click="refreshPage" plain>
					Refresh
				</el-button>
			</el-space>
			<el-space v-else direction="horizontal" size="large" wrap>
				<ActorFilterItem :item="filter_item" />
				<el-button type="primary" @click="onFilterBack" plain>
					Back to list
				</el-button>
			</el-space>
		</div>
		<!-- tools bar -->
		<el-space direction="horizontal" size="large">
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
						<el-button :disabled="!has_downing_actors" type="primary" size="large"
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
				inactive-text="None" width="60px" size="large" />
		</el-space>
		<!-- batch tool bar -->
		<el-space direction="horizontal" v-if="is_show_batch_op" spacer="|" class="common-border">
			<el-space direction="horizontal" size="small">
				<el-button type="danger" class="batch-op-button" @click="lockActors(false)">
					Unlock
				</el-button>
				<el-button type="primary" class="batch-op-button" @click="lockActors(true)">
					Lock
				</el-button>
			</el-space>

			<el-space direction="horizontal" size="small">
				<el-button type="danger" class="batch-op-button" @click="unlinkActors">
					Unlink
				</el-button>
				<el-button type="primary" class="batch-op-button" @click="onLinkClick">
					Link
				</el-button>
			</el-space>

			<!-- set actor group -->
			<el-select placeholder="Set Group" style="width: 150px" @change="batchSetGroup">
				<el-option v-for="group in group_list" :label="group.show_content" :value="group.group_id"
					:style="{ 'color': group.group_color, }" />
			</el-select>
			<!-- download -->
			<el-button @click="batchShowDownload" plain style="width: 150px;">
				Download
			</el-button>
			<!-- folder -->
			<el-space direction="horizontal" size="small">
				<el-text style="font-weight: bold;">
					Folder
				</el-text>
				<el-button type="primary" class="batch-op-button" @click="batchShowFolderAdd">
					Add
				</el-button>
				<el-button type="danger" class="batch-op-button" @click="batchShowFolderRemove">
					Remove
				</el-button>
			</el-space>

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
	</el-space>
	<!-- download  dialog -->
	<el-dialog v-model="actors_dialog.is_show_download" :title="actors_dialog.title">
		<el-space direction="vertical">
			<DownloadLimit :download_limit="download_limit" />
			<el-space direction="horizontal" alignment="center">
				<el-button type="primary" @click="onSubmitDownload">
					Download
				</el-button>
				<el-button type="warning" @click="onDownloadClose">
					Cancel
				</el-button>
			</el-space>
		</el-space>
	</el-dialog>
	<!-- link preview dialog -->
	<el-dialog v-model="actors_dialog.is_show_link" :title="actors_dialog.title">
		<ActorLinkPreview :actors="actors_dialog.selected_actors" @submit="onLinkPreviewSubmit"
			@cancel="onLinkPreviewClose" />
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
		<DownloadingStats @search="onActorSearch" />
	</el-dialog>
</template>

<script lang="ts">
import { ActorFilterData } from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import { ActorElement } from "../data/ArrayElement";
import {
	batchChangeActorGroup, 
	getActorCount,
	getActorIds,
	getLinkedActorIds,
	linkSameActors, unlinkSameActors
} from "../ctrls/ActorCtrl";
import { mapActions, mapState } from "pinia";
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { DownloadLimitForm } from "../data/DownloadForms";
import { downloadByActorIds } from "../ctrls/DownloadCtrl";
import DownloadLimit from "./DownloadLimit.vue";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { logInfo, logWarn } from "../ctrls/FetchCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import ActorData from "../data/ActorData";
import { BadgeStore } from "../store/BadgeStore";
import ActorLinkPreview from "./ActorLinkPreview.vue";
import ActorFilterItem from "./ActorFilterItem.vue";
import { FilterItem } from "../data/WebData";
import { ECardRefresh, EStoreType } from "../data/Enums";
import { FavFolderStore } from "../store/FavFolderStore";
import { ActorsDialog, EActorsDialog } from "../data/ActorsDialog";
import FavFolderSelector from "./FavFolderSelector.vue";
import DownloadingStats from "./DownloadingStats.vue";
import { batchAddActorToFolder, batchDelActorFromFolder } from "../ctrls/FolderCtrl";
import { LogMessages } from "../data/Messages";
import ActorDataMgr from "../data/ActorDataMgr";

enum FilterType {
	Normal = "Normal",
	Link = "Linked",
	Download = "Downloading"
}

export default {
	components: { ActorLinkPreview, SvgIcon, ActorCard, ActorFilter, DownloadLimit, ActorFilterItem, FavFolderSelector, DownloadingStats },
	data() {
		return {
			actorFilterRef: undefined,
			editing_filter_condition: new ActorFilterData(),
			page_filter_condition: new ActorFilterData(),
			filter_type: FilterType.Normal,
			filter_item: new FilterItem("", ""),
			actor_data_mgr: new ActorDataMgr(),
			page_size: 12,
			page_index: 1,
			actor_count: 0,
			active_parts: ['filter'],
			download_limit: undefined as DownloadLimitForm | undefined,
			is_show_batch_op: false,
			is_batch_select_all: false,
			actors_dialog: new ActorsDialog(),
		}
	},
	computed: {
		...mapState(ActorFilterStore, {
			last_filter_condition: 'last_filter',
			cached_page_size: "page_size",
			cached_page_index: "page_index",
			downing_actor_ids: "downing_actors",
			has_downing_actors: "has_downing_actors"
		}),
		...mapState(ActorGroupStore, {
			group_list: 'sorted_list',
			group_count: 'count'
		}),
		is_filter_normal() {
			return this.filter_type == FilterType.Normal
		},
		filter_type_name() {
			return this.filter_type
		},
	},
	methods: {
		...mapActions(ActorTagStore, {
			getTagsFromServer: 'getFromServer',
			getTagName: 'getName',
		}),
		...mapActions(ActorFilterStore, {
			savePageIndex: "setPageIndex",
			savePageSize: "setPageSize",
			getDowningFromServer: "getDowningFromServer",
			is_actor_downing: "is_downing",
			saveFilterCondition: "saveFilter",
		}),
		...mapActions(BadgeStore, {
			fetchTaskCount: 'fetchTaskCount',
		}),
		...mapActions(ActorGroupStore, {
			getGroupsFromServer: 'getFromServer',
			getGroupName: 'getName',
		}),
		...mapActions(FavFolderStore, { getFolderName: 'getName' }),

		getNameFunc(store_type: EStoreType, group_id: number): string {
			switch (store_type) {
				case EStoreType.ActorGroup:
					return this.getGroupName(group_id)
				case EStoreType.ActorTag:
					return this.getTagName(group_id)
				case EStoreType.ActorFavFolder:
					return this.getFolderName(group_id)
				default:
					throw new Error(`Unknown store type: ${store_type}`)
			}
		},

		formatFilterItems(page_filter: ActorFilterData): FilterItem[] {
			const show_group = page_filter.group_id_list.length > 0 && page_filter.group_id_list.length < this.group_count
			return page_filter.formatFilterItems(this.getNameFunc, show_group)
		},

		async handleSizeChange(val: number) {
			this.page_size = val
			this.savePageSize(val)
			this.page_index = 1
			await this.onActorPageChange()
		},

		async onActorPageChange() {
			this.savePageIndex(this.page_index)
			const [ok, actor_ids] = await getActorIds(this.page_filter_condition, this.page_size, (this.page_index - 1) * this.page_size)
			if (ok) {
				this.refreshActorIds(actor_ids)
				await this.getDowningFromServer()
			} else {
				this.refreshActorIds()
			}
		},
		async onFilterSubmit() {
			// extra actions to filter
			this.editing_filter_condition.simplifySortItems()
			// create desc_list before saving to store
			this.editing_filter_condition.desc_list = this.formatFilterItems(this.editing_filter_condition)
			this.saveFilterCondition(this.editing_filter_condition)
			this.page_filter_condition.copy(this.editing_filter_condition)

			// on filter changed
			await this.onPageFilterChange(true)
		},
		async onPageFilterChange(clear: boolean = false) {
			if (clear) {
				this.refreshActorIds()
				this.actor_count = 0
				this.page_index = 1
			}
			const [ok, actor_count] = await getActorCount(this.page_filter_condition)
			if (ok) {
				this.actor_count = actor_count
				if (!clear) {
					this.page_index = this.getCachedPageIndex()
				}
				await this.onActorPageChange()
			}
		},
		getCachedPageIndex(): number {
			let cached_page_index = this.cached_page_index

			let max_page_count = Math.ceil(this.actor_count / this.page_size)
			if (cached_page_index > max_page_count) {
				cached_page_index = max_page_count
			}

			if (cached_page_index < 1) {
				cached_page_index = 1
			}

			return cached_page_index
		},
		async refreshPage() {
			await this.onPageFilterChange()
		},
		async onFilterBack() {
			await this.onPageFilterChange()
		},
		onActorChange(actor_id: number, refresh: ECardRefresh) {
			if (refresh == ECardRefresh.Group) {
				this.$refs.actorFilterRef.refreshGroupCount()
			}
		},
		async onActorFriendClick(actor_data: ActorElement) {
			const [ok, actor_ids] = await getLinkedActorIds(actor_data.data.actor_id)
			if (ok) {
				this.refreshActorIds(actor_ids, FilterType.Link)
			} else {
				this.refreshActorIds()
			}
		},

		async filterDownloadingActors() {
			await this.getDowningFromServer()
			this.refreshActorIds(this.downing_actor_ids, FilterType.Download)
		},

		showDownloadingFileStats() {
			this.actors_dialog.showDialog(EActorsDialog.downloading)
		},

		async onActorSearch(actor_name: string) {
			this.actors_dialog.closeDialog(EActorsDialog.downloading)

			this.editing_filter_condition.reset()
			this.editing_filter_condition.setNameLink(`${actor_name}||`)
			await this.onFilterSubmit()
		},

		// region batch, select, lock
		getSelectedActors() {
			return this.actor_data_mgr.getSelected().map(actor => actor.data)
		},
		getSelectedActorIds() {
			return this.actor_data_mgr.getSelected().map(actor => actor.data.actor_id)
		},
		onBatchOpChange(val: boolean) {
			if (!val) {
				this.is_batch_select_all = false
				this.batchSelectAll(false)
			}
		},
		batchSelectAll(val: boolean) {
			this.actor_data_mgr.batchSelectAll(val)
		},

		async batchSetGroup(group_id: number) {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn(LogMessages.NoActorSelected())
				return
			}
			let [ok, actor_map] = await batchChangeActorGroup(actor_ids, group_id)
			if (ok) {
				this.refreshActors(actor_map)
			}
		},

		lockActors(lock: boolean) {
			this.actor_data_mgr.lockActors(lock)
		},

		// endregion

		// region link

		onLinkClick() {
			const link_actor_list = this.getSelectedActors()
			if (link_actor_list.length < 2) {
				logWarn(LogMessages.NotEnoughActorsToLink())
				return
			}
			this.actors_dialog.showDialog(EActorsDialog.link, undefined, link_actor_list)
		},

		onLinkPreviewClose() {
			this.actors_dialog.closeDialog(EActorsDialog.link)
		},

		async onLinkPreviewSubmit(score: number, remark: string, tag_list: number[]) {
			const actor_ids = this.actors_dialog.selected_actors.map(actor => actor.actor_id)
			const [ok, actor_map] = await linkSameActors(actor_ids, score, remark, tag_list)
			if (ok) {
				logInfo(LogMessages.LinkActors(actor_ids.length))
				this.actors_dialog.closeDialog(EActorsDialog.link)
				this.refreshActors(actor_map)
			}
		},

		async unlinkActors() {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn(LogMessages.NoActorSelected())
				return
			}

			const [ok, actor_map] = await unlinkSameActors(actor_ids)
			if (ok) {
				logInfo(LogMessages.UnlinkActors(actor_ids.length))
				this.refreshActors(actor_map)
			}
		},

		// endregion

		// region download

		showDownloadLimit(actor_ids: number[]) {
			if (this.download_limit == null) {
				this.download_limit = new DownloadLimitForm()
			}
			this.actors_dialog.showDialog(EActorsDialog.download, actor_ids, undefined)
		},

		singleShowDownload(actor_data: ActorElement) {
			this.showDownloadLimit([actor_data.data.actor_id])
		},

		batchShowDownload() {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn(LogMessages.NoActorSelected())
				return
			}
			this.showDownloadLimit(actor_ids)
		},

		async onSubmitDownload() {
			let [ok, _] = await downloadByActorIds(this.download_limit, this.actors_dialog.selected_actor_ids)
			this.onDownloadClose()
			if (ok) {
				await this.fetchTaskCount()
				await this.getDowningFromServer()
				logInfo(LogMessages.TaskStart())
			}
		},

		onDownloadClose() {
			this.actors_dialog.closeDialog(EActorsDialog.download)
		},

		// endregion

		//region folder

		batchShowFolderAdd() {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn(LogMessages.NoActorSelected())
				return
			}
			this.actors_dialog.showDialog(EActorsDialog.folder_add, actor_ids, undefined)
		},
		batchShowFolderRemove() {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn(LogMessages.NoActorSelected())
				return
			}
			this.actors_dialog.showDialog(EActorsDialog.folder_remove, actor_ids, undefined)
		},

		async onFolderAddSubmit(folder_id: number) {
			const [ok, _] = await batchAddActorToFolder(folder_id, this.actors_dialog.selected_actor_ids)
			if (ok) {
				this.updateActors(this.actors_dialog.selected_actor_ids, actor => actor.addToFolder(folder_id))
				this.actors_dialog.closeDialog(EActorsDialog.folder_add)
			}
		},

		async onFolderRemoveSubmit(folder_id: number) {
			const [ok, _] = await batchDelActorFromFolder(folder_id, this.actors_dialog.selected_actor_ids)
			if (ok) {
				this.updateActors(this.actors_dialog.selected_actor_ids, actor => actor.removeFromFolder(folder_id))
				this.actors_dialog.closeDialog(EActorsDialog.folder_remove)
			}
		},

		//endregion

		refreshActors(actor_map: Map<number, ActorData>) {
			this.actor_data_mgr.refreshActors(actor_map)
		},

		updateActors(actor_ids: number[], update: (actor: ActorData) => void) {
			this.actor_data_mgr.updateActors(actor_ids, update)
		},

		refreshActorIds(actor_ids: number[] | undefined = undefined, filter: FilterType = FilterType.Normal) {
			this.filter_type = filter
			this.is_batch_select_all = false

			this.actor_data_mgr.refreshActorIds(actor_ids)

			this.filter_item.label = filter
			this.filter_item.value = `${this.actor_data_mgr.actor_id_count} actors`
		},

		restoreFilter() {
			const last_filter = this.last_filter_condition
			if (last_filter) {
				if (last_filter.desc_list.length == 0) {
					last_filter.desc_list = this.formatFilterItems(last_filter)
				}
				this.editing_filter_condition.copy(last_filter)
			}
		}
	},
	watch: {},
	async mounted() {
		this.restoreFilter()
		this.page_size = this.cached_page_size
		this.page_index = this.cached_page_index

		await this.getTagsFromServer()
		await this.getGroupsFromServer()
		await this.getDowningFromServer()
	}
}

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
	width: 100px;
}
</style>