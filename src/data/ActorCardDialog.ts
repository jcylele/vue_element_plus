/**
 * EActorDialog is the type of dialog for ActorCard.vue
 */
export enum EActorDialog {
	none = 'none',
	remark = 'remark',
	tags = 'tags',
	post = 'post',
	log = 'log',
	file_info = 'file_info',
	post_info = 'post_info',
	folders = 'folders'
}

/**
 * ActorCardDialog is a dialog for ActorCard.vue, it is used to show the dialog for ActorCard.vue
 */
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

	get is_show_logs(): boolean {
		return this.dialog_type == EActorDialog.log
	}

	set is_show_logs(val: boolean) {
		if (!val) {
			this.closeDialog(EActorDialog.log)
		}
	}

	get is_show_file_info(): boolean {
		return this.dialog_type == EActorDialog.file_info
	}

	set is_show_file_info(val: boolean) {
		if (!val) {
			this.closeDialog(EActorDialog.file_info)
		}
	}

	get is_show_post_info(): boolean {
		return this.dialog_type == EActorDialog.post_info
	}

	set is_show_post_info(val: boolean) {
		if (!val) {
			this.closeDialog(EActorDialog.post_info)
		}
	}

	get is_show_folders(): boolean {
		return this.dialog_type == EActorDialog.folders
	}

	set is_show_folders(val: boolean) {
		if (!val) {
			this.closeDialog(EActorDialog.folders)
		}
	}

	showDialog(type: EActorDialog) {
		this.dialog_type = type
	}

}