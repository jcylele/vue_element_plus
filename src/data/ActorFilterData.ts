import {SortType} from "./Enums";
import {MAX_SCORE, Sort_Options} from "./Consts";

abstract class BaseCloneable {
    abstract clone(): this;

    abstract copy(source: this): void;

    abstract reset(): void;
}

class SortItem extends BaseCloneable {
    sort_type: SortType
    sort_asc: boolean

    constructor() {
        super()
        this.init()
    }

    private init(): void {  // 私有方法
        this.sort_type = SortType.Default;
        this.sort_asc = true;
    }

    clone(): this {
        const item = new SortItem()
        item.copy(this)
        return item as this
    }

    copy(item: SortItem) {
        this.sort_type = item.sort_type
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
        for (const sortOption of Sort_Options) {
            if (sortOption.value == val) {
                this.sort_asc = sortOption.default_asc
            }
        }
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
}


export class TagFilter extends BaseCloneable {
    private no_tag: boolean
    tag_arr: number[][]
    titles: string[] = ["Have All", "Have No", "Have Any"]
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
}

export class ActorFilterData extends BaseCloneable {
    /**
     * category, tag, score, name, remark
     */
    show_rows: boolean[]
    name: string
    linked: boolean
    group_id_list: number[]
    all_group_list: number[]
    tag_filter: TagFilter
    min_score: number
    max_score: number

    remark_str: string
    has_remark: boolean

    sort_items: SortItem[]

    get show_category() {
        return this.show_rows[0]
    }

    set show_category(val: boolean) {
        this.show_rows[0] = val
        if (!val) {
            this.resetCategory()
        }
    }

    get show_tag() {
        return this.show_rows[1]
    }

    set show_tag(val: boolean) {
        this.show_rows[1] = val
        if (!val) {
            this.resetTags()
        }
    }

    get show_score() {
        return this.show_rows[2]
    }

    set show_score(val: boolean) {
        this.show_rows[2] = val
        if (!val) {
            this.resetScores()
        }
    }

    get show_name() {
        return this.show_rows[3]
    }

    set show_name(val: boolean) {
        this.show_rows[3] = val
        if (!val) {
            this.resetNameLink()
        }
    }

    get show_remark() {
        return this.show_rows[4]
    }

    set show_remark(val: boolean) {
        this.show_rows[4] = val
        if (!val) {
            this.resetRemark()
        }
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
        this.show_rows = new Array(5).fill(false)
        this.all_group_list = []
        this.resetCategory()
        this.resetTags()
        this.resetScores()
        this.resetNameLink()
        this.resetRemark()

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
        this.tag_filter = data.tag_filter.clone()
        this.min_score = data.min_score
        this.max_score = data.max_score
        this.remark_str = data.remark_str
        this.has_remark = data.has_remark

        this.sort_items = data.sort_items.map(item => item.clone())
    }

    setAllGroupList(list: number[]) {
        this.all_group_list = list
    }

    resetCategory() {
        this.checkAllCategory(true)
    }


    checkAllCategory(val: boolean) {
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

    resetSort() {
        this.sort_items = []
    }

    resetRemark() {
        this.remark_str = ""
        this.has_remark = false
    }
}

