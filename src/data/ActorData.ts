import ActorCategory from "../consts/ActorCategory";
import EditableData from "./EditableData";

interface FileInfo {
    size: number,
    count: Map<string, number>
}

export default class ActorData extends EditableData {
    readonly actor_name: string
    rel_tags: number[]
    actor_category: ActorCategory
    readonly completed: boolean
    star: boolean
    file_info: FileInfo
    href: string
    _new_tag_list: number[] = []
    _edit_tags: boolean = false

    constructor(json_data?) {
        super(json_data);
        this.actor_category = ActorCategory.getByValue(json_data.actor_category)
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

    fileSize(): number {
        if (this.file_info && this.file_info.size && this.file_info.size > 0) {
            return Math.floor(this.file_info.size / (1024 * 1024));
        }
        return 0
    }

    fileList(): string {
        if (this.file_info && this.file_info.size && this.file_info.size > 0) {
            let img = 0, video = 0
            for (const key in this.file_info.count) {
                if (key === ".jpg" || key === ".jpeg") {
                    img += this.file_info.count[key]
                } else {
                    video += this.file_info.count[key]
                }
            }
            return `${img}P ${video}V`
        }
        return ""
    }
}