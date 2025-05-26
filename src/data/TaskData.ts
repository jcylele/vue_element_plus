import EditableData from "./EditableData";
import {DownloadLimitForm} from "./DownloadForms";
import {PostFilter, ResType} from "./Enums";
import {format_file_size} from "./DataUtil";

export class DownloadProgress extends EditableData {
    actor_count: number
    file_count: number
    total_file_size: number
}

export class DownloadLimit extends EditableData {
    private limit: DownloadLimitForm
    private progress: DownloadProgress

    constructor(json_data?) {
        super(json_data);
        this.limit = new DownloadLimitForm(json_data.limit)
        this.progress = new DownloadProgress(json_data.progress)
    }

    get limit_desc_list(): string[] {
        const desc_list: string[] = []
        // actor count
        if (this.limit.actor_count > 0) {
            desc_list.push(`${this.progress.actor_count}/${this.limit.actor_count} actors`)
        } else if (this.progress.actor_count > 0) {
            desc_list.push(`${this.progress.actor_count} actors`)
        }
        // post count
        if (this.limit.post_filter == PostFilter.Completed) {
            desc_list.push("completed posts")
        } else if (this.limit.post_filter == PostFilter.Current) {
            desc_list.push("current posts")
        } else {
            if (this.limit.post_count > 0) {
                desc_list.push(`${this.limit.post_count} posts`)
            } else {
                desc_list.push(`all posts`)
            }
        }
        // file count / res type
        let str_desc = ResType[this.limit.res_type]
        if (this.limit.file_count > 0) {
            str_desc = `${this.progress.file_count} / ${this.limit.file_count} ${str_desc}`
        } else if (this.progress.file_count > 0) {
            str_desc = `${this.progress.file_count} ${str_desc}`
        }
        desc_list.push(str_desc)

        // single file size
        if (this.limit.single_file_size > 0) {
            desc_list.push(`single ${format_file_size(this.limit.single_file_size)}`)
        }

        // total file size
        if (this.limit.total_file_size > 0) {
            const progress = format_file_size(this.progress.total_file_size)
            const limit = format_file_size(this.limit.total_file_size)
            desc_list.push(`total ${progress} / ${limit}`)
        } else if (this.progress.total_file_size > 0) {
            const progress = format_file_size(this.progress.total_file_size)
            desc_list.push(`total ${progress}`)
        }

        return desc_list
    }
}

export class TaskData extends EditableData {
    readonly uid: number
    desc: string
    download_limit: DownloadLimit
    worker_count: Map<string, number>
    queue_count: Map<string, number>

    constructor(json_data?) {
        super(json_data);
        this.download_limit = new DownloadLimit(json_data.download_limit)
    }
}