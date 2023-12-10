import ActorCategory from "../consts/ActorCategory";
import EditableData from "./EditableData";
import {List} from "@element-plus/icons-vue";

interface FileInfo {
    size: number,
    count: Map<string, number>
}

const _img_extensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"]
const res_state = ["未下载", "已下载", "大文件", "已删除"]

export default class ActorData extends EditableData {
    readonly actor_name: string
    rel_tags: number[]
    actor_category: ActorCategory
    readonly completed: boolean
    star: boolean
    remark: string
    // file_info: FileInfo
    post_info: number[]
    res_info: number[]
    href: string
    _new_tag_list: number[] = []
    _edit_tags: boolean = false

    constructor(json_data?) {
        super(json_data);
        this.actor_category = ActorCategory.getByValue(json_data.actor_category)
    }

    sortTags(compareFn?: (a: number, b: number) => number) {
        this.rel_tags.sort(compareFn)
    }

    editTags(edit: boolean) {
        this._edit_tags = edit
        if (edit) {
            this._new_tag_list = this.rel_tags.slice()
        } else {
            this._new_tag_list = []
        }
    }

    hasFolder() {
        return this.actor_category.value == ActorCategory.Init.value
            || this.actor_category.value === ActorCategory.Liked.value;
    }

    resSizeList(): string[] {
        let ret = []
        if (this.res_info) {
            for (let i = 0; i < this.res_info.length; i++) {
                let size = this.res_info[i] / (1024 * 1024 * 1024)
                size = Math.floor(size * 100) / 100
                if (size > 0) {
                    ret.push(`${res_state[i]}: ${size}G`)
                }
            }
        }
        return ret
    }

    // fileSize(): number {
    //     if (this.file_info && this.file_info.size && this.file_info.size > 0) {
    //         let size = this.file_info.size / (1024 * 1024 * 1024)
    //         return Math.floor(size * 100) / 100
    //     }
    //     return 0
    // }
    //
    // fileList(): string {
    //     if (this.file_info && this.file_info.size && this.file_info.size > 0) {
    //         let img = 0, video = 0
    //         for (const key in this.file_info.count) {
    //             if (_img_extensions.indexOf(key) >= 0) {
    //                 img += this.file_info.count[key]
    //             } else {
    //                 video += this.file_info.count[key]
    //             }
    //         }
    //         return `${img}P ${video}V`
    //     }
    //     return ""
    // }
}