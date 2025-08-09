<template>
	<el-container>
		<el-space direction="vertical" size="small" fill>
			<el-space v-for="tag_group in tag_group_info_list"
				style="border: 1px solid ; border-radius: 4px; padding: 2px" direction="horizontal" alignment="stretch">
				<el-text style="font-weight: bold;width: 120px;margin-left: 10px;">{{ tag_group.group_name }}</el-text>
				<el-space direction="horizontal" :wrap="true" alignment="stretch">
					<el-tag v-for="tag_info in tag_group.tag_infos" class="hint-selectable" :key="tag_info.tag_id"
						:style="getTagStyle(tag_info)"
						size="large" @click="switchSelect(tag_info)">
						{{ getTagName(tag_info.tag_id) }}
					</el-tag>
				</el-space>
			</el-space>
			<!-- buttons -->
			<el-space direction="horizontal" alignment="center">
				<el-button type="primary" size="large" @click="onSubmit">
					Save
				</el-button>
				<el-button type="warning" size="large" @click="onCancel">
					Cancel
				</el-button>
			</el-space>

		</el-space>

	</el-container>
</template>

<script lang="ts" setup>
// imports
import ActorTagData from "../data/ActorTagData.js";
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorTagGroupStore } from "../store/ActorTagGroupStore.js";
import { ref, onMounted } from "vue";
import ActorData from "../data/ActorData.js";

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
	const tag_groups = actor_tag_group_store.sorted_list.map(group => {
		return {
			group_name: group.group_name,
			tag_infos: actor_tag_store.sorted_list.filter(tag => tag.tag_group_id == group.group_id).map(tag => {
				return { tag_id: tag.tag_id, selected: actor_tag_ids.has(tag.tag_id) }
			})
		}
	})
	tag_group_info_list.value = tag_groups
}

function getTagStyle(tag_info: TagInfo) {
	const bg_color = actor_tag_store.getBgColor(tag_info.tag_id)
	if (tag_info.selected) {
		return {
			"color": "#ffffff",
			"border-color": bg_color,
			"background-color": bg_color,
		}
	} else {
		return {
			"color": bg_color,
			"border-color": bg_color,
			"background-color": "transparent",
		}
	}
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