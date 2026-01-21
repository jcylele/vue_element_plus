<template>
	<div class="left-column">
		<el-form label-width="150px" label-position="left">
			<el-form-item label="Type">
				<el-radio-group v-model="chart_type">
					<el-radio :value="EChartType.Prefix" size="large">Prefix</el-radio>
					<el-radio :value="EChartType.Postfix" size="large">Postfix</el-radio>
					<el-radio :value="EChartType.Substring" size="large">Substring</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="Length">
				<el-input-number v-model="min_length" :min="1" :max="20" @change="onMinLengthChange" />
				<span> - </span>
				<el-input-number v-model="max_length" :min="1" :max="20" @change="onMaxLengthChange" />
			</el-form-item>
			<el-form-item label="Top Count">
				<el-input-number v-model="top_count" :min="1" :max="20" />
			</el-form-item>
			<el-form-item label="Op">
				<el-button type="primary" @click="refreshData">Refresh</el-button>
			</el-form-item>
		</el-form>
		<div ref="dom_chart" :style="{ 'width': '1280px', 'height': chart_height_str }"></div>
	</div>
</template>

<script setup lang="ts">
// imports
import * as echarts from "echarts/core";
import { TooltipComponent } from 'echarts/components';
import { TreeChart, SankeyChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([TooltipComponent, TreeChart, SankeyChart, CanvasRenderer]);

import { onMounted, onUnmounted, markRaw, ref, computed } from "vue";
import { getActorNameStats, getActorNameSubstringStats } from "../../ctrls/ChartCtrl";
import { IActorNameStatsData, IActorNameStatsNode } from "../../data/SchemasOthers";
import { logError } from "../../ctrls/FetchCtrl";
import { ECssVarName } from "../../data/Enums";
import { formatCommonTextStyle } from "../../data/ChartUtil";


enum EChartType {
	Prefix = 0,
	Postfix = 1,
	Substring = 2
}

interface ISankeyData {
	name: string
	value: number
	depth: number
	is_other: boolean
}

interface ISankeyLink {
	source: string
	target: string
	value: number
}

// emits
// stores/routers
// props/models
// variables
const dom_chart = ref<HTMLElement | null>(null)
const chart = ref<echarts.ECharts | null>(null)

const chart_type = ref(EChartType.Prefix)
const min_length = ref(2)
const max_length = ref(8)
const top_count = ref(10)
const chart_height = ref(600)
// computed
const chart_height_str = computed(() => {
	return `${chart_height.value}px`
})
// watch
// methods
function onMinLengthChange() {
	if (min_length.value > max_length.value) {
		max_length.value = min_length.value
	}
}
function onMaxLengthChange() {
	if (max_length.value < min_length.value) {
		min_length.value = max_length.value
	}
}
async function refreshData() {
	chart_height.value = 600 + (top_count.value - 10) * 45
	switch (chart_type.value) {
		case EChartType.Prefix:
			{
				const [ok, data] = await getActorNameStats(true, min_length.value, max_length.value, top_count.value)
				if (ok) {
					refreshTreeChart(data)
				}
			}
			break
		case EChartType.Postfix:
			{
				const [ok, data] = await getActorNameStats(false, min_length.value, max_length.value, top_count.value)
				if (ok) {
					refreshTreeChart(data)
				}
			}
			break
		case EChartType.Substring:
			{
				const [ok, data] = await getActorNameSubstringStats(min_length.value, max_length.value, top_count.value)
				if (ok) {
					refreshSankeyChart(data as IActorNameStatsData[][])
				}
			}
			break
	}
}

function refreshSankeyChart(data: IActorNameStatsData[][]) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	chart.value.resize()

	const { nodes, links } = convertToSankey(data)
	chart.value.setOption({
		tooltip: {
			trigger: 'item',
			triggerOn: 'mousemove'
		},
		animation: false,
		series: [
			{
				type: 'sankey',
				layoutIterations: 0,  // 禁止布局迭代，按nodes顺序排序？
				emphasis: {
					focus: 'adjacency'
				},
				nodeAlign: 'right',
				nodeGap: 16,  // 同一层节点之间的间距（像素）
				data: nodes,
				links: links,
				lineStyle: {
					color: 'source',
					curveness: 0.5
				},
				label: formatCommonTextStyle(ECssVarName.ElFontSizeLarge),
			}
		]
	})
}

function convertToSankey(data: IActorNameStatsData[][]) {
	const nodes: ISankeyData[] = []
	const links: ISankeyLink[] = []
	let last_nodes_dict: Map<string, ISankeyData> = new Map()
	let last_missing_node: ISankeyData | null = null
	let current_nodes_dict: Map<string, ISankeyData> = new Map()
	for (let i = data.length - 1; i >= -1; i--) {
		if (i >= 0) {
			for (const item of data[i]) {
				current_nodes_dict.set(item.segment, {
					name: item.segment,
					value: item.count,
					depth: i + 1,
					is_other: false
				})
			}
		}
		// link last to current
		const missing_name = `${i + 1}`
		let missing_value = 0
		for (const last_node of last_nodes_dict.values()) {
			// prefix
			let prefix = last_node.name.substring(0, last_node.name.length - 1)
			if (!current_nodes_dict.has(prefix)) {
				prefix = missing_name
				missing_value += last_node.value
			}
			links.push({
				source: prefix,
				target: last_node.name,
				value: last_node.value
			})
			// postfix
			let postfix = last_node.name.substring(1)
			if (!current_nodes_dict.has(postfix)) {
				postfix = missing_name
				missing_value += last_node.value
			}
			links.push({
				source: postfix,
				target: last_node.name,
				value: last_node.value
			})
		}
		if (last_missing_node) {
			missing_value += last_missing_node.value
		}
		if (missing_value > 0) {
			let cur_missing_node: ISankeyData = {
				name: missing_name,
				value: missing_value,
				depth: i + 1,
				is_other: true
			}
			nodes.push(cur_missing_node)

			if (last_missing_node) {
				links.push({
					source: cur_missing_node.name,
					target: last_missing_node.name,
					value: last_missing_node.value
				})
			}

			last_missing_node = cur_missing_node
		}

		for (const node of current_nodes_dict.values()) {
			nodes.push(node)
		}
		last_nodes_dict = current_nodes_dict
		current_nodes_dict = new Map()
	}
	nodes.sort((a, b) => {
		if (a.depth !== b.depth) {
			return a.depth - b.depth  // 先按深度排序
		}
		if (a.is_other && !b.is_other) {
			return 1
		}
		if (!a.is_other && b.is_other) {
			return -1
		}
		return b.value - a.value  // 同层按 value 降序
	})
	return { nodes, links }
}

function refreshTreeChart(data: IActorNameStatsNode) {
	if (!chart.value) {
		logError('Chart not initialized')
		return
	}

	chart.value.resize()

	const echartsData = convertToTreeNode(data)
	chart.value.setOption({
		tooltip: {
			trigger: 'item',
			triggerOn: 'mousemove',
			formatter: (params: any) => {
				const data = params.data
				if (data.rank > 0) {
					return `${data.name}<br/>出现次数: ${data.value}<br/>排名: ${data.rank}`
				} else if (data.value > 0) {
					return `${data.name}<br/>出现次数: ${data.value}`
				} else {
					return data.name
				}

			}
		},
		series: [
			{
				type: 'tree',
				data: [echartsData],
				top: '5%',
				left: '5%',
				bottom: '5%',
				right: '10%',
				symbolSize: 7,
				initialTreeDepth: -1,  // 添加这行：-1 表示展开所有层级
				label: {
					position: 'left',
					verticalAlign: 'middle',
					align: 'right',
					fontSize: 9,
					offset: [0, -6]
					// formatter 和 rich 会在节点数据中覆盖这里的设置
				},
				leaves: {
					label: {
						position: 'right',
						verticalAlign: 'middle',
						align: 'left',
						offset: [0, 0]
					}
				},
				emphasis: {
					focus: 'relative'
				},
				expandAndCollapse: true,
				animationDuration: 550,
				animationDurationUpdate: 750
			}
		]
	})
}

function convertToTreeNode(node: IActorNameStatsNode): any {
	return {
		name: node.segment,  // ECharts 需要 name 字段
		value: node.count,   // 用于显示数值
		rank: node.rank,  // 保留原始信息用于样式判断
		itemStyle: {
			// 根据 rank 设置节点颜色
			color: node.rank > 0 ? '#ff6b6b' : '#4ecdc4',
			borderColor: node.rank > 0 ? '#ff4757' : '#26de81',
			borderWidth: node.rank > 0 ? 2 : 1
		},
		symbolSize: 10,
		label: {
			// 使用 rich 样式，根据 rank 显示不同样式
			formatter: (params: any) => {
				const data = params.data
				const styleName = data.rank > 0 ? 'topTier' : 'normal'
				return `{${styleName}|${data.name}}{count|(${data.value})}`
			},
			rich: {
				topTier: {
					fontSize: 16,
					fontWeight: 'bold',
					color: '#ff6b6b',
					padding: [2, 4]
				},
				normal: {
					fontSize: 14,
					color: '#4ecdc4'
				},
				count: {
					fontSize: 12,
					color: '#999'
				}
			}
		},
		children: node.children?.map(child => convertToTreeNode(child)) || []
	}
}

// lifecycle
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