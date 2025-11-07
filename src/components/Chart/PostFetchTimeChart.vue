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
import { IPostFetchTimeStats } from "../../data/SchemasOthers";
import { formatCategoryAxis, formatGrid, formatLegend, formatTooltip, formatValueAxis } from "../../data/ChartUtil";
import { getPostFetchTimeStats } from "../../ctrls/ActorCtrl";
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
	const [ok, post_fetch_time_stats] = await getPostFetchTimeStats(props.actor_id)
	if (ok) {
		console.log(post_fetch_time_stats)
		refreshChart(post_fetch_time_stats)
	}
}

function formatSeriesItem(data: number[]) {
	return {
		type: 'bar',
		barWidth: "80%",
		barMaxWidth: 50,
		stack: 'total',
		emphasis: {
			focus: 'series'
		},
		data: data,
	}
}

function refreshChart(post_fetch_time_stats: IPostFetchTimeStats[]) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	const category_data = post_fetch_time_stats.map(stat => stat.stat_date)
	const series_data: number[] = post_fetch_time_stats.map(stat => stat.post_count)

	const option = {
		grid: formatGrid(true),
		tooltip: formatTooltip(),
		xAxis: formatCategoryAxis(category_data, true),
		yAxis: formatValueAxis(),
		series: [formatSeriesItem(series_data)]
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