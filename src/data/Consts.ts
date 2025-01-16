import {
    ActorLogType,
    ActorShowType,
    DownloadType,
    NoticeType,
    PostFilter,
    ResSizeUnit,
    ResState,
    SortType
} from "./Enums";
import {CommonOption, SortOption} from "./Interfaces";

export const BASE_URL = "http://127.0.0.1:7878"

export const MAX_SCORE = 12

export const ResStateList: ResState[] = [ResState.Del, ResState.Skip, ResState.Init, ResState.Down]
export const video_state_color = {
    [ResState.Init]: "darkgreen",
    [ResState.Down]: "hotpink",
    [ResState.Skip]: "orangered",
    [ResState.Del]: "blue",
}
export const str_res_state = {
    [ResState.Init]: "未下载",
    [ResState.Down]: "已下载",
    [ResState.Skip]: "大文件",
    [ResState.Del]: "已删除",
}

export const ResSizeList = [ResSizeUnit.GB, ResSizeUnit.MB, ResSizeUnit.KB, ResSizeUnit.B]

export const Sort_Options: SortOption[] = [
    {id: 0, label: "None", sort_type: SortType.Default, sort_asc: false},
    {id: 1, label: "Star Desc", sort_type: SortType.Star, sort_asc: false},
    {id: 2, label: "Post Count Asc", sort_type: SortType.TotalPostCount, sort_asc: true},
    {id: 3, label: "Category Time Asc", sort_type: SortType.CategoryTime, sort_asc: true},
]

export const Post_Filter_Options: CommonOption[] = [
    {label: "Normal", value: PostFilter.Normal},
    {label: "Current", value: PostFilter.Old},
]

export const Download_Options: CommonOption[] = [
    {label: "New Actors", value: DownloadType.New},
    {label: "By Category", value: DownloadType.Category},
    {label: "Specific Urls", value: DownloadType.Url},
    {label: "Resume Files", value: DownloadType.Resume},
]


export const Star_Colors = {
    0: '#2020FF',
    1: '#7F7EFF',
    2: '#7EFF00',
    3: '#FFDE00',
    4: '#FFC0CB',
    5: '#FF007F',
    6: '#7F00FF'
}

export const Tag_Colors = [
    "#0000EE",
    "#3030EE",
    "#6060EE",
    "#9F9EEE",
    "#7EEE00",
    "#BECE00",
    "#EEAE00",
    "#EE707B",
    "#EE007F",
    "#434343",
]

export const Actor_Show_Options: CommonOption[] = [
    {label: "Card", value: ActorShowType.Card},
    {label: "Line", value: ActorShowType.Line},
]

export const Notice_Type_Options: CommonOption[] = [
    {label: "Invalid Post", value: NoticeType.InvalidPost},
    {label: "Unlinked Actor", value: NoticeType.UnlinkedActor},
    {label: "Same Actor Name", value: NoticeType.SameActorName},
    {label: "Has Linked Account", value: NoticeType.HasLinkedAccount},
]

export const Notice_Param_Names =
    {
        [NoticeType.UnlinkedActor]: ["actor_name1", "actor_name2"],
        [NoticeType.InvalidPost]: ["actor_name", "page", "post_id"],
        [NoticeType.SameActorName]: ["actor_name"],
        [NoticeType.HasLinkedAccount]: ["actor_name"],
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