export enum PostFilter {
    Normal = 0,
    Current = 1,
    Completed = 2
}

export enum DownloadType {
    None,
    New,
    Category,
    Url,
    Resume,
    Manual
}

export enum SortType {
    Default,
    Score,
    TotalPostCount,
    CurPostCount,
    CategoryTime,
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