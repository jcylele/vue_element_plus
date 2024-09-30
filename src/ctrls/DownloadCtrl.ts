import {fetchDelete, fetchGet, fetchPost} from "./FetchCtrl";
import {
    ActorUrl,
    GroupDownloadForm,
    DownloadLimitForm,
    ActorIdDownloadForm,
    UrlDownloadForm
} from "../data/SimpleForms";
import TaskData from "../data/TaskData";

const baseUrl = "http://127.0.0.1:8000/api/download"


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