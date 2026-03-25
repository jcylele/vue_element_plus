<template>
	<div class="fill-column">
		<div class="remark-root fill-column">
			<div class="left-row bottom">
				<span class="rc-title bold-text this-color">
					Remark(shared)
				</span>
				<svg-icon v-if="!remark_edit_info.is_editing" name="edit" class="this-color" size="30px"
					@click="onEditClick(remark_edit_info)" />
				<svg-icon v-if="!remark_edit_info.is_editing" name="remove" class="this-color" size="30px"
					@click="onRemoveClick(remark_edit_info)" />
				<svg-icon v-if="remark_edit_info.is_editing" name="completed" class="this-color" size="32px"
					@click="onSubmitClick(remark_edit_info)" />
				<svg-icon v-if="remark_edit_info.is_editing" name="close" class="this-color" size="32px"
					@click="onCancelClick(remark_edit_info)" />
			</div>
			<el-input v-if="remark_edit_info.is_editing" v-model="remark_edit_info.data" class="rc-input"
				type="textarea" autosize />
			<span v-else class="rc-text multi-line-text">{{ remark_edit_info.data }}</span>
		</div>
		<el-divider style="margin: 2px" />
		<div class="comment-root fill-column">
			<div class="split-row">
				<div class="left-row bottom">
					<span class="rc-title bold-text this-color">
						Comment(single)
					</span>
					<svg-icon v-if="!comment_edit_info.is_editing" name="edit" class="this-color" size="30px"
						@click="onEditClick(comment_edit_info)" />
					<svg-icon v-if="!comment_edit_info.is_editing" name="remove" class="this-color" size="30px"
						@click="onRemoveClick(comment_edit_info)" />
					<svg-icon v-if="comment_edit_info.is_editing" name="completed" class="this-color" size="32px"
						@click="onSubmitClick(comment_edit_info)" />
					<svg-icon v-if="comment_edit_info.is_editing" name="close" class="this-color" size="32px"
						@click="onCancelClick(comment_edit_info)" />
				</div>
				<el-select placeholder="common used" @change="onSelectComment" placement="bottom-end"
					style="width: 180px;">
					<el-option v-for="comment in common_comments" :key="comment.comment" :label="comment.comment"
						:value="comment.comment">
						<span style="float: left">{{ comment.count > 1 ? `${comment.comment} (${comment.count})` :
							comment.comment }}</span>
					</el-option>
				</el-select>
			</div>
			<el-input v-if="comment_edit_info.is_editing" v-model="comment_edit_info.data" class="rc-input"
				type="textarea" autosize />
			<span v-else class="rc-text multi-line-text">{{ comment_edit_info.data }}</span>
		</div>
		<el-divider style="margin: 2px" />
		<div class="left-row">
			<el-button type="primary" @click="toPosts" plain>
				Edit Posts
			</el-button>
		</div>
		<div v-if="actor.commented_posts.length == 0" class="left-row">
			<span class="post-comment">
				No Commented Post Yet
			</span>
		</div>
		<div class="left-column">
			<div v-for="post in actor.commented_posts" class="left-column no-gap">
				<span class="post-id">
					{{ post.post_id }}
				</span>
				<span class="post-comment multi-line-text">
					{{ post.comment }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import { onMounted, ref } from "vue";
import { getComments } from "../ctrls/ActorCtrl";
import { ActorData } from "../data/ActorData";
import { DescEditInfo, EditType } from "../data/DescEditInfo";
import { ICommentCount } from "../data/SchemasOthers";
// emits
const emit = defineEmits(["remark", "comment", "posts"])
// stores/routers
// props/models
const props = defineProps({
	actor: {
		type: ActorData,
		required: true,
	},
})
// variables
const common_comments = ref<ICommentCount[]>([])
const remark_edit_info = ref(new DescEditInfo(EditType.REMARK))
const comment_edit_info = ref(new DescEditInfo(EditType.COMMENT))
// computed
// watch
// methods
function onSelectComment(new_comment: string) {
	comment_edit_info.value.data = new_comment
	comment_edit_info.value.is_editing = true
}
function onEditClick(edit_info: DescEditInfo) {
	edit_info.startEdit()
}
function onRemoveClick(edit_info: DescEditInfo) {
	edit_info.data = ""
	onSubmitClick(edit_info)
}
function onSubmitClick(edit_info: DescEditInfo) {
	if (edit_info.edit_id === EditType.REMARK) {
		emit("remark", edit_info.data)
	} else {
		emit("comment", edit_info.data)
	}
}
function onCancelClick(edit_info: DescEditInfo) {
	edit_info.reset(props.actor)
}
function toPosts() {
	emit("posts")
}

function resetAllEdit() {
	remark_edit_info.value.reset(props.actor)
	comment_edit_info.value.reset(props.actor)
}

async function refreshCommonComments() {
	const [ok, comments] = await getComments()
	if (ok) {
		common_comments.value = comments
	}
}

// lifecycle
onMounted(() => {
	resetAllEdit()
	refreshCommonComments()
})
</script>

<style scoped>
.remark-root {
	--this-color: var(--me-remark-color);
	width: var(--me-remark-width);
}

.comment-root {
	--this-color: var(--me-comment-color);
	width: var(--me-remark-width);
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
	line-height: 30px;
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