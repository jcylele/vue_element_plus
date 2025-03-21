import {
    ActorLogType,
    ActorShowType,
    DownloadType,
    NoticeType,
    PostFilter,
    ResSizeUnit,
    ResState, ResType,
    SortType, TaskArchive
} from "./Enums";
import {CommonOption} from "./Interfaces";

export const BASE_URL = "http://127.0.0.1:7878"

export const MAX_SCORE = 12

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
    {label: "Normal", value: PostFilter.Normal},
    {label: "Current", value: PostFilter.Old},
]

export const Res_Type_Options: CommonOption[] = [
    {label: "Image", value: ResType.Image},
    {label: "Video", value: ResType.Video},
]

export const Sort_Options: CommonOption[] = [
    {label: "None", value: SortType.Default},
    {label: "Score", value: SortType.Score},
    {label: "TotalPostCount", value: SortType.TotalPostCount},
    {label: "CategoryTime", value: SortType.CategoryTime},
]

export const Download_Options: CommonOption[] = [
    {label: "New Actors", value: DownloadType.New},
    {label: "By Category", value: DownloadType.Category},
    {label: "Specific Urls", value: DownloadType.Url},
    {label: "Resume Files", value: DownloadType.Resume},
    {label: "Manual", value: DownloadType.Manual},
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
    "#787878",
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
    {label: "Similar Actor Name", value: NoticeType.SimilarActorName},
]

export const Notice_Param_Names =
    {
        [NoticeType.UnlinkedActor]: ["actor_name1", "actor_name2"],
        [NoticeType.InvalidPost]: ["actor_name", "page", "post_id"],
        [NoticeType.SameActorName]: ["actor_name"],
        [NoticeType.HasLinkedAccount]: ["actor_name1", "actor_name2", "actor_name3", "actor_name4"],
        [NoticeType.SimilarActorName]: ["actor_name1", "actor_name2", "actor_name3", "actor_name4"],
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