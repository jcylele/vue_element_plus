import { BoolEnum, EFilterRow, EStoreType, SortType } from "./Enums";
import { Default_Sort_Option, Filter_Row_Names, MAX_SCORE, Sort_Groups } from "./Consts";
import { SortOption } from "./Interfaces";
import BaseData from "./BaseData";
import { FilterItem } from "./WebData";

abstract class BaseCloneable extends BaseData {
	abstract clone(): this;

	abstract copy(source: this): void;

	abstract reset(): void;

	isListEqual(l1: any[], l2: any[], equalFunc?: (a: any, b: any) => boolean): boolean {
		if (l1.length !== l2.length) {
			return false
		}
		for (const [index, val] of l1.entries()) {
			if (equalFunc == undefined) {
				if (val !== l2[index]) {
					return false
				}
			} else {
				if (!equalFunc(val, l2[index])) {
					return false
				}
			}
		}
		return true
	}
}

class SortItem extends BaseCloneable {
	sort_type: SortType
	sort_asc: boolean
	sort_option: SortOption

	constructor() {
		super()
		this.init()
	}

	private init(): void {  // 私有方法
		this.sort_type = SortType.Default
		this.sort_option = Default_Sort_Option
		this.sort_asc = Default_Sort_Option.default_asc
	}

	clone(): this {
		const item = new SortItem()
		item.copy(this)
		return item as this
	}

	copy(item: SortItem) {
		this.sort_type = item.sort_type
		this.sort_option = this.findSortOption(item.sort_type)
		this.sort_asc = item.sort_asc
	}

	reset(): void {
		this.init()
	}

	get show_sort_type() {
		return this.sort_type
	}

	set show_sort_type(val: SortType) {
		this.sort_type = val
		this.sort_option = this.findSortOption(val)
		this.sort_asc = this.sort_option.default_asc
	}

	findSortOption(val): SortOption {
		for (const sortGroup of Sort_Groups) {
			for (const option of sortGroup.options) {
				if (option.value == val) {
					return option
				}
			}
		}
		throw new Error(`SortOption not found for ${val}`)
	}

	get icon(): string {
		if (this.sort_asc) {
			return "up"
		} else {
			return "down"
		}
	}

	switch() {
		this.sort_asc = !this.sort_asc
	}

	equals(item: SortItem): boolean {
		return this.sort_type == item.sort_type && this.sort_asc == item.sort_asc
	}
}


export class TagFilter extends BaseCloneable {
	private no_tag: boolean
	tag_arr: number[][]
	titles: string[] = ["All", "No", "Any"]
	// must_have: number[]
	// any_of: number[][]
	// must_not_have: number[]

	get show_no_tag() {
		return this.no_tag
	}

	set show_no_tag(val: boolean) {
		this.no_tag = val
		this.init_arr(val)
	}

	constructor() {
		super()
		this.init()
	}

	private init(): void {
		this.no_tag = false
		this.init_arr(this.no_tag)
	}

	private init_arr(no_tag: boolean) {
		if (no_tag) {
			this.tag_arr = []
		} else {
			this.tag_arr = [[], [], []]
		}
	}

	clone(): this {
		const filter = new TagFilter()
		filter.copy(this)
		return filter as this
	}

	copy(filter: TagFilter) {
		this.no_tag = filter.no_tag
		this.tag_arr = filter.tag_arr.map(list => list.slice())
	}

	reset(): void {
		this.init()
	}

	addLine() {
		this.tag_arr.push([])
	}

	removeLine(index: number): boolean {
		const has = this.tag_arr[index].length > 0
		this.tag_arr.splice(index, 1)
		return has
	}

	getTagItem(nameFunc: (tag_id: number) => string): FilterItem | undefined {
		if (this.no_tag) {
			return new FilterItem("Tag", "X")
		}
		const ret: string[] = []
		for (const [index, list] of this.tag_arr.entries()) {
			if (list.length == 0) {
				continue
			}
			const title = index < this.titles.length ? this.titles[index] : this.titles[this.titles.length - 1]
			const value = list.map(tag_id => nameFunc(tag_id)).join(", ")
			ret.push(`${title}(${value})`)
		}
		if (ret.length == 0) {
			return undefined
		}
		return new FilterItem("Tag", ret.join(" "))
	}

	toJSON() {
		const must_have: number[] = this.tag_arr.length == 0 ? [] : this.tag_arr[0]
		const must_not_have: number[] = this.tag_arr.length < 2 ? [] : this.tag_arr[1]
		const any_of: number[][] = this.tag_arr.length < 3 ? [] : this.tag_arr.slice(2).filter(list => list.length > 0)
		return {
			must_have: must_have,
			must_not_have: must_not_have,
			any_of: any_of,
			no_tag: this.no_tag
		}
	}

	removeTag(tag_id, index) {
		this.tag_arr[index].splice(this.tag_arr[index].indexOf(tag_id), 1)
	}

	equals(tag_filter: TagFilter): boolean {
		if (this.no_tag != tag_filter.no_tag) {
			return false
		}
		if (!this.isListEqual(this.tag_arr, tag_filter.tag_arr, this.isListEqual)) {
			return false
		}
		return true
	}
}

export class ActorFilterData extends BaseCloneable {
	show_rows: boolean[]
	name: string
	linked: boolean
	group_id_list: number[]
	folder_id: number
	all_group_list: number[]
	tag_filter: TagFilter
	min_score: number
	max_score: number

	has_remark: BoolEnum
	remark_str: string

	has_comment: BoolEnum
	comment_str: string

	post_completed: BoolEnum
	get is_post_completed() {
		return this.post_completed == BoolEnum.TRUE
	}
	res_completed: BoolEnum

	sort_items: SortItem[]

	desc_list: FilterItem[]

	get str_desc_list() {
		return this.desc_list.map(item => item.toString()).join(", ")
	}

	onRowHide(row: number) {
		switch (row) {
			case EFilterRow.Group:
				this.resetGroup()
				break
			case EFilterRow.Tag:
				this.resetTags()
				break
			case EFilterRow.Score:
				this.resetScores()
				break
			case EFilterRow.Name:
				this.resetNameLink()
				break
			case EFilterRow.Remark:
				this.resetRemark()
				break
			case EFilterRow.Comment:
				this.resetComment()
				break
			case EFilterRow.Folder:
				this.resetFolder()
				break
			case EFilterRow.Progress:
				this.resetProgress()
				break
		}
	}

	/**
	 * compare with show_rows, do extra reset
	 */
	onRowsChange(rows: number[]) {
		const new_show_rows = new Array(this.show_rows.length).fill(false)
		for (const row of rows) {
			new_show_rows[row] = true
		}

		for (const [index, value] of new_show_rows.entries()) {
			if (value != this.show_rows[index]) {
				this.show_rows[index] = value
				if (!value) {
					this.onRowHide(index)
				}
			}
		}
	}

	getShowRows(): number[] {
		const rows: number[] = []
		for (const [index, value] of this.show_rows.entries()) {
			if (value) {
				rows.push(index)
			}
		}
		// console.log("getShowRows", this.uuid,this.show_rows, rows)
		return rows
	}

	setRowVisible(row: number, visible: boolean) {
		// console.log("setRowVisible", this.uuid, row, visible)
		if (this.show_rows[row] == visible) {
			return
		}
		this.show_rows[row] = visible
		if (!visible) {
			this.onRowHide(row)
		}
	}

	get show_group() {
		return this.show_rows[EFilterRow.Group]
	}

	get show_tag() {
		return this.show_rows[EFilterRow.Tag]
	}

	get show_score() {
		return this.show_rows[EFilterRow.Score]
	}

	get show_name() {
		return this.show_rows[EFilterRow.Name]
	}

	get show_remark() {
		return this.show_rows[EFilterRow.Remark]
	}

	get show_comment() {
		return this.show_rows[EFilterRow.Comment]
	}

	get show_folder() {
		return this.show_rows[EFilterRow.Folder]
	}

	get show_progress() {
		return this.show_rows[EFilterRow.Progress]
	}

	get show_min_score() {
		return this.min_score / 2
	}

	set show_min_score(val: number) {
		this.min_score = val * 2
	}

	get show_max_score() {
		return this.max_score / 2
	}

	set show_max_score(val: number) {
		this.max_score = val * 2
	}

	addSortItem() {
		this.sort_items.push(new SortItem())
	}

	removeSortItem(index: number) {
		this.sort_items.splice(index, 1)
	}

	/**
	 * remove default, only keep first one for each SortType
	 */
	simplifySortItems() {
		const filtered: SortItem[] = []
		const typeSet = new Set<SortType>()
		for (const item of this.sort_items) {
			if (item.sort_type == SortType.Default) {
				continue
			}
			if (!typeSet.has(item.sort_type)) {
				typeSet.add(item.sort_type)
				filtered.push(item)
			}
		}
		this.sort_items = filtered
	}

	constructor() {
		super()

		this.init()
	}

	private init(): void {
		this.show_rows = new Array(Filter_Row_Names.length).fill(false)
		this.all_group_list = []
		this.desc_list = []
		this.resetGroup()
		this.resetTags()
		this.resetScores()
		this.resetNameLink()
		this.resetRemark()
		this.resetComment()
		this.resetFolder()
		this.resetProgress()
		this.resetSort()
	}

	reset() {
		this.init()
	}

	clone(): this {
		const data = new ActorFilterData()
		data.copy(this)
		return data as this
	}

	copy(data: ActorFilterData) {
		this.show_rows = data.show_rows.slice()
		this.name = data.name
		this.linked = data.linked
		this.group_id_list = data.group_id_list.slice()
		this.folder_id = data.folder_id
		this.tag_filter = data.tag_filter.clone()
		this.min_score = data.min_score
		this.max_score = data.max_score
		this.remark_str = data.remark_str
		this.has_remark = data.has_remark
		this.comment_str = data.comment_str
		this.has_comment = data.has_comment
		this.post_completed = data.post_completed
		this.res_completed = data.res_completed

		this.sort_items = data.sort_items.map(item => item.clone())
		// desc_list is immutable in some sense, so we don't need to clone it
		this.desc_list = data.desc_list
	}

	setAllGroupList(list: number[]) {
		this.all_group_list = list
	}

	resetGroup() {
		this.checkAllGroup(true)
	}


	checkAllGroup(val: boolean) {
		if (val) {
			this.group_id_list = this.all_group_list.slice()
		} else {
			this.group_id_list = []
		}
	}

	resetTags() {
		this.tag_filter = new TagFilter()
	}

	resetScores() {
		this.min_score = 0
		this.max_score = MAX_SCORE
	}

	resetNameLink() {
		this.name = ""
		this.linked = false
	}

	setNameLink(name: string = "", linked: boolean = false) {
		this.name = name
		this.linked = linked
		this.setRowVisible(EFilterRow.Name, true)
	}

	resetSort() {
		this.sort_items = []
	}

	resetRemark() {
		this.remark_str = ""
		this.has_remark = BoolEnum.ALL
	}

	resetComment() {
		this.comment_str = ""
		this.has_comment = BoolEnum.ALL
	}

	resetFolder() {
		this.folder_id = 0
	}

	resetProgress() {
		this.post_completed = BoolEnum.ALL
		this.res_completed = BoolEnum.ALL
	}

	/**
	 * compare with another ActorFilterData, ignore sort_items
	 * @param data ActorFilterData
	 * @returns boolean
	 */
	equals(data: ActorFilterData): boolean {
		return this.isListEqual(this.show_rows, data.show_rows) &&
			this.name === data.name &&
			this.linked === data.linked &&
			this.isListEqual(this.group_id_list, data.group_id_list) &&
			this.folder_id === data.folder_id &&
			this.tag_filter.equals(data.tag_filter) &&
			this.min_score === data.min_score &&
			this.max_score === data.max_score &&
			this.remark_str === data.remark_str &&
			this.has_remark === data.has_remark &&
			this.comment_str === data.comment_str &&
			this.has_comment === data.has_comment &&
			this.post_completed === data.post_completed &&
			this.res_completed === data.res_completed
	}

	formatFilterItems(getNameFunc: (store_type: EStoreType, group_id: number) => string, show_group: boolean): FilterItem[] {
		const desc_list: FilterItem[] = []
		// group
		if (show_group) {
			const group_name_list = this.group_id_list.map(group_id => getNameFunc(EStoreType.ActorGroup, group_id))
			desc_list.push(new FilterItem("Group", group_name_list.join(", ")))
		}

		// tag
		const tag_item = this.tag_filter.getTagItem(tag_id => getNameFunc(EStoreType.ActorTag, tag_id))
		if (tag_item) {
			desc_list.push(tag_item)
		}

		// score
		if (this.min_score > 0 && this.max_score < MAX_SCORE) {
			desc_list.push(new FilterItem("Score", `${this.min_score} - ${this.max_score}`))
		} else if (this.min_score > 0) {
			desc_list.push(new FilterItem("score", `>= ${this.min_score}`))
		} else if (this.max_score < MAX_SCORE) {
			desc_list.push(new FilterItem("Score", `<= ${this.max_score}`))
		}

		// name
		if (this.name.length > 0) {
			desc_list.push(new FilterItem("Name", this.name))
		}

		// linked
		if (this.linked) {
			desc_list.push(new FilterItem("Linked", "Yes"))
		}

		// remark
		switch (this.has_remark) {
			case BoolEnum.TRUE:
				desc_list.push(new FilterItem("Remark", this.remark_str || "O"))
				break
			case BoolEnum.FALSE:
				desc_list.push(new FilterItem("Remark", "X"))
				break
		}

		// comment
		switch (this.has_comment) {
			case BoolEnum.TRUE:
				desc_list.push(new FilterItem("Comment", this.comment_str || "O"))
				break
			case BoolEnum.FALSE:
				desc_list.push(new FilterItem("Comment", "X"))
				break
		}

		// folder
		if (this.folder_id > 0) {
			desc_list.push(new FilterItem("Folder", getNameFunc(EStoreType.ActorFavFolder, this.folder_id)))
		}

		if (desc_list.length == 0) {
			desc_list.push(new FilterItem("All", "actors"))
		}

		// progress
		switch (this.post_completed) {
			case BoolEnum.TRUE:
				desc_list.push(new FilterItem("Post", "Completed"))
				switch (this.res_completed) {
					case BoolEnum.TRUE:
						desc_list.push(new FilterItem("Res", "Completed"))
						break
					case BoolEnum.FALSE:
						desc_list.push(new FilterItem("Res", "Not Completed"))
				}
				break
			case BoolEnum.FALSE:
				desc_list.push(new FilterItem("Post", "Not Completed"))
				break
		}

		return desc_list
	}
}

