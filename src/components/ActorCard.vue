<template>
	<el-space direction="vertical" class="actor_card" alignment="stretch" :size="3" :key="actor.uuid"
		:style="{ 'color': group_color }">

		<!-- actor avatar -->
		<div class="avatar">
			<el-tooltip v-if="actor.has_remark" placement="top" :offset="3" effect="light">
				<template #content>
					<el-space direction="vertical" size="small" style="min-width: 210px; max-width: 420px;" fill>
						<el-text v-if="actor.remark" style="font-size: 20px;color: hotpink; white-space: pre-wrap;">
							{{ actor.remark }}
						</el-text>
						<el-text v-if="actor.comment" style="font-size: 20px;color: pink; white-space: pre-wrap;">
							{{ actor.comment }}
						</el-text>
						<el-text v-for="post in actor.commented_posts" style="font-size: 18px;color: royalblue;">
							· {{ post.comment }}
						</el-text>
					</el-space>
				</template>
				<el-image class="avatar-img" :src="actor.icon" />
			</el-tooltip>
			<el-image v-else class="avatar-img" :src="actor.icon" />

			<el-text class="avatar-platform">
				{{ actor.actor_platform }}
			</el-text>

			<svg-icon v-if="actor.is_linked" size="40px" name="avatar" class="avatar-friend" @click="findLinkedActor" />

			<div v-if="linked_group_ids.length > 1" class="avatar-group center-row">
				<svg-icon v-for="group_id in linked_group_ids" size="10px" name="circle"
					:style="{ 'color': getGroupColor(group_id) }" />
			</div>


			<svg-icon v-if="locked" size="40px" name="locked" class="avatar-lock" />

			<svg-icon v-if="show_select" size="40px" :name="actor_data.selected ? 'completed' : 'remove'"
				class="avatar-select" @click="onSelectCLick" />
			<!-- Stars -->
			<el-rate class="avatar-rate" v-model="actor.show_score" @change="changeScore" :colors="star_colors"
				void-color="#777777" :max="6" allow-half />
		</div>

		<!-- actor name, click to open menu items -->
		<!-- downloading related icons -->
		<div class="actor_name_line center-row">
			<el-popover trigger="click" placement="top" v-model:visible="is_show_op"
				:popper-style="{ 'border-color': group_color, 'width': 'auto' }" :offset="6">
				<template #reference>
					<el-text class="actor_name actor_name_text hint-selectable" tag="a" :style="{ 'color': group_color }" truncated>
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
						<el-space direction="horizontal" v-if="hasFolder()">
							<el-button class="pop-button" type="warning" @click="resetPosts">
								Reset Posts
							</el-button>
							<el-button class="pop-button" type="warning" @click="clearFolder">
								Clear Folder
							</el-button>
						</el-space>
						<el-space direction="horizontal" v-if="hasFolder()">
							<el-button class="pop-button" type="success" @click="toDownloadFromOp" v-if="hasFolder()">
								Download
							</el-button>
							<el-button class="pop-button" type="success" @click="openFolder" v-if="hasFolder()">
								Open Folder
							</el-button>
						</el-space>
					</el-space>
				</template>
			</el-popover>
			<!-- fav folder -->
			<div class="fav-container" @click="showFolders">
				<svg-icon name="star_empty" class="fav-item"
					:style="{ 'color': actor.in_fav_folder ? 'gold' : 'gray' }" />
				<span class="fav-number fav-item" v-if="actor.in_fav_folder">{{ actor.fav_count }}</span>
			</div>
		</div>

		<!-- actor post info -->
		<el-space direction="vertical" v-if="actor.file_info" style="gap: 1px 0" fill>
			<div class="post_line center-row">
				<el-text class="post_count hint-selectable" tag="ins" @click="showFileInfo">
					{{ actor.post_desc }}
				</el-text>
				<svg-icon v-if="is_downing" name="download" style="color: deepskyblue" size="24px"
					class="blink-class" />
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
			<el-popover v-else placement="right" trigger="click"
				:popper-style="{ 'border-color': group_color, 'width': 'auto' }">
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
	<el-dialog v-model="card_dialog.is_show_remark" :title="actor.actor_name" width="720px">
		<RemarkEditor :actor="actor" @remark="onSubmitRemark" @comment="onSubmitComment" @posts="showPosts" />
	</el-dialog>
	<!-- dialog: actor tags editing dialog-->
	<el-dialog v-model="card_dialog.is_show_tags" :title="actor.actor_name" width="67%">
		<ActorTagChooser :actor="actor" @submit="onSubmitTag" @cancel="onCancelAddTag" />
	</el-dialog>
	<!-- dialog: actor posts -->
	<el-dialog v-model="card_dialog.is_show_posts" title="Posts" width=720px>
		<Posts :actor_id="actor.actor_id" :actor_name="actor.actor_name" />
	</el-dialog>
	<!-- dialog: actor video sizes chart -->
	<el-dialog v-model="card_dialog.is_show_video_sizes" :title="actor.actor_name" width=720px>
		<VideoSizesChart :actor_id="actor.actor_id" />
	</el-dialog>
	<!-- dialog: actor logs -->
	<el-dialog v-model="card_dialog.is_show_logs" :title="actor.actor_name" width=720px>
		<ActorLogs :specific_actor_id="actor.actor_id" />
	</el-dialog>
	<!-- dialog: actor file info -->
	<el-dialog v-model="card_dialog.is_show_file_info" :title="actor.actor_name" width=720px>
		<ActorFileInfoTabs :actor_id="actor.actor_id" @download="toDownloadFromFileInfo" />
	</el-dialog>
	<!-- dialog: actor folders -->
	<el-dialog v-model="card_dialog.is_show_folders" :title="actor.actor_name" width=720px>
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
import { Star_Colors } from "../data/Consts";
import { logInfo } from "../ctrls/FetchCtrl";
import { ActorFilterStore } from "../store/ActorFilterStore";
import ActorFileStats from "../data/FileInfo";
import VideoSizesChart from "./Chart/VideoSizesChart.vue";
import { ActorCardDialog, EActorDialog } from "../data/ActorCardDialog";
import ActorFileInfoTabs from "./ActorFileInfoTabs.vue";
import { FavFolderStore } from "../store/FavFolderStore";
import { addActorToFolder, delActorFromFolder } from "../ctrls/FolderCtrl";
import FavFolderSelector from "./FavFolderSelector.vue";
import { ECardRefresh } from "../data/Enums";


export default {
	name: "ActorCard",
	components: { VideoSizesChart, SvgIcon, ActorLogs, ActorTagChooser, RemarkEditor, Posts, ActorFileInfoTabs, FavFolderSelector },
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
		star_colors() {
			return Star_Colors
		},
		group_color(): string {
			let group = this.getActorGroup(this.actor_data.data.actor_group_id)
			return group.group_color
		},
		is_downing(): boolean {
			return this.is_actor_downing(this.actor_data.data.actor_id)
		},
		is_video_all(): boolean {
			return this.hasFolder() && this.actor_data.data.is_video_all
		},
	},
	// declare emitted events to parent
	emits: ['refresh', 'download', 'friend', 'update'],
	data() {
		return {
			is_show_op: false,
			card_dialog: new ActorCardDialog(),
			linked_group_ids: [],
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
			getTagBgColor: 'getBgColor',
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

		hasFolder(): boolean {
			let group = this.getActorGroupData()
			return group.has_folder
		},

		onRecvActorMsg(actor: ActorData) {
			actor.sortTags(this.compareActorTagId)
			this.actor_data.data = actor
			//
			this.getFileInfo()
			this.getLinkedGroups()
		},

		hideOp() {
			this.is_show_op = false
		},

		gotoActorPage() {
			this.hideOp()
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
				logInfo("clear folder succeed")
			}
		},
		async resetPosts() {
			this.hideOp()
			const [ok, file_info] = await resetActorPosts(this.actor.actor_id)
			if (ok) {
				this.setFileInfo(file_info)
				logInfo("reset posts succeed")
			}
		},
		async setActorGroup() {
			const [ok, ar] = await changeActorGroup(this.actor.actor_id, this.actor.actor_group_id)
			if (ok) {
				this.onRecvActorMsg(ar)
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
			if (this.hasFolder()) {
				this.showDialog(EActorDialog.file_info)
			}
		},

		async changeScore() {
			const [ok, actor_map] = await changeActorScore(this.actor.actor_id, this.actor.score)
			if (ok) {
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
				this.$emit('refresh', this.actor_data.data.actor_id, ECardRefresh.Comment)
			}
		},
		async getFileInfo() {
			const [ok, file_info] = await getActorFileInfo(this.actor.actor_id)
			if (ok) {
				this.setFileInfo(file_info)
			}
		},
		setFileInfo(file_info) {
			this.actor.file_info = new ActorFileStats(file_info)
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
					logInfo(`del actor from folder succeed`)
				}
			} else {
				const [ok, _] = await addActorToFolder(this.actor.actor_id, folder_id)
				if (ok) {
					this.actor.folder_ids.push(folder_id)
					logInfo(`add actor to folder succeed`)
				}
			}
		}
	},
}
</script>

<style scoped>
.actor_name_text {
	font-size: var(--el-font-size-extra-large);
	word-wrap: nowrap;
	text-align: center;
}

.actor_name {
	max-width: 160px;
}

.actor_name_line {
	height: 32px;
	gap: 10px;
	background-color: #000000a0;
}

.fav-container {
	position: relative;
	display: inline-block;
	/* Adjust as needed */
	width: 32px;
	height: 32px;
}

.fav-item {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.fav-number {
	text-align: center;
	font-size: var(--el-font-size-large);
	/* Size of the number */
	color: #FF007F;
	/* Color of the number */
}

.post_count {
	color: var(--el-text-color);
	text-align: center;
}

.post_line {
	gap: 5px;
}

.actor_card {
	position: relative;
	border: 1px solid;
	padding: 2px;
	box-shadow: 2px 2px;
	width: 210px;
	background-color: var(--el-card-bg-color);
}

.avatar {
	position: relative;
	/*width: 180px;*/
	height: 180px;
	margin-top: 15px;
}

.avatar-img {
	width: 180px;
	height: 180px;
	position: absolute;
	top: 0;
	left: 15px;
}

.avatar-rate {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
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
	right: 15px;
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

.avatar-friend {
	position: absolute;
	top: 0;
	left: 15px;
}

.avatar-group {
	position: absolute;
	top: 37px;
	left: 5px;

	width: 60px;
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