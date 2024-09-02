import {Sort_Options} from "./Consts";
import {SortType} from "./Enums";

export default class ActorFilterData {
    show_rows: boolean[]
    name: string
    category_list: number[]
    all_category_list: number[]
    tag_list: number[]
    no_tag: boolean
    min_score: number
    max_score: number

    sort_id: number
    sort_type: SortType
    sort_asc: boolean

    remark_str: string
    remark_any: boolean

    get show_category() {
        return this.show_rows[0]
    }

    set show_category(val: boolean) {
        this.show_rows[0] = val
        this.resetCategory()
    }

    get show_tag() {
        return this.show_rows[1]
    }

    set show_tag(val: boolean) {
        this.show_rows[1] = val
        this.resetTags()
    }

    get show_score() {
        return this.show_rows[2]
    }

    set show_score(val: boolean) {
        this.show_rows[2] = val
        this.resetScores()
    }

    get show_name() {
        return this.show_rows[3]
    }

    set show_name(val: boolean) {
        this.show_rows[3] = val
        this.resetName()
    }

    get show_sort() {
        return this.show_rows[4]
    }

    set show_sort(val: boolean) {
        this.show_rows[4] = val
        this.resetSort()
    }

    get show_remark() {
        return this.show_rows[5]
    }

    set show_remark(val: boolean) {
        this.show_rows[5] = val
        this.resetRemark()
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

    get show_sort_id() {
        return this.sort_id
    }

    set show_sort_id(val: number) {
        this.sort_id = val
        for (const option of Sort_Options) {
            if (option.id == val) {
                this.sort_type = option.sort_type
                this.sort_asc = option.sort_asc
                return
            }
        }
    }

    constructor() {
        this.show_rows = new Array(6).fill(false)
        this.all_category_list = []
        this.reset()
    }

    reset() {
        this.resetCategory()
        this.resetTags()
        this.resetScores()
        this.resetName()
        this.resetSort()
        this.resetRemark()
    }

    clone() {
        const data = new ActorFilterData()
        data.copy(this)
        return data
    }

    copy(data: ActorFilterData) {
        this.show_rows = data.show_rows.slice()
        this.name = data.name
        this.category_list = data.category_list.slice()
        this.tag_list = data.tag_list.slice()
        this.no_tag = data.no_tag
        this.min_score = data.min_score
        this.max_score = data.max_score
        this.show_sort_id = data.show_sort_id
        this.remark_str = data.remark_str
        this.remark_any = data.remark_any
    }

    setAllCategoryList(list: number[]) {
        this.all_category_list = list
    }

    resetCategory() {
        this.checkAllCategory(true)
    }


    checkAllCategory(val: boolean) {
        if (val) {
            this.category_list = this.all_category_list.slice()
        } else {
            this.category_list = []
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
        this.max_score = 10
    }

    onFilterNameChange() {

    }

    resetName() {
        this.name = ""
    }

    resetSort() {
        this.show_sort_id = 0
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

