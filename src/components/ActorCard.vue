<template>
	<el-space direction="vertical" class="actor_card" alignment="stretch" style="gap:3px;" :key="actor.uuid"
		:style="{ 'color': group_color }">
		<!-- actor avatar -->
		<div class="avatar">
			<el-tooltip v-if="actor.has_remark" placement="top" :offset="3" effect="light"
				:popper-style="{ 'max-width': 'var(--me-remark-width)' }">
				<template #content>
					<el-space direction="vertical" size="small" fill>
						<el-text v-if="actor.remark" class="pop-remark remark-color multi-line-text">
							{{ actor.remark }}
						</el-text>
						<el-text v-if="actor.comment" class="pop-remark comment-color multi-line-text">
							{{ actor.comment }}
						</el-text>
						<el-text v-for="post in actor.commented_posts" class="pop-remark post-color multi-line-text">
							* {{ post.comment }}
						</el-text>
					</el-space>
				</template>
				<el-image class="avatar-img" :src="actor.icon_url" />
			</el-tooltip>
			<el-image v-else class="avatar-img" :src="actor.icon_url" />

			<el-text class="avatar-platform">
				{{ actor.actor_platform }}
			</el-text>

			<div v-if="actor.is_linked" class="avatar-friend-container center-column" style="gap: 0"
				@click="findLinkedActor">
				<svg-icon size="40px" name="avatar" :style="{ 'color': group_color }" />
				<div v-if="linked_group_ids.length > 1" class="center-row wrap"
					style="gap: 2px;max-width: 40px;">
					<svg-icon v-for="group_id in linked_group_ids" size="10px" name="circle"
						:style="{ 'color': getGroupColor(group_id) }" />
				</div>
			</div>

			<svg-icon v-if="locked" size="40px" name="locked" class="avatar-lock" />

			<svg-icon v-if="show_select" size="40px" :name="actor_data.selected ? 'completed' : 'remove'"
				class="avatar-select" @click="onSelectCLick" />

			<div class="avatar-bottom-container center-row" style="gap: 0;">
				<!-- fav folder -->
				<div class="fav-container" @click="showFolders">
					<svg-icon name="heart" class="fav-icon"
						:class="actor.in_fav_folder ? 'remark-color' : 'comment-color'" />
					<span class="fav-number fav-number-text logic-transparent" v-if="actor.in_fav_folder">{{
						actor.fav_count
					}}</span>
				</div>
				<!-- Stars -->
				<el-popover placement="top" trigger="click" :offset="-2" :show-arrow="false"
					:popper-style="popper_style.withColor(group_color)" @show="onShowScore">
					<template #reference>
						<div class="hint-selectable">
							<MyRate :model-value="actor.show_score" size="default" style="align-items: end;" disabled
								class="logic-transparent" />
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
				:popper-style="popper_style.withColor(group_color)" :offset="6">
				<template #reference>
					<el-text class="actor_name_text hint-selectable" tag="a" :style="{ 'color': group_color }">
						{{ actor.actor_name }}
					</el-text>
				</template>
				<template #default>
					<el-space direction="vertical" alignment="center">
						<el-text class="actor_name_text" :style="{ 'color': group_color }">
							{{ actor.actor_name }}
						</el-text>
						<el-space direction="horizontal">
							<el-button class="pop-button" type="primary" @click="showLogs">
								Show Logs
							</el-button>
							<el-button class="pop-button" type="primary" @click="gotoActorPage">
								Go To Page
							</el-button>
						</el-space>
						<el-space direction="horizontal" v-if="has_folder">
							<el-button class="pop-button" type="warning" @click="resetPosts">
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
			<div class="center-row">
				<el-text class="post_count hint-selectable" tag="ins" @click="showFileInfo">
					{{ actor.post_desc }}
				</el-text>
				<svg-icon v-if="is_downing" name="download" style="color: deepskyblue" size="24px" />
				<svg-icon v-if="is_video_all" name="file_checked" style="color: orange" size="24px" />
			</div>

			<!-- actor res info -->
			<el-space v-for="res_file_info in actor.file_info.res_info" size="small" direction="horizontal">
				<el-text v-for="i in res_file_info.col_count" class="res_info"
					:style="{ 'color': res_file_info.res_state_color }">
					{{ res_file_info.col_val(i) }}
				</el-text>
			</el-space>
		</el-space>
		<el-text v-else style="font-size: 16px;font-style: italic">
			loading file info
		</el-text>

		<!--actor remark + group + edit button -->
		<div style="display: flex;flex-direction: row;align-items: stretch;gap: 0 5px">
			<!-- actor remark -->
			<svg-icon :name="actor.has_remark ? 'remark' : 'remark_empty'" @click="startEditRemark" size="32px" />
			<!-- actor group -->
			<el-select v-model="actor.actor_group_id" @change="setActorGroup" placement="right" style="flex-grow: 1">
				<el-option v-for="group in group_list" :label="group.group_name" :value="group.group_id"
					:style="{ 'color': group.group_color, 'text-decoration': 'underline' }">
					{{ group.group_name }}
				</el-option>
			</el-select>
			<!-- click to edit tags -->
			<svg-icon v-if="has_tag" size="32px" name="edit" @click="startEditTag" />
			<el-popover v-else placement="right" trigger="click" :popper-style="popper_style.withColor(group_color)">
				<template #reference>
					<svg-icon size="32px" name="edit" />
				</template>
				<el-space direction="vertical" size="small" fill>
					<el-text style="font-style: italic">
						click to apply single tag to actor
					</el-text>
					<el-space v-for="tag_ids in tag_history" size="small" class="tag_history_row">
						<el-tag v-for="tag_id in tag_ids" @click="onApplyTag(tag_id)" :style="getTagStyle(tag_id)"
							effect="plain" round>
							{{ getTagName(tag_id) }}
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
			<el-tag v-for="tag_id in actor.tag_ids" :style="getTagStyle(tag_id)" effect="plain" round>
				{{ getTagName(tag_id) }}
			</el-tag>
		</el-space>
	</el-space>
	<!-- dialog: actor remark editing-->
	<el-dialog v-model="card_dialog.is_show_remark" :title="actor.actor_name">
		<RemarkEditor :actor="actor" @remark="onSubmitRemark" @comment="onSubmitComment" @posts="showPosts" />
	</el-dialog>
	<!-- dialog: actor tags editing dialog-->
	<el-dialog v-model="card_dialog.is_show_tags" :title="actor.actor_name">
		<ActorTagChooser :actor="actor" @submit="onSubmitTag" @cancel="onCancelAddTag" />
	</el-dialog>
	<!-- dialog: actor posts -->
	<el-dialog v-model="card_dialog.is_show_posts" title="Posts">
		<Posts :actor="actor" @comment="onPostComment" />
	</el-dialog>
	<!-- dialog: actor logs -->
	<el-dialog v-model="card_dialog.is_show_logs" :title="actor.actor_name">
		<ActorLogs :specific_actor_id="actor.actor_id" />
	</el-dialog>
	<!-- dialog: actor file info -->
	<el-dialog v-model="card_dialog.is_show_file_info" :title="actor.actor_name">
		<ActorFileInfoTabs :actor_id="actor.actor_id" :has_folder="has_folder" @download="toDownloadFromFileInfo"
			@close="closeFileInfo" />
	</el-dialog>
	<!-- dialog: actor folders -->
	<el-dialog v-model="card_dialog.is_show_folders" :title="actor.actor_name">
		<FavFolderSelector :selected_folder_ids="actor.folder_ids" @select="onActorFolderChange" />
	</el-dialog>
</template>

<script lang="ts">
import ActorData from "../data/ActorData";
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
	changeActorComment
} from "../ctrls/ActorCtrl";
import { mapActions, mapState } from "pinia";
import { ActorTagStore } from "../store/ActorTagStore";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagChooser from "./ActorTagChooser.vue";
import RemarkEditor from "./RemarkEditor.vue";
import Posts from "./Posts.vue";
import ActorLogs from "./ActorLogs.vue";
import { ActorElement } from "../data/ArrayElement";
import { ActorGroupStore } from "../store/ActorGroupStore";
import ActorGroupData from "../data/ActorGroupData";
import { Popper_Styles } from "../data/Consts";
import { logInfo } from "../ctrls/FetchCtrl";
import { ActorFilterStore } from "../store/ActorFilterStore";
import ActorFileDetail from "../data/FileInfo";
import { ActorCardDialog, EActorDialog } from "../data/ActorCardDialog";
import ActorFileInfoTabs from "./ActorFileInfoTabs.vue";
import { FavFolderStore } from "../store/FavFolderStore";
import { addActorToFolder, delActorFromFolder } from "../ctrls/FolderCtrl";
import FavFolderSelector from "./FavFolderSelector.vue";
import { ECardRefresh } from "../data/Enums";
import MyRate from "./MyRate.vue";
import { LogMessages } from "../data/Messages";


export default {
	name: "ActorCard",
	components: { SvgIcon, ActorLogs, ActorTagChooser, RemarkEditor, Posts, ActorFileInfoTabs, FavFolderSelector, MyRate },
	// props from parent
	props: {
		actor_data: ActorElement,
		locked: Boolean,
		show_select: Boolean
	},
	computed: {
		...mapState(ActorGroupStore, { group_list: 'sorted_list' }),
		...mapState(ActorTagStore, {
			tag_history: 'tag_history',
		}),
		...mapState(FavFolderStore, {
			fav_folder_list: 'sorted_list',
		}),
		actor(): ActorData {
			return this.actor_data.data
		},
		has_tag(): boolean {
			return this.actor_data.data.tag_ids.length > 0
		},
		popper_style(): any {
			return Popper_Styles
		},
		group_color(): string {
			let group = this.getActorGroup(this.actor_data.data.actor_group_id)
			return group.group_color
		},
		is_downing(): boolean {
			return this.is_actor_downing(this.actor_data.data.actor_id)
		},
		is_video_all(): boolean {
			return this.has_folder && this.actor_data.data.is_video_all
		},
		has_folder(): boolean {
			let group = this.getActorGroupData()
			return group.has_folder
		},
	},
	// declare emitted events to parent
	emits: ['refresh', 'download', 'friend', 'update'],
	data() {
		return {
			is_show_op: false,
			card_dialog: new ActorCardDialog(),
			linked_group_ids: [],
			edit_score: 0,
		}
	},
	mounted() {
		// console.log(`mounted[${this.actor_data.id}]: ${this.actor.actor_name}`)
		this.actor.sortTags(this.compareActorTagId)
		this.getFileInfo()
		this.getLinkedGroups()
	},
	methods: {
		...mapActions(ActorTagStore, {
			compareActorTagId: 'compareTagId',
			getTagStyle: 'getStyle',
			getTagName: 'getName',
			addTagRecord: 'addRecord',
			clearTagHistory: 'clearHistory',
		}),

		...mapActions(ActorGroupStore, {
			getActorGroup: 'get',
		}),

		...mapActions(ActorFilterStore, {
			is_actor_downing: "is_downing",
		}),

		getGroupColor(group_id: number): string {
			let group = this.getActorGroup(group_id)
			return group.group_color
		},

		getActorGroupData(): ActorGroupData {
			let group_id = this.actor_data.data.actor_group_id
			return this.getActorGroup(group_id)
		},

		onRecvActorMsg(actor: ActorData) {
			actor.sortTags(this.compareActorTagId)
			this.actor_data.data = actor
			//
			this.getFileInfo()
			this.getLinkedGroups()
		},

		onShowScore() {
			this.edit_score = this.actor.show_score
		},

		hideOp() {
			this.is_show_op = false
		},

		gotoActorPage() {
			this.hideOp()
			console.log(this.actor.href)
			window.open(this.actor.href, '_blank', 'noreferrer');
		},
		openFolder() {
			this.hideOp()
			openActorFolder(this.actor.actor_id)
		},
		async clearFolder() {
			this.hideOp()
			const [ok, file_info] = await clearActorFolder(this.actor.actor_id)
			if (ok) {
				this.setFileInfo(file_info)
				logInfo(LogMessages.ClearFolder())
			}
		},
		async resetPosts() {
			this.hideOp()
			const [ok, file_info] = await resetActorPosts(this.actor.actor_id)
			if (ok) {
				this.setFileInfo(file_info)
				logInfo(LogMessages.ResetPosts())
			}
		},
		async setActorGroup() {
			const [ok, ar] = await changeActorGroup(this.actor.actor_id, this.actor.actor_group_id)
			if (ok) {
				this.onRecvActorMsg(ar)
				logInfo(LogMessages.ActorChangeGroup(this.actor.actor_name))
				this.$emit('refresh', this.actor_data.data.actor_id, ECardRefresh.Group)
			}
		},
		startEditTag() {
			this.showDialog(EActorDialog.tags)
		},
		clearRecentTags() {
			this.clearTagHistory()
		},
		async onApplyTag(tag_id: number) {
			await this.onSubmitTag([tag_id])
		},
		async onSubmitTag(new_tag_list: number[]) {
			this.closeDialog(EActorDialog.tags)
			if (new_tag_list.length > 0) {
				this.addTagRecord(new_tag_list)
			}
			//request
			const [ok, actor_map] = await ChangeActorTag(this.actor.actor_id, new_tag_list)
			if (ok) {
				this.$emit('update', actor_map)
			}
		},
		async onCancelAddTag() {
			this.closeDialog(EActorDialog.tags)
		},

		toDownloadFromOp() {
			this.hideOp()
			this.$emit('download', this.actor_data)
		},

		toDownloadFromFileInfo() {
			this.closeDialog(EActorDialog.file_info)
			this.$emit('download', this.actor_data)
		},

		showDialog(type: EActorDialog) {
			this.hideOp()
			this.card_dialog.showDialog(type)
		},

		closeDialog(type: EActorDialog) {
			this.card_dialog.closeDialog(type)
		},

		showPosts() {
			this.showDialog(EActorDialog.post)
		},

		showLogs() {
			this.showDialog(EActorDialog.log)
		},

		showFileInfo() {
			this.showDialog(EActorDialog.file_info)
		},

		closeFileInfo() {
			this.closeDialog(EActorDialog.file_info)
		},

		async changeScore() {
			const [ok, actor_map] = await changeActorScore(this.actor.actor_id, this.edit_score * 2)
			if (ok) {
				logInfo(LogMessages.ActorChangeScore())
				this.$emit('update', actor_map)
			}
		},
		async findLinkedActor() {
			this.$emit('friend', this.actor_data)
		},
		onSelectCLick() {
			this.actor_data.selected = !this.actor_data.selected
		},
		startEditRemark() {
			this.showDialog(EActorDialog.remark)
		},
		async onSubmitRemark(new_remark: string) {
			// this.closeDialog(EActorDialog.remark)
			if (new_remark == this.actor.remark) {
				return
			}
			const [ok, actor_map] = await changeActorRemark(this.actor.actor_id, new_remark)
			if (ok) {
				logInfo(LogMessages.ActorChangeRemark())
				this.$emit('update', actor_map)
			}
		},
		async onSubmitComment(new_comment: string) {
			// this.closeDialog(EActorDialog.remark)
			if (new_comment == this.actor.comment) {
				return
			}
			const [ok, ar] = await changeActorComment(this.actor.actor_id, new_comment)
			if (ok) {
				this.onRecvActorMsg(ar)
				logInfo(LogMessages.ActorChangeComment())
				this.$emit('refresh', this.actor_data.data.actor_id, ECardRefresh.Comment)
			}
		},
		onPostComment(actor_id: number, post_id: string, comment: string) {
			if (actor_id == this.actor.actor_id) {
				this.actor.refreshPostComment(post_id, comment)
			} else {
				// I'm too lazy to notify other actors
			}
		},
		async getFileInfo() {
			const [ok, file_info] = await getActorFileInfo(this.actor.actor_id)
			if (ok) {
				this.setFileInfo(file_info)
			}
		},
		setFileInfo(file_info: ActorFileDetail) {
			this.actor.file_info = file_info
		},
		async getLinkedGroups() {
			if (!this.actor.is_linked) {
				return
			}
			const [ok, gids] = await getLinkedActorGroupIds(this.actor.actor_id)
			if (ok) {
				this.linked_group_ids = gids
			}
		},

		async showFolders() {
			this.showDialog(EActorDialog.folders)
		},

		async onActorFolderChange(folder_id: number) {
			this.closeDialog(EActorDialog.folders)
			const folder_index = this.actor.folder_ids.indexOf(folder_id)
			if (folder_index != -1) {
				const [ok, _] = await delActorFromFolder(this.actor.actor_id, folder_id)
				if (ok) {
					this.actor.folder_ids.splice(folder_index, 1)
					logInfo(LogMessages.DelActorFromFolder())
				}
			} else {
				const [ok, _] = await addActorToFolder(this.actor.actor_id, folder_id)
				if (ok) {
					this.actor.folder_ids.push(folder_id)
					logInfo(LogMessages.AddActorToFolder())
				}
			}
		}
	},
}
</script>

<style scoped>
.pop-remark {
	font-size: var(--el-font-size-large);
}

.actor_name_text {
	font-size: var(--el-font-size-extra-large);
	overflow-wrap: break-word;
	text-align: center;
}

.actor_name_line {
	height: 32px;
	background-color: #000000a0;
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
	color: var(--el-text-color);
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
	width: 45px;
	text-align: right;
	text-wrap: nowrap;
	font-size: 16px;
}

.tag_history_row {
	border: 1px solid;
	padding: 4px;
}
</style>