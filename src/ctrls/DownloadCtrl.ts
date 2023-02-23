import FetchCtrl from "./FetchCtrl";
import {DownloadLimitForm} from "../data/SimpleForms";
import ActorCategory from "../consts/ActorCategory";

const baseUrl = "http://127.0.0.1:8000/api/download"

async function restoreRecord() {
    const url = `${baseUrl}/restore`
    const [ok, response] = await FetchCtrl.fetchGet(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

async function downloadNewActors(download_limit: DownloadLimitForm) {
    const url = `${baseUrl}/new`
    const [ok, response] = await FetchCtrl.fetchPost(url, download_limit)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

async function downloadByCategory(category: ActorCategory, download_limit: DownloadLimitForm) {
    const url = `${baseUrl}/category/${category}`
    const [ok, response] = await FetchCtrl.fetchPost(url, download_limit)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export default {
    restoreRecord,
    downloadNewActors,
    downloadByCategory
}