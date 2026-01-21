import { BoolEnum, EFilterRow, EFixFilter, EStoreType, SortType } from "./Enums";
import { Default_Sort_Option, Filter_Row_Names, MAX_SCORE, Sort_Groups } from "./Consts";
import { SortOption } from "./Interfaces";
import { BaseCloneable } from "./BaseData";
import { FilterItem } from "./WebData";

function isListEqual(l1: any[], l2: any[], equalFunc?: (a: any, b: any) => boolean): boolean {
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

class SortItem extends BaseCloneable {
	sort_type: SortType
	sort_asc: boolean
	sort_option: SortOption

	constructor() {
		super()
		this.reset()
	}

	reset(): void {
		this.sort_type = SortType.Default
		this.sort_option = Default_Sort_Option
		this.sort_asc = Default_Sort_Option.default_asc
	}

	copy(item: SortItem) {
		this.sort_type = item.sort_type
		this.sort_option = this.findSortOption(item.sort_type)
		this.sort_asc = item.sort_asc
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
	no_tag: boolean
	tag_arr: number[][]
	titles: string[] = ["All", "No", "Any"]

	get show_no_tag() {
		return this.no_tag
	}

	set show_no_tag(val: boolean) {
		this.no_tag = val
		this.init_arr(val)
	}

	constructor() {
		super()
		this.reset()
	}

	init_arr(no_tag: boolean) {
		if (no_tag) {
			this.tag_arr = []
		} else {
			this.tag_arr = [[], [], []]
		}
	}

	reset(): void {
		this.no_tag = false
		this.init_arr(this.no_tag)
	}

	copy(filter: TagFilter) {
		this.no_tag = filter.no_tag
		this.tag_arr = filter.tag_arr.map(list => list.slice())
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
		if (!isListEqual(this.tag_arr, tag_filter.tag_arr, isListEqual)) {
			return false
		}
		return true
	}
}

export class LinkFilter extends BaseCloneable {
	linked: BoolEnum
	min_link_count: number
	contain_group_id: number

	constructor() {
		super()
		this.reset()
	}

	reset(): void {
		this.linked = BoolEnum.ALL
		this.min_link_count = 0
		this.contain_group_id = 0
	}

	copy(source: this): void {
		this.linked = source.linked
		this.min_link_count = source.min_link_count
		this.contain_group_id = source.contain_group_id
	}

	equals(other: this): boolean {
		return this.linked == other.linked &&
			this.min_link_count == other.min_link_count &&
			this.contain_group_id == other.contain_group_id
	}

	formatFilterItem(getNameFunc: (store_type: EStoreType, group_id: number) => string): FilterItem | undefined {
		if (this.linked == BoolEnum.ALL) {
			return undefined
		}
		const desc_list: string[] = []
		if (this.linked == BoolEnum.FALSE) {
			desc_list.push("X")
		} else {
			if (this.min_link_count > 0) {
				desc_list.push(`>= ${this.min_link_count}`)
			}
			if (this.contain_group_id > 0) {
				desc_list.push(getNameFunc(EStoreType.ActorGroup, this.contain_group_id))
			}
			if (desc_list.length == 0) {
				return new FilterItem("Link", "O")
			}
		}
		return new FilterItem("Link", desc_list.join(", "))
	}
}

export class ActorFilterData extends BaseCloneable {
	show_rows: boolean[]
	name: string
	group_id_list: number[]
	folder_id: number
	all_group_list: number[]
	tag_filter: TagFilter
	link_filter: LinkFilter
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

	fix_filter: EFixFilter

	sort_items: SortItem[]

	desc_list: FilterItem[]

	onRowHide(row: number) {
		switch (row) {
			case EFilterRow.Group:
				this.resetGroup()
				break
			case EFilterRow.Tag:
				this.resetTags()
				break
			case EFilterRow.Link:
				this.resetLink()
				break
			case EFilterRow.Score:
				this.resetScores()
				break
			case EFilterRow.Name:
				this.resetName()
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
			case EFilterRow.Fix:
				this.resetFix()
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

	// region group

	get show_group() {
		return this.show_rows[EFilterRow.Group]
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
	//endregion group

	// region folder
	get show_folder() {
		return this.show_rows[EFilterRow.Folder]
	}

	setFolder(folder_id: number) {
		this.folder_id = folder_id
		this.setRowVisible(EFilterRow.Folder, true)
	}

	resetFolder() {
		this.folder_id = 0
	}

	get in_folder(): boolean {
		return this.folder_id >= 0
	}

	set in_folder(val: boolean) {
		if (val) {
			this.folder_id = Math.abs(this.folder_id)
		} else {
			this.folder_id = -Math.abs(this.folder_id)
		}
	}

	get real_folder_id(): number {
		return Math.abs(this.folder_id)
	}

	set real_folder_id(val: number) {
		if (this.folder_id >= 0) {
			this.folder_id = val
		} else {
			this.folder_id = -val
		}
	}

	// endregion folder

	// region tags
	get show_tag() {
		return this.show_rows[EFilterRow.Tag]
	}
	resetTags() {
		this.tag_filter = new TagFilter()
	}

	// endregion tags

	//region link

	get show_link() {
		return this.show_rows[EFilterRow.Link]
	}
	resetLink() {
		this.link_filter = new LinkFilter()
	}

	//endregion link

	// region score

	get show_score() {
		return this.show_rows[EFilterRow.Score]
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

	resetScores() {
		this.min_score = 0
		this.max_score = MAX_SCORE
	}
	// endregion score

	// region fix filter

	get show_fix() {
		return this.show_rows[EFilterRow.Fix]
	}

	resetFix() {
		this.fix_filter = EFixFilter.None
	}

	getFixFlag(flag: EFixFilter): boolean {
		return (this.fix_filter & flag) !== 0
	}

	setFixFlag(flag: EFixFilter, value: boolean): void {
		if (value) {
			this.fix_filter |= flag
		} else {
			this.fix_filter &= ~flag
		}
	}

	get post_count_overflow(): boolean {
		return this.getFixFlag(EFixFilter.Overflow)
	}
	set post_count_overflow(value: boolean) {
		this.setFixFlag(EFixFilter.Overflow, value)
	}

	get post_count_total_zero(): boolean {
		return this.getFixFlag(EFixFilter.TotalZero)
	}
	set post_count_total_zero(value: boolean) {
		this.setFixFlag(EFixFilter.TotalZero, value)
	}

	get link_not_checked(): boolean {
		return this.getFixFlag(EFixFilter.LinkNotChecked)
	}

	set link_not_checked(value: boolean) {
		this.setFixFlag(EFixFilter.LinkNotChecked, value)
	}

	get icon_not_exists(): boolean {
		return this.getFixFlag(EFixFilter.IconNotExists)
	}
	set icon_not_exists(value: boolean) {
		this.setFixFlag(EFixFilter.IconNotExists, value)
	}

	get missing_posts(): boolean {
		return this.getFixFlag(EFixFilter.MissingPosts)
	}
	set missing_posts(value: boolean) {
		this.setFixFlag(EFixFilter.MissingPosts, value)
	}

	get no_favorite(): boolean {
		return this.getFixFlag(EFixFilter.NoFavorite)
	}
	set no_favorite(value: boolean) {
		this.setFixFlag(EFixFilter.NoFavorite, value)
	}

	// endregion post count

	// region progress
	get show_progress() {
		return this.show_rows[EFilterRow.Progress]
	}
	resetProgress() {
		this.post_completed = BoolEnum.ALL
		this.res_completed = BoolEnum.ALL
	}

	// endregion progress

	// region sort
	resetSort() {
		this.sort_items = []
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
	// endregion sort

	// region name link
	get show_name() {
		return this.show_rows[EFilterRow.Name]
	}

	resetName() {
		this.name = ""
	}

	setName(name: string = "") {
		this.name = name
		this.setRowVisible(EFilterRow.Name, true)
	}

	// endregion name link

	// region remark comment
	get show_remark() {
		return this.show_rows[EFilterRow.Remark]
	}

	get show_comment() {
		return this.show_rows[EFilterRow.Comment]
	}
	resetRemark() {
		this.remark_str = ""
		this.has_remark = BoolEnum.ALL
	}

	resetComment() {
		this.comment_str = ""
		this.has_comment = BoolEnum.ALL
	}

	// endregion remark comment
	constructor() {
		super()
		this.reset()
	}

	reset(): void {
		this.show_rows = new Array(Filter_Row_Names.length).fill(false)
		this.all_group_list = []
		this.desc_list = []
		this.resetGroup()
		this.resetTags()
		this.resetLink()
		this.resetScores()
		this.resetName()
		this.resetRemark()
		this.resetComment()
		this.resetFolder()
		this.resetProgress()
		this.resetFix()
		this.resetSort()
	}

	/**
 * compare with another ActorFilterData, ignore sort_items
 * @param data ActorFilterData
 * @returns boolean
 */
	equals(data: ActorFilterData): boolean {
		return isListEqual(this.show_rows, data.show_rows) &&
			this.name === data.name &&
			isListEqual(this.group_id_list, data.group_id_list) &&
			this.folder_id === data.folder_id &&
			this.tag_filter.equals(data.tag_filter) &&
			this.link_filter.equals(data.link_filter) &&
			this.min_score === data.min_score &&
			this.max_score === data.max_score &&
			this.remark_str === data.remark_str &&
			this.has_remark === data.has_remark &&
			this.comment_str === data.comment_str &&
			this.has_comment === data.has_comment &&
			this.post_completed === data.post_completed &&
			this.res_completed === data.res_completed &&
			this.fix_filter === data.fix_filter
	}

	copy(data: ActorFilterData) {
		this.show_rows = data.show_rows.slice()
		this.name = data.name
		this.group_id_list = data.group_id_list.slice()
		this.folder_id = data.folder_id
		this.tag_filter = data.tag_filter.clone()
		this.link_filter = data.link_filter.clone()
		this.min_score = data.min_score
		this.max_score = data.max_score
		this.remark_str = data.remark_str
		this.has_remark = data.has_remark
		this.comment_str = data.comment_str
		this.has_comment = data.has_comment
		this.post_completed = data.post_completed
		this.res_completed = data.res_completed
		this.fix_filter = data.fix_filter

		this.sort_items = data.sort_items.map(item => item.clone())
		// desc_list is immutable in some sense, so we don't need to clone it
		this.desc_list = data.desc_list
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

		// link
		const link_item = this.link_filter.formatFilterItem(getNameFunc)
		if (link_item) {
			desc_list.push(link_item)
		}

		// score
		if (this.min_score > 0 && this.max_score < MAX_SCORE) {
			desc_list.push(new FilterItem("Score", `${this.show_min_score} - ${this.show_max_score}`))
		} else if (this.min_score > 0) {
			desc_list.push(new FilterItem("Score", `>= ${this.show_min_score}`))
		} else if (this.max_score < MAX_SCORE) {
			desc_list.push(new FilterItem("Score", `<= ${this.show_max_score}`))
		}

		// name
		if (this.name.length > 0) {
			desc_list.push(new FilterItem("Name", this.name))
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
			const folder_name = getNameFunc(EStoreType.ActorFavFolder, this.folder_id)
			desc_list.push(new FilterItem("Folder", `In ${folder_name}`))
		} else if (this.folder_id < 0) {
			const folder_name = getNameFunc(EStoreType.ActorFavFolder, -this.folder_id)
			desc_list.push(new FilterItem("Folder", `Not in ${folder_name}`))
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

		// post count
		if (this.fix_filter != EFixFilter.None) {
			if (this.fix_filter & EFixFilter.Overflow) {
				desc_list.push(new FilterItem("Post", "Overflow"))
			}
			if (this.fix_filter & EFixFilter.TotalZero) {
				desc_list.push(new FilterItem("Post", "Total Zero"))
			}
			if (this.fix_filter & EFixFilter.LinkNotChecked) {
				desc_list.push(new FilterItem("Link", "Not Checked"))
			}
			if (this.fix_filter & EFixFilter.IconNotExists) {
				desc_list.push(new FilterItem("Icon", "Not Exists"))
			}
			if (this.fix_filter & EFixFilter.MissingPosts) {
				desc_list.push(new FilterItem("Post", "Missing"))
			}
			if (this.fix_filter & EFixFilter.NoFavorite) {
				desc_list.push(new FilterItem("Favorite", "X"))
			}
		}

		if (desc_list.length == 0) {
			desc_list.push(new FilterItem("All", "actors"))
		}

		return desc_list
	}
}

