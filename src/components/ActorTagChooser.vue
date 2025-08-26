<template>
	<el-container>
		<el-space direction="vertical" size="small" fill>
			<el-space v-for="tag_group in tag_group_info_list"
				style="border: 1px solid ; border-radius: 4px; padding: 2px" direction="horizontal" alignment="stretch">
				<el-text style="font-weight: bold;width: 120px;margin-left: 10px;">{{ tag_group.group_name }}</el-text>
				<el-space direction="horizontal" :wrap="true" alignment="stretch">
					<el-tag v-for="tag_info in tag_group.tag_infos" class="hint-selectable" :key="tag_info.tag_id"
						:style="getTagStyle(tag_info)" size="large" @click="switchSelect(tag_info)">
						{{ getTagName(tag_info.tag_id) }}
					</el-tag>
				</el-space>
			</el-space>
			<!-- buttons -->
			<div class="center-row" style="gap: 30px;">
				<el-button type="primary" size="large" style="width: 120px;" @click="onSubmit">
					Save
				</el-button>
				<el-button type="warning" size="large" style="width: 120px;" @click="onCancel">
					Cancel
				</el-button>
			</div>

		</el-space>

	</el-container>
</template>

<script lang="ts" setup>
// imports
import { ActorTagData } from "../data/ActorTagData";
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorTagGroupStore } from "../store/ActorTagGroupStore";
import { ref, onMounted } from "vue";
import ActorData from "../data/ActorData";

interface TagInfo {
	tag_id: number,
	selected: boolean,
}

interface TagGroupInfo {
	group_name: string,
	tag_infos: TagInfo[],
}
// emits
const emit = defineEmits(["submit", "cancel"])
// stores/routers
const actor_tag_group_store = ActorTagGroupStore()
const actor_tag_store = ActorTagStore()
// props/models
const props = defineProps<{
	actor: ActorData,
}>()
// variables
const tag_group_info_list = ref<TagGroupInfo[]>([])
// computed
// watch
// methods
function init() {
	const actor_tag_ids = new Set(props.actor.tag_ids)
	const tag_group_ids = actor_tag_group_store.sorted_list.map(group => group.group_id)
	tag_group_ids.push(0)
	const tag_group_map = new Map<number, TagInfo[]>()
	for (const actor_tag of actor_tag_store.sorted_list) {
		let tag_group = tag_group_map.get(actor_tag.tag_group_id)
		if (!tag_group) {
			tag_group = []
			tag_group_map.set(actor_tag.tag_group_id, tag_group)
		}
		tag_group.push({
			tag_id: actor_tag.tag_id,
			selected: actor_tag_ids.has(actor_tag.tag_id)
		})
	}
	const group_info_list: TagGroupInfo[] = []
	for (const tag_group_id of tag_group_ids) {
		const tag_group = tag_group_map.get(tag_group_id)
		if (!tag_group) {
			continue
		}
		group_info_list.push({
			group_name: tag_group_id == 0 ? "Ungrouped" : actor_tag_group_store.getName(tag_group_id),
			tag_infos: tag_group
		})
	}

	tag_group_info_list.value = group_info_list
}

function getTagStyle(tag_info: TagInfo) {
	return actor_tag_store.getStyle(tag_info.tag_id, tag_info.selected)
}

function getTagName(tag_id: number) {
	return actor_tag_store.getName(tag_id)
}

function switchSelect(tag_info: TagInfo) {
	tag_info.selected = !tag_info.selected
}

function onSubmit() {
	// merge all selected tags
	let new_tag_list: number[] = []
	for (const group of tag_group_info_list.value) {
		for (const tag_info of group.tag_infos) {
			if (tag_info.selected) {
				new_tag_list.push(tag_info.tag_id)
			}
		}
	}

	emit("submit", new_tag_list)
}

function onCancel() {
	emit("cancel")
}

// lifecycle
onMounted(() => {
	// console.log(`mounted for ${this.actor.actor_name}`)
	init()
})

</script>
<style scoped>
</style>