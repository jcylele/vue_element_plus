const sizes = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
]

export const mb_size = 1024 * 1024
export const gb_size = 1024 * 1024 * 1024

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