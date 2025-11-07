<template>
	<el-form label-width="150px" label-position="left">
		<el-form-item label="Tag">
			<el-select v-model="cur_tag_id" style="width: 150px;" filterable clearable>
				<el-option v-for="actor_tag in actorTagStore.sorted_list" :key="actor_tag.tag_id"
					:label="actor_tag.tag_name" :value="actor_tag.tag_id" />
			</el-select>
		</el-form-item>
		<el-form-item label="Tag Count">
			<el-input-number v-model="tag_count" :min="1" :max="20" />
		</el-form-item>
		<el-form-item label="Op">
			<el-button type="primary" @click="refreshData">Refresh</el-button>
		</el-form-item>
	</el-form>
	<div ref="dom_chart" style="width: 1280px;height: 480px"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { BarChart } from "echarts/charts";
import {
	GridComponent,
	TooltipComponent
} from "echarts/components";
import { CanvasRenderer } from 'echarts/renderers'
import { CallbackDataParams } from "echarts/types/dist/shared";

import { ref, onMounted, onUnmounted, markRaw } from "vue";
import { ActorTagStore } from "../../store/ActorTagStore";
import { getRelativesByTag } from "../../ctrls/ChartCtrl";
import { TagCount } from "../../data/Interfaces";
import { formatGrid, formatCategoryAxis, formatValueAxis, formatCommonTextStyle } from '../../data/ChartUtil';
import { logError } from '../../ctrls/FetchCtrl';

echarts.use([
	BarChart,
	GridComponent,
	TooltipComponent,
	CanvasRenderer
]);

const actorTagStore = ActorTagStore()

const cur_tag_id = ref(0)
const tag_count = ref(10)
const count_list = ref<TagCount[]>([])
const dom_chart = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

async function refreshData() {
	const [ok, tag_list] = await getRelativesByTag(cur_tag_id.value, tag_count.value)
	if (ok) {
		refreshChart(tag_list)
	}
}
function formatCategory(tc: TagCount) {
	return {
		value: actorTagStore.getName(tc.tag_id),
		textStyle: formatCommonTextStyle(actorTagStore.getBgColor(tc.tag_id))
	}
}
function formatCount(tc: TagCount) {
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
		barMaxWidth: 50,
		colorBy: 'data', // bar color is data.itemStyle.color
		data: data,
		label: {
			show: true,
			position: 'right',
			distance: 15,
			align: 'left',
			verticalAlign: 'middle',
			fontSize: 18,
		},
	}
}

function refreshChart(tag_list: TagCount[]) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	tag_list.reverse()

	count_list.value = tag_list

	const category_data = tag_list.map(formatCategory)
	const value_data = tag_list.map(formatCount)

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

function onChartClick(params: CallbackDataParams) {
	cur_tag_id.value = count_list.value[params.dataIndex].tag_id
	refreshData()
}

onMounted(() => {
	if (dom_chart.value) {
		chart.value = markRaw(echarts.init(dom_chart.value))
		chart.value.on('click', onChartClick)
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