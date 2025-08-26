import { ISortItem } from "./Interfaces";
import { Star_Colors } from "./Consts";
import BaseData from "./BaseData";
import { EditingData } from "./EditingData";
import { IActorTagData } from "./SchemasOthers";

export class ActorTagData extends BaseData implements ISortItem {
	tag_id: number = 0
	tag_name: string = ""
	tag_priority: number = 0
	used_count: number = 0
	avg_score: number = 0
	tag_group_id: number = 0

	constructor(json_data?: IActorTagData) {
		// 1. super constructor
		super()
		// 2. field default value is set after super()
		if (json_data) {
			// 3. override default value
			Object.assign(this, json_data)
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
		return Math.trunc(this.tag_priority / 100)
	}

	set show_priority(value: number) {
		this.tag_priority = value * 100
	}

}

export class EditingTagData extends EditingData<ActorTagData> {
	constructor(data: ActorTagData) {
		super(data)
	}
}