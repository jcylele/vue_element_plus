import {PostFilter, ResType} from "./Enums";

export class ActorUrl {
    actor_name: string
    full_url: string
}

export class BaseDownloadForm {
    download_limit: DownloadLimitForm
}

export class ActorIdDownloadForm extends BaseDownloadForm {
    actor_ids: number[]
}

export class GroupDownloadForm extends BaseDownloadForm {
    actor_group_id: number
}

export class NewDownloadForm extends GroupDownloadForm {
    from_start: boolean
}

export class UrlDownloadForm extends GroupDownloadForm {
    urls: ActorUrl[]
}

export class DownloadLimitForm {
    actor_count: number

    post_count: number
    post_filter: PostFilter

    res_type: ResType
    file_count: number
    total_file_size: number
    single_file_size: number


    constructor(json_data?) {
        Object.assign(this, json_data)
    }

    get show_single_file_size() {
        return this.single_file_size / (1024 * 1024)
    }

    set show_single_file_size(val: number) {
        this.single_file_size = val * (1024 * 1024)
    }

    get show_total_file_size() {
        return this.total_file_size / (1024 * 1024)
    }

    set show_total_file_size(val: number) {
        this.total_file_size = val * (1024 * 1024)
    }

    setPresetValue(preset, default_preset) {
        Object.assign(this, default_preset)
        if (preset) {
            Object.assign(this, preset)
        }
    }
}
