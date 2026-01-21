<template>
	<div class="left-row top">
		<!-- show rows -->
		<div class="fill-column">
			<el-select v-model="show_rows" @change="onShowRowsChange" style="width: 150px;" multiple clearable>
				<el-option v-for="(name, index) in Filter_Row_Names" :key="index" :label="name" :value="index" />
				<template #tag>
					<el-tag v-if="show_rows.length > 0" effect="plain" type="primary">
						{{ show_rows.length }} rows
					</el-tag>
				</template>
			</el-select>
			<el-checkbox v-for="row in show_rows" :key="row" :label="Filter_Row_Names[row]" @change="hideRow(row)"
				checked border />
		</div>
		<!-- filter form -->
		<div class="fill-column" style="padding: 5px">
			<el-form :model="filter_condition" label-width="auto" label-position="right" class="filter-form">
				<!--  group -->
				<el-form-item label="Group" v-if="filter_condition.show_group">
					<el-checkbox-group v-model="filter_condition.group_id_list" @change="onAnyConditionChange"
						size="default">
						<el-checkbox-button v-for="group in actorGroupStore.sorted_list" :value="group.group_id">
							{{ group.group_name }}<br>{{ getActorCountInGroup(group.group_id) }}
						</el-checkbox-button>
					</el-checkbox-group>

					<el-switch v-model="is_group_all" @change="onGroupAllChange" size="large" active-text="All"
						inactive-text="None" style="padding: 0 10px" width="80px" inline-prompt />

				</el-form-item>

				<!--  name -->
				<el-form-item label="Name" v-if="filter_condition.show_name">
					<el-input v-model="filter_condition.name" @change="onAnyConditionChange" class="filter-item"
						clearable />

				</el-form-item>

				<!-- folder -->
				<el-form-item label="Folder" v-if="filter_condition.show_folder">
					<el-switch v-model="filter_condition.in_folder" @change="onAnyConditionChange" active-text="In"
						inactive-text="Not" size="large" />
					<el-select v-model="filter_condition.real_folder_id" @change="onAnyConditionChange"
						class="filter-item">
						<el-option label="None" :value="0" />
						<el-option v-for="folder in favFolderStore.sorted_list" :label="folder.folder_name"
							:value="folder.folder_id">
							<span>{{ folder.folder_name }} ({{ getActorCountInFolder(folder.folder_id) }})</span>
						</el-option>
					</el-select>
				</el-form-item>

				<!-- Fix -->
				<el-form-item label="Fix" v-if="filter_condition.show_fix">
					<div class="left-column">
						<div class="left-row" v-for="fix_option_list in Fix_Options">
							<el-tooltip v-for="fix_option in fix_option_list" :content="fix_option.tooltip"
								placement="top" effect="dark" show-after="200">
								<el-checkbox :model-value="getFixChecked(fix_option.value)"
									@update:model-value="(val) => setFixChecked(fix_option.value, val)"
									:key="fix_option.value" :label="fix_option.label" size="large"
									style="width: 240px;" border />
							</el-tooltip>
						</div>
					</div>
				</el-form-item>

				<!-- link -->
				<el-form-item label="Link" v-if="filter_condition.show_link">
					<el-select v-model="filter_condition.link_filter.linked" @change="onAnyConditionChange"
						class="filter-item">
						<el-option v-for="option in Link_Options" :label="option.label" :value="option.value" />
					</el-select>
					<div v-if="is_linked" class="small-border split-row filter-item" style="gap:0;">
						<span>
							Count >=
						</span>
						<el-input-number v-model="filter_condition.link_filter.min_link_count"
							@change="onAnyConditionChange" style="width: 100px;" />
					</div>
					<div v-if="is_linked" class="small-border split-row filter-item" style="gap:0;">
						<span>
							Contains
						</span>
						<el-select v-model="filter_condition.link_filter.contain_group_id"
							@change="onAnyConditionChange" placeholder="Contains group">
							<el-option label="None" :value="0" />
							<el-option v-for="group in actorGroupStore.sorted_list" :label="group.group_name"
								:value="group.group_id" />
						</el-select>
					</div>
				</el-form-item>

				<!-- remark -->
				<el-form-item label="Remark" v-if="filter_condition.show_remark">
					<el-select v-model="filter_condition.has_remark" @change="onRemarkTypeChange" class="filter-item">
						<el-option v-for="option in Remark_Options" :label="option.label" :value="option.value" />
					</el-select>
					<el-input v-if="has_remark" v-model="filter_condition.remark_str" @change="onAnyConditionChange"
						placeholder="search in remark" class="filter-item" clearable />
				</el-form-item>

				<!-- comment -->
				<el-form-item label="Comment" v-if="filter_condition.show_comment">
					<el-select v-model="filter_condition.has_comment" @change="onCommentTypeChange" class="filter-item">
						<el-option v-for="option in Comment_Options" :label="option.label" :value="option.value" />
					</el-select>
					<el-select v-if="has_comment" v-model="filter_condition.comment_str" @change="onAnyConditionChange"
						placement="bottom-end" class="filter-item">
						<el-option v-for="comment in common_comments" :key="comment.comment" :label="comment.comment"
							:value="comment.comment">
							<span style="float: left">{{ comment.count > 1 ? `${comment.comment} (${comment.count})` :
								comment.comment }}</span>
						</el-option>
					</el-select>
				</el-form-item>

				<!-- progress -->
				<el-form-item label="Progress" v-if="filter_condition.show_progress">
					<el-select v-model="filter_condition.post_completed" placeholder="Post"
						@change="onAnyConditionChange" class="filter-item">
						<el-option v-for="option in Post_Completed_Options" :label="option.label"
							:value="option.value" />
					</el-select>
					<el-select v-if="filter_condition.is_post_completed" placeholder="Res"
						v-model="filter_condition.res_completed" @change="onAnyConditionChange" class="filter-item">
						<el-option v-for="option in Res_Completed_Options" :label="option.label"
							:value="option.value" />
					</el-select>
				</el-form-item>

				<!-- score -->
				<el-form-item label="Star" v-if="filter_condition.show_score">
					<MyRate v-model="filter_condition.show_min_score" @change="onAnyConditionChange" />
					<el-text>~</el-text>
					<MyRate v-model="filter_condition.show_max_score" @change="onAnyConditionChange" />
				</el-form-item>

				<!--  tags -->
				<el-form-item label="Tags" v-if="filter_condition.show_tag">
					<ActorTagFilter :tag_filter="filter_condition.tag_filter" @change="onAnyConditionChange" />
				</el-form-item>

				<!-- Sort -->
				<el-form-item label="Sort">
					<div v-for="(sort_item, index) in filter_condition.sort_items" class="sort_item">
						<el-select v-model="sort_item.show_sort_type" style="width: 170px">
							<template #header>
								<el-button size="small" type="primary" @click="filter_condition.removeSortItem(index)"
									plain>
									Remove
								</el-button>
							</template>
							<template #label>
								<span>{{ sort_item.sort_option.full_label }}</span>
							</template>
							<el-option-group v-for="group in Sort_Groups" :key="group.label" :label="group.label">
								<el-option v-for="item in group.options" :key="item.value" :label="item.label"
									:value="item.value" />
							</el-option-group>
						</el-select>
						<svg-icon :name="sort_item.icon" size="30px" @click="sort_item.switch()" />
					</div>
					<el-button style="font-size: 28px" @click="filter_condition.addSortItem()" plain>
						+
					</el-button>
				</el-form-item>
			</el-form>
			<!-- buttons -->
			<div class="center-row">
				<el-button :type="cond_changed ? 'warning' : 'primary'" size="large" class="filter-button"
					@click="onFilterSubmit">
					Search
				</el-button>
				<el-button type="warning" size="large" class="filter-button" @click="onFilterCancel">
					Reset
				</el-button>
				<el-popover v-if="actorFilterStore.has_history" trigger="click" placement="bottom-end"
					:popper-style="Popper_Styles.Default">
					<template #reference>
						<el-button type="success" size="large" class="filter-button" plain>
							Previous
						</el-button>
					</template>

					<template #default>
						<div class="fill-column">
							<div v-for="filter in actorFilterStore.filter_history" :key="filter.uuid" class="split-row"
								style="gap: 10px;">
								<div class="left-row wrap common-border group-selectable" style="width: 400px;"
									@click.stop="selectFilterInHistory(filter.uuid)">
									<ActorFilterItem :item="desc" v-for="desc in filter.desc_list" />
								</div>
								<svg-icon name="remove" size="36px" @click.stop="removeFilterHistory(filter.uuid)" />
							</div>
						</div>
					</template>
				</el-popover>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref, watch } from "vue";
import SvgIcon from "./SvgIcon/index.vue";
import { BoolEnum, EFilterRow, EFixFilter } from "../data/Enums";
import { Comment_Options, Link_Options, Popper_Styles, Post_Completed_Options, Remark_Options, Res_Completed_Options, Sort_Groups, Filter_Row_Names, Fix_Options } from "../data/Consts";
import { ICommentCount } from "../data/SchemasOthers";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { FavFolderStore } from "../store/FavFolderStore";
import MyRate from "./MyRate.vue";
import ActorTagFilter from "./ActorTagFilter.vue";
import ActorFilterItem from "./ActorFilterItem.vue";
import { getActorCountInFolders, getActorCountInGroups, getComments } from "../ctrls/ActorCtrl";

// emits
const emit = defineEmits(['submit'])
// stores/routers
const actorTagStore = ActorTagStore()
const actorGroupStore = ActorGroupStore()
const favFolderStore = FavFolderStore()
const actorFilterStore = ActorFilterStore()
// props/models
const props = defineProps({
	filter_condition: {
		type: ActorFilterData,
		required: true
	}
})
// variables
const cond_changed = ref(false)
const is_group_all = ref(false)
const group_count_map = ref<Record<number, number>>({})
const folder_count_map = ref<Record<number, number>>({})
const show_rows = ref<number[]>([])
const common_comments = ref<ICommentCount[]>([])
// computed
const has_remark = computed(() => props.filter_condition.has_remark == BoolEnum.TRUE)
const has_comment = computed(() => props.filter_condition.has_comment == BoolEnum.TRUE)
const is_linked = computed(() => props.filter_condition.link_filter.linked == BoolEnum.TRUE)
// watch
watch(
	() => props.filter_condition,
	async (new_val) => {
		await restoreShowRows()
	}
)
// methods
function onGroupAllChange() {
	if (is_group_all.value) {
		props.filter_condition.setAllGroupList(actorGroupStore.sorted_list.map(group => group.group_id))
	}
	props.filter_condition.checkAllGroup(is_group_all.value)
}

async function onRemarkTypeChange(val: BoolEnum) {
	if (val !== BoolEnum.TRUE) {
		props.filter_condition.remark_str = ""
	}
	onAnyConditionChange()
}

async function onCommentTypeChange(val: BoolEnum) {
	if (val === BoolEnum.TRUE) {
		await refreshCommonComments()
	} else {
		props.filter_condition.comment_str = ""
	}
	onAnyConditionChange()
}

async function refreshCommonComments() {
	const [ok, comments] = await getComments()
	if (ok) {
		common_comments.value = comments
	}
}

async function restoreShowRows() {
	// it's sorted already
	show_rows.value = props.filter_condition.getShowRows()
	for (const row of show_rows.value) {
		await onRowShow(row)
	}
}

async function selectFilterInHistory(uuid: number) {
	const filter = actorFilterStore.selectFilter(uuid)
	if (filter) {
		props.filter_condition.copy(filter)
		await restoreShowRows()
	}
}

function removeFilterHistory(uuid: number) {
	actorFilterStore.removeFilter(uuid)
}

function hideRow(row: number) {
	const index = show_rows.value.indexOf(row)
	if (index != -1) {
		show_rows.value.splice(index, 1)
		props.filter_condition.onRowsChange(show_rows.value)
	}
}

async function onShowRowsChange(new_rows: number[]) {
	const old_rows = props.filter_condition.getShowRows()
	const added_rows = new_rows.filter(row => !old_rows.includes(row))

	show_rows.value = new_rows
	show_rows.value.sort((a, b) => a - b)
	props.filter_condition.onRowsChange(show_rows.value)

	for (const row of added_rows) {
		await onRowShow(row)
	}
}

/**
 * extra actions when a row shows
 */
async function onRowShow(row: number) {
	switch (row) {
		case EFilterRow.Group:
			await refreshGroupCount()
			break
		case EFilterRow.Folder:
			await refreshFolderCount()
			break
		default:
			break
	}
}

function onAnyConditionChange() {
	cond_changed.value = true
}
async function onFilterSubmit() {
	cond_changed.value = false
	emit('submit')
}
function onFilterCancel() {
	props.filter_condition.reset()
	cond_changed.value = true
}

function getFixChecked(fix_type: EFixFilter): boolean {
	return props.filter_condition.getFixFlag(fix_type)
}

function setFixChecked(fix_type: EFixFilter, val: boolean) {
	props.filter_condition.setFixFlag(fix_type, val)
	onAnyConditionChange()
}

function getActorCountInGroup(group_id: number): number {
	return group_count_map.value[group_id] || 0
}

function getActorCountInFolder(folder_id: number): number {
	return folder_count_map.value[folder_id] || 0
}

async function refreshGroupCount() {
	const [ok, gc_map] = await getActorCountInGroups()
	if (ok) {
		group_count_map.value = gc_map as Record<number, number>
	}
}

async function refreshFolderCount() {
	const [ok, fc_map] = await getActorCountInFolders()
	if (ok) {
		folder_count_map.value = fc_map as Record<number, number>
	}
}
// lifecycle
onMounted(async () => {
	await restoreShowRows()
})

// 重要！必须要把父组件想调用的方法暴露出去
defineExpose({
	refreshGroupCount,
	// 如果还有其他方法父组件要用，也加在这里
})
</script>

<style scoped>
.sort_item {
	display: flex;
	flex-direction: row;
	margin-right: 10px;
	border-style: solid;
	border-width: 1px;
	border-radius: 5px;
	border-color: var(--el-border-color);
}

/** some common styles for filter items */
.filter-item {
	width: 200px;
	font-size: 24px;
	margin-right: 0;
}

.filter-button {
	width: 110px;
}
</style>