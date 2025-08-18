<template>
	<div class="actor_tag">
		<el-space direction="vertical" border>
			<!-- Tag Name -->
			<el-text v-if="!is_editing" class="tag-title">{{ tag.tag_name }}</el-text>
			<el-input v-if="is_editing" v-model="tag.tag_name" />
			<!-- used count -->
			<el-text>count: {{ tag.used_count }}</el-text>
			<!-- avg score -->
			<el-text class="tag-score" :style="{ 'color': tag.score_color }">
				score: {{ tag.show_score }}
			</el-text>
			<!-- not in editing -->
			<el-space v-if="!is_editing" direction="horizontal" alignment="center">
				<svg-icon size="24px" name="edit" @click="startEdit" />
			</el-space>
			<!-- in editing -->
			<el-space v-if="is_editing" size="large" direction="horizontal" alignment="center">
				<svg-icon size="24px" name="check" @click="onSave" />
				<svg-icon size="24px" name="refresh" @click="onReset" />
				<svg-icon size="24px" name="remove" @click="onDelete" />
			</el-space>

		</el-space>
	</div>
</template>

<script setup lang="ts">
// imports
import { computed } from "vue";
import { ActorTagStore } from "../store/ActorTagStore";
import { delActorTag, updateTagName, getActorTag } from "../ctrls/ActorTagCtrl";
import { EditingTagData } from "../data/ActorTagData";
// emits
const emit = defineEmits(['delete'])
// stores/routers
const actorTagStore = ActorTagStore()
// props/models
const props = defineProps<{
	tag_edit_info: EditingTagData
}>()
// variables
// computed
const tag = computed(() => props.tag_edit_info.data)
const is_editing = computed(() => props.tag_edit_info.is_editing)
// watch
// methods
function startEdit() {
	props.tag_edit_info.is_editing = true
}
function stopEdit() {
	props.tag_edit_info.is_editing = false
}
async function onSave() {
	const tag = props.tag_edit_info.data
	const [ok, _] = await updateTagName(tag.tag_id, tag.tag_name)
	if (ok) {
		stopEdit()
	}
}
async function onReset() {
	const [ok, origin_tag] = await getActorTag(props.tag_edit_info.data.tag_id)
	if (ok) {
		props.tag_edit_info.data = origin_tag
		actorTagStore.update(origin_tag)
		stopEdit()
	}
}
async function onDelete() {
	const tag_id = props.tag_edit_info.data.tag_id
	const [ok, _] = await delActorTag(tag_id)
	if (ok) {
		actorTagStore.remove(tag_id)
		emit('delete', tag_id)
	}
}
// lifecycle
</script>

<style scoped>
.actor_tag {
	background-color: var(--el-card-bg-color);
	padding: 10px;
	margin: 5px;
}

.tag-title {
	font-weight: bold;
}

.tag-score {
	background: linear-gradient(to bottom, #1A1A1A, #2C3E50);
	padding: 0 5px;
}
</style>