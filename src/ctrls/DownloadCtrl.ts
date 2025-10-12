import {fetchDelete, fetchGet, fetchPatch, fetchPost} from "./FetchCtrl";
import {
    ActorUrl,
    GroupDownloadForm,
    DownloadLimitForm,
    ActorIdDownloadForm,
    UrlDownloadForm, NewDownloadForm
} from "../data/DownloadForms";
import {TaskData} from "../data/TaskData";

const baseUrl = `/download`


export async function downloadNewActors(download_limit: DownloadLimitForm, group_id: number, start_page: number) {
    const url = `${baseUrl}/new`
    const downForm = new NewDownloadForm()
    downForm.actor_group_id = group_id
    downForm.download_limit = download_limit
    downForm.start_page = start_page
    return await fetchPost(url, downForm)
}

export async function downloadByGroup(download_limit: DownloadLimitForm, group_id: number) {
    const url = `${baseUrl}/group`
    const downForm = new GroupDownloadForm()
    downForm.actor_group_id = group_id
    downForm.download_limit = download_limit
    return await fetchPost(url, downForm)
}

export async function downloadByActorIds(download_limit: DownloadLimitForm, actor_ids: number[]) {
    let url = `${baseUrl}/specific`
    const nameDownForm = new ActorIdDownloadForm()
    nameDownForm.download_limit = download_limit
    nameDownForm.actor_ids = actor_ids
    return await fetchPost(url, nameDownForm)
}

export async function downloadByUrls(download_limit: DownloadLimitForm, group_id: number, urls: ActorUrl[]) {
    let url = `${baseUrl}/urls`
    const urlDownForm = new UrlDownloadForm()
    urlDownForm.actor_group_id = group_id
    urlDownForm.download_limit = download_limit
    urlDownForm.urls = urls

    return await fetchPost(url, urlDownForm)
}

export async function resumeActorDownload(actor_id: number) {
    let url = `${baseUrl}/resume/${actor_id}`

    return await fetchPatch(url)
}

export async function fixPosts(actor_id: number) {
    let url = `${baseUrl}/fix_posts/${actor_id}`

    return await fetchPatch(url)
}

export async function manualDownload(download_limit: DownloadLimitForm, group_id: number) {
    let url = `${baseUrl}/manual`
    const downloadForm = new GroupDownloadForm()
    downloadForm.download_limit = download_limit
    downloadForm.actor_group_id = group_id

    return await fetchPost(url, downloadForm)
}

export async function getTaskCount() {
    const url = `${baseUrl}/count`
    return await fetchGet<number>(url, undefined, false)
}

export async function getAllTasks() {
    const url = `${baseUrl}/list`
    return await fetchGet<TaskData>(url, TaskData, true)
}

export async function stopAllTasks() {
    const url = `${baseUrl}/all`
    return await fetchDelete(url)
}

export async function stopSingleTask(task_id: number) {
    const url = `${baseUrl}/${task_id}`
    return await fetchDelete(url)
}

export async function getActorIds() {
    const url = `${baseUrl}/actor_ids`
    return await fetchGet<number>(url, undefined, true)
}
