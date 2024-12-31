<template>
    <el-space direction="vertical" alignment="flex-start">
        <el-button type="primary"
                   @click="is_choosing_tags = true">
            Choose Tags
        </el-button>
        <div id="tag_scores" style="width: 1280px;height: 600px"></div>
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
import {ECharts} from "echarts";
import ActorData from "../../data/ActorData";
import ActorTagChooser from "../ActorTagChooser.vue";
import {tag_score_option, tag_score_series_item} from "../../data/ChartOptionData";

export default {
    name: "TagScoresChart",
    components: {ActorTagChooser},
    data() {
        return {
            is_choosing_tags: false,
            tagChart: undefined as ECharts,
            actor: new ActorData(),
        }
    },
    computed: {
        ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagStyleName: 'getStyleName',
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
            const chart_option = tag_score_option
            // x axis 0-10
            const x_axis = []
            for (let i = 0; i <= MAX_SCORE; i++) {
                x_axis.push(i)
            }
            chart_option.xAxis[0].data = x_axis

            // legend and series
            const tag_names = this.actor.tag_ids.map(tag_id => this.getTagName(tag_id))
            chart_option.legend.data = tag_names;

            const series_items = []
            for (let i = 0; i < score_arr.length; i++) {
                const series_item = Object.assign({}, tag_score_series_item);
                series_item.name = tag_names[i]
                series_item.data = score_arr[i]
                series_items.push(series_item)
            }
            chart_option.series = series_items

            this.tagChart.setOption(chart_option, true)
        },
    },
    mounted() {
        console.log(`Tag Scores Chart mounted`)
        this.tagChart = echarts.init(document.getElementById('tag_scores'));

        this.actor.actor_name = "fake actor"
        this.actor.tag_ids = []
    },
}

</script>

<style scoped>
</style>