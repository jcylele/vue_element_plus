import {fetchDelete, fetchGet, fetchPatch, fetchPost} from "./FetchCtrl";
import {
    ActorUrl,
    GroupDownloadForm,
    DownloadLimitForm,
    ActorIdDownloadForm,
    UrlDownloadForm, BaseDownloadForm, NewDownloadForm
} from "../data/DownloadForms";
import {TaskData} from "../data/TaskData";
import {BASE_URL} from "../data/Consts";

const baseUrl = `${BASE_URL}/api/download`


export async function downloadNewActors(download_limit: DownloadLimitForm, group_id: number, start_page: number) {
    const url = `${baseUrl}/new`
    const downForm = new NewDownloadForm()
    downForm.actor_group_id = group_id
    downForm.download_limit = download_limit
    downForm.start_page = start_page
    const [ok, response] = await fetchPost(url, downForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadByGroup(download_limit: DownloadLimitForm, group_id: number) {
    const url = `${baseUrl}/group`
    const downForm = new GroupDownloadForm()
    downForm.actor_group_id = group_id
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

export async function downloadByUrls(download_limit: DownloadLimitForm, group_id: number, urls: ActorUrl[]) {
    let url = `${baseUrl}/urls`
    const urlDownForm = new UrlDownloadForm()
    urlDownForm.actor_group_id = group_id
    urlDownForm.download_limit = download_limit
    urlDownForm.urls = urls

    const [ok, response] = await fetchPost(url, urlDownForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function resumeActorDownload(actor_id: number) {
    let url = `${baseUrl}/resume/${actor_id}`

    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function fixPosts(actor_id: number) {
    let url = `${baseUrl}/fix_posts/${actor_id}`

    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function manualDownload(download_limit: DownloadLimitForm, group_id: number) {
    let url = `${baseUrl}/manual`
    const downloadForm = new GroupDownloadForm()
    downloadForm.download_limit = download_limit
    downloadForm.actor_group_id = group_id

    const [ok, response] = await fetchPost(url, downloadForm)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function getTaskCount() {
    const url = `${baseUrl}/count`
    return await fetchGet(url)
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

// openLogs
export async function openLogs() {
    const url = `${baseUrl}/logs`
    const [ok, response] = await fetchGet(url)
    return [ok, response]
}

export async function getCustomPage() {
    const url = `${baseUrl}/custom_page`
    return await fetchGet(url)
}
