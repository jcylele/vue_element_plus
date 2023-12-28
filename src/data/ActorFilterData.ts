import ActorCategory from "../consts/ActorCategory";

export default class ActorFilterData {
    name: string
    category_list: number[]
    tag_list: number[]
    no_tag: boolean
    star: boolean

    private _is_category_partial: boolean
    public get is_category_partial() {
        return this._is_category_partial
    }
    public set is_category_partial(val) {
        this._is_category_partial = val
    }

    private _is_category_all: boolean
    public get is_category_all() {
        return this._is_category_all
    }
    public set is_category_all(val) {
        this._is_category_all = val
    }

    constructor() {
        this.reset()
    }

    reset(excludeCategory: boolean = false) {
        this.name = ""
        this.tag_list = []
        this.no_tag = false
        this.star = false
        if (!excludeCategory){
            this.category_list = ActorCategory.AllCategoryValues
        }
    }

    clone() {
        const data = new ActorFilterData()
        data.name = this.name
        data.category_list = this.category_list.slice()
        data.tag_list = this.tag_list.slice()
        data.no_tag = this.no_tag
        data.star = this.star
        return data
    }

    copy(data: ActorFilterData) {
        this.name = data.name
        this.category_list = data.category_list.slice()
        this.tag_list = data.tag_list.slice()
        this.no_tag = data.no_tag
        this.star = data.star
    }

    checkAllCategory(val: boolean) {
        // console.log("all", val)
        if (val) {
            this.category_list = ActorCategory.AllCategoryValues
        } else {
            this.category_list = []
        }
        this.is_category_partial = false
        this.reset(true)
    }

    onCheckedCategoryChange(val: number[]) {
        // console.log("check", ...val)
        const length = this.category_list.length
        this.is_category_all = length === ActorCategory.AllCategories.length
        this.is_category_partial = length > 0 && length < ActorCategory.AllCategories.length
        this.reset(true)
    }

    onCheckedTagChange() {
        if (this.tag_list.length > 0) {
          this.no_tag = false
        }
    }

    checkNoTag(val: boolean){
        if (val){
            this.tag_list = []
        }
    }

    onFilterNameChange() {

    }
}

