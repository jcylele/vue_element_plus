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
					<span v-else >{{ scope.row.log_type_name }}</span>
				</div>
			</template>
		</el-table-column>
		<el-table-column label="Param" min-width="500">
			<template #default="scope">
				<div class="split-row" style="align-items: flex-end;">
					<div v-if="scope.row.log_type == ActorLogType.Add">
						<el-text>
							{{ specific_actor_id }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Group">
						<el-text :style="{ 'color': getGroupColor(scope.row.group_id) }">
							{{ getGroupName(scope.row.group_id) }}
						</el-text>
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Score" class="center-column">
						<MyRate v-model="scope.row.show_score" style="background-color: #1a1a1a50;" disabled />
					</div>
					<div v-else-if="scope.row.log_type == ActorLogType.Tag" class="left-row wrap">
						<el-tag v-for="tag_id in scope.row.tag_id_list" :style="getTagStyle(tag_id)" round>
							{{ getTagName(tag_id) }}
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

<script lang="ts">
import { getActorLogs } from "../ctrls/ActorCtrl";
import { mapActions } from "pinia";
import { ActorTagStore } from "../store/ActorTagStore";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { ActorLogType } from "../data/Enums";
import ActorLog from "../data/ActorLog";
import MyRate from "./MyRate.vue";

export default {
	name: "ActorLogs",
	components: { MyRate },
	// props from parent
	props: {
		specific_actor_id: Number
	},
	data() {
		return {
			actor_log_list: [] as ActorLog[],
			simplified_log_list: [] as ActorLog[],
			simplified_count: 0,
			is_simplified: true,
		}
	},
	computed: {
		ActorLogType() {
			return ActorLogType
		},
		show_log_list(): ActorLog[] {
			return this.is_simplified ? this.simplified_log_list : this.actor_log_list
		},
	},
	methods: {
		...mapActions(ActorTagStore, {
			getTagStyle: 'getStyle',
			getTagName: 'getName',
		}),

		...mapActions(ActorGroupStore, {
			getGroupName: 'getName',
			getActorGroup: 'get'
		}),

		getGroupColor(group_id: number): string {
			let group = this.getActorGroup(group_id)
			if (group) {
				return group.group_color
			}
			return "#000000"
		},

		async getLogs() {
			const [ok, new_list] = await getActorLogs(this.specific_actor_id)
			if (ok) {
				this.actor_log_list = new_list
				this.simplified_log_list = ActorLog.simplifyLogs(new_list)
				this.simplified_count = this.actor_log_list.length - this.simplified_log_list.length
			}
		},
	},
	mounted() {
		console.log(`actor logs of ${this.specific_actor_id}`)
		this.getLogs()
	}
}
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