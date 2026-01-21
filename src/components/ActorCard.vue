<template>
	<el-space direction="vertical" class="actor_card" alignment="stretch" style="gap:3px;" :key="actor.uuid"
		:style="group_color_style">
		<!-- actor avatar -->
		<div class="avatar">
			<el-tooltip v-if="actor.show_tooltip" placement="top" :offset="3" effect="light"
				:popper-style="{ 'max-width': 'var(--me-remark-width)' }">
				<template #content>
					<div class="fill-column">
						<div v-if="actor.in_fav_folder" class="left-row remark-color">
							<svg-icon size="24px" name="star_filled" />
							<span class="pop-remark">
								{{ fav_fodlers_str }}
							</span>
						</div>
						<div v-if="actor.remark" class="left-row top remark-color">
							<svg-icon size="24px" name="remark" />
							<span class="pop-remark multi-line-text">
								{{ actor.remark }}
							</span>
						</div>
						<div v-if="actor.comment" class="left-row top comment-color">
							<svg-icon size="24px" name="remark" />
							<span class="pop-remark  multi-line-text">
								{{ actor.comment }}
							</span>
						</div>
						<div v-for="post in actor.commented_posts" class="left-row top post-color">
							<svg-icon size="24px" name="remark" />
							<span class="pop-remark multi-line-text">
								{{ post.comment }}
							</span>
						</div>
						<div v-if="actor.show_video_infos" class="left-row">
							<svg-icon size="24px" name="camera" />
							<span class="pop-remark">
								{{ actor.str_video_infos }}
							</span>
						</div>
					</div>
				</template>
				<el-image class="avatar-img" :src="actor.icon_url" />
			</el-tooltip>
			<el-image v-else class="avatar-img" :src="actor.icon_url" />

			<el-text class="avatar-platform">
				{{ actor.actor_platform }}
			</el-text>

			<div v-if="actor.is_linked" class="avatar-friend-container center-column" style="gap: 0"
				@click="findLinkedActor">
				<svg-icon size="40px" name="avatar" :style="group_color_style" />
				<div v-if="linked_group_ids.length > 1" class="center-row wrap" style="gap: 0;width: 40px;">
					<svg-icon v-for="group_id in linked_group_ids" size="10px" name="circle"
						:style="getGroupColorStyle(group_id)" />
				</div>
			</div>

			<svg-icon v-if="locked" size="40px" name="locked" class="avatar-lock" />

			<svg-icon v-if="show_select" size="40px" :name="actor_data.selected ? 'completed' : 'remove'"
				class="avatar-select" @click="onSelectCLick" />

			<div class="avatar-bottom-container center-row" style="gap: 0;">
				<!-- actor remark -->
				<svg-icon :name="actor.has_remark ? 'remark' : 'remark_empty'" @click="startEditRemark"
					class="remark-icon" />
				<!-- Stars -->
				<el-popover placement="top" trigger="click" :offset="-2" :show-arrow="false"
					:popper-style="group_color_popper_style" @show="onShowScore">
					<template #reference>
						<div class="hint-selectable">
							<MyRate :model-value="actor.show_score" size="default" disabled class="logic-transparent" />
						</div>
					</template>
					<template #default>
						<MyRate v-model="edit_score" size="large" @change="changeScore" />
					</template>
				</el-popover>
			</div>

		</div>

		<!-- actor name, click to open menu items -->
		<!-- downloading related icons -->
		<div class="actor_name_line center-row">
			<el-popover trigger="click" placement="top" v-model:visible="is_show_op"
				:popper-style="group_color_popper_style" :offset="6">
				<template #reference>
					<el-text class="actor_name_text hint-selectable" tag="a" :style="group_color_style">
						{{ actor.actor_name }}
					</el-text>
				</template>
				<template #default>
					<el-space direction="vertical" alignment="center">
						<el-text class="actor_name_text" :style="group_color_style">
							{{ actor.actor_name }}
						</el-text>
						<el-space direction="horizontal">
							<el-button class="pop-button" type="primary" @click="showDialog(EActorDialog.log)">
								Show Logs
							</el-button>
							<el-button class="pop-button" type="primary" @click="gotoActorPage">
								Go To Page
							</el-button>
						</el-space>
						<el-space direction="horizontal" v-if="has_folder">
							<el-button class="pop-button" type="warning" :disabled="!actor.has_last_post_id"
								@click="resetPosts">
								Reset Posts
							</el-button>
							<el-button class="pop-button" type="warning" @click="clearFolder">
								Clear Folder
							</el-button>
						</el-space>
						<el-space direction="horizontal" v-if="has_folder">
							<el-button class="pop-button" type="success" @click="toDownloadFromOp" v-if="has_folder">
								Download
							</el-button>
							<el-button class="pop-button" type="success" @click="openFolder" v-if="has_folder">
								Open Folder
							</el-button>
						</el-space>
					</el-space>
				</template>
			</el-popover>
		</div>

		<!-- actor post info -->
		<el-space direction="vertical" v-if="actor.file_info" style="gap: 1px 0" fill>
			<div class="center-row" style="gap: 0 3px">
				<span class="post_count hint-selectable" @click="showDialog(EActorDialog.post_info)">
					{{ actor.post_desc }}
				</span>
				<span v-if="group_abstract.is_initial" class="thumbnail_count">
					{{ actor.thumbnail_desc }}
				</span>
				<svg-icon v-if="is_video_all" name="file_checked" style="color: orange" size="24px" />
				<svg-icon v-if="show_downloading" name="loading" style="color: orange" size="24px" />
				<svg-icon v-if="is_downing" name="download" style="color: deepskyblue" size="24px" />
			</div>

			<!-- actor res info -->
			<div class="center-column hint-selectable" style="gap: 0;" @click="showDialog(EActorDialog.file_info)">
				<div v-for="res_file_info in actor.file_info.res_info" class="center-row"
					:style="{ 'color': res_file_info.res_state_color }">
					<!-- <span v-for="i in res_file_info.col_count" class="res_info">
						{{ res_file_info.col_val(i) }}
					</span> -->
					<span class="res_info" style="width: 45px;">
						{{ res_file_info.str_state }}
					</span>
					<span class="res_info" style="width: 60px;">
						{{ res_file_info.str_video_size }}
					</span>
					<span class="res_info" style="width: 40px;">
						{{ res_file_info.str_img_count }}
					</span>
					<span class="res_info" style="width: 40px;">
						{{ res_file_info.str_video_count }}
					</span>
				</div>
			</div>
		</el-space>
		<el-text v-else style="font-size: 16px;font-style: italic">
			loading file info
		</el-text>

		<!--actor remark + group + edit button -->
		<div class="center-row">
			<!-- fav folder -->
			<el-tooltip v-if="actor.in_fav_folder" placement="top-start" :offset="3" effect="light">
				<template #content>
					<div class="center-column" style="gap: 2px;">
						<span v-for="folder_id in actor.folder_ids" class="pop-remark remark-color">
							{{ favFolderStore.getName(folder_id) }}
						</span>
					</div>
				</template>
				<svg-icon name="star_filled" class="remark-color" size="32px" @click="showFolders" />
			</el-tooltip>
			<svg-icon v-else name="star_empty" class="comment-color" size="32px" @click="showFolders" />
			<!-- actor group -->
			<el-select v-model="actor.actor_group_id" @change="setActorGroup" placement="right" style="flex-grow: 1">
				<el-option v-for="group in actorGroupStore.sorted_list" :label="group.group_name"
					:value="group.group_id" class="underline" :style="getGroupColorStyle(group.group_id)">
					{{ group.group_name }}
				</el-option>
			</el-select>
			<!-- click to edit tags -->
			<svg-icon v-if="has_tag" size="32px" name="edit" @click="startEditTag" />
			<el-popover v-else placement="right" trigger="click" :popper-style="group_color_popper_style">
				<template #reference>
					<svg-icon size="32px" name="edit" />
				</template>
				<el-space direction="vertical" size="small" fill>
					<el-text style="font-style: italic">
						click to apply single tag to actor
					</el-text>
					<el-space v-for="tag_ids in actorTagStore.tag_history" size="small" class="tag_history_row">
						<el-tag v-for="tag_id in tag_ids" @click="onApplyTag(tag_id)"
							:style="actorTagStore.getStyle(tag_id)" effect="plain" round>
							{{ actorTagStore.getName(tag_id) }}
						</el-tag>
					</el-space>
					<el-space direction="horizontal" size="small">
						<el-button size="default" type="warning" @click="clearRecentTags">
							Clear
						</el-button>
						<el-button size="default" type="primary" @click="startEditTag">
							Choose Other Tags
						</el-button>
					</el-space>
				</el-space>
			</el-popover>
		</div>

		<!--actor tags-->
		<el-space wrap style="margin-top: 5px">
			<el-tag v-for="tag_id in actor.tag_ids" :style="actorTagStore.getStyle(tag_id)" effect="plain" round>
				{{ actorTagStore.getName(tag_id) }}
			</el-tag>
		</el-space>
	</el-space>
	<!-- dialog: actor remark editing-->
	<el-dialog v-model="card_dialog.is_show_remark" :title="actor.actor_name">
		<RemarkEditor v-if="card_dialog.is_show_remark" :actor="actor" @remark="onSubmitRemark"
			@comment="onSubmitComment" @posts="showDialog(EActorDialog.post)" />
	</el-dialog>
	<!-- dialog: actor tags editing dialog-->
	<el-dialog v-model="card_dialog.is_show_tags" :title="actor.actor_name">
		<ActorTagChooser v-if="card_dialog.is_show_tags" :actor="actor" @submit="onSubmitTag"
			@cancel="onCancelAddTag" />
	</el-dialog>
	<!-- dialog: actor posts -->
	<el-dialog v-model="card_dialog.is_show_posts" title="Posts">
		<Posts v-if="card_dialog.is_show_posts" :actor="actor" @comment="onPostComment" />
	</el-dialog>
	<!-- dialog: actor logs -->
	<el-dialog v-model="card_dialog.is_show_logs" :title="actor.actor_name">
		<ActorLogs v-if="card_dialog.is_show_logs" :specific_actor_id="actor.actor_id" />
	</el-dialog>
	<!-- dialog: actor file info -->
	<el-dialog v-model="card_dialog.is_show_file_info" :title="actor.actor_name">
		<ActorFileInfoTabs v-if="card_dialog.is_show_file_info" :actor="actor" @download="toDownloadFromFileInfo"
			@file="refreshFileInfos" />
	</el-dialog>
	<!-- dialog: actor post info -->
	<el-dialog v-model="card_dialog.is_show_post_info" :title="actor.actor_name">
		<ActorPostInfoTabs v-if="card_dialog.is_show_post_info" :actor="actor"
			@close="closeDialog(EActorDialog.post_info)" />
	</el-dialog>
	<!-- dialog: actor folders -->
	<el-dialog v-model="card_dialog.is_show_folders" :title="actor.actor_name">
		<FavFolderSelector v-if="card_dialog.is_show_folders" :selected_folder_ids="actor.folder_ids"
			@select="onActorFolderChange" />
	</el-dialog>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import { ActorData } from "../data/ActorData";
import {
	ChangeActorTag,
	changeActorGroup,
	openActorFolder,
	changeActorRemark,
	getActorFileInfo,
	changeActorScore,
	clearActorFolder,
	resetActorPosts,
	getLinkedActorGroupIds,
	changeActorComment,
	getActorVideoInfo
} from "../ctrls/ActorCtrl";
import { ActorTagStore } from "../store/ActorTagStore";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagChooser from "./ActorTagChooser.vue";
import RemarkEditor from "./RemarkEditor.vue";
import Posts from "./Posts.vue";
import ActorLogs from "./ActorLogs.vue";
import { ActorElement } from "../data/ArrayElement";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { Popper_Styles } from "../data/Consts";
import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { ActorFileDetail } from "../data/FileInfo";
import { ActorCardDialog, EActorDialog } from "../data/ActorCardDialog";
import ActorFileInfoTabs from "./ActorFileInfoTabs.vue";
import { FavFolderStore } from "../store/FavFolderStore";
import { addActorToFolder, delActorFromFolder } from "../ctrls/FolderCtrl";
import FavFolderSelector from "./FavFolderSelector.vue";
import { ECardRefresh, EConfirmOp } from "../data/Enums";
import MyRate from "./MyRate.vue";
import { LogMessages } from "../data/Messages";
import ActorPostInfoTabs from "./ActorPostInfoTabs.vue";

// emits
const emit = defineEmits(['refresh', 'download', 'friend', 'update'])
// stores/routers
const actorGroupStore = ActorGroupStore()
const actorTagStore = ActorTagStore()
const favFolderStore = FavFolderStore()
const actorFilterStore = ActorFilterStore()
// props/models
const props = defineProps({
	actor_data: {
		type: ActorElement,
		required: true
	},
	locked: {
		type: Boolean,
		required: true
	},
	show_select: {
		type: Boolean,
		required: true
	}
})
// variables
const is_show_op = ref(false)
const card_dialog = ref(new ActorCardDialog())
const linked_group_ids = ref<number[]>([])
const edit_score = ref(0)
// computed
const actor = computed(() => props.actor_data.data)
const actor_id = computed(() => actor.value.actor_id)
const has_tag = computed(() => actor.value.tag_ids.length > 0)
const group_abstract = computed(() => actor.value.group_abstract)
const group_color_style = computed(() => ({ 'color': group_abstract.value.group_color }))
const group_color_popper_style = computed(() => Popper_Styles.withColor(group_abstract.value.group_color))
const has_folder = computed(() => group_abstract.value.has_folder)
const is_video_all = computed(() => has_folder.value && actor.value.is_video_all)
const is_downing = computed(() => actorFilterStore.is_downing(actor_id.value))
const show_downloading = computed(() => !is_video_all.value && !is_downing.value && actor.value.has_downloading)
const fav_fodlers_str = computed(() => actor.value.folder_ids.map(folder_id => favFolderStore.getName(folder_id)).join(', '))
// watch
// methods

function onActorRefreshed() {
	//cache group abstract
	let group_id = actor.value.actor_group_id
	let group = actorGroupStore.get(group_id)
	actor.value.group_abstract = group.abstract()
	//sort tags
	actor.value.sortTags(actorTagStore.compareTagId)
	//get linked groups
	getLinkedGroups()
	//get file info
	getFileInfo()
	//get video infos
	getVideoInfos()
}

function refreshFileInfos() {
	getFileInfo()
	getVideoInfos()
}

async function getVideoInfos() {
	//TODO group增加一个bool项，显示视频信息， 只有Good组为True
	if (!group_abstract.value.show_video_info) {
		return
	}
	const [ok, video_infos] = await getActorVideoInfo(actor_id.value)
	if (ok) {
		actor.value.video_infos = video_infos
	}
}

function getGroupColorStyle(group_id: number) {
	let group = actorGroupStore.get(group_id)
	return { 'color': group.group_color }
}

function onRecvActorMsg(actor: ActorData) {
	props.actor_data.data = actor
	onActorRefreshed()
}

function onShowScore() {
	edit_score.value = actor.value.show_score
}

function hideOp() {
	is_show_op.value = false
}

function gotoActorPage() {
	hideOp()
	window.open(actor.value.href, '_blank', 'noreferrer');
}
function openFolder() {
	hideOp()
	openActorFolder(actor_id.value)
}
async function clearFolder() {
	hideOp()
	await confirmOp(EConfirmOp.ClearActorFolder, async () => {
		const [ok, file_info] = await clearActorFolder(actor_id.value)
		if (ok) {
			setFileInfo(file_info)
			logInfo(LogMessages.ClearFolder())
		}
	})
}
async function resetPosts() {
	hideOp()
	await confirmOp(EConfirmOp.ResetPosts, async () => {
		const [ok, file_info] = await resetActorPosts(actor_id.value)
		if (ok) {
			actor.value.has_last_post_id = false
			setFileInfo(file_info)
			logInfo(LogMessages.ResetPosts())
		}
	})
}
async function setActorGroup() {
	const [ok, ar] = await changeActorGroup(actor_id.value, actor.value.actor_group_id)
	if (ok) {
		onRecvActorMsg(ar)
		let group_name = actorGroupStore.getName(actor.value.actor_group_id)
		logInfo(LogMessages.ActorChangeGroup(actor.value.actor_name, group_name))
		emit('refresh', actor_id, ECardRefresh.Group)
	}
}
function startEditTag() {
	showDialog(EActorDialog.tags)
}
function clearRecentTags() {
	actorTagStore.clearHistory()
}
async function onApplyTag(tag_id: number) {
	await onSubmitTag([tag_id])
}
async function onSubmitTag(new_tag_list: number[]) {
	closeDialog(EActorDialog.tags)
	if (new_tag_list.length > 0) {
		actorTagStore.addRecord(new_tag_list)
	}
	//request
	const [ok, actor_map] = await ChangeActorTag(actor_id.value, new_tag_list)
	if (ok) {
		emit('update', actor_map)
	}
}
async function onCancelAddTag() {
	closeDialog(EActorDialog.tags)
}

function toDownloadFromOp() {
	hideOp()
	emit('download', props.actor_data)
}

function toDownloadFromFileInfo() {
	closeDialog(EActorDialog.file_info)
	emit('download', props.actor_data)
}

function showDialog(type: EActorDialog) {
	hideOp()
	card_dialog.value.showDialog(type)
}

function closeDialog(type: EActorDialog) {
	card_dialog.value.closeDialog(type)
}

async function changeScore() {
	const [ok, actor_map] = await changeActorScore(actor_id.value, edit_score.value * 2)
	if (ok) {
		logInfo(LogMessages.ActorChangeScore())
		emit('update', actor_map)
	}
}
async function findLinkedActor() {
	emit('friend', props.actor_data)
}
function onSelectCLick() {
	props.actor_data.selected = !props.actor_data.selected
}
function startEditRemark() {
	showDialog(EActorDialog.remark)
}
async function onSubmitRemark(new_remark: string) {
	// closeDialog(EActorDialog.remark)
	if (new_remark == actor.value.remark) {
		return
	}
	const [ok, actor_map] = await changeActorRemark(actor_id.value, new_remark)
	if (ok) {
		logInfo(LogMessages.ActorChangeRemark())
		emit('update', actor_map)
	}
}
async function onSubmitComment(new_comment: string) {
	// closeDialog(EActorDialog.remark)
	if (new_comment == actor.value.comment) {
		return
	}
	const [ok, ar] = await changeActorComment(actor_id.value, new_comment)
	if (ok) {
		onRecvActorMsg(ar)
		logInfo(LogMessages.ActorChangeComment())
		emit('refresh', actor_id, ECardRefresh.Comment)
	}
}
function onPostComment(a_id: number, post_id: string, comment: string) {
	if (a_id == actor_id.value) {
		actor.value.refreshPostComment(post_id, comment)
	} else {
		// I'm too lazy to notify other actors
	}
}
async function getFileInfo() {
	const [ok, file_info] = await getActorFileInfo(actor_id.value)
	if (ok) {
		setFileInfo(file_info)
	}
}
function setFileInfo(file_info: ActorFileDetail) {
	actor.value.file_info = file_info
}
async function getLinkedGroups() {
	if (!actor.value.is_linked) {
		return
	}
	const [ok, gids] = await getLinkedActorGroupIds(actor_id.value)
	if (ok) {
		linked_group_ids.value = gids as number[]
	}
}

async function showFolders() {
	showDialog(EActorDialog.folders)
}

async function onActorFolderChange(folder_id: number) {
	closeDialog(EActorDialog.folders)
	const folder_index = actor.value.folder_ids.indexOf(folder_id)
	if (folder_index != -1) {
		const [ok, _] = await delActorFromFolder(actor_id.value, folder_id)
		if (ok) {
			actor.value.folder_ids.splice(folder_index, 1)
			logInfo(LogMessages.DelActorFromFolder())
		}
	} else {
		const [ok, _] = await addActorToFolder(actor_id.value, folder_id)
		if (ok) {
			actor.value.folder_ids.push(folder_id)
			logInfo(LogMessages.AddActorToFolder())
		}
	}
}

// lifecycle
onMounted(() => {
	onActorRefreshed()
})
</script>

<style scoped>
.pop-remark {
	font-size: var(--el-font-size-large);
}

.actor_name_text {
	font-size: var(--el-font-size-extra-large);
	text-align: center;
}

.actor_name_line {
	height: 32px;
	background-color: #000000a0;
}

.remark-icon {
	position: relative;
	width: var(--avatar-bottom-height);
	height: var(--avatar-bottom-height);
}

.fav-container {
	position: relative;
	width: var(--avatar-bottom-height);
	height: var(--avatar-bottom-height);
}

.fav-icon {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.fav-number {
	position: absolute;
	top: 2px;
	left: 0;
	right: 0;
	bottom: 0;
}

.fav-number-text {
	text-align: center;
	font-size: var(--el-font-size-large);
	/* Size of the number */
	color: whitesmoke;
	/* Color of the number */
}

.post_count {
	color: var(--el-text-color-regular);
	font-size: var(--el-font-size-base);
	text-decoration: underline;
	text-align: center;
}

.thumbnail_count {
	/* color: var(--el-text-color-regular); */
	font-size: var(--el-font-size-base);
	text-align: center;
}

.actor_card {
	--avatar-size: 194px;
	--avatar-margin: 10px;
	--avatar-bottom-height: 32px;

	position: relative;
	border: 1px solid;
	padding: 2px;
	box-shadow: 2px 2px;
	background-color: var(--el-card-bg-color);
	width: calc(var(--avatar-size) + 2 * var(--avatar-margin) + 6px);
	/* 6px = 2*(2padding+1border) */
}

.avatar {
	position: relative;
	height: var(--avatar-size);
	margin-top: var(--avatar-margin);
}

.avatar-img {
	width: var(--avatar-size);
	height: var(--avatar-size);
	position: absolute;
	top: 0;
	left: var(--avatar-margin);
}

.avatar-bottom-container {
	position: absolute;
	bottom: 0;
	left: var(--avatar-margin);
	right: var(--avatar-margin);
	height: var(--avatar-bottom-height);
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.avatar-lock {
	position: absolute;
	top: -35px;
	left: 50%;
	transform: translateX(-50%);
}

.avatar-select {
	position: absolute;
	top: 0;
	right: var(--avatar-margin);
}

.avatar-platform {
	position: absolute;
	top: 0;
	right: 20px;

	font-size: 18px;
	font-style: italic;
	color: darkorange;

	text-shadow: 1px 1px lightcoral;
}

.avatar-friend-container {
	position: absolute;
	top: 0;
	left: var(--avatar-margin);
}

.pop-button {
	width: 126px;
	height: 32px;
}

.res_info {
	text-align: right;
	text-wrap: nowrap;
	font-size: 16px;
}

.tag_history_row {
	border: 1px solid;
	padding: 4px;
}
</style>