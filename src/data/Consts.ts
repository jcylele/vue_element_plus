import {ActorShowType, LimitPreset, SortType} from "./Enums";
import {CommonOption, SortOption} from "./Interfaces";

export const Sort_Options: SortOption[] = [
    {id: 0, label: "None", sort_type: SortType.Default, sort_asc: false},
    {id: 1, label: "Star Desc", sort_type: SortType.Star, sort_asc: false},
    {id: 2, label: "Post Count Asc", sort_type: SortType.TotalPostCount, sort_asc: true},
    {id: 3, label: "Category Time Asc", sort_type: SortType.CategoryTime, sort_asc: true},
]

export const Preset_Options: CommonOption[] = [
    {label: "All", value: LimitPreset.All},
    {label: "Init", value: LimitPreset.Init},
    {label: "Cur_Init", value: LimitPreset.Current_Init},
    {label: "Cur_Video", value: LimitPreset.Current_Video},
    {label: "Only_Info", value: LimitPreset.Only_Info}
]

export const Star_Colors = {
    0: '#0000FF',
    1: '#7F8EFF',
    2: '#1EFF00',
    3: '#FFEE00',
    4: '#FFA0AB',
    5: '#FF007F',
}

export const Actor_Show_Options = [
    {label: "Card", value: ActorShowType.Card},
    {label: "Line", value: ActorShowType.Line},
]