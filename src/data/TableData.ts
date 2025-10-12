export default class TableData<T> {
	public list: T[] = []
	private is_loaded: boolean = false

	get empty_text(): string {
		if (this.is_loaded) {
			return "No Data"
		} else {
			return "Loading..."
		}
	}

	onLoaded(list: T[]) {
		this.list = list
		this.is_loaded = true
	}
}