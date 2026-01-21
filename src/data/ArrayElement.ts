import { ActorData } from "./ActorData";
import { BaseData } from "./BaseData";

class ArrayElement<T extends BaseData> {
	private _data: T
	selected: boolean

	constructor(data: T) {
		this._data = data
		this.selected = false
	}

	get data() {
		return this._data
	}

	set data(data: T) {
		this._data = data
	}

	get uuid() {
		return this._data.uuid
	}
}

export class ActorElement extends ArrayElement<ActorData> {

}