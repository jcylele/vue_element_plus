export const score_tag_option = {
    xAxis: {
        type: 'value',
    },
    yAxis: {
        type: 'category',
        data: []
    },
    series: [
        {
            type: 'bar',
            data: [],
        }
    ]
}

export const tag_relative_option = {
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
            data: [],
        }
    ]
}

export const tag_score_label_option = {
    show: true,
    position: 'top',
    distance: 15,
    align: 'center',
    verticalAlign: 'middle',
    rotate: 0,
    formatter: '{c}',
    fontSize: 16,
    rich: {
        name: {}
    }
};

export const tag_score_series_item = {
    name: '', // dynamic data
    type: 'bar',
    barGap: 0,
    label: tag_score_label_option,
    emphasis: {
        focus: 'series'
    },
    data: [] // dynamic data
}

export const tag_score_option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {
        data: [] // dynamic data
    },
    toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
            mark: {show: true},
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar', 'stack']},
            restore: {show: true},
            saveAsImage: {show: true}
        }
    },
    xAxis: [
        {
            type: 'category',
            axisTick: {show: false},
            data: [] // dynamic data
        }
    ],
    yAxis: [
        {
            type: 'value'
        }
    ],
    series: []  //template: tag_score_series_item
};