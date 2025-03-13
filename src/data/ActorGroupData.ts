import EditableData from "./EditableData";
import {ISortItem} from "./Interfaces";
import ActorGroupCond from "./ActorGroupCond";

export default class ActorGroupData extends EditableData implements ISortItem {
    readonly group_id: number
    group_name: string
    group_desc: string
    group_color: string
    has_folder: boolean
    group_priority: number

    cond_list: ActorGroupCond[]

    constructor(json_data?) {
        super(json_data);
        if (json_data == undefined) {
            this.group_id = 0
            this.group_name = ""
            this.group_desc = ""
            this.group_color = "#000000"
            this.has_folder = false
            this.group_priority = 0
        } else {
            this.cond_list = []
            for (const json_obj of json_data.cond_list) {
                this.cond_list.push(new ActorGroupCond(json_obj.cond_type, json_obj.cond_param))
            }
        }
    }

    get show_content(): string {
        return `${this.group_name} (${this.group_desc})`
    }

    get key(): number {
        return this.group_id
    }

    get priority(): number {
        return this.group_priority
    }
}