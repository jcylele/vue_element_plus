<template>
	<el-space direction="vertical" size="small" fill style="width: var(--me-remark-width);">
		<!-- search line -->
		<div class="left-row">
			<div class="left-column">
				<div class="left-row">
					<el-checkbox v-model="condition_form.init_selected" :disabled="!condition_form.is_editing"
						class="search-checkbox" size="default" border>
						{{ init_actor_name }}
					</el-checkbox>
					<el-input v-model="condition_form.post_id_prefix" placeholder="first 8 digits of post id"
						maxlength="8" @input="handlePostId" :disabled="!condition_form.is_editing" class="search-input"
						clearable />
				</div>
				<div class="left-row">
					<el-checkbox v-model="condition_form.has_comment" :disabled="!condition_form.is_editing"
						class="search-checkbox" size="default" border>
						{{ condition_form.has_comment ? "Search" : "Has Comment" }}
					</el-checkbox>
					<el-input v-model="condition_form.comment" placeholder="comment"
						:disabled="!condition_form.is_editing || !condition_form.has_comment" clearable
						class="search-input" />
				</div>
			</div>
			<div class="center-row" style="flex-grow: 1;">
				<el-button v-if="condition_form.is_editing" type="primary" size="large"
					@click="endEdit">Save</el-button>
				<el-button v-else type="success" size="large" @click="startEdit">Edit</el-button>
			</div>
		</div>
		<el-divider style="margin: 5px 0" />
		<div v-if="actor_post_list.length == 0" class="center-row">
			<el-text style="font-size: 24px">No Post Found</el-text>
		</div>
		<el-collapse v-else v-model="expanded_actors" @change="onExpandChange">
			<el-collapse-item v-for="actor_info in actor_post_list" :title="actor_info.actor_name"
				:name="actor_info.actor_id">
				<div class="left-column">
					<div v-for="post_info in actor_post_dict.get(actor_info.actor_id)" class="left-column"
						style="gap: 0;">
						<div class="left-row">
							<span class="post-id">
								{{ post_info.data.post_id }}
							</span>
							<svg-icon v-if="!post_info.is_editing" name="edit" size="30px"
								@click="onPostEditClick(post_info)" />
							<svg-icon v-if="post_info.is_editing" name="completed" size="32px"
								@click="onPostSubmitClick(actor_info, post_info)" />
							<svg-icon v-if="post_info.is_editing" name="close" size="32px"
								@click="onPostCancelClick(post_info)" />
						</div>
						<el-input v-if="post_info.is_editing" v-model="post_info.data.editing_comment"
							class="post-comment" placeholder="add comment for post" clearable />
						<span v-else class="post-comment">
							{{ post_info.data.comment }}
						</span>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>
	</el-space>
</template>

<script setup lang="ts">
import { getPostCountList, getPosts, setPostComment } from "../ctrls/PostCtrl";
import { PostConditionForm, EditingPostData, ActorPostInfo } from "../data/PostData";
import { logInfo, logWarn } from "../ctrls/FetchCtrl";
import { computed, onMounted, ref } from "vue";
import ActorData from "../data/ActorData";


const props = defineProps({
	actor: {
		type: ActorData,
		required: true,
	}
})

const emit = defineEmits(["comment"])

const init_actor_name = computed(() => {
	return props.actor.actor_name
})

const condition_form = ref(new PostConditionForm(props.actor.actor_id))
const actor_post_list = ref<ActorPostInfo[]>([])
const actor_post_dict = ref<Map<number, EditingPostData[]>>(new Map())
const expanded_actors = ref<string[]>([])

function startEdit() {
	actor_post_list.value = []
	actor_post_dict.value = new Map()

	condition_form.value.is_editing = true
}

async function endEdit() {
	if (!condition_form.value.checkPostIdPrefix()) {
		logWarn(`prefix of post id too short`)
		return
	}

	condition_form.value.is_editing = false

	await getActorNames()
}
function handlePostId(value: string) {
	// 移除非数字字符
	condition_form.value.post_id_prefix = value.replace(/[^\d]/g, '')
}
async function onExpandChange(actors: string[]) {
	for (const actor_id_str of actors) {
		const actor_id = Number(actor_id_str)
		const post_list = actor_post_dict.value.get(actor_id)
		if (post_list!.length == 0) {
			getActorPosts(actor_id)
		}
	}
}
async function getActorNames() {
	const form = condition_form.value.createInitForm()
	const [ok, new_list] = await getPostCountList(form)
	if (ok) {
		expanded_actors.value = []
		actor_post_list.value = []
		actor_post_dict.value = new Map()
		for (const actor_info of new_list) {
			actor_post_dict.value.set(actor_info.actor_id, [])
		}
		actor_post_list.value = new_list
	}
}
async function getActorPosts(actor_id: number) {
	const form = condition_form.value.createFilterForm(actor_id)
	const [ok, new_list] = await getPosts(form)
	if (ok) {
		console.log(`update ${new_list.length} posts for ${actor_id}`)
		actor_post_dict.value.set(actor_id, new_list)
	}
}

function onPostEditClick(post_info: EditingPostData) {
	post_info.is_editing = true
	post_info.data.editing_comment = post_info.data.comment
}

async function onPostSubmitClick(actor_info: ActorPostInfo, post_info: EditingPostData) {
	const [ok, _] = await setPostComment(post_info.data.post_id, post_info.data.editing_comment)
	if (ok) {
		post_info.is_editing = false
		post_info.data.comment = post_info.data.editing_comment
		emit("comment", actor_info.actor_id, post_info.data.post_id, post_info.data.comment)
		logInfo("set comment for post succeed")
	}
}


function onPostCancelClick(post_info: EditingPostData) {
	post_info.is_editing = false
	post_info.data.editing_comment = post_info.data.comment
}

onMounted(() => {

})
</script>

<style scoped>
.search-checkbox {
	font-size: var(--el-font-size-large);
	width: 180px;
}

.search-input {
	width: 200px;
}

.post-id {
	font-size: var(--el-font-size-large);
	line-height: normal;
}

.post-comment {
	color: var(--me-post-color);
	font-size: var(--el-font-size-large);
	max-width: var(--me-remark-width);
	line-height: normal;
}
</style>