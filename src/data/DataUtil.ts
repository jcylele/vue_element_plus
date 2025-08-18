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

export function  format_file_size_gb(file_size: number): string {
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

export function format_duration(duration: number): string {
	duration = Math.floor(duration)
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = Math.floor(duration % 60)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function format_percent(percent: number): string {
	return `${(percent * 100).toFixed(1)}%`
}