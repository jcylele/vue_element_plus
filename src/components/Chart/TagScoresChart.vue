<template>
	<el-space direction="vertical" alignment="flex-start">
		<el-button type="primary" @click="is_choosing_tags = true">
			Choose Tags
		</el-button>
		<div ref="dom_chart" style="width: 1280px;height: 480px"></div>
	</el-space>
	<el-dialog v-model="is_choosing_tags" :title="actor.actor_name">
		<ActorTagChooser :actor="actor" @submit="onSubmitTag" @cancel="onCancelTag" />
	</el-dialog>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { BarChart } from "echarts/charts";
import {
	TooltipComponent,
	GridComponent,
	LegendComponent
} from "echarts/components";
import { CanvasRenderer } from 'echarts/renderers'

import { ref, markRaw, onMounted, onUnmounted } from "vue";
import { ActorTagStore } from "../../store/ActorTagStore";
import { getScoresByTag } from "../../ctrls/ChartCtrl";
import { MAX_SCORE, Star_Colors } from "../../data/Consts";
import ActorData from "../../data/ActorData";
import ActorTagChooser from "../ActorTagChooser.vue";
import { formatCategoryAxis, formatCommonTextStyle, formatGrid, formatLegend, formatTooltip, formatValueAxis } from '../../data/ChartUtil';
import { logError } from '../../ctrls/FetchCtrl';
import { ECssVarName } from '../../data/Enums';

echarts.use([
	BarChart,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	CanvasRenderer
]);

const actorTagStore = ActorTagStore()

const is_choosing_tags = ref(false)
const actor = ref(new ActorData())
const dom_chart = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

function formatSeriesItem(tag_name: string, data: number[]) {
	return {
		type: 'bar',
		name: tag_name,
		label: {
			show: false,
			position: 'top',
			distance: 15,
			align: 'center',
			verticalAlign: 'middle',
			fontSize: 16,
		},
		emphasis: {
			focus: 'series'
		},
		data: data
	}
}

async function onSubmitTag(new_tag_list: number[]) {
	is_choosing_tags.value = false
	actor.value.tag_ids = new_tag_list
	const [ok, score_arr] = await getScoresByTag(new_tag_list)
	if (ok) {
		refreshChart(score_arr)
	}
}
function onCancelTag() {
	is_choosing_tags.value = false
}

function formatScoreCategory(score: number) {
	return {
		value: (score / 2),
		textStyle: formatCommonTextStyle(ECssVarName.ElFontSizeLarge, Star_Colors[Math.floor(score / 2)])
	}
}

function refreshChart(score_arr) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	// scores 0-12
	const score_list: any[] = []
	for (let i = 0; i <= MAX_SCORE; i++) {
		score_list.push(formatScoreCategory(i))
	}

	// legend
	const tag_names = actor.value.tag_ids.map(tag_id => actorTagStore.getName(tag_id))

	// series
	const series_items: any[] = tag_names.map((tag_name, index) => formatSeriesItem(tag_name, score_arr[index]))

	const option = {
		textStyle: formatCommonTextStyle(),
		grid: formatGrid(true),
		tooltip: formatTooltip(),
		legend: formatLegend(),
		xAxis: formatCategoryAxis(score_list),
		yAxis: formatValueAxis(),
		series: series_items
	}

	chart.value.setOption(option)
}

onMounted(() => {
	if (dom_chart.value) {
		chart.value = markRaw(echarts.init(dom_chart.value))
	}
	actor.value.actor_name = "fake actor"
	actor.value.tag_ids = []
})

onUnmounted(() => {
	if (chart.value) {
		chart.value.dispose()
		chart.value = null
	}
})

</script>

<style scoped></style>