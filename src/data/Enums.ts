export enum PostFilter {
    Normal = 0,
    Old = 1,
}

export enum DownloadType {
    None,
    New,
    Category,
    Url,
    Resume,
}

export enum SortType {
    Default,
    Star,
    TotalPostCount,
    CategoryTime,
}

export enum ActorShowType {
    Card,
    Line
}

export enum NoticeType {
    UnlinkedActor = 1,
    InvalidPost = 2,
    SameActorName = 3
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