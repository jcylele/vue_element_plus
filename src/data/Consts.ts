import {
	ActorLogType, BoolEnum,
	DownloadType,
	EStartPage,
	NoticeType,
	PostFilter,
	ResSizeUnit,
	ResState, ResType,
	SortType
} from "./Enums";
import { CommonOption, NoticeColumn, SortGroup } from "./Interfaces";

export const BASE_URL = "http://127.0.0.1:7878"

export const MAX_SCORE = 12

export const Filter_Row_Names = ["Group", "Tag", "Score", "Name/Link", "Remark", "Folder"]

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
			{ label: "Current", value: SortType.CurPostCount, default_asc: false, full_label: "Current Post Count" },
		]
	},
	{
		label: "File Size", options: [
			{ label: "Down", value: SortType.DownFileSize, default_asc: true, full_label: "Down File Size" },
			{ label: "Current", value: SortType.CurFileSize, default_asc: true, full_label: "Current File Size" },
			{ label: "Total", value: SortType.TotalFileSize, default_asc: true, full_label: "Total File Size" },
		]
	}
]

export const Download_Options: CommonOption[] = [
	{ label: "New Actors", value: DownloadType.New },
	{ label: "By Group", value: DownloadType.Group },
	{ label: "Specific Urls", value: DownloadType.Url },
	{ label: "Resume Files", value: DownloadType.Resume },
	{ label: "Manual", value: DownloadType.Manual },
]

export const Remark_Options: CommonOption[] = [
	{ label: "All", value: BoolEnum.ALL },
	{ label: "Has Remark", value: BoolEnum.TRUE },
	{ label: "No Remark", value: BoolEnum.FALSE },
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

export const Notice_Param_Names: Record<NoticeType, NoticeColumn[]> =
{
	[NoticeType.All]: [{
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
	}],
	[NoticeType.UnlinkedActor]: [{
		col_name: "Actor Name 1",
		prop_name: "notice_param0"
	}, {
		col_name: "Actor Name 2",
		prop_name: "notice_param1"
	}],
	[NoticeType.InvalidPost]: [{
		col_name: "Actor Name",
		prop_name: "notice_param0"
	}, {
		col_name: "Page",
		prop_name: "notice_param1"
	}, {
		col_name: "Post ID",
		prop_name: "notice_param2"
	}],
	[NoticeType.SameActorName]: [{
		col_name: "Actor Name",
		prop_name: "notice_param0"
	}],
	[NoticeType.HasLinkedAccount]: [{
		col_name: "Actor Name 1",
		prop_name: "notice_param0"
	}, {
		col_name: "Actor Name 2",
		prop_name: "notice_param1"
	}],
	[NoticeType.SimilarActorName]: [{
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
	}],
}

export const Actor_Log_Type_Names = {
	[ActorLogType.Add]: "Actor Created",
	[ActorLogType.Group]: "Set Group",
	[ActorLogType.Score]: "Set Score",
	[ActorLogType.Tag]: "Set Tags",
	[ActorLogType.ResetPost]: "Reset Post",
	[ActorLogType.Remark]: "Set Remark",
	[ActorLogType.Link]: "Link",
	[ActorLogType.Unlink]: "Unlink",
	[ActorLogType.PostCount]: "Post Count",
	[ActorLogType.ClearFolder]: "Clear Folder",
}