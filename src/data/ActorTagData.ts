import EditableData from "./EditableData";

export default class ActorTagData extends EditableData {
    readonly tag_id: number
    tag_name: string
    tag_priority: number
    used_count: number

    constructor(json_data?) {
        super(json_data);
    }
}