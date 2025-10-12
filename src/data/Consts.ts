import {
	ActorLogType, BoolEnum,
	DownloadType,
	ECacheKey,
	EConfirmOp,
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
import { CommonOption, ConfirmOp, NoticeColumn, NoticeTypeConfig, OtherOp, SettingItemConfig, SortGroup } from "./Interfaces";

export const ROOT_URL = "http://127.0.0.1:7878"
export const BASE_URL = `${ROOT_URL}/api`

export const MAX_SCORE = 12

export const Filter_Row_Names = ["Group", "Tag", "Score", "Name/Link", "Remark", "Comment", "Folder", "Progress"]

export const ResStateList: ResState[] = [ResState.Del, ResState.Skip, ResState.Init, ResState.Down]
export const video_state_color = {
	[ResState.Init]: "green",
	[ResState.Down]: "hotpink",
	[ResState.Skip]: "orangered",
	[ResState.Del]: "#409eff",
}
export const str_res_state = {
	[ResState.Init]: "未下载",
	[ResState.Down]: "已下载",
	[ResState.Skip]: "大文件",
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
	{ label: "Image", value: ResType.Image },
	{ label: "Video", value: ResType.Video },
]

export const Default_Sort_Option = { label: "None", value: SortType.Default, default_asc: true, full_label: "None" }

export const Sort_Groups: SortGroup[] = [
	{
		label: "Actor", options: [
			{ label: "Score", value: SortType.Score, default_asc: true, full_label: "Score" },
			{ label: "Group Time", value: SortType.GroupTime, default_asc: false, full_label: "Group Time" }
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
			{ label: "Downed", value: SortType.DownFileSize, default_asc: true, full_label: "Downed File Size" },
			{ label: "Total", value: SortType.TotalFileSize, default_asc: true, full_label: "Total File Size" }
		]
	},
	{
		label: "Progress", options: [
			{ label: "Post Time", value: SortType.LastPostFetchTime, default_asc: false, full_label: "Post Fetch Time" },
			{ label: "Res Time", value: SortType.LastResDownloadTime, default_asc: false, full_label: "Res Download Time" }
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


export const Star_Colors = {
	0: '#A0B9C6',  // 灰蓝色
	1: '#2E86AB',  // 深蓝色
	2: '#00A6FB',  // 亮蓝色
	3: '#FFDE00',   // 黄色
	4: '#FF6840',   // 橙色
	5: '#FF007F',   // 粉色
	6: '#BF00BF'    // 紫色
}

export const Tag_Colors = [
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

export const Notice_Type_Names: Record<NoticeType, string> = {
	[NoticeType.All]: "All",
	[NoticeType.UnlinkedActor]: "Unlinked Actor",
	[NoticeType.InvalidPost]: "Invalid Post",
	[NoticeType.SameActorName]: "Same Actor Name",
	[NoticeType.HasLinkedAccount]: "Has Linked Account",
	[NoticeType.SimilarActorName]: "Similar Actor Name",
}

export const Notice_Type_Values: NoticeType[] = [
	NoticeType.InvalidPost,
	NoticeType.UnlinkedActor,
	NoticeType.SameActorName,
	NoticeType.HasLinkedAccount,
	NoticeType.SimilarActorName
]

export const Notice_Type_Config_Default: NoticeTypeConfig = { tip: "", notice_columns: [] }
export const Notice_Type_Configs: Record<NoticeType, NoticeTypeConfig> =
{
	[NoticeType.All]: {
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
		tip: "same actor name on different platforms",
		notice_columns: [{
			col_name: "Actor Name",
			prop_name: "notice_param0"
		}]
	},
	[NoticeType.HasLinkedAccount]: {
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

export const Other_Ops: OtherOp[] = [
	{ op: EOtherOp.Outdated, label: "Outdated Files", desc: "when actor is done, there may be downloading files of this actor", btn_text: "Remove Files" },
	{ op: EOtherOp.Validate, label: "Validate File Info", desc: "correct incorrect file info in database", btn_text: "Validate" },
	{ op: EOtherOp.Manual, label: "Reset Manual", desc: "reset manual flag for all actors", btn_text: "Reset Manual" },
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
	[EConfirmOp.ResetPosts]: { title: "Reset Posts", content: "reset  last post id of actor, so to download old posts" },
	[EConfirmOp.RemoveDownloading]: { title: "Remove Downloading", content: "remove all downloading files of actor" },
	[EConfirmOp.ClearGroupFolder]: { title: "Clear Group Folder", content: "clear all files of actors in this group, be careful" },
	[EConfirmOp.DelActorGroup]: { title: "Delete Actor Group", content: "will fail if there are actors within" },
	[EConfirmOp.DelActorTag]: { title: "Delete Actor Tag", content: "should comment related actors first" },
	[EConfirmOp.DelActorTagGroup]: { title: "Delete Actor Tag Group", content: "delete actor tag group" },
	[EConfirmOp.DelActorFolder]: { title: "Delete Actor Folder", content: "delete actor folder" },
}

export const Task_Type_Descs: Record<TaskType, string> = {
	[TaskType.Default]: "Default",
	[TaskType.Specific]: "Specific Actor",
	[TaskType.Resume]: "Resume Actor",
	[TaskType.MaxSingleActor]: "Max Single Actor",
	[TaskType.New]: "New Actors",
	[TaskType.Url]: "Specific Urls",
	[TaskType.Group]: "Actors in Group",
	[TaskType.FixPost]: "Fix Posts of Actor",
	[TaskType.Manual]: "Manual",
}

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