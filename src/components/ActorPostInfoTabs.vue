<template>
	<div class="fill-column">
		<div class="center-column common-border">
			<span class="part-title">Post Fetch Time Stats</span>
			<PostFetchTimeChart :actor_id="actor.actor_id" />
			<div class="center-row" v-if="before_date_shortcuts.length > 0">
				<el-button type="warning" @click="toFixRes">
					Fix Video Urls
				</el-button>
				<span>Before</span>
				<el-date-picker v-model="before_date" type="date" :shortcuts="before_date_shortcuts" />
			</div>
		</div>
		<div class="left-column common-border">
			<span class="part-title">Posts of Missing Reses</span>
			<div v-if="has_missing_posts" class="center-row">
				<el-link v-for="hash_info in missing_posts" :href="hash_info.hash_url" target="_blank" underline>
					{{ hash_info.post_id }}
				</el-link>
			</div>
			<span v-else>No missing posts</span>
			<div class="center-row">
				<el-button type="warning" @click="toFixPosts">
					Scan All Posts
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import { ActorData } from "../data/ActorData";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { BadgeStore } from "../store/BadgeStore";
import { fixPosts, fixRes } from "../ctrls/DownloadCtrl";
import { logError, logInfo } from "../ctrls/FetchCtrl";
import { LogMessages } from "../data/Messages";
import { IMissingPost } from "../data/SchemasOthers";
import { getMissingPosts, getPostFetchDates } from "../ctrls/ActorCtrl";
import PostFetchTimeChart from "./Chart/PostFetchTimeChart.vue";
import { format_date, to_date } from "../data/DataUtil";

interface IDateShortcut {
	text: string,
	value: Date | (() => Date)
}

// emits
const emit = defineEmits(['close'])
// stores/routers
const actorFilterStore = ActorFilterStore()
const badgeStore = BadgeStore()
// props/models
const props = defineProps({
	actor: {
		type: ActorData,
		required: true
	}
})
// variables
const missing_posts = ref<IMissingPost[]>([])
const before_date = ref<Date | null>(null)
const before_date_shortcuts = ref<IDateShortcut[]>([])
// computed
const has_missing_posts = computed(() => missing_posts.value.length > 0)
// watch
// methods

async function fetchPostFetchDates() {
	const [ok, list] = await getPostFetchDates(props.actor.actor_id)
	if (ok) {
		before_date_shortcuts.value = list.map(date => ({
			text: date,
			value: to_date(date)
		}))
	}
}

async function fetchMissingPosts() {
	const [ok, list] = await getMissingPosts(props.actor.actor_id)
	if (ok) {
		missing_posts.value = list
	}
}

function refreshDownloadInfo() {
	badgeStore.fetchTaskCount()
	actorFilterStore.getDowningFromServer()
}

async function toFixPosts() {
	const [ok, _] = await fixPosts([props.actor.actor_id])
	if (ok) {
		refreshDownloadInfo()
		logInfo(LogMessages.TaskStart())
		emit('close')
	}
}

async function toFixRes() {
	if (before_date.value === null) {
		logError('Please select a before date')
		return
	}
	const [ok, _] = await fixRes([props.actor.actor_id], format_date(before_date.value!))
	if (ok) {
		refreshDownloadInfo()
		logInfo(LogMessages.TaskStart())
		emit('close')
	}
}

// lifecycle
onMounted(async () => {
	await fetchMissingPosts()
	await fetchPostFetchDates()
})
</script>

<style scoped>
.part-title {
	font-size: var(--el-font-size-large);
	font-weight: 700;
}
</style>