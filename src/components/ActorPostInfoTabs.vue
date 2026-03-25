<template>
	<el-tabs type="border-card" v-model="default_tab" @tab-change="onTabChange" style="width: 750px;">
		<el-tab-pane label="Fetch Time" :name="ETabNames.FetchTimeStats" lazy>
			<div class="center-column">
				<PostFetchTimeChart :actor_id="actor.actor_id" />
				<div class="center-row" v-if="before_date_shortcuts.length > 0">
					<el-button type="warning" @click="toFixRes">
						Fix Video Urls
					</el-button>
					<span>Before</span>
					<el-date-picker v-model="before_date" type="date" :shortcuts="before_date_shortcuts" />
				</div>
			</div>
		</el-tab-pane>
		<el-tab-pane label="Others" :name="ETabNames.Others" lazy>
			<div class="fill-column">
				<div class="left-column common-border">
					<span class="part-title">Missing Posts</span>
					<div v-if="has_missing_posts" class="center-row">
						<el-link v-for="hash_info in missing_posts" :href="hash_info.hash_url" target="_blank"
							underline>
							{{ hash_info.post_id }}
						</el-link>
					</div>
					<span class="part-desc" v-else>No missing posts</span>
					<div class="center-row">
						<el-button type="warning" @click="toFixPosts">
							Scan All Posts
						</el-button>
					</div>
				</div>
				<div class="left-column common-border">
					<span class="part-title">Last Post Id</span>
					<span class="part-desc">When actor is moved to final group, the maximum post id will be saved</span>
					<span class="part-desc">reset this to fetch older posts</span>
					<el-button type="warning" :disabled="!actor.has_last_post_id" @click="toResetLastPostId">
						{{ actor.has_last_post_id ? "Reset Last Post Id" : "No Last Post Id" }}
					</el-button>
				</div>
				<div class="left-column common-border">
					<span class="part-title">Res States</span>
					<span class="part-desc">reset all deleted reses to initial state</span>
					<el-button type="warning" @click="toResetResStates">
						Reset Res States
					</el-button>
				</div>
			</div>
		</el-tab-pane>
	</el-tabs>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import { ActorData } from "../data/ActorData";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { BadgeStore } from "../store/BadgeStore";
import { fixPosts, fixRes } from "../ctrls/DownloadCtrl";
import { confirmOp, logError, logInfo } from "../ctrls/FetchCtrl";
import { LogMessages } from "../data/Messages";
import { IMissingPost } from "../data/SchemasOthers";
import { getMissingPosts, getPostFetchDates, resetActorResStates, resetLastPostId } from "../ctrls/ActorCtrl";
import PostFetchTimeChart from "./Chart/PostFetchTimeChart.vue";
import { format_date, to_date } from "../data/DataUtil";
import { EConfirmOp } from "../data/Enums";

enum ETabNames {
	FetchTimeStats,
	Others
}

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
const default_tab = ref(ETabNames.FetchTimeStats)
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

async function toResetLastPostId() {
	await confirmOp(EConfirmOp.ResetLastPostId, async () => {
		const [ok, _] = await resetLastPostId(props.actor.actor_id)
		if (ok) {
			props.actor.has_last_post_id = false
			logInfo(LogMessages.ResetLastPostId())
		}
	})
}

async function toResetResStates() {
	await confirmOp(EConfirmOp.ResetResStates, async () => {
		const [ok, file_info] = await resetActorResStates(props.actor.actor_id)
		if (ok) {
			props.actor.file_info = file_info
			logInfo(LogMessages.ResetResStates())
		}
	})
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

async function onTabChange(tab_name: number) {
	switch (tab_name) {
		case ETabNames.FetchTimeStats:
			await fetchPostFetchDates()
			break
		case ETabNames.Others:
			await fetchMissingPosts()
			break
		default:
			break
	}
}

// lifecycle
onMounted(async () => {
	await onTabChange(default_tab.value)
})
</script>

<style scoped>
.part-title {
	font-size: var(--el-font-size-large);
	font-weight: 700;
}

.part-desc {
	font-size: var(--el-font-size-base);
}
</style>