<template>
	<div ref="dom_chart" style="width: 720px;height: 360px"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
	GridComponent,
	TooltipComponent,
	LegendComponent
} from "echarts/components";
import { CanvasRenderer } from 'echarts/renderers'

import { ref, markRaw, onMounted, onUnmounted } from "vue";
import { ResState } from "../../data/Enums";
import { ResStateList, str_res_state, video_state_color } from "../../data/Consts";
import { formatCategoryAxis, formatGrid, formatLegend, formatTooltip, formatValueAxis } from "../../data/ChartUtil";
import { ResSizeCount } from "../../data/ResSizeCount";
import { getVideoSizes } from "../../ctrls/ActorCtrl";
import { logError } from "../../ctrls/FetchCtrl";

echarts.use([
	BarChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	CanvasRenderer
]);

const dom_chart = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

const props = defineProps({
	actor_id: {
		type: Number,
		required: true,
	},
})

async function refreshData() {
	const [ok, rsc_list] = await getVideoSizes(props.actor_id)
	if (ok) {
		refreshChart(rsc_list)
	}
}

function formatSeriesItem(res_state: ResState, data: number[]) {
	return {
		type: 'bar',
		name: str_res_state[res_state],
		barWidth: "80%",
		stack: 'total',
		itemStyle: { color: video_state_color[res_state] },
		data: data
	}
}

function refreshChart(rsc_list: ResSizeCount[]) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	const series_items: any[] = ResStateList.map(res_state => formatSeriesItem(res_state,
		rsc_list.map(rsc => rsc.resCount(res_state))))

	const xAxis = formatValueAxis()
	xAxis['minInterval'] = 1

	const option = {
		grid: formatGrid(true),
		legend: formatLegend(),
		tooltip: formatTooltip(),
		xAxis: xAxis,
		yAxis: formatCategoryAxis(rsc_list.map(rsc => rsc.str_size)),
		series: series_items
	}

	chart.value.setOption(option)
}

onMounted(() => {
	if (dom_chart.value) {
		chart.value = markRaw(echarts.init(dom_chart.value))
	}
	refreshData()
})

onUnmounted(() => {
	if (chart.value) {
		chart.value.dispose()
		chart.value = null
	}
})
</script>

<style scoped></style>