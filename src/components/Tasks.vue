<template>
	<el-container>
		<el-main>
			<div class="fill-column fit-width">
				<div class="center-row">
					<el-button type="danger" size="large" @click="stopAll">Stop All</el-button>
					<el-button type="primary" size="large" @click="getAll">Refresh</el-button>
				</div>
				<el-table :data="task_list" border>
					<el-table-column label="task" align="center" min-width="300px">
						<template #default="scope">
							<div class="center-row">
								<span>
									{{ scope.row.desc }}
								</span>
								<span v-if="scope.row.group_id > 0" :style="{ color: getExtraColor(scope.row) }">
									{{ getExtraDesc(scope.row) }}
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="download_limit" label="limit" align="center" min-width="280px">
						<template #default="scope">
							<div class="center-column">
								<el-tag v-for="limit in scope.row.download_limit.limit_desc_list" type="success"
									size="small" effect="light">
									{{ limit }}
								</el-tag>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="workers" align="center" min-width="200px">
						<template #default="scope">
							<div class="center-column">
								<el-tag v-for="pair in scope.row.worker_count" :key="pair.name" size="small"
									effect="light">
									{{ pair.name }}:{{ pair.count }}
								</el-tag>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="queues" align="center" min-width="200px">
						<template #default="scope">
							<div class="center-column">
								<el-tag v-for="pair in scope.row.queue_count" :key="pair.name" size="small"
									effect="light">
									{{ pair.name }}:{{ pair.count }}
								</el-tag>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="Op" align="center" min-width="240px">
						<template #default="scope">
							<div class="center-row">
								<el-popover trigger="hover" placement="left" width="auto">
									<template #reference>
										<el-button type="primary" style="width: 100px;" plain>Progress</el-button>
									</template>
									<template #default>
										<div class="fill-column">
											<el-table :data="scope.row.worker_process_stats"
												empty-text="no progress yet" border>
												<el-table-column label="Worker" prop="worker_type" min-width="140px" />
												<el-table-column label="Failed" prop="failed_count" min-width="80px" />
												<el-table-column label="Succeed" prop="process_count"
													min-width="90px" />
												<el-table-column label="Average" min-width="90px">
													<template #default="scope">
														<span>
															{{ format_duration(scope.row.total_process_time /
																scope.row.process_count, false) }}
														</span>
													</template>
												</el-table-column>
												<el-table-column label="Last Time" prop="last_process_time"
													min-width="120px" />
											</el-table>
										</div>
									</template>
								</el-popover>
								<el-button type="danger" style="width: 100px;"
									@click="stopTask(scope.row.uid)">Stop</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-main>
	</el-container>
</template>

<script setup lang="ts">
import { getAllTasks, stopAllTasks, stopSingleTask } from "../ctrls/DownloadCtrl.js";
import { logInfo } from "../ctrls/FetchCtrl";
import { BadgeStore } from "../store/BadgeStore";
import { ActorGroupStore } from "../store/ActorGroupStore";
import { TaskData } from "../data/TaskData";
import { LogMessages } from "../data/Messages.js";
import { ref, onMounted } from 'vue';
import { format_duration } from "../data/DataUtil.js";

const task_list = ref<TaskData[]>([])
const badgeStore = BadgeStore()
const actorGroupStore = ActorGroupStore()

function getExtraDesc(task: TaskData): string {
	if (task.show_group_name) {
		return actorGroupStore.getName(task.group_id)
	} else if (task.show_actor_name) {
		return task.actor_abstract?.actor_name ?? ""
	}
	return ""
}

function getExtraColor(task: TaskData): string {
	const group_id = task.group_id
	if (group_id > 0) {
		return actorGroupStore.get(group_id).group_color
	}
	return "#000000"
}

async function stopTask(uid: number) {
	const [ok, _] = await stopSingleTask(uid)
	if (ok) {
		logInfo(LogMessages.TaskStop())
		task_list.value.splice(task_list.value.findIndex((task: any) => task.uid === uid), 1)
		badgeStore.setTaskCount(task_list.value.length)
	}
}

async function stopAll() {
	const [ok, _] = await stopAllTasks()
	if (ok) {
		logInfo(LogMessages.TaskStopAll())
		task_list.value = []
		badgeStore.setTaskCount(0)
	}
}

async function getAll() {
	const [ok, ret] = await getAllTasks()
	if (ok) {
		task_list.value = ret
		badgeStore.setTaskCount(ret.length)
	}
}

onMounted(() => {
	getAll()
})
</script>

<style scoped></style>