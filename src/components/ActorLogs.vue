<template>
	<!-- posts -->
	<el-table :data="show_log_list" height="480">
		<el-table-column label="Type" width="150">
			<template #header>
				<el-tooltip content="check to collapse continous same logs" placement="top">
					<div class="left-row">
						<el-checkbox v-model="is_simplified" label="Type" size="default" border />
					</div>
				</el-tooltip>
			</template>
			<template #default="scope">
				<div class="left-row">
					<span v-if="is_simplified">{{ scope.row.log_type_name_count }}</span>
					<span v-else>{{ scope.row.log_type_name }}</span>
				</div>
			</template>
		</el-table-column>
		<el-table-column label="Param" min-width="500">
			<template #default="scope">
				<div class="split-row">
					<div v-if="scope.row.log_type == ActorLogType.Add">
						<el-text>
							{{ specific_actor_id }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Group">
						<el-text :style="{ 'color': getGroupColor(scope.row.group_id) }">
							{{ actorGroupStore.getName(scope.row.group_id) }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Score" class="center-column">
						<MyRate v-model="scope.row.show_score" style="background-color: #1a1a1a50;" disabled />
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Tag" class="left-row wrap">
						<el-tag v-for="tag_id in scope.row.tag_id_list" :style="actorTagStore.getStyle(tag_id)" round>
							{{ actorTagStore.getName(tag_id) }}
						</el-tag>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Remark">
						<el-text class="log-string remark-color">
							{{ scope.row.remark }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Comment">
						<el-text class="log-string comment-color">
							{{ scope.row.comment }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Link" class="left-row">
						<el-text v-for="actor_name in scope.row.actor_names"
							style="margin-right:10px;text-decoration-line: underline">
							{{ actor_name }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.PostCount">
						<el-text>
							{{ scope.row.post_count }}
						</el-text>
					</div>
					<div v-else>
						<el-text>
							{{ scope.row.log_param }}
						</el-text>
					</div>
				</div>
			</template>
		</el-table-column>
		<el-table-column label="Time" width="170">
			<template #default="scope">
				<span class="log-time">{{ scope.row.log_time }}</span>
			</template>
		</el-table-column>
	</el-table>
</template>

<script setup lang="ts">
// imports
import { computed, onMounted, ref } from "vue";
import { getActorLogs } from "../ctrls/ActorCtrl";
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { ActorLogType } from "../data/Enums";
import { ActorLog } from "../data/ActorLog";
import MyRate from "./MyRate.vue";
// emits
// stores/routers
const actorTagStore = ActorTagStore()
const actorGroupStore = ActorGroupStore()
// props/models
const props = defineProps({
	specific_actor_id: {
		type: Number,
		required: true
	}
})
// variables
const actor_log_list = ref<ActorLog[]>([])
const simplified_log_list = ref<ActorLog[]>([])
const simplified_count = ref(0)
const is_simplified = ref(true)
// computed
const show_log_list = computed(() => {
	return is_simplified.value ? simplified_log_list.value : actor_log_list.value
})
// watch
// methods

function getGroupColor(group_id: number): string {
	let group = actorGroupStore.get(group_id)
	if (group) {
		return group.group_color
	}
	return "#000000"
}

async function getLogs() {
	const [ok, new_list] = await getActorLogs(props.specific_actor_id)
	if (ok) {
		actor_log_list.value = new_list
		simplified_log_list.value = ActorLog.simplifyLogs(new_list)
		simplified_count.value = actor_log_list.value.length - simplified_log_list.value.length
	}
}
// lifecycle
onMounted(async () => {
	// console.log(`actor logs of ${props.specific_actor_id}`)
	await getLogs()
})
</script>

<style scoped>
.collapse-label {
	text-decoration: line-through;
}

.log-string {
	font-size: var(--el-font-size-large);
	white-space: pre-wrap;
	/* word-break: break-all; */
	overflow-wrap: break-word;
}

.log-time {
	min-width: 150px;
	line-height: normal;

	text-align: right;
	font-size: var(--el-font-size-extra-small);
	font-style: italic;
	color: var(--el-text-color-secondary);
}
</style>