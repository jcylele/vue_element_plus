import { BaseData } from "./BaseData";
import { GroupCondType } from "./Enums";

export class ActorGroupCond extends BaseData {
    in_use: boolean
    cond_type: GroupCondType
    cond_param: number

    constructor(cond_type: GroupCondType, cond_param = 0) {
        super()
        this.in_use = false
        this.cond_type = cond_type
        this.cond_param = cond_param
    }

    public get bool_param(): boolean {
        return this.cond_param != 0
    }

    public set bool_param(val: boolean) {
        this.cond_param = val ? 1 : 0
    }

    public get score_param(): number {
        return this.cond_param / 2
    }

    public set score_param(val: number) {
        this.cond_param = val * 2
    }

    public get is_score(): boolean {
        return this.cond_type == GroupCondType.MinScore
            || this.cond_type == GroupCondType.MaxScore
    }

    public get is_switch(): boolean {
        return this.cond_type == GroupCondType.HasAnyTag
            || this.cond_type == GroupCondType.Linked
			|| this.cond_type == GroupCondType.HasRemark
    }

    public get score_prefix() {
        switch (this.cond_type) {
            case GroupCondType.MinScore:
                return "Score >= "
            case GroupCondType.MaxScore:
                return "Score <= "
        }
    }

    public get false_text() {
        switch (this.cond_type) {
            case GroupCondType.HasAnyTag:
                return "No Tag"
            case GroupCondType.Linked:
                return "Not Linked"
			case GroupCondType.HasRemark:
				return "No Remark"
        }
    }

    public get true_text() {
        switch (this.cond_type) {
            case GroupCondType.HasAnyTag:
                return "Has Tag"
            case GroupCondType.Linked:
                return "Linked"
			case GroupCondType.HasRemark:
				return "Has Remark"
        }
    }

    public get desc() {
        switch (this.cond_type) {
            case GroupCondType.MinScore:
                return `score >= ${this.cond_param / 2}`
            case GroupCondType.MaxScore:
                return `score <= ${this.cond_param / 2}`
            case GroupCondType.HasAnyTag:
                return this.cond_param == 0 ? "no tag" : "has tag"
            case GroupCondType.Linked:
                return this.cond_param == 0 ? "not linked" : "linked"
			case GroupCondType.HasRemark:
				return this.cond_param == 0 ? "no remark" : "has remark"
        }
    }
}