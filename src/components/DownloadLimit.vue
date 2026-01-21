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
				<el-input-number v-model="download_limit.show_total_file_size" :min="0" :max="10240" :step="256" />
			</el-form-item>
			<el-form-item label="Single Res Size(MB)">
				<!-- <el-input-number v-model="download_limit.show_single_file_size" :min="0" :max="1024" :step="20" /> -->
				<el-radio-group v-model="selected_single_preset" class="common-border" @change="onSinglePresetChange">
					<el-radio v-for="single_option in Single_File_Size_Options" :value="single_option.value"
						size="small">
						<div class="center-column double-line">
							<div>{{ single_option.label }}</div>
							<div>{{ single_option.value }}</div>
						</div>
					</el-radio>
					<el-radio :value="-1" size="small">
						<div class="center-column double-line">
							<div>Custom</div>
							<div>{{ custom_single_value }}</div>
						</div>
					</el-radio>
					<el-input-number v-model="custom_single_value" :min="0" :max="1024" style="width: 96px;"
						@change="onCustomSingleValueChange" :disabled="selected_single_preset !== -1" :controls="false" />
				</el-radio-group>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
// imports
import { ref } from "vue";
import { DownloadLimitForm } from "../data/DownloadForms";
import { Post_Filter_Options, Res_Type_Options, Single_File_Size_Options } from "../data/Consts"
import downJson from "../assets/down.json"

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
const selected_single_preset = ref<number>(-1)
const custom_single_value = ref<number>(0)
// computed
// watch
// methods

function onCustomSingleValueChange(value: number) {
	props.download_limit.show_single_file_size = value
}

function onSinglePresetChange(preset: number) {
	if (preset === -1) {
		props.download_limit.show_single_file_size = custom_single_value.value
	} else {
		props.download_limit.show_single_file_size = preset
	}
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

	const show_single_file_size = props.download_limit.show_single_file_size
	custom_single_value.value = show_single_file_size
	if (Single_File_Size_Options.find(option => option.value === show_single_file_size)) {
		selected_single_preset.value = show_single_file_size
	} else {
		selected_single_preset.value = -1
	}
}
// lifecycle
</script>

<style scoped>
.limit-form {
	border: 1px solid;
	padding: 5px;
}

.double-line {
	line-height: 1.0;
	gap: 0;
}
</style>