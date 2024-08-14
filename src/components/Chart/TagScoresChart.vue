<template>
  <el-space direction="vertical" alignment="flex-start">
    <el-text style="font-size: 24px">
      Choose Tag
    </el-text>
    <el-select v-model="cur_tag_id"
               @change="onCheckedTagChange"
               filterable clearable>
      <el-option
          v-for="actor_tag in actor_tag_list"
          :key="actor_tag.tag_id"
          :label="actor_tag.tag_name"
          :value="actor_tag.tag_id"
      />
    </el-select>
    <div id="tag_scores" style="width: 640px;height: 420px"></div>
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

type TagScoresOption = ComposeOption<| BarSeriesOption
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

import {mapState} from "pinia";
import {ActorTagStore} from "../../store/ActorTagStore";
import {getScoresByTag} from "../../ctrls/ChartCtrl";
import {Star_Colors} from "../../data/Consts";

export default {
  name: "TagScoresChart",
  data() {
    return {
      cur_tag_id: 0,
      chart_option: {
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar',
          data: [],
          color: []
        }]
      } as TagScoresOption
    }
  },
  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
  },
  methods: {
    async onCheckedTagChange() {
      const [ok, score_list] = await getScoresByTag(this.cur_tag_id)
      if (ok) {
        this.refreshChart(score_list)
      }
    },
    refreshChart(score_list) {
      this.chart_option.series[0].data = score_list

      const tagChart = echarts.init(document.getElementById('tag_scores'));
      tagChart.setOption(this.chart_option)
    },
    initChartOption() {
      const colors = []
      const x_axis = []
      for (let i = 0; i < 11; i++) {
        x_axis.push(i)
        colors.push(Star_Colors[Math.ceil(i / 2)])
      }
      this.chart_option.series[0].color = colors
      this.chart_option.xAxis.data = x_axis
    }
  },
  mounted() {
    this.initChartOption()
  }
}

</script>

<style scoped>
</style>