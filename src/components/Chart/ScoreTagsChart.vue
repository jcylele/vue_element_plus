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
import {PieChart} from "echarts/charts";

import {
  TooltipComponent,
  DatasetComponent,
  TransformComponent
} from "echarts/components";

import {LabelLayout, UniversalTransition} from 'echarts/features'

import {CanvasRenderer} from 'echarts/renderers'

import type {
  PieSeriesOption
} from 'echarts/charts'

import type {
  ComposeOption
} from 'echarts/core'

type ScoreTagsOption = ComposeOption<| PieSeriesOption>;

echarts.use([
  PieChart,
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

interface TagCount {
  tag_id: number,
  count: number
}

export default {
  name: "ScoreTagsChart",
  data() {
    return {
      scores: [0, 10],
      chart_option: {
        series: [{
          type: 'pie',
          data: [],
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
      const data_list = []
      for (const tag_info of tag_list) {
        const tagName = this.getTagName(tag_info.tag_id);
        data_list.push({name: tagName, value: tag_info.count})
      }
      this.chart_option.series[0].data = data_list

      const chart = echarts.init(document.getElementById('score_tags'));
      chart.setOption(this.chart_option)
    },
    mounted() {

    }
  }
}
</script>

<style scoped>

</style>