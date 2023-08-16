import {fetchDelete, fetchGet, fetchPost} from "./FetchCtrl";
import {DownloadLimitForm} from "../data/SimpleForms";
import ActorCategory from "../consts/ActorCategory";

const baseUrl = "http://127.0.0.1:8000/api/download"

export async function restoreRecord() {
    const url = `${baseUrl}/restore`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadByNames(download_limit: DownloadLimitForm, actor_names: string[]) {
    let url = `${baseUrl}/specific`
    const params = actor_names.map(name => `name=${name}`).join("&")
    url = `${url}?${params}`
    const [ok, response] = await fetchPost(url, download_limit)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadNewActors(download_limit: DownloadLimitForm) {
    const url = `${baseUrl}/new`
    const [ok, response] = await fetchPost(url, download_limit)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function downloadByCategory(category: ActorCategory, download_limit: DownloadLimitForm) {
    const url = `${baseUrl}/category/${category}`
    const [ok, response] = await fetchPost(url, download_limit)
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

    return [true, response]
}

export async function stopTask(task_id: number) {
    const url = `${baseUrl}/${task_id}`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}