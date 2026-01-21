import { BaseData } from "./BaseData";
import { GroupEntity } from "./Interfaces";
import { CommonGroupForm } from "./WebData";

export class ActorTagGroupData extends BaseData implements GroupEntity {
	group_id: number
	group_name: string
	group_desc: string
	group_priority: number
	tag_ids: number[]

	constructor(json_data?) {
		super(json_data);
		this.tag_ids = []
		if (!json_data) {
			this.copy()
		}
	}

	copy(source?: ActorTagGroupData): void {
		if (source) {
			this.group_id = source.group_id
			this.group_name = source.group_name
			this.group_desc = source.group_desc
			this.group_priority = source.group_priority
		} else {
			this.group_id = 0
			this.group_name = ""
			this.group_desc = ""
			this.group_priority = 0
		}
	}

	get name(): string {
		return this.group_name
	}

	get key(): number {
		return this.group_id
	}

	get priority(): number {
		return this.group_priority
	}

	set priority(value: number) {
		this.group_priority = value
	}

	toForm(): CommonGroupForm {
		const form = new CommonGroupForm()
		form.name = this.group_name
		form.desc = this.group_desc
		form.priority = this.group_priority
		return form
	}
}