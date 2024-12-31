import {ActorShowType, DownloadType, NoticeType, PostFilter, SortType} from "./Enums";
import {CommonOption, SortOption} from "./Interfaces";

export const BASE_URL = "http://127.0.0.1:7878"

export const MAX_SCORE = 12

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

export const Actor_Show_Options: CommonOption[] = [
    {label: "Card", value: ActorShowType.Card},
    {label: "Line", value: ActorShowType.Line},
]

export const Notice_Type_Options: CommonOption[] = [
    {label: "Unlinked Actor", value: NoticeType.UnlinkedActor},
    {label: "Invalid Post", value: NoticeType.InvalidPost},
    {label: "Same Actor Name", value: NoticeType.SameActorName},
]

export const Notice_Param_Names =
    {
        [NoticeType.UnlinkedActor]: ["actor_name1", "actor_name2"],
        [NoticeType.InvalidPost]: ["actor_name", "page", "post_id"],
        [NoticeType.SameActorName]: ["actor_name"],
    }