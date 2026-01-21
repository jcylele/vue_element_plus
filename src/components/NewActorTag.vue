<template>
	<div class="left-row common-border">
		<el-checkbox v-model="show_add" label="Add New Actor Tag" size="large" border />
		<div v-if="show_add">
			<el-form :inline="true" :model="new_actor_tag" class="new-tag-form">
				<el-form-item label="Name">
					<el-input v-model="new_actor_tag.tag_name" style="width: 150px" clearable />
				</el-form-item>
				<el-form-item label="Priority">
					<el-select v-model="new_actor_tag.show_priority" style="width: 150px">
						<el-option v-for="i in 10" :key="i - 1" :value="i - 1" :label="`Priority ${i - 1}`"
							:style="{ 'color': getTagColor(i - 1) }" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onAddActorTag">Add</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import { ActorTagData } from "../data/ActorTagData";
import { addActorTag } from "../ctrls/ActorTagCtrl";
import { ActorTagStore } from "../store/ActorTagStore";
import { Tag_Colors } from "../data/Consts";
import { ref } from "vue";
// emits
const emit = defineEmits(['tag_added'])
// stores/routers
const actorTagStore = ActorTagStore()
// props/models
// variables
const new_actor_tag = ref(new ActorTagData())
const show_add = ref(false)
// computed
// watch
// methods
// lifecycle

function getTagColor(index: number): string {
	return Tag_Colors[index]
}

async function onAddActorTag() {
	const [ok, tag] = await addActorTag(new_actor_tag.value)
	if (ok) {
		new_actor_tag.value = new ActorTagData()
		show_add.value = false
		actorTagStore.add(tag)
		emit("tag_added")
	}
}

</script>

<style scoped>
.new-tag-form .el-form-item {
	margin: 5px 8px;
}

.new-tag-button {
	margin: 5px 8px;
}
</style>