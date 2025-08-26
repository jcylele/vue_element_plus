<template>
	<el-space direction="vertical" fill>
		<el-space direction="horizontal" alignment="start">
			<el-button type="primary" @click="toAddGroup">Add New Group</el-button>
		</el-space>
		<div v-for="group in actor_group_store.sorted_list" class="common-group-item">
			<div class="split-row underlined">
				<div class="center-row">
					<span class="common-group-name" :style="{ color: group.group_color }">
						{{ group.group_name }}
					</span>
					<svg-icon v-if="group.has_folder" name="file_checked" size="24px" class="is-disabled" />
				</div>
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
				<svg-icon size="24px" name="edit" @click="startEditCondition(group)" />
				<el-tag v-for="cond in group.cond_list" type="info" effect="plain">
					{{ cond.desc }}
				</el-tag>
			</el-space>
		</div>
	</el-space>
	<el-dialog v-model="is_editing" title="Add/Edit Folder" style="min-width: 600px;">
		<el-form label-width="auto">
			<el-form-item label="Name">
				<el-input v-model="edit_group.group_name" />
			</el-form-item>
			<el-form-item label="Desc">
				<el-input v-model="edit_group.group_desc" />
			</el-form-item>
			<el-form-item label="Folder">
				<el-switch v-model="edit_group.has_folder" size="large" active-text="has" inactive-text="no" />
			</el-form-item>
			<el-form-item label="Color">
				<el-color-picker v-model="edit_group.group_color" />
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
	<el-dialog v-model="is_show_condition" :title="cond_title" @close="onCancelCondition">
		<GroupCondEditor :group="cond_actor_group" @submit="onSubmitCondition" @cancel="onCancelCondition" />
	</el-dialog>
</template>

<script lang="ts" setup>
// imports
import { ActorGroupStore } from "../store/ActorGroupStore";
import ActorGroupData from "../data/ActorGroupData";
import { addActorGroup, delActorGroup, setGroupCondition, updateActorGroup, updatePriorities } from "../ctrls/ActorGroupCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import GroupCondEditor from "./GroupCondEditor.vue";
import ActorGroupCond from "../data/ActorGroupCond";
import { computed, onMounted, ref } from "vue";
import { swapGroup } from "../ctrls/BaseGroupCtrl";
import { LogMessages } from "../data/Messages";

// stores/routers
const actor_group_store = ActorGroupStore()
// props/models
// variables
const cond_actor_group = ref<ActorGroupData | undefined>(undefined)
const edit_group = ref<ActorGroupData>(new ActorGroupData())
const is_editing = ref(false)
// computed
const is_show_condition = computed(() => cond_actor_group.value !== undefined)
const cond_title = computed(() => cond_actor_group.value !== undefined ? cond_actor_group.value.group_name : "")
// watch
// methods

async function saveGroup() {
	if (edit_group.value.group_id != 0) {
		const [ok, group] = await updateActorGroup(edit_group.value)
		if (ok) {
			actor_group_store.update(group)
			stopEdit()
		}
	} else {
		const [ok, group] = await addActorGroup(edit_group.value)
		if (ok) {
			actor_group_store.add(group)
			stopEdit()
		}
	}
}

async function delGroup() {
	const [ok, _] = await delActorGroup(edit_group.value.group_id)
	if (ok) {
		actor_group_store.remove(edit_group.value.group_id)
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

function toEditGroup(group: ActorGroupData) {
	edit_group.value.copy(group)
	is_editing.value = true
}

async function moveGroup(group_id: number, up: boolean) {
	const group_list = actor_group_store.sorted_list
	const priorities = swapGroup(group_list, group_id, up)
	if (priorities) {
		const [ok, succeed] = await updatePriorities(priorities)
		if (ok && succeed) {
			actor_group_store.updatePriorities(priorities)
		} else {
			actor_group_store.dirty()
		}
	}
}

function startEditCondition(actorGroup: ActorGroupData) {
	cond_actor_group.value = actorGroup
}

function onCancelCondition() {
	cond_actor_group.value = undefined
}

async function onSubmitCondition(cond_list: ActorGroupCond[]) {
	const [ok, _] = await setGroupCondition(cond_actor_group.value!.group_id, cond_list)
	if (ok) {
		cond_actor_group.value!.cond_list = cond_list
		logInfo(LogMessages.GroupSetCondition())
	}
	cond_actor_group.value = undefined
}

// lifecycle
onMounted(async () => {
	await actor_group_store.getFromServer()
})
</script>

<style scoped></style>