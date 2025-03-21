<template>
    <div ref="dom_video_sizes" style="width: 720px;height: 360px"></div>
</template>

<script lang="ts">
import * as echarts from "echarts/core";
import {BarChart} from "echarts/charts";
import 'echarts/lib/component/legend'

import {DatasetComponent, GridComponent, TooltipComponent, TransformComponent} from "echarts/components";

import {LabelLayout, UniversalTransition} from 'echarts/features'

import {CanvasRenderer} from 'echarts/renderers'
import {getVideoSizes} from "../../ctrls/ActorCtrl";
import {ResStateList, str_res_state, video_state_color} from "../../data/Consts";
import {ref} from "vue";
import ResSizeCount from "../../data/ResSizeCount";

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

export default {
    name: "ScoreTagsChart",
    computed: {},
    setup() {
        const dom_video_sizes = ref(null)
        return {
            dom_video_sizes
        }
    },
    data() {
        return {
            video_sizes_chart: undefined as BarChart,
            video_sizes_option: {
                grid: {
                    top: '5%',
                    left: '10%',
                    right: '10%',
                    bottom: '5%',
                },
                legend: {
                    orient: 'vertical',
                    right: '5%',
                    top: '5%',
                    data: [] // dynamic data
                },
                xAxis: [
                    {
                        type: 'value',
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        data: [] // dynamic data
                    }
                ],
                series: [] //template: video_sizes_series_item
            },
            video_sizes_series_item: {
                name: '', // dynamic data
                type: 'bar',
                barWidth: "80%",
                stack: 'x',
                itemStyle: {
                    // Color of the point.
                    color: 'red'
                },
                data: [] // dynamic data
            }
        }
    },
    props: {
        actor_id: Number,
    },
    methods: {
        async refreshData() {
            const [ok, rsc_list] = await getVideoSizes(this.actor_id)
            if (ok) {
                this.refreshChart(rsc_list)
            }
        },
        refreshChart(rsc_list: ResSizeCount[]) {
            // console.log(rsc_list)
            this.video_sizes_option.yAxis[0].data = rsc_list.map(rsc => rsc.str_size)

            this.video_sizes_option.legend.data = ResStateList.map(res_state => str_res_state[res_state])

            const series_items = []
            for (const res_state of ResStateList) {
                const series_item = Object.assign({}, this.video_sizes_series_item)
                series_item.itemStyle = {color: video_state_color[res_state]}
                series_item.name = str_res_state[res_state]
                series_item.data = rsc_list.map(rsc => rsc.resCount(res_state))
                series_items.push(series_item)
            }
            this.video_sizes_option.series = series_items

            this.video_sizes_chart.setOption(this.video_sizes_option, true)
        },
    },
    mounted() {
        // 2. 判断 dom 是否为空或未定义
        if (this.video_sizes_chart != null && this.video_sizes_chart != "" && this.video_sizes_chart != undefined) {
            // 3. 已存在则调用 dispose() 方法销毁
            this.video_sizes_chart.dispose();
        }
        this.video_sizes_chart = echarts.init(this.dom_video_sizes)
        this.refreshData()
    },
}
</script>

<style scoped>

</style>