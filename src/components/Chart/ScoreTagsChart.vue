<template>
  <el-space direction="vertical" alignment="flex-start">
    <el-text style="font-size: 24px">
      Choose Score Range
    </el-text>
    <el-slider v-model="scores"
               :min="0" :max="10"
               range show-stops
               style="width: 400px;"
               @change="onScoreChange"/>
    <div id="score_tags" style="width: 640px;height: 640px"></div>
  </el-space>
</template>

<script lang="ts">
import * as echarts from "echarts/core";
import {BarChart} from "echarts/charts";

import {
  TooltipComponent,
  DatasetComponent,
  TransformComponent, TitleComponentOption, GridComponentOption
} from "echarts/components";

import {LabelLayout, UniversalTransition} from 'echarts/features'

import {CanvasRenderer} from 'echarts/renderers'

import type {
  BarSeriesOption
} from 'echarts/charts'

import type {
  ComposeOption
} from 'echarts/core'

type ScoreTagsOption = ComposeOption<| BarSeriesOption
    | TitleComponentOption
    | GridComponentOption>;

echarts.use([
  BarChart,
  TooltipComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

import {getTagsByScore} from "../../ctrls/ChartCtrl.js";
import {mapActions} from "pinia";
import {ActorTagStore} from "../../store/ActorTagStore";
import {ECharts} from "echarts";

interface TagCount {
  tag_id: number,
  count: number
}

export default {
  name: "ScoreTagsChart",
  data() {
    return {
      scores: [0, 10],
      tagChart: undefined as ECharts,
      chart_option: {
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: []
        },
        series: [{
          type: 'bar',
          data: [],
          // color: []
        }]
      } as ScoreTagsOption
    }
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagName: 'getName',
    }),
    async onScoreChange() {
      const [ok, tag_list] = await getTagsByScore(this.scores[0], this.scores[1])
      if (ok) {
        this.refreshChart(tag_list)
      }
    },
    refreshChart(tag_list: TagCount[]) {
      tag_list.sort((a, b) => b.count - a.count)
      tag_list = tag_list.slice(0, 10)
      console.log(tag_list)

      this.chart_option.yAxis.data = tag_list.map(a => this.getTagName(a.tag_id))
      this.chart_option.series[0].data = tag_list.map(a => a.count)

      this.tagChart.setOption(this.chart_option)
    },
    // TODO why mounted if not called
    mounted() {
      console.log("init this.tagChart")
      this.tagChart = echarts.init(document.getElementById('score_tags'));
    }
  }
}
</script>

<style scoped>

</style>