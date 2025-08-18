export class EditingData<T> {
	data: T
	is_editing: boolean

	constructor(data: T, is_editing: boolean = false) {
		this.data = data
		this.is_editing = is_editing
	}
}



