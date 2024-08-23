<template>
  <el-space direction="vertical" alignment="flex-start">
    <el-text style="font-size: 24px">
      Choose Tag
    </el-text>
    <el-select v-model="cur_tag_id"
               @change="onCheckedTagChange"
               style="width: 120px;"
               filterable clearable>
      <el-option
          v-for="actor_tag in actor_tag_list"
          :key="actor_tag.tag_id"
          :label="actor_tag.tag_name"
          :value="actor_tag.tag_id"
      />
    </el-select>
    <div id="tag_relatives" style="width: 840px;height: 420px"></div>
  </el-space>
</template>

<script lang="ts">
import * as echarts from 'echarts/core'
import {BarChart} from "echarts/charts";

import {
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from "echarts/components";

import {LabelLayout, UniversalTransition} from 'echarts/features'

import {CanvasRenderer} from 'echarts/renderers'

import type {
  BarSeriesOption
} from 'echarts/charts'

import type {
  TitleComponentOption,
  GridComponentOption
} from "echarts/components";
import type {
  ComposeOption
} from 'echarts/core'

type TagRelativesOption = ComposeOption<| BarSeriesOption
    | TitleComponentOption
    | GridComponentOption>;

echarts.use([
  BarChart,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../../store/ActorTagStore";
import {getRelativesByTag} from "../../ctrls/ChartCtrl";
import {CallbackDataParams} from "echarts/types/dist/shared";
import {ECharts} from "echarts";

export default {
  name: "TagRelativeChart",
  data() {
    return {
      cur_tag_id: 0,
      count_list: [] as number[][],
      tagChart: undefined as ECharts,
      chart_option: {
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: [],
        },
        series: [{
          type: 'bar',
          data: [],
          color: []
        }]
      } as TagRelativesOption
    }
  },
  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagName: 'getName',
    }),
    async onCheckedTagChange() {
      const [ok, count_map] = await getRelativesByTag(this.cur_tag_id)
      if (ok) {
        this.count_list = Array.from(count_map)
        this.count_list.sort((a, b) => a[1] - b[1])
        // take top 10, self is included, so be 11
        this.count_list = this.count_list.slice(-11)

        this.refreshChart()
      }
    },
    refreshChart() {
      this.chart_option.yAxis.data = this.count_list.map(a => this.getTagName(a[0]))
      this.chart_option.series[0].data = this.count_list.map(a => a[1])

      this.tagChart.setOption(this.chart_option)
    },
    onChartClick(params: CallbackDataParams){
      const tag_id = this.count_list[params.dataIndex][0]
      this.cur_tag_id = tag_id
      this.onCheckedTagChange()
    },
  },
  mounted() {
    this.tagChart = echarts.init(document.getElementById('tag_relatives'));
    this.tagChart.on('click', this.onChartClick);
  }
}

</script>

<style scoped>
</style>