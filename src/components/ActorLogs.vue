<template>
	<el-space direction="vertical" size="small" style="width: 100%" fill>
		<!-- posts -->
		<el-form label-width="auto" label-position="left">
			<el-form-item v-for="actor_log in actor_log_list" :label="actor_log.log_type_name">
				<div class="split-row" style="align-items: flex-end;">
					<div v-if="actor_log.log_type == ActorLogType.Add">
						<el-text>
							{{ specific_actor_id }}
						</el-text>
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.Group">
						<el-text :style="{ 'color': getGroupColor(actor_log.group_id) }">
							{{ getGroupName(actor_log.group_id) }}
						</el-text>
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.Score" class="center-column">
						<MyRate v-model="actor_log.show_score" style="background-color: #1a1a1a50;" disabled />
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.Tag" class="left-row">
						<el-tag v-for="tag_id in actor_log.tag_id_list" :style="getTagStyle(tag_id)" round>
							{{ getTagName(tag_id) }}
						</el-tag>
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.Remark">
						<el-text class="log-string remark-color">
							{{ actor_log.remark }}
						</el-text>
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.Comment">
						<el-text class="log-string comment-color">
							{{ actor_log.comment }}
						</el-text>
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.Link" class="left-row">
						<el-text v-for="actor_name in actor_log.actor_names"
							style="margin-right:10px;text-decoration-line: underline">
							{{ actor_name }}
						</el-text>
					</div>
					<div v-else-if="actor_log.log_type == ActorLogType.PostCount">
						<el-text>
							{{ actor_log.post_count }}
						</el-text>
					</div>
					<div v-else>
						<el-text>
							{{ actor_log.log_param }}
						</el-text>
					</div>
					<span class="log-time">
						{{ actor_log.log_time }}
					</span>
				</div>
			</el-form-item>
		</el-form>
	</el-space>
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
	computed: {
		ActorLogType() {
			return ActorLogType
		},
	},
	// props from parent
	props: {
		specific_actor_id: Number
	},
	data() {
		return {
			actor_log_list: [] as ActorLog[],
		}
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
				this.actor_log_list = new_list.map(item => new ActorLog(item))
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

.el-form-item {
	padding-right: 0;
}

.log-string {
	white-space: pre-wrap;
	word-break: break-all;
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