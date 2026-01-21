import { ITableItem } from "./Interfaces"

export class TableSource<T extends ITableItem> {
	public list: T[] = []
	public total: T
	private is_loaded: boolean = false

	get empty_text(): string {
		if (this.is_loaded) {
			return "No Data"
		} else {
			return "Loading..."
		}
	}

	get count(): number {
		return this.list.length
	}

	constructor(ctor: new () => T){
		this.total = new ctor()
	}

	onLoaded(list: T[]) {
		this.list = list
		this.total.sum(list)
		this.is_loaded = true
	}

	unload() {
		this.list = []
		this.total.sum([])
		this.is_loaded = false
	}

	getSummaries(): string[] {
		return this.total.toSummaries()
	}

	removeByKey(key: number|string): boolean{
		const index = this.list.findIndex(item => item.key === key)
		if (index === -1) {
			return false
		}
		this.list.splice(index, 1)
		this.total.sum(this.list)
		return true
	}
}