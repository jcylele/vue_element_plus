import EditableData from "./EditableData";
import {ActorLogType} from "./Enums";
import {Actor_Log_Type_Names} from "./Consts";

export default class ActorLog extends EditableData {
    log_type: ActorLogType
    log_param: string

    public get log_type_name(): string {
        return Actor_Log_Type_Names[this.log_type]
    }

    public get tag_id_list(): number[] {
        return this.log_param.split('\n').map(a => parseInt(a))
    }

    public get group_id(): number {
        return parseInt(this.log_param)
    }

    public get show_score(): number {
        return parseInt(this.log_param) / 2
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