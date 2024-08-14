import EditableData from "./EditableData";
import {ISortItem} from "./Interfaces";

export default class ActorGroupData extends EditableData implements ISortItem {
    readonly group_id: number
    group_name: string
    group_desc: string
    group_color: string
    has_folder: boolean
    group_priority: number

    constructor(json_data?) {
        super(json_data);
        if (json_data == undefined) {
            this.group_id = 0
            this.group_name = ""
            this.group_desc = ""
            this.group_color = "#000000"
            this.has_folder = false
            this.group_priority = 0
        }
    }

    get show_content(): string{
        return `${this.group_name} (${this.group_desc})`
    }

    get key(): number {
        return this.group_id
    }

    get priority(): number {
        return this.group_priority
    }
}