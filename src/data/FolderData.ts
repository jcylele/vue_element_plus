import BaseData from "./BaseData";
import { GroupEntity } from "./Interfaces";
import { CommonGroupForm } from "./WebData";

export class FolderData extends BaseData implements GroupEntity {
	folder_id: number
	folder_name: string
	folder_desc: string
	folder_priority: number

	constructor(json_data?) {
		super(json_data);

		if (!json_data) {
			this.copy()
		}
	}

	get name(): string {
		return this.folder_name
	}

	get key(): number {
		return this.folder_id
	}

	get priority(): number {
		return this.folder_priority
	}

	set priority(value: number) {
		this.folder_priority = value
	}

	copy(source?: FolderData): void {
		if (source) {
			this.folder_id = source.folder_id
			this.folder_name = source.folder_name
			this.folder_desc = source.folder_desc
			this.folder_priority = source.folder_priority
		} else {
			this.folder_id = 0
			this.folder_name = ""
			this.folder_desc = ""
			this.folder_priority = 0
		}
	}

	toForm(): CommonGroupForm {
		const form = new CommonGroupForm()
		form.name = this.folder_name
		form.desc = this.folder_desc
		form.priority = this.folder_priority
		return form
	}
}