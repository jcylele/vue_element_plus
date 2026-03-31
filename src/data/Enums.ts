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
	Specific,
	Resume,
	FixPost,
	FixRes,
	Thumbnail,

	MaxSingleActor = 100,  // above are single actor tasks, below are multiple actor tasks

	New,
	Url,
	Group,
	Manual,
}

export enum SortType {
	Default,
	Score,
	GroupTime,
	LogTime,
	TotalPostCount,
	CompletedPostCount,
	InitFileSize,
	DownFileSize,
	TotalFileSize,
	FavoriteCount
}

export enum NoticeType {
	All = 0,
	UnlinkedActor = 1,
	InvalidPost = 2,
	SameActorName = 3,
	HasLinkedAccount = 4,
	SimilarActorName = 5,
	SimilarIcon = 6,
}

export enum ResState {
	Init = 1,
	Down = 2,
	Skip = 3, //已废弃，保留参数名
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
	Linked = 3,		// param: bool
	HasRemark = 4 	// param: bool
}

export enum ResType {
	None = 0,
	Image = 1,
	Video = 2,
}

export enum BoolEnum {
	ALL = 1,
	TRUE = 2,
	FALSE = 3
}

export enum EFixFilter {
	None = 0,
	Overflow = 1,  // current post count > total post count
	TotalZero = 1 << 1,  // total post count = 0
	LinkNotChecked = 1 << 2,  // link not checked
	IconNotExists = 1 << 3,  // icon not exists
	MissingPosts = 1 << 4,  // actor has missing posts
	NoFavorite = 1 << 5  // actor has no favorite count
}

export enum EStartPage {
	ActorCount = -1,
	FromStart = 0,
	Custom = 1,
}

/**
 * filter row, same as show order in ActorFilter.vue
 */
export enum EFilterRow {
	Group = 0,
	Name = 1,
	Folder = 2,
	Fix = 3,
	Link = 4,
	Remark = 5,
	Comment = 6,
	Progress = 7,
	Score = 8,
	Tag = 9,
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
	NoNewMainActor = 204,

	GroupAlreadyIn = 301,
	GroupCondFailed = 302,
	GroupHasActors = 303,

	TagInOtherGroup = 401,
	TagNotInGroup = 402,
	TagInGroup = 403,

	BatchFileInfoTooLarge = 501
}

export enum EOtherOp {
	Outdated = 0,
	Validate = 1,
	Manual = 2,
	Logs = 3,
	MissingPosts = 4,
}

export enum EConfirmOp {
	ClearActorFolder,
	ResetResStates,
	RemoveDownloading,
	RemoveDownloadingAll,
	ClearGroupFolder,
	DelActorGroup,
	DelActorTag,
	DelActorTagGroup,
	DelActorFolder,
	RemoveActorVideos,
	DelAllNotice,
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
export enum ECssVarName {
	// colors
	ElTableTextColor = "--el-table-text-color",
	ElTextColorRegular = "--el-text-color-regular",
	// font sizes
	ElFontSizeLarge = "--el-font-size-large",
	ElFontSizeBase = "--el-font-size-base",
	ElFontSizeSmall = "--el-font-size-small",
}

export enum EStoreType {
	ActorGroup,
	ActorFavFolder,
	ActorTagGroup,
	// above are group stores, below are not
	ActorTag,
	ActorFilter,
	Badge,
	SubMenu,
}

/**
 * actor group flag, used to store actor group boolean properties
 */
export enum EActorGroupFlag {
	HasFolder = 1,
	IsInitial = 1 << 1,
	ShowVideoInfo = 1 << 2
}