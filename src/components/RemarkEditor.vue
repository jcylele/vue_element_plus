<template>
	<el-space direction="vertical" fill style="width: 100%">

		<el-space v-for="edit_info in edit_info_list" direction="vertical" size="small" fill>
			<el-space direction="horizontal" size="large" alignment="flex-end">
				<el-text style="font-size: 24px;font-weight: bold; color: hotpink; width: 210px;">
					{{ edit_info.title }}
				</el-text>
				<svg-icon v-if="!edit_info.is_editing" name="edit" size="32px"
					@click="onEditClick(edit_info.edit_id)" />
				<svg-icon v-if="edit_info.is_editing" name="completed" size="32px" style="color: hotpink"
					@click="onSubmitClick(edit_info.edit_id)" />
				<svg-icon v-if="edit_info.is_editing" name="close" size="32px" style="color: hotpink"
					@click="onCancelClick(edit_info.edit_id)" />
			</el-space>
			<el-input v-if="edit_info.is_editing" v-model="edit_info.data" class="remark-input" type="textarea" autosize />
			<el-text v-else class="remark-input">{{ edit_info.data }}</el-text>
			<el-divider style="margin: 2px" />
		</el-space>
		<el-space v-if="actor.commented_posts.length == 0" direction="horizontal">
			<el-text style="font-size: 22px; color: royalblue;">
				No Commented Post
			</el-text>
		</el-space>
		<el-space v-else v-for="post in actor.commented_posts" direction="horizontal" alignment="center">
			<el-text style="font-size: 22px; color: royalblue;">
				{{ post.post_id }}: {{ post.comment }}
			</el-text>
		</el-space>
		<el-space direction="horizontal">
			<el-button type="primary" @click="toPosts" plain>
				Edit Posts
			</el-button>
		</el-space>
	</el-space>
</template>

<script lang="ts">

import ActorData from "../data/ActorData";

enum EditType {
	REMARK = 0,
	COMMENT = 1,
}

interface EditInfo {
	edit_id: EditType;
	title: string;
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
	emits: ["submit", "cancel", "posts"],
	data() {
		return {
			edit_info_list: [
				{
					edit_id: EditType.REMARK,
					title: "Remark(shared)",
					data: "",
					is_editing: false,
				},
				{
					edit_id: EditType.COMMENT,
					title: "Comment(single)",
					data: "",
					is_editing: false,
				},
			],
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
.remark-input {
	font-size: 24px;
	--el-input-text-color: hotpink;
	/* 覆盖输入框文字颜色 */
	color: hotpink;
}
</style>