<template>
	<div class="fill-column link-root">
		<div v-for="actor in actors" class="left-row" style="gap: 0;">
			<el-text class="col-name bold-text">{{ actor.actor_name }}</el-text>
			<MyRate class="col-score" v-model="actor.show_score" disabled />
			<div class="col-tags left-row wrap">
				<el-tag v-for="tag_id in actor.tag_ids" class="hint-selectable" :key="tag_id"
					:style="actorTagStore.getStyle(tag_id)" effect="plain" @click="addTag(tag_id)" round>
					{{ actorTagStore.getName(tag_id) }}
				</el-tag>
			</div>
		</div>
		<el-text class="desc-text">
			click above tags to add, below tags to remove
		</el-text>
		<div class="result-row left-row" style="gap: 0;">
			<el-text class="col-name">
				Edit Link Result
			</el-text>
			<div class="col-result left-column">
				<MyRate v-model="show_score" />
				<div class="left-row wrap">
					<el-tag v-for="tag_id in tag_list" :key="tag_id" :style="actorTagStore.getStyle(tag_id)"
						effect="plain" @close="removeTag(tag_id)" closable round>
						{{ actorTagStore.getName(tag_id) }}
					</el-tag>
				</div>
				<el-input v-model="remark" placeholder="set shared remark for actors" type="textarea" autosize class="remark-input" />
			</div>
		</div>
		<div class="center-row">
			<el-button type="primary" @click="onSubmit">
				Submit
			</el-button>
			<el-button type="warning" @click="onCancel">
				Cancel
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import ActorData from "../data/ActorData";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { ActorTagStore } from "../store/ActorTagStore";	
import MyRate from "./MyRate.vue";
// emits
const emit = defineEmits(['submit', 'cancel'])
// stores/routers
const actorTagStore = ActorTagStore()
// props/models

const props = defineProps({
	actors: Array<ActorData>
})
// variables
const tag_list: Ref<number[]> = ref([])
const score = ref(0)
const remark = ref("")
// computed
const show_score = computed({
	// getter
	get() {
		return score.value / 2
	},
	// setter
	set(val) {
		score.value = val * 2
	}
})
// watch
watch(() => props.actors, async (new_actors) => {
	initLinkResult()
})

// methods
function removeTag(tag_id: number) {
	tag_list.value.splice(tag_list.value.indexOf(tag_id), 1)
}

function addTag(tag_id: number, sort: boolean = true) {
	if (tag_list.value.includes(tag_id)) return
	tag_list.value.push(tag_id)
	if (sort) {
		tag_list.value.sort(actorTagStore.compareTagId)
	}
}

function onSubmit() {
	emit("submit", score.value, remark.value, tag_list.value)
}

function onCancel() {
	emit("cancel")
}

/**
 * set score to max of actors
 * tag_list unions distinct tag ids of actors
 */
function initLinkResult() {
	score.value = 0
	remark.value = ""
	tag_list.value = []

	for (const actor of props.actors) {
		if (actor.score > score.value) {
			score.value = actor.score
		}
		for (const tag_id of actor.tag_ids) {
			addTag(tag_id, false)
		}
		if (actor.remark !== "" && remark.value != actor.remark) {
			if (remark.value === "") remark.value = actor.remark
			else remark.value += `\n${actor.remark}`
		}
	}
	// sort tags at the end
	tag_list.value.sort(actorTagStore.compareTagId)

	// console.log(`init score: ${score.value}, tag_list: ${tag_list.value}`)
}

// lifecycle
onMounted(() => {
	initLinkResult()
})
</script>
<style scoped>
.link-root {
	--result-width: var(--me-remark-width);
	--name-width: 170px;
	--score-width: 170px;
	--tags-width: calc(var(--result-width) - var(--score-width) - var(--me-common-gap));
}

.desc-text {
	font-style: italic;
}

.result-row {
	background-color: var(--el-card-bg-color);
}

.col-name {
	font-size: var(--el-font-size-large);
	width: var(--name-width);
}

.col-score {
	width: var(--score-width);
}

.col-tags {
	width: var(--tags-width);
}

.col-result	{
	width: var(--result-width);
}

.remark-input {
	font-size: var(--el-font-size-large);
	--el-input-text-color: var(--me-remark-color);
}
</style>