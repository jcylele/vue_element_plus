import { GroupEntity } from "./Interfaces";
import ActorGroupCond from "./ActorGroupCond";
import { ActorGroupForm } from "./WebData";
import BaseData from "./BaseData";

export default class ActorGroupData extends BaseData implements GroupEntity {
	group_id: number
	group_name: string
	group_desc: string
	group_color: string
	has_folder: boolean
	is_initial: boolean
	group_priority: number

	cond_list: ActorGroupCond[]

	constructor(json_data?) {
		super(json_data);
		if (json_data) {
			this.cond_list = []
			for (const json_obj of json_data.cond_list) {
				this.cond_list.push(new ActorGroupCond(json_obj.cond_type, json_obj.cond_param))
			}
		} else {
			this.copy()
		}
	}

	get show_content(): string {
		return `${this.group_name} (${this.group_desc})`
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

	copy(other?: ActorGroupData): void {
		if (other == undefined) {
			this.group_id = 0
			this.group_name = ""
			this.group_desc = ""
			this.group_color = "#000000"
			this.has_folder = false
			this.is_initial = false
			this.group_priority = 0
		} else {
			this.group_id = other.group_id
			this.group_name = other.group_name
			this.group_desc = other.group_desc
			this.group_color = other.group_color
			this.has_folder = other.has_folder
			this.is_initial = other.is_initial
			this.group_priority = other.group_priority
			// skip cond_list
		}
	}

	toForm(): ActorGroupForm {
		const form = new ActorGroupForm()
		form.name = this.group_name
		form.desc = this.group_desc
		form.priority = this.group_priority
		form.group_color = this.group_color
		form.has_folder = this.has_folder
		form.is_initial = this.is_initial
		return form
	}
}