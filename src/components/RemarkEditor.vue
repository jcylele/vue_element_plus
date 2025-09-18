<template>
	<el-space direction="vertical" fill>
		<el-space :class="remark_edit_info.config.root_class" direction="vertical" alignment="start" size="small" fill>
			<el-space direction="horizontal" alignment="flex-end">
				<el-text class="rc-title bold-text this-color">
					{{ remark_edit_info.config.title }}
				</el-text>
				<svg-icon v-if="!remark_edit_info.is_editing" name="edit" class="this-color" size="30px"
					@click="onEditClick(remark_edit_info)" />
				<svg-icon v-if="remark_edit_info.is_editing" name="completed" class="this-color" size="32px"
					@click="onSubmitClick(remark_edit_info)" />
				<svg-icon v-if="remark_edit_info.is_editing" name="close" class="this-color" size="32px"
					@click="onCancelClick(remark_edit_info)" />
			</el-space>
			<el-input v-if="remark_edit_info.is_editing" v-model="remark_edit_info.data" class="rc-input"
				type="textarea" autosize />
			<el-text v-else class="rc-text multi-line-text">{{ remark_edit_info.data }}</el-text>
			<el-divider style="margin: 2px" />
		</el-space>
		<el-space :class="comment_edit_info.config.root_class" direction="vertical" alignment="start" size="small" fill>
			<div class="split-row">
				<el-space direction="horizontal" alignment="flex-end">
					<el-text class="rc-title bold-text this-color">
						{{ comment_edit_info.config.title }}
					</el-text>
					<svg-icon v-if="!comment_edit_info.is_editing" name="edit" class="this-color" size="30px"
						@click="onEditClick(comment_edit_info)" />
					<svg-icon v-if="comment_edit_info.is_editing" name="completed" class="this-color" size="32px"
						@click="onSubmitClick(comment_edit_info)" />
					<svg-icon v-if="comment_edit_info.is_editing" name="close" class="this-color" size="32px"
						@click="onCancelClick(comment_edit_info)" />
				</el-space>
				<el-select placeholder="common used" @change="onSelectComment" placement="bottom-end"
					style="width: 180px;">
					<template v-if="comment_edit_info.data" #header>
						<el-button size="small" type="primary" @click="onSelectComment('')" plain>
							Remove
						</el-button>
					</template>
					<el-option v-for="comment in common_comments" :key="comment.comment" :label="comment.comment"
						:value="comment.comment">
						<span style="float: left">{{ comment.count > 1 ? `${comment.comment} (${comment.count})` :
							comment.comment }}</span>
					</el-option>
				</el-select>
			</div>
			<el-input v-if="comment_edit_info.is_editing" v-model="comment_edit_info.data" class="rc-input"
				type="textarea" autosize />
			<el-text v-else class="rc-text multi-line-text">{{ comment_edit_info.data }}</el-text>
			<el-divider style="margin: 2px" />
		</el-space>
		<el-space direction="horizontal">
			<el-button type="primary" @click="toPosts" plain>
				Edit Posts
			</el-button>
		</el-space>
		<el-space v-if="actor.commented_posts.length == 0" direction="horizontal">
			<el-text class="post-comment">
				No Commented Post Yet
			</el-text>
		</el-space>
		<div class="left-column">
			<div v-for="post in actor.commented_posts" class="left-column" style="gap: 0;">
				<span class="post-id">
					{{ post.post_id }}
				</span>
				<span class="post-comment multi-line-text">
					{{ post.comment }}
				</span>
			</div>
		</div>

	</el-space>
</template>

<script lang="ts">

import { getComments } from "../ctrls/ActorCtrl";
import ActorData from "../data/ActorData";
import { DescEditInfo, EditType } from "../data/DescEditInfo";
import { ICommentCount } from "../data/SchemasOthers";

export default {
	name: "RemarkEditor",
	props: {
		actor: {
			type: ActorData,
			required: true,
		},
	},
	emits: ["remark", "comment", "posts"],
	data() {
		return {
			common_comments: [] as ICommentCount[],
			remark_edit_info: new DescEditInfo(EditType.REMARK),
			comment_edit_info: new DescEditInfo(EditType.COMMENT),
		}
	},
	methods: {
		onSelectComment(new_comment: string) {
			this.comment_edit_info.data = new_comment
			this.comment_edit_info.is_editing = true
		},
		removeComment() {
			this.comment_edit_info.data = ""
			this.$emit("comment", "")
		},
		onEditClick(edit_info: DescEditInfo) {
			edit_info.startEdit()
		},
		onSubmitClick(edit_info: DescEditInfo) {
			if (edit_info.edit_id === EditType.REMARK) {
				this.$emit("remark", edit_info.data)
			} else {
				this.$emit("comment", edit_info.data)
			}
		},
		onCancelClick(edit_info: DescEditInfo) {
			edit_info.reset(this.actor)
		},
		toPosts() {
			this.$emit("posts")
		},

		resetAllEdit() {
			this.remark_edit_info.reset(this.actor)
			this.comment_edit_info.reset(this.actor)
		},

		async refreshCommonComments() {
			const [ok, comments] = await getComments()
			if (ok) {
				this.common_comments = comments
			}
		}
	},
	watch: {
		actor: {
			handler() {
				this.resetAllEdit()
			},
		}
	},
	mounted() {
		this.resetAllEdit()
		this.refreshCommonComments()
	}
}
</script>

<style scoped>
.remark-root {
	--this-color: var(--me-remark-color);
}

.comment-root {
	--this-color: var(--me-comment-color);
}

.this-color {
	color: var(--this-color);
}

.rc-title {
	font-size: var(--el-font-size-extra-large);
	/* width: 210px; */
}

.rc-text {
	font-size: var(--el-font-size-large);
	color: var(--this-color);
	overflow-wrap: break-word;
	/* copy from rc-input and textarea */
	padding: 5px 11px;
	background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
	width: var(--me-remark-width);
	min-height: 34px;
	/* 34px = 24px + 2*5px */
}

.rc-input {
	font-size: var(--el-font-size-large);
	--el-input-text-color: var(--this-color);
	width: var(--me-remark-width);
}

.post-id {
	font-size: var(--el-font-size-large);
}

.post-comment {
	color: var(--me-post-color);
	font-size: var(--el-font-size-large);
	max-width: var(--me-remark-width);
}
</style>