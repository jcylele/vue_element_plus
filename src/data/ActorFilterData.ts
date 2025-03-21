import {SortType} from "./Enums";


class SortItem {
    sort_type: SortType
    sort_asc: boolean

    constructor() {
        this.sort_type = SortType.Default
        this.sort_asc = true
    }

    clone() {
        const item = new SortItem()
        item.copy(this)
        return item
    }

    copy(item: SortItem) {
        this.sort_type = item.sort_type
        this.sort_asc = item.sort_asc
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

export default class ActorFilterData {
    /**
     * category, tag, score, name, remark
     */
    show_rows: boolean[]
    name: string
    linked: boolean
    group_id_list: number[]
    all_group_list: number[]
    tag_list: number[]
    no_tag: boolean
    min_score: number
    max_score: number

    remark_str: string
    remark_any: boolean

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
        const filtered = []
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
        this.show_rows = new Array(5).fill(false)
        this.all_group_list = []
        this.reset()
    }

    reset() {
        this.resetCategory()
        this.resetTags()
        this.resetScores()
        this.resetNameLink()
        this.resetRemark()

        this.resetSort()
    }

    clone() {
        const data = new ActorFilterData()
        data.copy(this)
        return data
    }

    copy(data: ActorFilterData) {
        this.show_rows = data.show_rows.slice()
        this.name = data.name
        this.linked = data.linked
        this.group_id_list = data.group_id_list.slice()
        this.tag_list = data.tag_list.slice()
        this.no_tag = data.no_tag
        this.min_score = data.min_score
        this.max_score = data.max_score
        this.remark_str = data.remark_str
        this.remark_any = data.remark_any

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
        this.tag_list = []
        this.no_tag = false
    }

    onCheckedTagChange() {
        if (this.tag_list.length > 0) {
            this.no_tag = false
        }
    }

    checkNoTag(val: boolean) {
        if (val) {
            this.tag_list = []
        }
    }

    resetScores() {
        this.min_score = 0
        this.max_score = 12
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
        this.remark_any = false
    }

    checkAnyRemark(val: boolean) {
        if (val) {
            this.remark_str = ""
        }
    }
}

