import {fetchDelete, fetchGet, fetchPost} from "./FetchCtrl";
import {
    ActorUrl,
    GroupDownloadForm,
    DownloadLimitForm,
    ActorIdDownloadForm,
    UrlDownloadForm, BaseDownloadForm
} from "../data/SimpleForms";
import TaskData from "../data/TaskData";
import {BASE_URL} from "../data/Consts";

const baseUrl = `${BASE_URL}/api/download`


export async function downloadNewActors(category: number, download_limit: DownloadLimitForm) {
    const url = `${baseUrl}/new`
    const downForm = new GroupDownloadForm()
    downForm.actor_group_id = category
    downForm.download_limit = download_limit
    const [ok, response] = await fetchPost(url, downForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadByGroup(category: number, download_limit: DownloadLimitForm) {
    const url = `${baseUrl}/group`
    const downForm = new GroupDownloadForm()
    downForm.actor_group_id = category
    downForm.download_limit = download_limit
    const [ok, response] = await fetchPost(url, downForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadByActorIds(download_limit: DownloadLimitForm, actor_ids: number[]) {
    let url = `${baseUrl}/specific`
    const nameDownForm = new ActorIdDownloadForm()
    nameDownForm.download_limit = download_limit
    nameDownForm.actor_ids = actor_ids
    const [ok, response] = await fetchPost(url, nameDownForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadByUrls(category: number, download_limit: DownloadLimitForm, urls: ActorUrl[]) {
    let url = `${baseUrl}/urls`
    const urlDownForm = new UrlDownloadForm()
    urlDownForm.actor_group_id = category
    urlDownForm.download_limit = download_limit
    urlDownForm.urls = urls

    const [ok, response] = await fetchPost(url, urlDownForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function resumeDownload(download_limit: DownloadLimitForm) {
    let url = `${baseUrl}/resume`
    const urlDownForm = new BaseDownloadForm()
    urlDownForm.download_limit = download_limit

    const [ok, response] = await fetchPost(url, urlDownForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function getTaskCount() {
    const url = `${baseUrl}/count`
    return  await fetchGet(url)
}

export async function getAllTasks() {
    const url = `${baseUrl}/list`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const list = [] as TaskData[]
    for (const json_data of response) {
        list.push(new TaskData(json_data))
    }
    return [true, list]
}

export async function stopAllTasks() {
    const url = `${baseUrl}/all`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function stopTask(task_id: number) {
    const url = `${baseUrl}/${task_id}`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function cleanFiles() {
    const url = `${baseUrl}/clean`
    const [ok, response] = await fetchGet(url)
    return [ok, response]
}

export async function getActorIds() {
    const url = `${baseUrl}/actor_ids`
    const [ok, response] = await fetchGet(url)
    return [ok, response]
}

