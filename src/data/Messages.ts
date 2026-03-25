/**
 * containing the error codes and user messages.
 */
import { ErrorCode } from './Enums';

/**
 * ErrorMessages is the messages for the error codes.
 */
export const ErrorMessages: { [key in ErrorCode]: string } = {
	[ErrorCode.Success]: 'operation succeed',

	[ErrorCode.Unavailable]: 'function unavailable',

	[ErrorCode.MainActorNotFound]: 'main actor not found',
	[ErrorCode.ActorNotFound]: 'actor not found',
	[ErrorCode.ActorGroupNotFound]: 'actor group not found',
	[ErrorCode.TagNotFound]: 'tag not found',
	[ErrorCode.TagGroupNotFound]: 'tag group not found',
	[ErrorCode.FolderNotFound]: 'folder not found',

	[ErrorCode.MultiLinkGroups]: 'multiple link groups',
	[ErrorCode.NotAllLinkedActors]: 'not all actors are linked',
	[ErrorCode.UnlinkedActor]: 'unlinked actor',
	[ErrorCode.NoNewMainActor]: 'no new main actor',

	[ErrorCode.GroupAlreadyIn]: 'already in group',
	[ErrorCode.GroupCondFailed]: 'group condition failed',
	[ErrorCode.GroupHasActors]: 'group has actors',

	[ErrorCode.TagInOtherGroup]: 'tag in other group',
	[ErrorCode.TagNotInGroup]: 'tag not in group',
	[ErrorCode.TagInGroup]: 'tag already in group',

	[ErrorCode.BatchFileInfoTooLarge]: 'too many actors in batch file info',
};

/**
 * LogMessages is the messages for the log operations.
 */
export const LogMessages = {

	ActorChangeGroup(actor_name: string, group_name: string): string {
		return `actor ${actor_name} changed to group ${group_name} succeed`
	},
	ActorChangeScore(): string {
		return "change score succeed"
	},
	ActorChangeRemark(): string {
		return "change remark succeed"
	},
	ActorChangeComment(): string {
		return "change comment succeed"
	},
	ClearFolder(): string {
		return "clear folder succeed"
	},
	ResetResStates(): string {
		return "reset res states succeed"
	},
	AddActorToFolder(): string {
		return "add actor to folder succeed"
	},
	DelActorFromFolder(): string {
		return "del actor from folder succeed"
	},
	RemoveDownloadingFiles(): string {
		return "remove downloading files succeed"
	},
	RemoveOutdatedFiles(): string {
		return "remove outdated files succeed"
	},
	ResumeDownloading(): string {
		return "resume downloading succeed"
	},
	ResetManual(): string {
		return "reset manual succeed"
	},
	ValidateFileInfos(count: number): string {
		return `validate file info succeed, ${count} actors fixed`
	},
	RenameFiles(): string {
		return "rename files succeed"
	},
	RemoveFiles(is_landscape: boolean): string {
		return `remove ${is_landscape ? 'landscape' : 'portrait'} files succeed`
	},
	TaskStart(): string {
		return "download task started"
	},
	ResetLastPostId(): string {
		return "reset last post id succeed"
	},
	TaskStop(): string {
		return "stop task succeed"
	},
	TaskStopAll(): string {
		return "stop all tasks succeed"
	},
	GroupSetCondition(): string {
		return "set group condition succeed"
	},
	GroupAdded(): string {
		return "add group succeed"
	},
	AddTagToGroup(tag_name: string, group_name: string): string {
		return `Added tag ${tag_name} to group ${group_name} succeed`
	},
	DelTagFromGroup(tag_name: string, group_name: string): string {
		return `Removed tag ${tag_name} from group ${group_name} succeed`
	},
	TagPrioritiesSaved(): string {
		return "tag priorities saved"
	},
	SimilarActorNames(): string {
		return "find similar actor names finished"
	},
	SimilarActorIcons(): string {
		return "find similar actor icons finished"
	},
	SetPostComment(): string {
		return "set comment for post succeed"
	},
	NoActorSelected(): string {
		return "no actor selected"
	},
	NotEnoughActorsToLink(): string {
		return "not enough actors to link"
	},
	LinkActors(count: number): string {
		return `link ${count} actors succeed`
	},
	UnlinkActors(count: number): string {
		return `unlink ${count} actors succeed`
	},
	ChooseCorrectActorGroup(): string {
		return "choose correct group"
	},
	NoUrlAssigned(): string {
		return "no url assigned"
	},
	ShortPostIdPrefix(): string {
		return "post id prefix is too short"
	},
	InvalidDownloadType(): string {
		return "invalid download type"
	},

	RequestFailed(message: string): string {
		return `Request Failed: ${message}`
	},

	NetworkError(): string {
		return "Network Error: Server Unresponsive"
	},

	RequestError(message: string, status: number): string {
		return `Request Error: ${message} (Code: ${status})`
	},
};