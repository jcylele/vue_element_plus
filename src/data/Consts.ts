/**
 * Consts is the constants for the application.
 */
import {
	ActorLogType, BoolEnum,
	DownloadType,
	EActorGroupFlag,
	ECacheKey,
	EConfirmOp,
	EFixFilter,
	EOtherOp,
	ESettingType,
	EStartPage,
	NoticeType,
	PostFilter,
	ResSizeUnit,
	ResState, ResType,
	SortType,
	TaskType
} from "./Enums";
import { ActorGroupFlagConfig, CommonOption, ConfirmOp, FixOption, NoticeTypeConfig, OtherOp, SettingItemConfig, SortGroup } from "./Interfaces";

export const ROOT_URL = "http://127.0.0.1:7878"
export const BASE_URL = `${ROOT_URL}/api`

export const MAX_SCORE = 12
export const SHOW_MAX_SCORE = MAX_SCORE / 2


// yu EFilterRow 顺序相同
export const Filter_Row_Names = ["Group", "Name", "Folder", "Fix", "Link", "Remark", "Comment", "Progress", "Score", "Tag"]

export const ResStateList: ResState[] = [ResState.Del, ResState.Init, ResState.Down]
export const video_state_color = {
	[ResState.Init]: "green",
	[ResState.Down]: "hotpink",
	[ResState.Del]: "#409eff",
}
export const str_res_state = {
	[ResState.Init]: "未下载",
	[ResState.Down]: "已下载",
	[ResState.Del]: "已删除",
}

export const ResSizeList = [ResSizeUnit.GB, ResSizeUnit.MB, ResSizeUnit.KB, ResSizeUnit.B]

export const Post_Filter_Options: CommonOption[] = [
	{ label: "All", value: PostFilter.All },
	{ label: "Normal", value: PostFilter.Normal },
	{ label: "Current", value: PostFilter.Current },
	{ label: "Completed", value: PostFilter.Completed },
]

export const Res_Type_Options: CommonOption[] = [
	{ label: "None", value: ResType.None },
	{ label: "Image", value: ResType.Image },
	{ label: "Video", value: ResType.Video },
]

export const Default_Sort_Option = { label: "None", value: SortType.Default, default_asc: true, full_label: "None" }

export const Sort_Groups: SortGroup[] = [
	{
		label: "Actor", options: [
			{ label: "Score", value: SortType.Score, default_asc: false, full_label: "Score" },
			{ label: "Group Time", value: SortType.GroupTime, default_asc: false, full_label: "Group Time" },
			{ label: "Log Time", value: SortType.LogTime, default_asc: false, full_label: "Log Time" },
			{ label: "Favorite Count", value: SortType.FavoriteCount, default_asc: false, full_label: "Favorite Count" }
		]
	},
	{
		label: "Post Count", options: [
			{ label: "Total", value: SortType.TotalPostCount, default_asc: true, full_label: "Total Post Count" },
			{ label: "Completed", value: SortType.CompletedPostCount, default_asc: false, full_label: "Completed Post Count" }
		]
	},
	{
		label: "File Size", options: [
			{ label: "Init", value: SortType.InitFileSize, default_asc: true, full_label: "Init File Size" },
			{ label: "Downed", value: SortType.DownFileSize, default_asc: false, full_label: "Downed File Size" },
			{ label: "Total", value: SortType.TotalFileSize, default_asc: true, full_label: "Total File Size" }
		]
	}
]

export const Download_Options: CommonOption[] = [
	{ label: "New Actors", value: DownloadType.New },
	{ label: "By Group", value: DownloadType.Group },
	{ label: "Specific Urls", value: DownloadType.Url },
	{ label: "Manual", value: DownloadType.Manual },
]

export const Remark_Options: CommonOption[] = [
	{ label: "All", value: BoolEnum.ALL },
	{ label: "Has Remark", value: BoolEnum.TRUE },
	{ label: "No Remark", value: BoolEnum.FALSE },
]

export const Comment_Options: CommonOption[] = [
	{ label: "All", value: BoolEnum.ALL },
	{ label: "Has Comment", value: BoolEnum.TRUE },
	{ label: "No Comment", value: BoolEnum.FALSE },
]

export const Link_Options: CommonOption[] = [
	{ label: "All", value: BoolEnum.ALL },
	{ label: "Linked", value: BoolEnum.TRUE },
	{ label: "Unlinked", value: BoolEnum.FALSE },
]


export const Post_Completed_Options: CommonOption[] = [
	{ label: "Posts All", value: BoolEnum.ALL },
	{ label: "Posts Completed", value: BoolEnum.TRUE },
	{ label: "Posts Uncompleted", value: BoolEnum.FALSE },
]

export const Res_Completed_Options: CommonOption[] = [
	{ label: "Res All", value: BoolEnum.ALL },
	{ label: "Res Completed", value: BoolEnum.TRUE },
	{ label: "Res Uncompleted", value: BoolEnum.FALSE },
]

export const Start_Page_Options: CommonOption[] = [
	{ label: "Actor Count", value: EStartPage.ActorCount },
	{ label: "From Start", value: EStartPage.FromStart },
	{ label: "Custom", value: EStartPage.Custom },
]

export const Fix_Options: FixOption[][] = [
	[
		{ label: "Post Count Overflow", value: EFixFilter.Overflow, tooltip: "current post count > total post count, indicating missing posts" },
		{ label: "Post Count Zero", value: EFixFilter.TotalZero, tooltip: "total post count == 0" },
		{ label: "Link Not Checked", value: EFixFilter.LinkNotChecked, tooltip: "actor link page not fetched yet" },
	],
	[
		{ label: "Icon Not Exists", value: EFixFilter.IconNotExists, tooltip: "find similar actor icons in Notices first" },
		{ label: "Missing Posts", value: EFixFilter.MissingPosts, tooltip: "some posts are moved  to other actors" },
		{ label: "No Favorite", value: EFixFilter.NoFavorite, tooltip: "actor has no favorite count" },
	]
]


export const Star_Colors = {
	0: '#A0B9C6',  // 灰蓝色
	1: '#2E86AB',  // 深蓝色
	2: '#00A6FB',  // 亮蓝色
	3: '#FFDE00',   // 黄色
	4: '#FF6840',   // 橙色
	5: '#FF007F',   // 粉色
	6: '#BF00BF'    // 紫色
}

export const Tag_Colors: string[] = [
	"#787878",
	"#EE007F",
	"#EE707B",
	"#EEAE00",
	"#BECE00",
	"#7EEE00",
	"#9F9EEE",
	"#6060EE",
	"#3030EE",
	"#0000EE",
]

export const Notice_Type_Values: NoticeType[] = [
	NoticeType.InvalidPost,
	NoticeType.UnlinkedActor,
	NoticeType.HasLinkedAccount,
	NoticeType.SameActorName,
	NoticeType.SimilarActorName,
	NoticeType.SimilarIcon
]

export const Notice_Type_Config_Default: NoticeTypeConfig = { name: "", tip: "", notice_columns: [] }
export const Notice_Type_Configs: Record<NoticeType, NoticeTypeConfig> =
{
	[NoticeType.All]: {
		name: "All",
		tip: "search all notices(including deleted), must precisely match",
		notice_columns: [{
			col_name: "Type",
			prop_name: "str_notice_type"
		}, {
			col_name: "param0",
			prop_name: "notice_param0"
		}, {
			col_name: "param1",
			prop_name: "notice_param1"
		}, {
			col_name: "param2",
			prop_name: "notice_param2"
		}, {
			col_name: "param3",
			prop_name: "notice_param3"
		}]
	},
	[NoticeType.UnlinkedActor]: {
		name: "Unlinked Actor",
		tip: "unlinked actors share same post, should be linked",
		notice_columns: [{
			col_name: "Actor Name 1",
			prop_name: "notice_param0"
		}, {
			col_name: "Actor Name 2",
			prop_name: "notice_param1"
		}]
	},
	[NoticeType.InvalidPost]: {
		name: "Invalid Post",
		tip: "invalid post id, skip",
		notice_columns: [{
			col_name: "Actor Name",
			prop_name: "notice_param0"
		}, {
			col_name: "Page",
			prop_name: "notice_param1"
		}, {
			col_name: "Post ID",
			prop_name: "notice_param2"
		}]
	},
	[NoticeType.SameActorName]: {
		name: "Same Actor Name",
		tip: "same actor name on different platforms",
		notice_columns: [{
			col_name: "Actor Name",
			prop_name: "notice_param0"
		}]
	},
	[NoticeType.HasLinkedAccount]: {
		name: "Has Linked Account",
		tip: "officially linked accounts",
		notice_columns: [{
			col_name: "Actor Name 1",
			prop_name: "notice_param0"
		}, {
			col_name: "Actor Name 2",
			prop_name: "notice_param1"
		}, {
			col_name: "Actor Name 3",
			prop_name: "notice_param2"
		}, {
			col_name: "Actor Name 4",
			prop_name: "notice_param3"
		}]
	},
	[NoticeType.SimilarActorName]: {
		name: "Similar Actor Name",
		btn_text: "Find Similar Actor Names",
		api_path: "/api/others/similar_names",
		tip: "similar actor names, indicating the same actor",
		notice_columns: [{
			col_name: "Actor Name 1",
			prop_name: "notice_param0"
		}, {
			col_name: "Actor Name 2",
			prop_name: "notice_param1"
		}, {
			col_name: "Actor Name 3",
			prop_name: "notice_param2"
		}, {
			col_name: "Actor Name 4",
			prop_name: "notice_param3"
		}]
	},
	[NoticeType.SimilarIcon]: {
		name: "Similar Actor Icon",
		btn_text: "Find Similar Actor Icons",
		api_path: "/api/others/similar_icons",
		tip: "similar icons, indicating the same actor",
		notice_columns: [{
			col_name: "Actor Name 1",
			prop_name: "notice_param0"
		}, {
			col_name: "Actor Name 2",
			prop_name: "notice_param1"
		}, {
			col_name: "Actor Name 3",
			prop_name: "notice_param2"
		}, {
			col_name: "Actor Name 4",
			prop_name: "notice_param3"
		}]
	},
}

export const Actor_Log_Type_Names = {
	[ActorLogType.Add]: "Actor ID",
	[ActorLogType.Group]: "Set Group",
	[ActorLogType.Score]: "Set Score",
	[ActorLogType.Tag]: "Set Tags",
	[ActorLogType.ResetPost]: "Reset Post",
	[ActorLogType.Remark]: "Set Remark",
	[ActorLogType.Link]: "Link",
	[ActorLogType.Unlink]: "Unlink",
	[ActorLogType.PostCount]: "Post Count",
	[ActorLogType.ClearFolder]: "Clear Folder",
	[ActorLogType.Comment]: "Set Comment",
}

// "/api/others/similar_names": "",
// "/api/others/similar_icons": "",
export const Other_Ops: OtherOp[] = [
	{ op: EOtherOp.Outdated, label: "Outdated Files", desc: "when actor is done, there may be downloading files of this actor", btn_text: "Remove Files", api_path: "/api/others/remove_outdated" },
	{ op: EOtherOp.MissingPosts, label: "Missing Posts", desc: "find missing posts of actors", btn_text: "Find Missing Posts", api_path: "/api/others/refresh_missing_posts" },
	{ op: EOtherOp.Validate, label: "Validate File Info", desc: "correct incorrect file info in database", btn_text: "Validate", api_path: "/api/others/validate_all_file_info" },
	{ op: EOtherOp.Manual, label: "Reset Manual", desc: "reset manual flag for all actors", btn_text: "Reset Manual", api_path: "/api/others/reset_manual" },
	{ op: EOtherOp.Logs, label: "Log Folder", desc: "open log folder in explorer", btn_text: "Open Log Folder" },
]

export const Setting_Item_Configs: SettingItemConfig[] = [
	{ key: ECacheKey.DbConnectString, label: "Db Connect String", type: ESettingType.Text },
	{ key: ECacheKey.RootUrl, label: "Root url to download files", type: ESettingType.Text },
	{ key: ECacheKey.RootFolder, label: "Root folder for downloading", type: ESettingType.Text },
	{ key: ECacheKey.ServerPort, label: "Port of my server", type: ESettingType.Number },
	{ key: ECacheKey.ShowBrowser, label: "Show browser when downloading", type: ESettingType.Boolean },
]

export const Confirm_Ops: Record<EConfirmOp, ConfirmOp> =
{
	[EConfirmOp.ClearActorFolder]: { title: "Clear Actor Folder", content: "clear all files of actor, make sure you have watched them" },
	[EConfirmOp.ResetResStates]: { title: "Reset Res States", content: "reset all deleted reses to initial state" },
	[EConfirmOp.ResetLastPostId]: { title: "Reset Last Post Id", content: "reset last post id of actor, so to download older posts" },
	[EConfirmOp.RemoveDownloading]: { title: "Remove Downloading", content: "remove downloading files below {0}%" },
	[EConfirmOp.RemoveDownloadingAll]: { title: "Remove Downloading", content: "remove all downloading files of actor" },
	[EConfirmOp.ClearGroupFolder]: { title: "Clear Group Folder", content: "clear all files of actors in this group, be careful" },
	[EConfirmOp.DelActorGroup]: { title: "Delete Actor Group", content: "will fail if there are actors within" },
	[EConfirmOp.DelActorTag]: { title: "Delete Actor Tag", content: "should comment related actors first" },
	[EConfirmOp.DelActorTagGroup]: { title: "Delete Actor Tag Group", content: "delete actor tag group" },
	[EConfirmOp.DelActorFolder]: { title: "Delete Actor Folder", content: "delete actor folder" },
	[EConfirmOp.RemoveActorVideos]: { title: "Remove Actor Videos", content: "remove actor's {0} videos, should be watched first" },
	[EConfirmOp.DelAllNotice]: { title: "Delete All Notices", content: "delete all notices of this type" },
}

export const Task_Type_Descs: Record<TaskType, string> = {
	[TaskType.Default]: "Default",
	[TaskType.Specific]: "Specific Actor",
	[TaskType.Resume]: "Resume Actor",
	[TaskType.FixPost]: "Fix Posts of Actor",
	[TaskType.FixRes]: "Fix Res of Actor",
	[TaskType.Thumbnail]: "Thumbnail of Actor",
	[TaskType.MaxSingleActor]: "Max Single Actor",
	[TaskType.New]: "New Actors",
	[TaskType.Url]: "Specific Urls",
	[TaskType.Group]: "Actors in Group",
	[TaskType.Manual]: "Manual",
}

export const Actor_Group_Flag_Configs: ActorGroupFlagConfig[] = [
	{
		flag: EActorGroupFlag.HasFolder,
		label: "Folder",
		desc: "actor in group has folder",
		icon: "bag",
	},
	{
		flag: EActorGroupFlag.IsInitial,
		label: "Initial",
		desc: "suitable for new actors",
		icon: "flag",
	},
	{
		flag: EActorGroupFlag.ShowVideoInfo,
		label: "Video",
		desc: "show video durations in tooltip",
		icon: "camera",
	}
]

export const Single_File_Size_Options: CommonOption[] = [
	{ label: "All", value: 0 },
	{ label: "Info", value: 1 },
	{ label: "Image", value: 4 },
	{ label: "Video", value: 1024 },
]

export const Popper_Styles = {
	Default: {
		'border-color': 'var(--el-border-color)',
		'width': 'auto'
	},

	// 带自定义颜色的样式生成函数
	withColor: (color: string) => ({
		'border-color': color,
		'width': 'auto'
	}),

	// 带自定义宽度的样式生成函数
	withWidth: (width: string) => ({
		'border-color': 'var(--el-border-color)',
		'width': width
	}),

	withWidthNoBorder: (width: string) => ({
		'width': width
	})
} as const