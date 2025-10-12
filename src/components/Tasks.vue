<template>
	<el-container>
		<el-main>
			<el-space direction="vertical">
				<el-space direction="horizontal" size="large">
					<el-button type="danger" size="default" @click="stopAll">Stop All</el-button>
					<el-button type="primary" size="default" @click="getAll">Refresh</el-button>
				</el-space>
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
							<el-space direction="vertical">
								<el-tag v-for="limit in scope.row.download_limit.limit_desc_list" type="success"
									size="small" effect="light">
									{{ limit }}
								</el-tag>
							</el-space>
						</template>
					</el-table-column>
					<el-table-column prop="worker_count" label="workers" align="center" min-width="200px">
						<template #default="scope">
							<el-space direction="vertical">
								<el-tag v-for="(count, name) in scope.row.worker_count" :key="name" size="small"
									effect="light">
									{{ name }}:{{ count }}
								</el-tag>
							</el-space>
						</template>
					</el-table-column>
					<el-table-column prop="queue_count" label="queues" align="center" min-width="200px">
						<template #default="scope">
							<el-space direction="vertical">
								<el-tag v-for="(count, name) in scope.row.queue_count" :key="name" size="small"
									effect="light">
									{{ name }}:{{ count }}
								</el-tag>
							</el-space>
						</template>
					</el-table-column>
					<el-table-column label="Op" align="center" min-width="100px">
						<template #default="scope">
							<el-button type="danger" @click="stopTask(scope.row.uid)">Stop</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-space>
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