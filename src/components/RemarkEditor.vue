<template>
	<el-space direction="vertical" fill>
		<el-space v-for="edit_info in edit_info_list" :class="edit_info.root_class" direction="vertical"
			alignment="start" size="small">
			<el-space direction="horizontal" size="large" alignment="flex-end">
				<el-text class="rc-title bold-text this-color">
					{{ edit_info.title }}
				</el-text>
				<svg-icon v-if="!edit_info.is_editing" name="edit" class="this-color" size="30px"
					@click="onEditClick(edit_info.edit_id)" />
				<svg-icon v-if="edit_info.is_editing" name="completed" class="this-color" size="32px"
					@click="onSubmitClick(edit_info.edit_id)" />
				<svg-icon v-if="edit_info.is_editing" name="close" class="this-color" size="32px"
					@click="onCancelClick(edit_info.edit_id)" />
			</el-space>
			<el-input v-if="edit_info.is_editing" v-model="edit_info.data" class="rc-input" type="textarea" autosize />
			<el-text v-else class="rc-text multi-line-text">{{ edit_info.data }}</el-text>
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

import ActorData from "../data/ActorData";

enum EditType {
	REMARK = 0,
	COMMENT = 1,
}

interface IEditInfo {
	edit_id: EditType;
	title: string;
	root_class: string;
	data: string;
	is_editing: boolean;
}

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
			edit_info_list: [
				{
					edit_id: EditType.REMARK,
					title: "Remark(shared)",
					root_class: "remark-root",
					data: "",
					is_editing: false,
				},
				{
					edit_id: EditType.COMMENT,
					title: "Comment(single)",
					root_class: "comment-root",
					data: "",
					is_editing: false,
				},
			] as IEditInfo[],
		}
	},
	methods: {
		onEditClick(edit_id: EditType) {
			this.edit_info_list[edit_id].is_editing = true
		},
		onSubmitClick(edit_id: EditType) {
			if (edit_id === EditType.REMARK) {
				this.$emit("remark", this.edit_info_list[edit_id].data)
			} else {
				this.$emit("comment", this.edit_info_list[edit_id].data)
			}
		},
		onCancelClick(edit_id: EditType) {
			this.resetEdit(edit_id)
		},
		toPosts() {
			this.$emit("posts")
		},

		resetEdit(edit_id: EditType) {
			const edit_info = this.edit_info_list[edit_id]
			edit_info.data = edit_info.edit_id === EditType.REMARK ? this.actor.remark : this.actor.comment
			edit_info.is_editing = false
		},

		resetAllEdit() {
			this.edit_info_list.forEach(edit_info => {
				this.resetEdit(edit_info.edit_id)
			})
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