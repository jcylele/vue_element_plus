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
    <div ref="dom_tag_relative" style="width: 1280px;height: 480px"></div>
</template>

<script lang="ts">
import * as echarts from 'echarts/core'
import {BarChart} from "echarts/charts";

import {DatasetComponent, GridComponent, TooltipComponent, TransformComponent} from "echarts/components";

import {LabelLayout, UniversalTransition} from 'echarts/features'

import {CanvasRenderer} from 'echarts/renderers'
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../../store/ActorTagStore";
import {getRelativesByTag} from "../../ctrls/ChartCtrl";
import {CallbackDataParams} from "echarts/types/dist/shared";
import {TagCount} from "../../data/Interfaces";
import {ref} from "vue";

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
    name: "TagRelativeChart",
    setup() {
        const dom_tag_relative = ref(null)
        return {
            dom_tag_relative
        }
    },
    data() {
        return {
            cur_tag_id: 0,
            tag_count: 10,
            count_list: [] as TagCount[],
            tag_relative_chart: undefined as BarChart,
            tag_relative_option: {
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
                    }
                ]
            }
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
        async refreshData() {
            const [ok, tag_list] = await getRelativesByTag(this.cur_tag_id, this.tag_count)
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
            this.count_list = tag_list

            this.tag_relative_option.yAxis.data = tag_list.map(a => this.formatCategory(a))
            this.tag_relative_option.series[0].data = tag_list.map(a => this.formatCount(a))

            this.tag_relative_chart.setOption(this.tag_relative_option, true)
        },
        onChartClick(params: CallbackDataParams) {
            this.cur_tag_id = this.count_list[params.dataIndex].tag_id
            this.refreshData()
        },
    },
    mounted() {
        console.log(`Tag Relative Chart mounted`)
        // 2. 判断 dom 是否为空或未定义
        if (this.tag_relative_chart != null && this.tag_relative_chart != "" && this.tag_relative_chart != undefined) {
            // 3. 已存在则调用 dispose() 方法销毁
            this.tag_relative_chart.dispose();
        }
        this.tag_relative_chart = echarts.init(this.dom_tag_relative);
        this.tag_relative_chart.on('click', this.onChartClick);
    }
}

</script>

<style scoped>
</style>