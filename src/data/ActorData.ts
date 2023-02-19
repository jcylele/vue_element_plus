import ActorCategory from "../consts/ActorCategory";
import EditableData from "./EditableData";

export default class ActorData extends EditableData{
    readonly actor_name: string
    rel_tags: number[]
    actor_category: ActorCategory
    readonly completed: boolean

    _new_tag: number

    constructor(json_data?) {
        super(json_data);
        this.actor_category = ActorCategory.getByValue(json_data.actor_category)
    }
}