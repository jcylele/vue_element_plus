<template>
    <el-form label-width="120px" label-position="left">
        <el-form-item label="Tag">
            <el-select v-model="cur_tag_id"
                       style="width: 150px;"
                       filterable clearable>
                <el-option
                    v-for="actor_tag in actor_tag_list"
                    :key="actor_tag.tag_id"
                    :label="actor_tag.tag_name"
                    :value="actor_tag.tag_id"
                />
            </el-select>
        </el-form-item>
        <el-form-item label="Tag Count">
            <el-input-number v-model="tag_count" :min="1" :max="20"/>
        </el-form-item>
        <el-form-item label="Op">
            <el-button type="primary" @click="refreshData">Refresh</el-button>
        </el-form-item>
    </el-form>
    <div id="tag_relatives" style="width: 1280px;height: 600px"></div>
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
import {TagCount} from "../../data/Interfaces";
import {tag_relative_option} from "../../data/ChartOptionData";

export default {
    name: "TagRelativeChart",
    data() {
        return {
            cur_tag_id: 0,
            tag_count: 10,
            count_list: [] as TagCount[],
            tagChart: undefined as ECharts
        }
    },
    computed: {
        ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagName: 'getName',
        }),
        async refreshData() {
            const [ok, tag_list] = await getRelativesByTag(this.cur_tag_id, this.tag_count)
            if (ok) {
                this.refreshChart(tag_list)
            }
        },
        refreshChart(tag_list: TagCount[]) {
            tag_list.reverse()
            this.count_list = tag_list

            const chart_option = tag_relative_option
            chart_option.yAxis.data = tag_list.map(a => this.getTagName(a.tag_id))
            chart_option.series[0].data = tag_list.map(a => a.count)

            this.tagChart.setOption(chart_option, true)
        },
        onChartClick(params: CallbackDataParams) {
            const tag_id = this.count_list[params.dataIndex].tag_id
            this.cur_tag_id = tag_id
            this.refreshData()
        },
    },
    mounted() {
        console.log(`Tag Relative Chart mounted`)
        this.tagChart = echarts.init(document.getElementById('tag_relatives'));
        this.tagChart.on('click', this.onChartClick);
    }
}

</script>

<style scoped>
</style>