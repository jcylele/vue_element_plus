<template>
	<div class="center-column limit-form">
		<!-- Presets -->
		<el-text style="font-style: italic">
			Select Post Filter And Res Type First
		</el-text>

		<el-form :model="download_limit" label-width="200px" label-position="left">

			<el-form-item label="Post Filter">
				<el-radio-group v-model="download_limit.post_filter" @change="onPostFilterChange" class="fixed-width">
					<el-radio v-for="pf in Post_Filter_Options" :value="pf.value">
						{{ pf.label }}
					</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item label="Res Type">
				<el-radio-group v-model="download_limit.res_type" @change="onResTypeChange" class="fixed-width">
					<el-radio v-for="pf in Res_Type_Options" :value="pf.value">
						{{ pf.label }}
					</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="Actor Count">
				<el-input-number v-model="download_limit.actor_count" :min="0" :max="1000" :step="50" />
			</el-form-item>
			<el-form-item label="Post Count">
				<el-input-number v-model="download_limit.post_count" :min="0" :max="1000" :step="50" />
			</el-form-item>
			<el-form-item label="Res Count">
				<el-input-number v-model="download_limit.file_count" :min="0" :max="200" :step="50" />
			</el-form-item>
			<el-form-item label="Total Res Size(MB)">
				<el-input-number v-model="download_limit.show_total_file_size" :min="0" :max="10240" :step="512" />
			</el-form-item>
			<el-form-item label="Single Res Size(MB)">
				<div class="fill-column no-gap" style="width: 100%;">
					<el-slider v-model="single_range_index" range :min="0" :max="single_size_steps.length - 1" :step="1"
						:show-tooltip="false" @change="onSingleRangeChange" />
					<div class="split-row">
						<el-text size="small">{{ single_range_value[0] }} MB</el-text>
						<el-text size="small">{{ formatSingleMax(single_range_value[1]) }}</el-text>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
// imports
import { computed, ref } from "vue";
import downJson from "../assets/down.json";
import { Post_Filter_Options, Res_Type_Options } from "../data/Consts";
import { DownloadLimitForm } from "../data/DownloadForms";

// emits
// stores/routers
// props/models
const props = defineProps({
	download_limit: {
		type: DownloadLimitForm,
		required: true,
	}
})
// variables
const down_json_obj = ref(downJson)
// last step uses value 0 to represent "no upper limit"
const single_size_steps = [0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 0]
const single_range_index = ref<[number, number]>([0, 1])

const single_range_value = computed<[number, number]>(() => ([
	single_size_steps[single_range_index.value[0]],
	single_size_steps[single_range_index.value[1]],
]))

function formatSingleMax(maxValue: number): string {
	return maxValue === 0 ? "0 MB (不封顶)" : `${maxValue} MB`
}

// watch
// methods

function getNearestStepIndex(targetValue: number, preferLastZero: boolean): number {
	if (targetValue === 0 && preferLastZero) return single_size_steps.length - 1

	let nearestIndex = 0
	let minDiff = Number.POSITIVE_INFINITY
	for (let i = 0; i < single_size_steps.length; i++) {
		const diff = Math.abs(single_size_steps[i] - targetValue)
		if (diff < minDiff) {
			minDiff = diff
			nearestIndex = i
		}
	}
	return nearestIndex
}

function onSingleRangeChange(indexRange: [number, number]) {
	const [minIndex, maxIndex] = indexRange
	props.download_limit.show_single_file_size_min = single_size_steps[minIndex]
	props.download_limit.show_single_file_size_max = single_size_steps[maxIndex]
}

function onPostFilterChange() {
	refreshPreset()
}
function onResTypeChange() {
	refreshPreset()
}
function refreshPreset() {
	const preset = down_json_obj.value.find(preset =>
		preset.res_type == props.download_limit.res_type
		&& preset.post_filter == props.download_limit.post_filter
	)
	if (preset == undefined) return

	// console.log(`change to ${preset.name}`)
	props.download_limit.setPresetValue(preset)

	const minIndex = getNearestStepIndex(props.download_limit.show_single_file_size_min || 0, false)
	const maxIndex = getNearestStepIndex(props.download_limit.show_single_file_size_max || 0, true)
	single_range_index.value = [Math.min(minIndex, maxIndex), Math.max(minIndex, maxIndex)]
}
// lifecycle
refreshPreset()
</script>

<style scoped>
.limit-form {
	border: 1px solid;
	padding: 5px;
}

.single-slider-wrap {
	/* width: 100%; */
	/* padding-right: 8px; */
	height: 50px;
}

.single-range-endpoint {
	display: flex;
	justify-content: space-between;
	margin-top: 6px;
}
</style>