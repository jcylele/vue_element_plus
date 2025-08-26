<template>
	<el-container>
		<el-main>
			<el-space direction="vertical" fill>
				<NewActorTag @tag_added="refreshTags" />
				<el-text style="font-size: 24px;font-style: oblique">
					Drag Elements Below To Set Tags Priorities
				</el-text>
				<el-space direction="horizontal" v-if="changed">
					<el-button type="primary" size="default" @click="onSubmitPriority">
						Save
					</el-button>
					<el-button type="warning" size="default" @click="onCancel">
						Reset
					</el-button>
				</el-space>
				<el-space direction="vertical" fill>
					<el-space direction="horizontal" v-for="(tag_group, index) in editing_tags" class="tag_row"
						:style="{ 'border-color': getTagBgColor(index) }" alignment="stretch" wrap>
						<draggable :list="tag_group" :group="{ name: 'tags', pull: true, put: true }"
							@change="onTagItemMoved" class="tag_row left-row wrap">
							<ActorTagEditor v-for="tag_info in tag_group" :tag_edit_info="tag_info"
								:key="tag_info.data.tag_id" @delete="onDeleteActorTag" class="card_item"
								:style="{ 'border-color': getTagBgColor(index) }" />
						</draggable>
					</el-space>

				</el-space>
			</el-space>
		</el-main>
	</el-container>
</template>

<script lang="ts">
import NewActorTag from "./NewActorTag.vue";
import ActorTagEditor from "./ActorTagEditor.vue"
import { mapActions, mapState } from "pinia";
import { ActorTagStore } from "../store/ActorTagStore";
import { EditingTagData } from "../data/ActorTagData";
import { VueDraggableNext } from "vue-draggable-next";
import { updatePriorities } from "../ctrls/ActorTagCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { Tag_Colors } from "../data/Consts";
import { CommonPriority } from "../data/WebData";
import { LogMessages } from "../data/Messages";


export default {
	name: "ActorTags",
	components: { NewActorTag, ActorTagEditor, draggable: VueDraggableNext },

	data() {
		return {
			editing_tags: [] as EditingTagData[][],
			changed: false
		}
	},
	computed: {
		...mapState(ActorTagStore, { actor_tag_list: 'sorted_list' }),
	},
	methods: {
		...mapActions(ActorTagStore, {
			getTagsFromServer: 'getFromServer',
		}),
		getTagBgColor(index: number): string {
			return Tag_Colors[index]
		},
		onTagItemMoved(evt) {
			this.changed = true
		},
		onDeleteActorTag(tag_id: number) {
			for (const group of this.editing_tags) {
				for (let i = 0; i < group.length; i++) {
					if (group[i].data.tag_id == tag_id) {
						group.splice(i, 1)
						return
					}
				}
			}
		},
		async onSubmitPriority() {
			let changed_priorities: CommonPriority[] = []
			for (let i = 0; i < 10; i++) {
				const group = this.editing_tags[i]
				for (let j = 0; j < group.length; j++) {
					const tag = group[j].data
					const new_tag_priority = i * 100 + j + 1
					if (tag.tag_priority != new_tag_priority) {
						changed_priorities.push(new CommonPriority(tag.tag_id, new_tag_priority))
					}
				}
			}
			
			if (changed_priorities.length == 0) {
				this.changed = false
				return
			}

			let [ok, _] = await updatePriorities(changed_priorities)
			if (ok) {
				logInfo(LogMessages.TagPrioritiesSaved())
				this.changed = false
			}
		},
		async onCancel() {
			await this.refreshTags()
			this.changed = false
		},
		initTags() {
			this.editing_tags = []
			for (let i = 0; i < 10; i++) {
				this.editing_tags.push([])
			}
			for (const tag of this.actor_tag_list) {
				const group_id = Math.floor(tag.tag_priority / 100)
				let tagEditInfo = new EditingTagData(tag)
				this.editing_tags[group_id].push(tagEditInfo)
			}
			// this.editing_tags.reverse()
		},
		async refreshTags() {
			await this.getTagsFromServer()
			this.initTags()
		}
	},
	async mounted() {
		await this.refreshTags()
	}
}
</script>

<style scoped>
.card_item {
	display: table-cell;
	border: 1px solid;
	border-radius: 4px;
	margin: 2px;
}

.tag_row {
	border: 1px solid;
	border-radius: 4px;
	padding: 2px
}

.tag_row {
	min-height: 25px;
	min-width: 100px;
}
</style>