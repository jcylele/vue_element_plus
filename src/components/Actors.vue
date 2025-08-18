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
						Filter Actors
					</el-button>
				</template>

				<template #default>
					<el-space direction="vertical" size="default" fill>
						<el-button :disabled="!has_downing_actors" type="primary" size="large" @click="onDowningClick">
							Downloading
						</el-button>
					</el-space>
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
			<ActorCard v-for="actor_data in locked_actor_list" :actor_data="actor_data" :show_select="is_show_batch_op"
				:key="actor_data.uuid" :locked="true" @refresh="onActorChange" @friend="onActorFriendClick"
				@download="singleShowDownload" @update="refreshActors" />
			<ActorCard v-for="actor_data in actor_list" :actor_data="actor_data" :show_select="is_show_batch_op"
				:key="actor_data.uuid" :locked="false" @refresh="onActorChange" @friend="onActorFriendClick"
				@download="singleShowDownload" @update="refreshActors" />
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
</template>

<script lang="ts">
import { ActorFilterData } from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import { ActorElement } from "../data/ArrayElement";
import {
	batchChangeActorGroup, getActor,
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
import { MAX_SCORE } from "../data/Consts";
import { BoolEnum, ECardRefresh } from "../data/Enums";
import { FavFolderStore } from "../store/FavFolderStore";
import { ActorsDialog, EActorsDialog } from "../data/ActorsDialog";
import FavFolderSelector from "./FavFolderSelector.vue";
import { batchAddActorToFolder, batchDelActorFromFolder } from "../ctrls/FolderCtrl";

enum FilterType {
	Normal = "Normal",
	Link = "Linked",
	Download = "Downloading"
}

export default {
	components: { ActorLinkPreview, SvgIcon, ActorCard, ActorFilter, DownloadLimit, ActorFilterItem, FavFolderSelector },
	data() {
		return {
			actorFilterRef: undefined,
			editing_filter_condition: new ActorFilterData(),
			page_filter_condition: new ActorFilterData(),
			filter_type: FilterType.Normal,
			filter_item: new FilterItem("", ""),
			locked_actor_list: [] as ActorElement[],
			actor_list: [] as ActorElement[],
			actor_ids: [] as number[],
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

		formatFilterItems(page_filter: ActorFilterData): FilterItem[] {
			const desc_list: FilterItem[] = []
			// group
			if (page_filter.group_id_list.length > 0 && page_filter.group_id_list.length < this.group_count) {
				const group_name_list = page_filter.group_id_list.map(group_id => this.getGroupName(group_id))
				desc_list.push(new FilterItem("Group", group_name_list.join(", ")))
			}

			// tag
			const tag_item = page_filter.tag_filter.getTagItem(this.getTagName)
			if (tag_item) {
				desc_list.push(tag_item)
			}

			// score
			if (page_filter.min_score > 0 && page_filter.max_score < MAX_SCORE) {
				desc_list.push(new FilterItem("Score", `${page_filter.min_score} - ${page_filter.max_score}`))
			} else if (page_filter.min_score > 0) {
				desc_list.push(new FilterItem("score", `>= ${page_filter.min_score}`))
			} else if (page_filter.max_score < MAX_SCORE) {
				desc_list.push(new FilterItem("Score", `<= ${page_filter.max_score}`))
			}

			// name
			if (page_filter.name.length > 0) {
				desc_list.push(new FilterItem("Name", page_filter.name))
			}

			// linked
			if (page_filter.linked) {
				desc_list.push(new FilterItem("Linked", "Yes"))
			}

			// remark
			switch (page_filter.has_remark) {
				case BoolEnum.TRUE:
					desc_list.push(new FilterItem("Remark", page_filter.remark_str))
					break
				case BoolEnum.FALSE:
					desc_list.push(new FilterItem("Remark", "X"))
					break
			}

			// folder
			if (page_filter.folder_id > 0) {
				desc_list.push(new FilterItem("Folder", this.getFolderName(page_filter.folder_id)))
			}

			if (desc_list.length == 0) {
				desc_list.push(new FilterItem("All", "actors"))
			}

			// progress
			switch (page_filter.post_completed) {
				case BoolEnum.TRUE:
					desc_list.push(new FilterItem("Post", "Completed"))
					switch (page_filter.res_completed) {
						case BoolEnum.TRUE:
							desc_list.push(new FilterItem("Res", "Completed"))
							break
						case BoolEnum.FALSE:
							desc_list.push(new FilterItem("Res", "Not Completed"))
					}
					break
				case BoolEnum.FALSE:
					desc_list.push(new FilterItem("Post", "Not Completed"))
					break
			}

			return desc_list
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
				this.refreshActorIds();
				this.actor_count = 0
			}
			const [ok, actor_count] = await getActorCount(this.page_filter_condition)
			if (ok) {
				this.actor_count = actor_count
				this.refreshPageIndex()
				await this.onActorPageChange()
			}
		},
		refreshPageIndex() {
			let max_page_count = Math.ceil(this.actor_count / this.page_size)
			this.page_index = this.cached_page_index
			if (this.page_index > max_page_count) {
				this.page_index = max_page_count
			}
			if (this.page_index < 1) {
				this.page_index = 1
			}
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

		async onDowningClick() {
			await this.getDowningFromServer()
			this.refreshActorIds(this.downing_actor_ids, FilterType.Download)
		},

		// region batch, select, lock

		_getSelected(converter: Function) {
			let result_list: any[] = []
			for (const actor of this.locked_actor_list) {
				if (actor.selected) {
					result_list.push(converter(actor))
				}
			}
			for (const actor of this.actor_list) {
				if (actor.selected) {
					result_list.push(converter(actor))
				}
			}
			return result_list
		},
		getSelectedActors() {
			return this._getSelected(actor => actor.data)
		},
		getSelectedActorIds() {
			return this._getSelected(actor => actor.data.actor_id)
		},
		onBatchOpChange(val: boolean) {
			if (!val) {
				this.is_batch_select_all = false
				this.batchSelectAll(false)
			}
		},
		batchSelectAll(val: boolean) {
			for (const actor of this.locked_actor_list) {
				actor.selected = val
			}
			for (const actor of this.actor_list) {
				actor.selected = val
			}
		},

		async batchSetGroup(group_id: number) {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn("No actor to set group")
				return
			}
			let [ok, actor_map] = await batchChangeActorGroup(actor_ids, group_id)
			if (ok) {
				this.refreshActors(actor_map)
			}
		},

		lockActors(lock: boolean) {
			let locked_actor_list: ActorElement[] = []
			let actor_list: ActorElement[] = []
			if (lock) {
				locked_actor_list = [...this.locked_actor_list]
				for (const actor of this.actor_list) {
					if (actor.selected) {
						locked_actor_list.push(actor)
					} else {
						actor_list.push(actor)
					}
				}
			} else {
				for (const actor of this.locked_actor_list) {
					if (actor.selected) {
						actor_list.push(actor)
					} else {
						locked_actor_list.push(actor)
					}
				}
				actor_list.push(...this.actor_list)
			}

			this.locked_actor_list = locked_actor_list
			this.actor_list = actor_list
			this.batchSelectAll(false)
		},

		// endregion

		// region link

		onLinkClick() {
			const link_actor_list = this.getSelectedActors()
			if (link_actor_list.length < 2) {
				logWarn("Not enough actors to link")
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
				this.actors_dialog.closeDialog(EActorsDialog.link)
				this.refreshActors(actor_map)
			}
		},

		async unlinkActors() {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn("No actor to unlink")
				return
			}

			const [ok, actor_map] = await unlinkSameActors(actor_ids)
			if (ok) {
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
				logWarn("No actor to download")
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
				logInfo("download started")
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
				logWarn("No actor to add to folder")
				return
			}
			this.actors_dialog.showDialog(EActorsDialog.folder_add, actor_ids, undefined)
		},
		batchShowFolderRemove() {
			let actor_ids = this.getSelectedActorIds()
			if (actor_ids.length == 0) {
				logWarn("No actor to remove from folder")
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

		innerRefreshActors(ar_map: Map<number, ActorData>, actor_list: ActorElement[]) {
			for (const actor_data of actor_list) {
				const new_actor = ar_map.get(actor_data.data.actor_id)
				if (new_actor) {
					actor_data.data = new_actor
				}
			}
		},

		refreshActors(actor_map: Map<number, ActorData>) {
			this.innerRefreshActors(actor_map, this.locked_actor_list)
			this.innerRefreshActors(actor_map, this.actor_list)
			this.batchSelectAll(false)
		},

		innerUpdateActors(actor_id_set: Set<number>, actor_list: ActorElement[], update: (actor: ActorData) => void) {
			for (const actor of actor_list) {
				if (actor_id_set.has(actor.data.actor_id)) {
					update(actor.data)
				}
			}
		},

		updateActors(actor_ids: number[], update: (actor: ActorData) => void) {
			const actor_id_set = new Set(actor_ids)
			this.innerUpdateActors(actor_id_set, this.locked_actor_list, update)
			this.innerUpdateActors(actor_id_set, this.actor_list, update)
			this.batchSelectAll(false)
		},

		refreshActorIds(actor_ids: number[] | undefined = undefined, filter: FilterType = FilterType.Normal) {
			this.filter_type = filter
			this.is_batch_select_all = false

			if (actor_ids == undefined) {
				this.actor_list = []
				this.actor_ids = []
			} else {
				this.actor_list = []
				this.actor_ids = actor_ids
				this.asyncFetchActors()
			}

			this.filter_item.label = filter
			this.filter_item.value = `${this.actor_ids.length} actors`
		},

		async asyncFetchActors() {
			for (let i = 0; i < this.actor_ids.length; i++) {
				let actor_id = this.actor_ids[i]
				const [ok, actor] = await getActor(actor_id)
				if (ok) {
					// check if outdated
					if (this.actor_ids[i] != actor_id
						|| this.actor_list.length != i) {
						return
					}
					this.actor_list.push(new ActorElement(actor))
					// wait a moment
					await new Promise(resolve => {
						setTimeout(resolve, 100)
					})
				} else {
					return
				}
			}
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