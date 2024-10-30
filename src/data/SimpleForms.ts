import {PostFilter} from "./Enums";

export class BatchActorOperation {
    actor_ids: number[]
}

export class BatchActorGroup extends BatchActorOperation {
    group_id: number
}

export class ActorUrl {
    actor_name: string
    full_url: string
}

abstract class BaseDownloadForm {
    download_limit: DownloadLimitForm
}

export class ActorIdDownloadForm extends BaseDownloadForm {
    actor_ids: number[]
}

export class GroupDownloadForm extends BaseDownloadForm {
    actor_group_id: number
}

export class UrlDownloadForm extends GroupDownloadForm {
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

    setPresetValue(preset, default_preset) {
        Object.assign(this, default_preset)
        if (preset) {
            Object.assign(this, preset)
        }
    }

    post_desc(): string {
        console.log(`${this.post_filter}-${this.post_count}`)
        switch (this.post_filter) {
            case PostFilter.Old:
                return "current posts"
            default:
                if (this.post_count == 0) {
                    return "all posts"
                } else {
                    return `${this.post_count} posts`
                }
        }
    }
}
