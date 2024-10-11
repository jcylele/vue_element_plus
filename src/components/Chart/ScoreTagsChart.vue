<template>
    <el-form label-width="120px" label-position="left">
        <el-form-item label="Score Range">
            <el-slider v-model="scores"
                       :min="0" :max="max_score"
                       range show-stops
                       style="width: 250px;"/>
        </el-form-item>
        <el-form-item label="Tag Count">
            <el-input-number v-model="tag_count" :min="1" :max="20"/>
        </el-form-item>
        <el-form-item label="Op">
            <el-button type="primary" @click="refreshData">Refresh</el-button>
        </el-form-item>
    </el-form>
    <div id="score_tags" style="width: 640px;height: 480px"></div>
</template>

<script lang="ts">
import * as echarts from "echarts/core";
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

type ScoreTagsOption = ComposeOption<| BarSeriesOption
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

import {getTagsByScore} from "../../ctrls/ChartCtrl.js";
import {mapActions} from "pinia";
import {ActorTagStore} from "../../store/ActorTagStore";
import {ECharts} from "echarts";
import {MAX_SCORE} from "../../data/Consts";
import {TagCount} from "../../data/Interfaces";

export default {
    name: "ScoreTagsChart",
    computed: {
        max_score() {
            return MAX_SCORE
        }
    },
    data() {
        return {
            tag_count: 10,
            scores: [0, MAX_SCORE],
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
        async refreshData() {
            const [ok, tag_list] = await getTagsByScore(this.scores[0], this.scores[1], this.tag_count)
            if (ok) {
                this.refreshChart(tag_list)
            }
        },
        refreshChart(tag_list: TagCount[]) {
            tag_list.reverse()
            this.chart_option.yAxis.data = tag_list.map(a => this.getTagName(a.tag_id))
            this.chart_option.series[0].data = tag_list.map(a => a.count)

            this.tagChart.setOption(this.chart_option)
        },
    },
    mounted() {
        console.log(`Score Tags Chart mounted`)
        this.tagChart = echarts.init(document.getElementById('score_tags'));
    },
}
</script>

<style scoped>

</style>