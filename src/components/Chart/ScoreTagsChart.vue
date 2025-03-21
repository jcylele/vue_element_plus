<template>
    <el-form label-width="120px" label-position="left">
        <el-form-item label="Score Range">
            <el-slider v-model="scores"
                       :min="0" :max="max_score"
                       range show-stops
                       style="width: 360px;"/>
        </el-form-item>
        <el-form-item label="Tag Count">
            <el-input-number v-model="tag_count" :min="1" :max="20"/>
        </el-form-item>
        <el-form-item label="Op">
            <el-button type="primary" @click="refreshData">Refresh</el-button>
        </el-form-item>
    </el-form>
    <div ref="dom_score_tags" style="width: 1280px;height: 480px"></div>
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
import {MAX_SCORE} from "../../data/Consts";
import {TagCount} from "../../data/Interfaces";
import {ref} from "vue";

export default {
    name: "ScoreTagsChart",
    computed: {
        max_score() {
            return MAX_SCORE
        }
    },
    setup() {
        const dom_score_tags = ref(null)
        return {
            dom_score_tags
        }
    },
    data() {
        return {
            tag_count: 10,
            scores: [0, MAX_SCORE],
            score_tags_chart: undefined as BarChart,
            score_tag_option: {
                grid: {
                    top: '5%',
                    left: '10%',
                    right: '10%',
                    bottom: '5%',
                },
                xAxis: {
                    type: 'value',
                },
                yAxis: {
                    type: 'category',
                    data: [],
                },
                series: [
                    {
                        type: 'bar',
                        barWidth: "80%",
                        barMaxWidth: 50,
                        colorBy: 'data', // bar color is data.itemStyle.color
                        data: [],
                        label: {
                            show: true,
                            position: 'right',
                            distance: 15,
                            align: 'left',
                            verticalAlign: 'middle',
                            fontSize: 18,
                        },
                    }
                ]
            }
        }
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagBgColor: 'getBgColor',
            getTagName: 'getName',
        }),
        async refreshData() {
            const [ok, tag_list] = await getTagsByScore(this.scores[0], this.scores[1], this.tag_count)
            if (ok) {
                this.refreshChart(tag_list)
            }
        },
        formatCategory(tc: TagCount) {
            return {
                value: this.getTagName(tc.tag_id),
                textStyle: {
                    color: this.getTagBgColor(tc.tag_id),
                    fontSize: 16
                }
            }
        },
        formatCount(tc: TagCount) {
            return {
                value: tc.count,
                itemStyle: {
                    color: this.getTagBgColor(tc.tag_id)
                }
            }
        },
        refreshChart(tag_list: TagCount[]) {
            tag_list.reverse()

            this.score_tag_option.yAxis.data = tag_list.map(a => this.formatCategory(a))

            this.score_tag_option.series[0].data = tag_list.map(a => this.formatCount(a))

            this.score_tags_chart.setOption(this.score_tag_option, true)
        },
    },
    mounted() {
        // 2. 判断 dom 是否为空或未定义
        if (this.score_tags_chart != null && this.score_tags_chart != "" && this.score_tags_chart != undefined) {
            // 3. 已存在则调用 dispose() 方法销毁
            this.score_tags_chart.dispose();
        }
        this.score_tags_chart = echarts.init(this.dom_score_tags);
    },
}
</script>

<style scoped>

</style>