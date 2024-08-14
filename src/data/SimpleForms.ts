import {LimitPreset, PostFilter} from "./Enums";

export class BatchActorOperation {
    actor_names: string[]
}

export class BatchActorCategory extends BatchActorOperation {
    category: number
}

export class ActorUrl {
    actor_name: string
    full_url: string
}

abstract class BaseDownloadForm {
    download_limit: DownloadLimitForm
}

export class NameDownloadForm extends BaseDownloadForm {
    actor_names: string[]
}

export class CategoryDownloadForm extends BaseDownloadForm {
    actor_category: number
}

export class UrlDownloadForm extends CategoryDownloadForm {
    urls: ActorUrl[]
}

export class DownloadLimitForm {
    actor_count: number

    post_count: number
    post_filter: PostFilter

    file_size: number
    total_file_size: number
    allow_video: boolean
    allow_img: boolean

    constructor(json_data?) {
        Object.assign(this, json_data)
    }

    get show_file_size() {
        return this.file_size / (1024 * 1024)
    }

    set show_file_size(val: number) {
        this.file_size = val * (1024 * 1024)
    }

    get show_total_file_size() {
        return this.total_file_size / (1024 * 1024)
    }

    set show_total_file_size(val: number) {
        this.total_file_size = val * (1024 * 1024)
    }

    format_file_size(file_size: number): string {
        if (file_size >= 1024 * 1024 * 1024) {
            return `${file_size / (1024 * 1024 * 1024)} GB`
        } else if (file_size >= 1024 * 1024) {
            return `${file_size / (1024 * 1024)} MB`
        } else if (file_size >= 1024) {
            return `${file_size / 1024} KB`
        } else {
            return `${file_size} B`
        }
    }


    file_size_desc(): string {
        return this.format_file_size(this.file_size)
    }

    total_file_size_desc(): string {
        return this.format_file_size(this.total_file_size)
    }

    resetDefaultValue(preset_val: number) {
        console.log(`preset_val: ${preset_val}`)
        this.actor_count = 0
        this.post_count = 0
        this.show_file_size = 0
        this.show_total_file_size = 0
        this.allow_video = true
        this.allow_img = true
        this.post_filter = PostFilter.Normal

        switch (preset_val) {
            case LimitPreset.All:
                break
            case LimitPreset.Init:
                this.actor_count = 50
                this.post_count = 50
                this.show_file_size = 20  // 20MB
                this.show_total_file_size = 1024 // 1GB
                break
            case LimitPreset.Current_Init:
                this.post_filter = PostFilter.Old
                this.show_file_size = 20  // 20MB
                this.show_total_file_size = 1024 // 1GB
                break
            case LimitPreset.Current_Video:
                this.post_filter = PostFilter.Old
                this.allow_img = false
                break
            case LimitPreset.Only_Info:
                this.show_file_size = 1  // 1MB, most res will be oversize
                this.show_total_file_size = 1 // 1MB total
            default:
                break
        }
    }

    static NewForm(category_value: number) {
        const form = new DownloadLimitForm()
        form.resetDefaultValue(category_value)
        return form
    }

    setPageLimit(page_limit: number) {
        if (page_limit < 1) {
            this.post_count = 0
        } else {
            this.post_count = page_limit * 50
        }
    }

    post_desc(): string {
        console.log(`${this.post_filter}-${this.post_count}`)
        switch (this.post_filter) {
            case PostFilter.Old:
                return "current posts"
            case PostFilter.New:
                return "latest posts"
            default:
                if (this.post_count == 0) {
                    return "all posts"
                } else {
                    return `${this.post_count} posts`
                }
        }
    }
}
