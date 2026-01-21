<template>
	<div class="left-column">
		<el-form label-width="150px" label-position="left">
			<el-form-item label="Score Range">
				<el-slider v-model="scores" :min="0" :max="max_score" range show-stops style="width: 360px;" />
			</el-form-item>
			<el-form-item label="Tag Count">
				<el-input-number v-model="tag_count" :min="1" :max="30" />
			</el-form-item>
			<el-form-item label="Op">
				<el-button type="primary" @click="refreshData">Refresh</el-button>
			</el-form-item>
		</el-form>
		<div ref="dom_chart" style="width: 1280px;height: 480px"></div>
	</div>
</template>

<script setup lang="ts">
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
	TooltipComponent,
	GridComponent,
} from "echarts/components";
import { CanvasRenderer } from 'echarts/renderers'

import { ref, computed, onMounted, onUnmounted, markRaw } from "vue";
import { getTagsByScore } from "../../ctrls/ChartCtrl.js";
import { ActorTagStore } from "../../store/ActorTagStore";
import { MAX_SCORE } from "../../data/Consts";
import { TagCount } from "../../data/Interfaces";
import { logError } from "../../ctrls/FetchCtrl.js";
import { formatBarLabel, formatCategoryAxis, formatCommonTextStyle, formatGrid, formatValueAxis } from "../../data/ChartUtil.js";
import { ECssVarName } from "../../data/Enums.js";

echarts.use([
	BarChart,
	TooltipComponent,
	GridComponent,
	CanvasRenderer
]);

const actorTagStore = ActorTagStore()

const max_score = computed(() => MAX_SCORE)

const dom_chart = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)
const scores = ref<[number, number]>([0, MAX_SCORE])
const tag_count = ref(10)

async function refreshData() {
	const [ok, tag_list] = await getTagsByScore(scores.value[0], scores.value[1], tag_count.value)
	if (ok) {
		refreshChart(tag_list)
	}
}
function formatCategory(tc: TagCount) {
	return {
		value: actorTagStore.getName(tc.tag_id),
		textStyle: formatCommonTextStyle(ECssVarName.ElFontSizeBase, actorTagStore.getBgColor(tc.tag_id))
	}
}
function formatValue(tc: TagCount) {
	return {
		value: tc.count,
		itemStyle: {
			color: actorTagStore.getBgColor(tc.tag_id)
		}
	}
}

function formatSeriesItem(data: any[]) {
	return {
		type: 'bar',
		barWidth: "80%",
		// barMinWidth: 20,
		barMaxWidth: 50,
		colorBy: 'data', // bar color is data.itemStyle.color
		data: data,
		label: formatBarLabel(),
	}
}

function refreshChart(tag_list: TagCount[]) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	tag_list.reverse()

	const category_data = tag_list.map(a => formatCategory(a))

	const value_data = tag_list.map(a => formatValue(a))

	const option = {
		grid: formatGrid(false),
		xAxis: formatValueAxis(),
		yAxis: formatCategoryAxis(category_data),
		series: [
			formatSeriesItem(value_data)
		]
	}

	chart.value.setOption(option)
}

onMounted(() => {
	if (dom_chart.value) {
		chart.value = markRaw(echarts.init(dom_chart.value))
	}
})

onUnmounted(() => {
	if (chart.value) {
		chart.value.dispose()
		chart.value = null
	}
})
</script>

<style scoped></style>