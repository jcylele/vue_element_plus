import ActorCategory from "../consts/ActorCategory";

export class DownloadLimitForm {
    actor_count: number
    post_count: number
    // MB
    file_size: number

    resetDefaultValue(category_value:number) {
        switch (category_value) {
            case ActorCategory.Enough.value:
                this.actor_count = 0
                this.post_count = 9999
                this.file_size = 1024
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
}
