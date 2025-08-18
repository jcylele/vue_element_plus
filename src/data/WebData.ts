import BaseData from "./BaseData";

export class CommonPriority {
    id: number
    priority: number

    constructor(id: number, priority: number) {
        this.id = id
        this.priority = priority
    }
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

export class CommonGroupForm {
	name: string
	desc: string
	priority: number
}

export class ActorGroupForm extends CommonGroupForm {
	group_color: string
	has_folder: boolean
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

