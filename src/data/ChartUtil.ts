import { getCssVarValue } from "./DataUtil"
import { ECssVarName } from "./Enums"

export function formatCommonTextStyle(font_size: ECssVarName = ECssVarName.ElFontSizeLarge, color: string | undefined = undefined) {
	return {
		color: color ?? getCssVarValue(ECssVarName.ElTextColorRegular), // 文字颜色
		fontSize: getCssVarValue(font_size), // 文字大小
	}
}

export function formatGrid(with_legend: boolean) {
	return {
		top: with_legend ? '10%' : '5%',
		left: '5%',
		right: '5%',
		bottom: '5%',
	}
}

export function formatLegend() {
	return {
		top: '0%',
		left: 'center',
		itemGap: 10,
		textStyle: {
			color: getCssVarValue(ECssVarName.ElTextColorRegular), // 文字颜色
		},
	}
}

export function formatTooltip() {
	return {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
	}
}

function formatDateToMD(date: string): string {
	if (!date) return "Nah"
	const parts = date.split("-")
	if (parts.length < 3) return date
	const m = parseInt(parts[1], 10)
	const d = parseInt(parts[2], 10)
	if (Number.isNaN(m) || Number.isNaN(d)) return date
	return `${m}/${d}`
}

export function formatCategoryAxis(data: any[], short_date: boolean = false) {
	let axis_label = {}
	if (short_date) {
		axis_label = formatCommonTextStyle(ECssVarName.ElFontSizeSmall)
		axis_label['formatter'] = (value: string) => {
			return formatDateToMD(value)
		}
	} else {
		axis_label = formatCommonTextStyle()
	}
	const result = {
		type: 'category',
		axisLabel: axis_label,
		data: data,
	}
	return result
}

export function formatValueAxis() {
	return {
		type: 'value',
		axisLabel: formatCommonTextStyle(),
	}
}