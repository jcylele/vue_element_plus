/**
 * DataUtil is the utility functions for the data operations.
 */
import { ECssVarName } from "./Enums"

const sizes = [
	"B",
	"KB",
	"MB",
	"GB",
	"TB"
]

const times = [
	"s",
	"m",
	"h"
]

export const mb_size = 1024 * 1024
export const gb_size = 1024 * 1024 * 1024

const css_value_cache = new Map<ECssVarName, string>()

export function format_file_size_gb(file_size: number): string {
	return `${(file_size / gb_size).toFixed(2)}G`
}

export function format_file_size(file_size: number): string {
	let cur_unit = 1
	let next_unit = 1024
	for (let i = 0; i < sizes.length; i++) {
		if (file_size < next_unit || i == sizes.length - 1) {
			return `${(file_size / cur_unit).toFixed(1)} ${sizes[i]}`
		}
		cur_unit = next_unit
		next_unit *= 1024
	}
	return "Error"
}

function pad_time(time: number): string {
	return time.toString().padStart(2, '0')
}

export function format_duration(duration: number, padding: boolean = true): string {
	duration = Math.floor(duration)
	const hours = Math.floor(duration / 3600)
	const minutes = Math.floor((duration % 3600) / 60)
	const seconds = Math.floor(duration % 60)

	if (padding) {
		return `${pad_time(hours)}:${pad_time(minutes)}:${pad_time(seconds)}`
	} else {
		if (hours > 0) {
			return `${hours}:${pad_time(minutes)}:${pad_time(seconds)}`
		} else if (minutes > 0) {
			return `${minutes}:${pad_time(seconds)}`
		} else {
			return `${seconds}s`
		}
	}
}

export function format_date(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function to_date(str_date: string): Date {
	const [year, month, day] = str_date.split('-').map(Number)
	return new Date(year, month - 1, day)
}

export function format_percent(percent: number): string {
	return `${(percent * 100).toFixed(1)}%`
}

/**
 * getCssVarValue is the utility function to get the value of the css variable.
 * @param cssVarName - the name of the css variable.
 * @returns the value of the css variable.
 */
export function getCssVarValue(
	cssVarName: ECssVarName
): string {
	let css_value = css_value_cache.get(cssVarName)
	if (css_value) {
		return css_value
	}
	const rootStyle = getComputedStyle(document.documentElement)
	css_value = rootStyle.getPropertyValue(cssVarName).trim()
	css_value_cache.set(cssVarName, css_value)
	return css_value
}