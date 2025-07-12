import NoticeData from "../data/NoticeData";
import {fetchDelete, fetchGet} from "./FetchCtrl";
import {NoticeType} from "../data/Enums";
import {BASE_URL} from "../data/Consts";

const baseUrl = `${BASE_URL}/api/notice`

export async function getNoticeCountMap() {
    const url = `${baseUrl}/count_map`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const count_map = new Map<NoticeType, number>()
    for (const json_obj of response) {
        console.log(json_obj.notice_type, json_obj.count)
        count_map.set(json_obj.notice_type, json_obj.count)
    }
    return [true, count_map]
}

export async function getNotices(notice_type: NoticeType, limit: number = 0, start: number = 0) {
    const url = `${baseUrl}/list/${notice_type}?limit=${limit}&offset=${start}`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const list = response.map(json_data => new NoticeData(json_data))
    return [true, list]
}

export async function deleteNotice(notice_id: number) {
    const url = `${baseUrl}/${notice_id}`
    return await fetchDelete(url)
}

export async function delNoticesByType(notice_type: NoticeType) {
    const url = `${baseUrl}/list/${notice_type}`
    return await fetchDelete(url)
}

export async function searchNotices(actor_name: string) {
    const url = `${baseUrl}/search/${actor_name}`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }

    const list = response.map(json_data => new NoticeData(json_data))
    return [true, list]
}