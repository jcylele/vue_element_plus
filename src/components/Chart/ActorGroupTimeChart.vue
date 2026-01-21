<template>
	<div class="left-column">
		<el-form label-width="150px" label-position="left">
			<el-form-item label="Date Range">
				<el-date-picker v-model="date_range" type="daterange" range-separator="To"
					start-placeholder="Start date" end-placeholder="End date" />
			</el-form-item>
			<el-form-item label="Actor Groups">
				<el-select v-model="cur_group_ids" clearable multiple>
					<el-option v-for="actor_group in actorGroupStore.sorted_list" :key="actor_group.group_id"
						:label="actor_group.group_name" :value="actor_group.group_id" />
				</el-select>
			</el-form-item>
			<el-form-item label="Op">
				<el-button type="primary" @click="refreshData">Refresh</el-button>
			</el-form-item>
		</el-form>
		<div ref="dom_chart" style="width: 1280px;height: 480px"></div>
	</div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, markRaw } from 'vue';
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { getGroupTimeStats } from '../../ctrls/ChartCtrl';
import { ActorGroupStore } from '../../store/ActorGroupStore';
import { IGroupTimeStats } from '../../data/SchemasOthers';
import { logError } from '../../ctrls/FetchCtrl';
import { formatCategoryAxis, formatCommonTextStyle, formatGrid, formatLegend, formatTooltip, formatValueAxis } from '../../data/ChartUtil';
import { ActorGroupData } from '../../data/ActorGroupData';
import { format_date } from '../../data/DataUtil';

// 注册 ECharts 组件
echarts.use([
	BarChart,
	TooltipComponent,
	LegendComponent,
	GridComponent,
	CanvasRenderer
]);

const actorGroupStore = ActorGroupStore()

const date_range = ref<[Date, Date] | null>(null);
const cur_group_ids = ref([]);
const dom_chart = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

function validateDateRange() {
	if (!date_range.value) {
		logError('Invalid date range')
		return false
	}
	const [startDate, endDate] = date_range.value;
	const dateDiff = endDate.getTime() - startDate.getTime();
	const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
	if (daysDiff >= 365) {
		logError('Date range cannot be more than 1 year')
		return false
	}

	return true
}

async function refreshData() {
	if (cur_group_ids.value.length === 0) {
		logError('Please select at least one actor group')
		return
	}

	if (!validateDateRange()) {
		return
	}

	const start_date = format_date(new Date(date_range.value![0]))
	const end_date = format_date(new Date(date_range.value![1]))
	const [ok, group_time_stats] = await getGroupTimeStats(cur_group_ids.value, start_date, end_date)
	if (ok) {
		refreshChart(group_time_stats)
	}
}

function formatSeriesItem(group: ActorGroupData, data: number[]) {
	return {
		name: group.group_name,
		type: 'bar',
		stack: 'total',
		emphasis: {
			focus: 'series'
		},
		barMaxWidth: 50,
		data: data,
		itemStyle: { color: group.group_color }
	}
}

function refreshChart(group_time_stats: IGroupTimeStats[]) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	// 处理数据，按日期和组ID分组
	const dataMap = new Map<string, Map<number, number>>()

	group_time_stats.forEach(stat => {
		const dateKey = stat.stat_date
		if (!dataMap.has(dateKey)) {
			dataMap.set(dateKey, new Map())
		}
		dataMap.get(dateKey)!.set(stat.actor_group_id, stat.actor_count)
	})

	// 获取所有日期和组ID
	const dates = Array.from(dataMap.keys()).sort()
	const groupIds = Array.from(new Set(group_time_stats.map(s => s.actor_group_id))).sort()

	// 构建系列数据
	const series = groupIds.map(groupId => {
		const group = actorGroupStore.get(groupId)
		const data = dates.map(date => {
			const groupData = dataMap.get(date)
			return groupData ? (groupData.get(groupId) || 0) : 0
		})

		return formatSeriesItem(group, data)
	})

	const option = {
		textStyle: formatCommonTextStyle(),
		grid: formatGrid(true),
		tooltip: formatTooltip(),
		legend: formatLegend(),
		xAxis: formatCategoryAxis(dates, true),
		yAxis: formatValueAxis(),
		series: series
	}

	chart.value.setOption(option)
}

onMounted(() => {
	if (dom_chart.value) {
		chart.value = markRaw(echarts.init(dom_chart.value))
		// const mode = isDark.value ? 'dark' : 'default'
		// console.log('mode', mode)
		// chart.value.setTheme(mode)
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