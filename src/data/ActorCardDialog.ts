export enum EActorDialog {
    none = 'none',
    remark = 'remark',
    tags = 'tags',
    post = 'post',
    video_sizes = 'video_sizes',
    log = 'log'
}

export class ActorCardDialog {
    private dialog_type: EActorDialog = EActorDialog.none

    closeDialog(dialog_type: EActorDialog) {
        if (this.dialog_type == dialog_type) {
            this.dialog_type = EActorDialog.none
        }
    }

    get is_show_remark(): boolean {
        return this.dialog_type == EActorDialog.remark
    }

    set is_show_remark(val: boolean) {
        if (!val) {
            this.closeDialog(EActorDialog.remark)
        }
    }

    get is_show_tags(): boolean {
        return this.dialog_type == EActorDialog.tags
    }

    set is_show_tags(val: boolean) {
        if (!val) {
            this.closeDialog(EActorDialog.tags)
        }
    }

    get is_show_posts(): boolean {
        return this.dialog_type == EActorDialog.post
    }

    set is_show_posts(val: boolean) {
        if (!val) {
            this.closeDialog(EActorDialog.post)
        }
    }

    get is_show_video_sizes(): boolean {
        return this.dialog_type == EActorDialog.video_sizes
    }

    set is_show_video_sizes(val: boolean) {
        if (!val) {
            this.closeDialog(EActorDialog.video_sizes)
        }
    }

    get is_show_logs(): boolean {
        return this.dialog_type == EActorDialog.log
    }

    set is_show_logs(val: boolean) {
        if (!val) {
            this.closeDialog(EActorDialog.log)
        }
    }

    showDialog(type: EActorDialog) {
        this.dialog_type = type
    }

}