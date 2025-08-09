import { ActorLogType } from "./Enums";
import { Actor_Log_Type_Names } from "./Consts";
import BaseData from "./BaseData";

export default class ActorLog extends BaseData {
    log_type: ActorLogType
    log_param: string

    public get log_type_name(): string {
        return Actor_Log_Type_Names[this.log_type]
    }

    public get tag_id_list(): number[] {
        console.log(`this.log_param = ${this.log_param}`)
        return this.log_param.split('\n').filter((str_tag_id) => {
            return str_tag_id
        }).map(a => parseInt(a))
    }

    public get group_id(): number {
        return parseInt(this.log_param)
    }

    public get show_score(): number {
        return parseInt(this.log_param) / 2
    }

    public set show_score(val: number) {
        // this.log_param = (val * 2).toString()
        // do nothing, just to support v-model
    }

    public get remark(): string {
        return this.log_param
    }

    public get actor_names(): string[] {
        return this.log_param.split('\n')
    }

    public get post_count(): number {
        return parseInt(this.log_param)
    }

    constructor(json_data?) {
        super(json_data);
    }
}