import { ResSizeUnit, ResState } from "./Enums";
import { ResSizeList } from "./Consts";
import BaseData from "./BaseData";

class SizeStruct {
    public size: number = 0
    public unit: ResSizeUnit = ResSizeUnit.B

    constructor(real_size: number) {
        for (const size_unit of ResSizeList) {
            if (real_size >= size_unit) {
                this.size = real_size / size_unit
                this.unit = size_unit
                break
            }
        }
    }

    toString(): string {
        if (this.size == 0) {
            return "0"
        }
        return `${this.size}${ResSizeUnit[this.unit]}`
    }
}

export default class ResSizeCount extends BaseData {
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