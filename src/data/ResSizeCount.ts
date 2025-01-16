import EditableData from "./EditableData";
import {ResState} from "./Enums";
import SizeStruct from "./SizeStruct";

export default class ResSizeCount extends EditableData {
    min: number
    max: number
    count_map: Map<ResState, number>

    constructor(json_data?) {
        super(json_data);
    }

    get str_size(): string {
        if (this.min == this.max) {
            const ss = new SizeStruct(this.min)
            return ss.toString()
        } else if (this.max < this.min) {
            const min_ss = new SizeStruct(this.min)
            return `> ${min_ss}`
        } else {
            const max_ss = new SizeStruct(this.max)
            return `< ${max_ss}`
        }
    }

    resCount(res_state: ResState): number {
        return this.count_map[res_state] || 0
    }
}