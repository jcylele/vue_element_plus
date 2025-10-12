<template>
	<div class="fill-column">
		<el-table :data="setting_items" border>
			<el-table-column prop="label" label="Name" width="300px" />
			<el-table-column label="Value" min-width="300">
				<template #default="scope">
					<el-input-number v-if="scope.row.type === ESettingType.Number" v-model="scope.row.value"
						@change="onValueChange(scope.row)" />
					<el-switch v-else-if="scope.row.type === ESettingType.Boolean" v-model="scope.row.value"
						@change="onValueChange(scope.row)" />
					<el-input v-else v-model="scope.row.value" @change="onValueChange(scope.row)" />
				</template>
			</el-table-column>
			<el-table-column label="Op" width="220px">
				<template #default="scope">
					<div v-if="scope.row.changed" class="center-row">
						<el-button type="primary" @click="commitSetting(scope.row)">Commit</el-button>
						<el-button type="warning" @click="revertSetting(scope.row)">Revert</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script setup lang="ts">
// imports
import { onMounted, ref } from 'vue'
import { changeSetting, getSettings } from '../ctrls/OtherCtrl'
import { ESettingType } from '../data/Enums'
import { logInfo } from '../ctrls/FetchCtrl'
import { Setting_Item_Configs } from "../data/Consts";
import { SettingItemData } from '../data/SettingItemData'

// emits
// stores/routers
// props/models
// variables
const original_settings = ref<Record<string, string | number | boolean>>({})
const setting_items = ref<SettingItemData[]>([])
// computed
// watch
// methods
async function fetchSettings() {
	const [ok, ret] = await getSettings()
	if (ok) {
		original_settings.value = ret as Record<string, string | number | boolean>
		setting_items.value = Setting_Item_Configs.map(config => new SettingItemData(config, original_settings.value[config.key]))
	}
}

async function commitSetting(item: SettingItemData) {
	const [ok, _] = await changeSetting(item.config.key, item.value)
	if (ok) {
		item.changed = false
		original_settings.value[item.config.key] = item.value
		logInfo("Change setting success")
	}
}

function revertSetting(item: SettingItemData) {
	item.value = original_settings.value[item.config.key]
	item.changed = false
	logInfo("Revert setting success")
}

function onValueChange(item: SettingItemData) {
	item.changed = true
}

// lifecycle
onMounted(async () => {
	await fetchSettings()
})
</script>
<style scoped></style>
