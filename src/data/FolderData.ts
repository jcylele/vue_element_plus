import EditableData from "./EditableData";
import { ISortItem } from "./Interfaces";

export class FolderData extends EditableData implements ISortItem {
	folder_desc: string
	folder_name: string
	folder_id: number

	constructor(json_data?) {
		super(json_data);

		if (!json_data) {
			this.copy()
		}
	}

	copy(source?: FolderData): void {
		if (source) {
			this.folder_id = source.folder_id
			this.folder_name = source.folder_name
			this.folder_desc = source.folder_desc
		} else {
			this.folder_id = 0
			this.folder_name = ""
			this.folder_desc = ""
		}
	}

	get key(): number {
		return this.folder_id
	}

	get priority(): number {
		return this.folder_id
	}
}