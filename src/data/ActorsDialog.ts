import ActorData from "./ActorData"

export enum EActorsDialog {
	none = 'none',
	download = 'download',
	link = 'link',
	folder_add = 'folder_add',
	folder_remove = 'folder_remove',
	downloading = 'downloading',
}

export class ActorsDialog {
	private dialog_type: EActorsDialog = EActorsDialog.none
	public selected_actor_ids: number[] = []
	public selected_actors: ActorData[] = []

	closeDialog(dialog_type: EActorsDialog) {
		if (this.dialog_type == dialog_type) {
			this.dialog_type = EActorsDialog.none
			this.selected_actor_ids = []
			this.selected_actors = []
		}
	}

	showDialog(type: EActorsDialog, actor_ids: number[]|undefined, actors: ActorData[]|undefined) {
		this.dialog_type = type
		this.selected_actor_ids = actor_ids ?? []
		this.selected_actors = actors ?? []
	}

	get title(): string {
		switch (this.dialog_type) {
			case EActorsDialog.download:
				return `Download (${this.selected_actor_ids.length} actors)`
			case EActorsDialog.link:
				return 'Link Preview'
			case EActorsDialog.folder_add:
				return `Add to Folder (${this.selected_actor_ids.length} actors)`
			case EActorsDialog.folder_remove:
				return `Remove from Folder (${this.selected_actor_ids.length} actors)`
			case EActorsDialog.downloading:
				return 'Downloading File Stats'
			default:
				return `Title ${this.dialog_type}`
		}
	}

	get is_show_download(): boolean {
		return this.dialog_type == EActorsDialog.download
	}

	set is_show_download(val: boolean) {
		if (!val) {
			this.closeDialog(EActorsDialog.download)
		}
	}

	get is_show_link(): boolean {
		return this.dialog_type == EActorsDialog.link
	}

	set is_show_link(val: boolean) {
		if (!val) {
			this.closeDialog(EActorsDialog.link)
		}
	}

	get is_show_folder_add(): boolean {
		return this.dialog_type == EActorsDialog.folder_add
	}

	set is_show_folder_add(val: boolean) {
		if (!val) {
			this.closeDialog(EActorsDialog.folder_add)
		}
	}

	get is_show_folder_remove(): boolean {
		return this.dialog_type == EActorsDialog.folder_remove
	}

	set is_show_folder_remove(val: boolean) {
		if (!val) {
			this.closeDialog(EActorsDialog.folder_remove)
		}
	}

	get is_show_downloading(): boolean {
		return this.dialog_type == EActorsDialog.downloading
	}

	set is_show_downloading(val: boolean) {
		if (!val) {
			this.closeDialog(EActorsDialog.downloading)
		}
	}

}