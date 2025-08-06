import ActorTagData from "./ActorTagData";
import ActorData from "./ActorData";
import BaseData from "./BaseData";
import { format_duration, format_file_size, format_file_size_gb } from "./DataUtil";

interface ITagEditInfo {
	tag: ActorTagData,
	is_editing: boolean,
}

/**
 * props 不支持 interface类型定义，只能这么包一层
 */
export class TagEditInfo implements ITagEditInfo {
	tag: ActorTagData
	is_editing: boolean
}

export class StrForm {
	data: string
	constructor(data: string) {
		this.data = data
	}

	toJson() {
		return {
			data: this.data
		}
	}
}

export class FilterItem {
	label: string
	value: string

	constructor(label: string, value: string) {
		this.label = label
		this.value = value
	}

	toString() {
		return `${this.label}:${this.value}`
	}
}

export class ActorPostInfo extends BaseData {
	readonly actor_id: number
	readonly actor_name: string
	readonly post_count: number
}

export class ResFileInfo extends BaseData {
	readonly file_path: string
	file_size: number
	res_size: number

	get str_file_size() {
		return format_file_size(this.file_size)
	}

	get str_res_size() {
		return format_file_size(this.res_size)
	}

	add(info: ResFileInfo) {
		this.file_size += info.file_size
		this.res_size += info.res_size
	}

	constructor(pathOrJson: string | Record<string, any> | null) {
		if (typeof pathOrJson === 'string') {
			super()
			this.file_path = pathOrJson
			this.file_size = 0
			this.res_size = 0
		} else {
			super(pathOrJson)
		}
	}
}

export class ActorVideoInfo extends BaseData {
	readonly is_landscape: boolean
	readonly duration: number
	readonly file_count: number
	readonly file_size: number

	get str_duration() {
		return format_duration(this.duration)
	}

	get str_file_size() {
		return format_file_size_gb(this.file_size)
	}

	get str_resolution(): string {
		if (this.is_landscape) {
			return "landscape"
		} else {
			return "portrait"
		}
	}

	get str_file_count() {
		return `${this.file_count}V`
	}
}

export class BaseResult extends BaseData {
	succeed: boolean
	msg: string

	constructor(json_data?) {
		super(json_data);
	}
}


export class ActorResult extends BaseResult {
	actor: ActorData

	constructor(json_data?) {
		super(json_data);
		if (!json_data) {
			return
		}
		if (json_data.actor) {
			this.actor = new ActorData(json_data.actor)
		}
	}
}

export class ActorListResult extends BaseResult {
	// actor_list: ActorData[]   server data
	actor_map: Map<number, ActorData>

	constructor(json_data?) {
		super(json_data);
		if (!json_data) {
			return
		}
		this.actor_map = new Map<number, ActorData>()
		for (const json_obj of json_data.actor_list) {
			const actor = new ActorData(json_obj)
			this.actor_map.set(actor.actor_id, actor)
		}
	}
}
