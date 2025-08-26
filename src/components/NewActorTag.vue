<template>
	<div style="border: 1px solid ; border-radius: 4px; padding: 3px">
		<div v-if="!show_add">
			<el-button type="default" @click="showAdd(true)" class="new-tag-button">
				Add New Actor Tag
			</el-button>
		</div>
		<div v-if="show_add">
			<el-form :inline="true" :model="new_actor_tag" class="new-tag-form">
				<el-form-item label="Name">
					<el-input v-model="new_actor_tag.tag_name" style="width: 150px" />
				</el-form-item>
				<el-form-item label="Priority">
					<el-select v-model="new_actor_tag.show_priority" style="width: 150px">
						<el-option v-for="i in 10" :key="i-1" :value="i-1" :label="`Priority ${i-1}`" :style="{'color': getTagColor(i-1)}" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onAddActorTag">Add</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" @click="showAdd(false)">Cancel</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script lang="ts">
import { ActorTagData } from "../data/ActorTagData";
import { addActorTag } from "../ctrls/ActorTagCtrl";
import { mapActions } from "pinia";
import { ActorTagStore } from "../store/ActorTagStore";
import { Tag_Colors } from "../data/Consts";

export default {
	name: "NewActorTag",
	emits: ['tag_added'],
	data() {
		return {
			new_actor_tag: new ActorTagData(),
			show_add: false
		}
	},
	methods: {
		...mapActions(ActorTagStore, {
			addActorTag: 'add',
		}),

		getTagColor(index: number): string {
			return Tag_Colors[index]
		},

		showAdd(val: boolean) {
			this.show_add = val
		},
		async onAddActorTag() {
			// console.log("Add", this.new_actor_tag)
			const [ok, tag] = await addActorTag(this.new_actor_tag)
			if (ok) {
				this.new_actor_tag = new ActorTagData()
				this.show_add = false
				this.addActorTag(tag)
				this.$emit("tag_added")
			}
		},
	}
}
</script>

<style scoped>
.new-tag-form .el-form-item {
	margin: 5px 8px;
}

.new-tag-button {
	margin: 5px 8px;
}
</style>