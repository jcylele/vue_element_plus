<template>
	<div class="fill-column">
		<div class="left-row" v-for="cond in cond_list" :class="cond.in_use ? 'cond_enabled' : 'cond_disabled'">
			<el-checkbox v-model="cond.in_use" size="default" border />
			<div v-if="cond.is_score" class="center-row">
				<el-text>{{ cond.score_prefix }}</el-text>
				<MyRate v-model="cond.score_param" :disabled="!cond.in_use" size="large" />
			</div>
			<div v-else-if="cond.is_switch" class="center-row">
				<el-switch v-model="cond.bool_param" :disabled="!cond.in_use" class="cond-switch"
					:active-text="cond.true_text" :inactive-text="cond.false_text" />
			</div>
		</div>
		<!-- submit/cancel -->
		<div class="center-row" style="gap: 20px;">
			<el-button type="primary" @click="onSubmit">Submit</el-button>
			<el-button type="warning" @click="onCancel">Cancel</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
// imports
import { onMounted, ref, watch } from "vue";
import { ActorGroupData } from "../data/ActorGroupData";
import { ActorGroupCond } from "../data/ActorGroupCond";
import { GroupCondType } from "../data/Enums";
import MyRate from "./MyRate.vue";
// emits
const emit = defineEmits(['submit', 'cancel'])
// stores/routers
// props/models


const props = defineProps({
	group: ActorGroupData
})
// variables
const cond_list = ref([
	new ActorGroupCond(GroupCondType.MinScore),
	new ActorGroupCond(GroupCondType.MaxScore),
	new ActorGroupCond(GroupCondType.HasAnyTag),
	new ActorGroupCond(GroupCondType.Linked),
	new ActorGroupCond(GroupCondType.HasRemark),
])
// computed

// watch
watch(() => props.group, async (new_group) => {
	console.log(`GroupCondEditor watch group: ${new_group == null ? "null" : new_group.group_name}`)
	refresh()
})

// methods
function refresh() {
	// reset conditions
	for (const cond of cond_list.value) {
		cond.in_use = false
		cond.cond_param = 0
	}
	// set conditions
	if (props.group == null) return
	for (const cond of props.group.cond_list) {
		const c = cond_list.value[cond.cond_type]
		c.in_use = true
		c.cond_param = cond.cond_param
	}
}

function onSubmit() {
	const used_cond_list = cond_list.value.filter(cond => cond.in_use)
		.map(cond => new ActorGroupCond(cond.cond_type, cond.cond_param))
	emit('submit', used_cond_list)
}

//new /new2  HasAnyTag = false Linked = false
//nice / nicer HasAnyTag = true Linked = false
//good HasAnyTag = true
//loved HasAnyTag = true MinScore >= 3.5 hasRemark = true
//dislike HasAnyTag = true MinScore <= 3
//enough HasAnyTag = true MinScore >= 3.5
// recall HasAnyTag = true Linked = true

function onCancel() {
	emit('cancel')
}

// lifecycle
onMounted(() => {
	refresh()
})
</script>

<style scoped>
.cond_enabled {
	background-color: var(--me-odd-bg-color);
}

.cond_disabled {
	background-color: var(--el-bg-color);
}

/* .cond-switch {} */

.cond-switch :deep(.el-switch__label--left) {
	width: 100px;
	text-align: right;
}

.cond-switch :deep(.el-switch__label--right) {
	width: 100px;
	text-align: left;
}
</style>