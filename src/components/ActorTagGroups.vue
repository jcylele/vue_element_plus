<template>
	<el-space direction="vertical" alignment="start" fill>
		<el-space direction="horizontal" alignment="start">
			<el-button type="primary" @click="toAddGroup">Add New Group</el-button>
		</el-space>
		<div v-for="group in actor_tag_group_store.sorted_list" class="common-group-item">
			<div class="split-row underlined">
				<span class="common-group-name">
					{{ group.group_name }}
				</span>
				<div class="center-row">
					<svg-icon name="edit" size="24px" @click.stop="toEditGroup(group)" />
					<svg-icon name="top" size="24px" @click.stop="moveGroup(group.group_id, true)" />
					<svg-icon name="bottom" size="24px" @click.stop="moveGroup(group.group_id, false)" />
				</div>
			</div>
			<p class="common-group-desc">
				{{ group.group_desc }}
			</p>
			<el-space direction="horizontal" size="large" alignment="center" wrap>
				<el-tag v-for="tag_id in group.tag_ids" :key="tag_id" :style="actor_tag_store.getStyle(tag_id)" round
					size="large" @close="delTagFromGroup(group.group_id, tag_id)" closable>
					{{ actor_tag_store.getName(tag_id) }}
				</el-tag>
				<el-tag v-if="to_add_group_id != group.group_id" size="large" effect="plain" type="success"
					@click="toAddTag(group.group_id)" round>+</el-tag>
				<el-select v-else filterable placeholder="Add Tag" @change="addTagToGroup" style="width: 120px;">
					<el-option v-for="tag in actor_tag_store.sorted_list" :key="tag.tag_id" :label="tag.tag_name"
						:value="tag.tag_id" :disabled="tag.tag_group_id != 0" />
				</el-select>
			</el-space>
		</div>
	</el-space>
	<el-dialog v-model="is_editing" title="Add/Edit Folder" width="720px">
		<el-form label-width="100px">
			<el-form-item label="Name">
				<el-input v-model="edit_group.group_name" maxlength="30" show-word-limit />
			</el-form-item>
			<el-form-item label="Desc">
				<el-input v-model="edit_group.group_desc" type="textarea" maxlength="100" show-word-limit />
			</el-form-item>
			<el-form-item>
				<div class="split-row" style="padding: 10px">
					<el-space direction="horizontal" size="large" alignment="center">
						<el-button type="primary" @click="saveGroup">Save</el-button>
						<el-button type="warning" @click="stopEdit">Cancel</el-button>
					</el-space>
					<el-button type="danger" @click="delGroup">Delete</el-button>
				</div>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>

<script setup lang="ts">
// imports
import { onMounted, Ref, ref } from "vue";
import { ActorTagGroupStore } from "../store/ActorTagGroupStore";
import { ActorTagGroupData } from "../data/ActorTagGroupData";
import { updateActorTagGroup, addActorTagGroup, delActorTagGroup, addActorTagToGroup, delActorTagFromGroup, updatePriorities } from "../ctrls/ActorTagGroupCtrl";
import { ActorTagStore } from "../store/ActorTagStore";
import { logInfo } from "../ctrls/FetchCtrl";
import { swapGroup } from "../ctrls/BaseGroupCtrl";
// emits
// stores/routers
const actor_tag_group_store = ActorTagGroupStore()
const actor_tag_store = ActorTagStore()
// props/models
// variables
const edit_group = ref(new ActorTagGroupData()) as Ref<ActorTagGroupData>
const is_editing = ref(false)
const to_add_group_id = ref(0)
// computed
// watch
// methods

async function saveGroup() {
	if (edit_group.value.group_id != 0) {
		const [ok, group] = await updateActorTagGroup(edit_group.value)
		if (ok) {
			// set tag_ids in group again
			group.tag_ids = actor_tag_store.getTagIdsInGroup(group.group_id)
			actor_tag_group_store.update(group)
			stopEdit()
		}
	} else {
		const [ok, group] = await addActorTagGroup(edit_group.value)
		if (ok) {
			actor_tag_group_store.add(group)
			stopEdit()
		}
	}
}

async function delGroup() {
	const [ok, _] = await delActorTagGroup(edit_group.value.group_id)
	if (ok) {
		actor_tag_group_store.remove(edit_group.value.group_id)
		stopEdit()
	}
}

function stopEdit() {
	is_editing.value = false
}

function toAddGroup() {
	edit_group.value.copy()
	is_editing.value = true
}

function toEditGroup(group: ActorTagGroupData) {
	edit_group.value.copy(group)
	is_editing.value = true
}

async function moveGroup(group_id: number, up: boolean) {
	const group_list = actor_tag_group_store.sorted_list
	const priorities = swapGroup(group_list, group_id, up)
	if (priorities) {
		const [ok, succeed] = await updatePriorities(priorities)
		if (ok && succeed) {
			actor_tag_group_store.updatePriorities(priorities)
		} else {
			actor_tag_group_store.dirty()
		}
	}
}

async function addTagToGroup(tag_id: number) {
	const [ok, succeed] = await addActorTagToGroup(to_add_group_id.value, tag_id)
	if (ok && succeed) {
		const tag = actor_tag_store.get(tag_id)
		const group = actor_tag_group_store.get(to_add_group_id.value)
		tag.tag_group_id = to_add_group_id.value
		group.tag_ids = actor_tag_store.getTagIdsInGroup(group.group_id)
		to_add_group_id.value = 0
		logInfo(`Added tag ${tag.tag_name} to group ${group.group_name} succeed`)
	}
}

async function delTagFromGroup(group_id: number, tag_id: number) {
	const [ok, succeed] = await delActorTagFromGroup(group_id, tag_id)
	if (ok && succeed) {
		const tag = actor_tag_store.get(tag_id)
		const group = actor_tag_group_store.get(group_id)
		tag.tag_group_id = 0
		group.tag_ids = actor_tag_store.getTagIdsInGroup(group_id)
		logInfo(`Removed tag ${tag.tag_name} from group ${group.group_name} succeed`)
	}
}

function toAddTag(group_id: number) {
	to_add_group_id.value = group_id
}

async function initGroups() {
	await actor_tag_group_store.getFromServer()
	await actor_tag_store.getFromServer()
	actor_tag_group_store.sorted_list.forEach(group => {
		group.tag_ids = actor_tag_store.getTagIdsInGroup(group.group_id)
	})
}

// lifecycle

onMounted(async () => {
	await initGroups()
})
</script>

<style scoped></style>