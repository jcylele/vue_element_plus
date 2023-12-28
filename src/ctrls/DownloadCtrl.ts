import {fetchDelete, fetchGet, fetchPost} from "./FetchCtrl";
import {DownloadLimitForm} from "../data/SimpleForms";
import ActorCategory from "../consts/ActorCategory";
import ActorTagData from "../data/ActorTagData";
import TaskData from "../data/TaskData";

const baseUrl = "http://127.0.0.1:8000/api/download"

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

export async function downloadAllPosts(download_limit: DownloadLimitForm, actor_name: string) {
    const url = `${baseUrl}/all_posts/${actor_name}`
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
    const list = [] as TaskData[]
    for (const json_data of response) {
        list.push(new TaskData(json_data))
    }
    return [true, list]
}

export async function stopTask(task_id: number) {
    const url = `${baseUrl}/${task_id}`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function stopAllTasks() {
    const url = `${baseUrl}/all`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function restoreFiles() {
    const url = `${baseUrl}/restore`
    const [ok, response] = await fetchGet(url)
    return [ok, response]
}