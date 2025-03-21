<template>
    <el-space direction="vertical" alignment="flex-start">
        <el-button type="primary"
                   @click="is_choosing_tags = true">
            Choose Tags
        </el-button>
        <div ref="dom_tag_scores" style="width: 1280px;height: 480px"></div>
    </el-space>
    <el-dialog v-model="is_choosing_tags"
               :title="actor.actor_name"
               width="67%">
        <ActorTagChooser :actor="actor"
                         @submit="onSubmitTag"
                         @cancel="onCancelTag"
        />
    </el-dialog>
</template>

<script lang="ts">
import * as echarts from 'echarts/core'
import {BarChart} from "echarts/charts";
import 'echarts/lib/component/legend'
import {
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
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

import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../../store/ActorTagStore";
import {getScoresByTag} from "../../ctrls/ChartCtrl";
import {MAX_SCORE} from "../../data/Consts";
import ActorData from "../../data/ActorData";
import ActorTagChooser from "../ActorTagChooser.vue";
import {ref} from "vue";

export default {
    name: "TagScoresChart",
    components: {ActorTagChooser},
    setup() {
        const dom_tag_scores = ref(null)
        return {
            dom_tag_scores
        }
    },
    data() {
        return {
            is_choosing_tags: false,
            actor: new ActorData(),
            tag_scores_chart: undefined as BarChart,
            tag_scores_option: {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: [] // dynamic data
                },
                xAxis: [
                    {
                        type: 'category',
                        data: [] // dynamic data
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: []  //template: tag_score_series_item
            },
            tag_scores_series_item: {
                name: '', // dynamic data
                type: 'bar',
                label: {
                    show: true,
                    position: 'top',
                    distance: 15,
                    align: 'center',
                    verticalAlign: 'middle',
                    fontSize: 16,
                },
                emphasis: {
                    focus: 'series'
                },
                data: [] // dynamic data
            },
        }
    },
    computed: {
        ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagBgColor: 'getBgColor',
            getTagName: 'getName',
        }),
        async onSubmitTag(new_tag_list: number[]) {
            this.is_choosing_tags = false
            this.actor.tag_ids = new_tag_list
            const [ok, score_arr] = await getScoresByTag(new_tag_list)
            if (ok) {
                this.refreshChart(score_arr)
            }
        },
        onCancelTag() {
            this.is_choosing_tags = false
        },
        refreshChart(score_arr) {
            console.log(score_arr)
            // x axis 0-12
            const x_axis = []
            for (let i = 0; i <= MAX_SCORE; i++) {
                x_axis.push(i)
            }
            this.tag_scores_option.xAxis[0].data = x_axis

            // legend
            const legend_names = this.actor.tag_ids.map(tag_id => this.getTagName(tag_id))
            this.tag_scores_option.legend.data = legend_names

            // series
            const series_items = []
            for (let i = 0; i < score_arr.length; i++) {
                const series_item = Object.assign({}, this.tag_scores_series_item)
                series_item.name = legend_names[i]
                series_item.data = score_arr[i]
                series_items.push(series_item)
            }
            this.tag_scores_option.series = series_items

            this.tag_scores_chart.setOption(this.tag_scores_option, true)
        },
    },
    mounted() {
        // 2. 判断 dom 是否为空或未定义
        if (this.tag_scores_chart != null && this.tag_scores_chart != "" && this.tag_scores_chart != undefined) {
            // 3. 已存在则调用 dispose() 方法销毁
            this.tag_scores_chart.dispose();
        }
        this.tag_scores_chart = echarts.init(this.dom_tag_scores);


        this.actor.actor_name = "fake actor"
        this.actor.tag_ids = []
    },
}

</script>

<style scoped>
</style>