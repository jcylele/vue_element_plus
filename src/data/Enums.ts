export enum PostFilter {
	All = 0,
	Normal = 1,
	Current = 2,
	Completed = 3
}

export enum DownloadType {
	None,
	New,
	Group,
	Url,
	Manual
}

export enum TaskType {
	Default = 0,
	Specific = 1,
	Resume = 2,

	MaxSingleActor = 100,  // above are single actor tasks, below are multiple actor tasks

	New = 101,
	Url = 102,
	Group = 103,
	FixPost = 104,
	Manual = 105,
}

export enum SortType {
	Default,
	Score,
	GroupTime,
	TotalPostCount,
	CompletedPostCount,
	InitFileSize,
	DownFileSize,
	TotalFileSize,
	LastPostFetchTime,
	LastResDownloadTime
}

export enum NoticeType {
	All = 0,
	UnlinkedActor = 1,
	InvalidPost = 2,
	SameActorName = 3,
	HasLinkedAccount = 4,
	SimilarActorName = 5,
}

export enum ResState {
	Init = 1,
	Down = 2,
	Skip = 3,
	Del = 4,
}

export enum MainMenu {
	Notices = "Notices",
	Charts = "Charts",
}

export enum ActorLogType {
	None = 0,
	Add = 1,
	Group = 2,
	Score = 3,
	Tag = 4,
	ResetPost = 5,
	Remark = 6,
	Link = 7,
	Unlink = 8,
	PostCount = 9,
	ClearFolder = 10,
	Comment = 11,
}

export enum ResSizeUnit {
	B = 1,
	KB = 1024,
	MB = 1024 * 1024,
	GB = 1024 * 1024 * 1024
}

export enum GroupCondType {
	MinScore = 0,   // param: score
	MaxScore = 1,   // param: score
	HasAnyTag = 2,  // param: bool
	Linked = 3      // param: bool
}

export enum ResType {
	Image = 1,
	Video = 2,
}

export enum BoolEnum {
	ALL = 1,
	TRUE = 2,
	FALSE = 3
}

export enum EStartPage {
	ActorCount = -1,
	FromStart = 0,
	Custom = 1,
}

export enum EFilterRow {
	Group = 0,
	Tag = 1,
	Score = 2,
	Name = 3,
	Remark = 4,
	Comment = 5,
	Folder = 6,
	Progress = 7,
}

export enum ECardRefresh {
	All = 0,
	Group = 1,
	Comment = 2,
}

export enum ErrorCode {
	Success = 0,

	Unavailable = 1,

	MainActorNotFound = 101,
	ActorNotFound = 102,
	ActorGroupNotFound = 103,
	TagNotFound = 104,
	TagGroupNotFound = 105,
	FolderNotFound = 106,

	MultiLinkGroups = 201,
	NotAllLinkedActors = 202,
	UnlinkedActor = 203,


	GroupAlreadyIn = 301,
	GroupCondFailed = 302,
	GroupHasActors = 303,

	TagInOtherGroup = 401,
	TagNotInGroup = 402,
}

export enum EOtherOp {
	Outdated = 0,
	Validate = 1,
	Manual = 2,
	Logs = 3,
}

export enum EConfirmOp {
	ClearActorFolder = 1,
	ResetPosts = 2,
	RemoveDownloading = 3,
	ClearGroupFolder = 4,
	DelActorGroup = 5,
	DelActorTag = 6,
	DelActorTagGroup = 7,
	DelActorFolder = 8,
}

export enum ECacheKey {
	DbConnectString = 'DbConnectString',
	RootUrl = 'RootUrl',
	ServerPort = 'ServerPort',
	RootFolder = 'RootFolder',
	ShowBrowser = 'ShowBrowser',
}

export enum ESettingType {
	Text,
	Number,
	Boolean,
}