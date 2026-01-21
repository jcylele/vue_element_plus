<template>
	<el-container>
		<el-main>
			<el-space direction="vertical" fill>
				<NewActorTag @tag_added="refreshTags" />
				<!-- Filter Section -->
				<div class="left-row common-border">
					<el-checkbox v-model="is_filtering" label="Filter Tags" size="large" border />
					<el-form v-if="is_filtering && filter_form" :model="filter_form" label-position="left" inline>
						<el-form-item label="Tag Name">
							<el-input v-model="filter_form.name" clearable style="width: 160px;" />
						</el-form-item>
						<el-form-item label="Score">
							<el-input-number v-model="filter_form.show_min_score" :min="0" :max="SHOW_MAX_SCORE"
								:step="0.1" placeholder="min score" style="width: 120px;" />
							<span style="margin: 0 4px;">~</span>
							<el-input-number v-model="filter_form.show_max_score" :min="0" :max="SHOW_MAX_SCORE"
								:step="0.1" placeholder="max score" style="width: 120px;" />
						</el-form-item>
						<el-form-item label="Used Count">
							<el-input-number v-model="filter_form.minUsedCount" :min="0" :step="1"
								placeholder="min used count" style="width: 150px;" />
							<span style="margin: 0 4px;">~</span>
							<el-input-number v-model="filter_form.maxUsedCount" :min="0" :step="1"
								placeholder="max used count" style="width: 150px;" />
						</el-form-item>
					</el-form>
				</div>
				<el-text style="font-size: 24px;font-style: oblique">
					<span v-if="is_filtering">is filtering, drag disabled</span>
					<span v-else>Drag Elements Below To Set Tags Priorities</span>
				</el-text>
				<el-space direction="horizontal" v-if="changed">
					<el-button type="primary" size="default" @click="onSubmitPriority">
						Save
					</el-button>
					<el-button type="warning" size="default" @click="onCancel">
						Reset
					</el-button>
				</el-space>
				<el-space direction="vertical" fill>
					<!-- 筛选模式：只读显示，禁用拖动 -->
					<template v-if="is_filtering">
						<el-space direction="horizontal" v-for="(tag_group, index) in displayed_tags" class="tag_row"
							:style="{ 'border-color': getTagBgColor(index) }" alignment="stretch" wrap>
							<div class="tag_row left-row wrap" style="cursor: not-allowed;">
								<ActorTagEditor v-for="tag_info in tag_group" :tag_edit_info="tag_info"
									:key="tag_info.data.tag_id" @delete="onDeleteActorTag" class="card_item"
									:style="{ 'border-color': getTagBgColor(index) }" />
							</div>
						</el-space>
					</template>
					<!-- 正常模式：可拖动 -->
					<template v-else>
						<el-space direction="horizontal" v-for="(tag_group, index) in editing_tags" class="tag_row"
							:style="{ 'border-color': getTagBgColor(index) }" alignment="stretch" wrap>
							<draggable :list="tag_group" :group="{ name: 'tags', pull: true, put: true }"
								@change="onTagItemMoved" class="tag_row left-row wrap">
								<ActorTagEditor v-for="tag_info in tag_group" :tag_edit_info="tag_info"
									:key="tag_info.data.tag_id" @delete="onDeleteActorTag" class="card_item"
									:style="{ 'border-color': getTagBgColor(index) }" />
							</draggable>
						</el-space>
					</template>
				</el-space>
			</el-space>
		</el-main>
	</el-container>
</template>

<script setup lang="ts">
// imports
import { onMounted, ref, computed, watch } from "vue";
import NewActorTag from "./NewActorTag.vue";
import ActorTagEditor from "./ActorTagEditor.vue"
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorTagData, EditingTagData } from "../data/ActorTagData";
import { VueDraggableNext as draggable } from "vue-draggable-next";
import { updatePriorities } from "../ctrls/ActorTagCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { SHOW_MAX_SCORE, Tag_Colors } from "../data/Consts";
import { CommonPriority } from "../data/WebData";
import { LogMessages } from "../data/Messages";
import { ActorTagFilter } from "../data/ActorTagFilter";

// emits
// stores/routers
const actorTagStore = ActorTagStore()
// props/models
// variables
const editing_tags = ref<EditingTagData[][]>([])
const changed = ref(false)
const filter_form = ref<ActorTagFilter | undefined>(undefined)
const is_filtering = ref(false)
// computed

// 筛选后的标签
const displayed_tags = computed(() => {
	if (!is_filtering.value) {
		return editing_tags.value
	}

	const filtered: EditingTagData[][] = []
	for (let i = 0; i < editing_tags.value.length; i++) {
		const group = editing_tags.value[i].filter(tagInfo => filterTag(tagInfo.data))
		if (group.length > 0) {
			filtered.push(group)
		}
	}

	return filtered
})

// watch
watch(() => is_filtering.value, async (new_val) => {
	initTags()
	changed.value = false
	if (new_val) {
		filter_form.value = actorTagStore.getDefaultFilter()
	}
})

// methods

function filterTag(tag: ActorTagData): boolean {
	if (!filter_form.value) {
		return true
	}
	if (filter_form.value.name && !tag.tag_name.includes(filter_form.value.name)) {
		return false
	}
	if (tag.avg_score < filter_form.value.minScore || tag.avg_score > filter_form.value.maxScore) {
		return false
	}
	if (tag.used_count < filter_form.value.minUsedCount || tag.used_count > filter_form.value.maxUsedCount) {
		return false
	}
	return true
}

function getTagBgColor(index: number): string {
	return Tag_Colors[index]
}

function onTagItemMoved(evt) {
	changed.value = true
}

function onDeleteActorTag(tag_id: number) {
	for (const group of editing_tags.value) {
		for (let i = 0; i < group.length; i++) {
			if (group[i].data.tag_id == tag_id) {
				group.splice(i, 1)
				return
			}
		}
	}
}
async function onSubmitPriority() {
	let changed_priorities: CommonPriority[] = []
	for (let i = 0; i < 10; i++) {
		const group = editing_tags.value[i]
		for (let j = 0; j < group.length; j++) {
			const tag = group[j].data
			const new_tag_priority = i * 100 + j + 1
			if (tag.tag_priority != new_tag_priority) {
				changed_priorities.push(new CommonPriority(tag.tag_id, new_tag_priority))
			}
		}
	}

	if (changed_priorities.length == 0) {
		changed.value = false
		return
	}

	let [ok, _] = await updatePriorities(changed_priorities)
	if (ok) {
		logInfo(LogMessages.TagPrioritiesSaved())
		changed.value = false
	}
}
async function onCancel() {
	await refreshTags()
	changed.value = false
}
function initTags() {
	editing_tags.value = []
	for (let i = 0; i < 10; i++) {
		editing_tags.value.push([])
	}
	for (const tag of actorTagStore.sorted_list) {
		const group_id = Math.floor(tag.tag_priority / 100)
		let tagEditInfo = new EditingTagData(tag)
		editing_tags.value[group_id].push(tagEditInfo)
	}
	// editing_tags.value.reverse()
}
async function refreshTags() {
	await actorTagStore.getFromServer()
	initTags()
	filter_form.value = actorTagStore.getDefaultFilter()
}

// lifecycle
onMounted(async () => {
	await refreshTags()
})
</script>

<style scoped>
.card_item {
	display: table-cell;
	border: 1px solid;
	border-radius: 4px;
	margin: 2px;
}

.tag_row {
	border: 1px solid;
	border-radius: 4px;
	padding: 2px
}

.tag_row {
	min-height: 25px;
	min-width: 100px;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>