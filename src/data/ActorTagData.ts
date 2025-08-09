import EditableData from "./EditableData";
import {ISortItem} from "./Interfaces";
import {Star_Colors} from "./Consts";

export default class ActorTagData extends EditableData implements ISortItem {
    readonly tag_id: number
    tag_name: string
    tag_priority: number
    used_count: number
    avg_score: number
	tag_group_id: number

    constructor(json_data?) {
        super(json_data);
		if (!json_data) {
			this.tag_name = ""
			this.tag_priority = 0
			this.used_count = 0
			this.avg_score = 0
			this.tag_group_id = 0
		}
    }

    get key(): number {
        return this.tag_id
    }

    get priority(): number {
        return this.tag_priority
    }

    get score_color(): string {
        return Star_Colors[Math.floor(this.avg_score / 2)]
    }

    get show_score(): string {
        return (this.avg_score / 2).toFixed(2)
    }

	get show_priority(): number {
		return Math.trunc( this.tag_priority / 100)
	}

	set show_priority(value: number) {
		this.tag_priority = value * 100
	}

}