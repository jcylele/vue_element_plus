import ActorCategory from "../consts/ActorCategory";

export enum PostFilter {
    Normal = 0,
    Old = 1,
    New = 2,
}

export class DownloadLimitForm {
    actor_count: number

    post_count: number
    post_filter: PostFilter

    file_size: number // MB
    allow_video: boolean
    allow_img: boolean

    resetDefaultValue(category_value: number) {
        this.allow_video = true
        this.allow_img = true
        this.post_filter = PostFilter.Normal

        switch (category_value) {
            case ActorCategory.Enough.value:
                this.actor_count = 0
                this.post_count = 0
                this.file_size = 0
                break
            case ActorCategory.Liked.value:
                this.actor_count = 0
                this.post_count = 200
                this.file_size = 200
                break
            default:
                this.actor_count = 50
                this.post_count = 50
                this.file_size = 20
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

    get post_desc() {
        console.log(this.post_filter)
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
