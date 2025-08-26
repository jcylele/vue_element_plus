import NoticeData from "../data/NoticeData";
import {fetchDelete, fetchGet} from "./FetchCtrl";
import {NoticeType} from "../data/Enums";
import { INoticeCount } from "../data/SchemasOthers";

const baseUrl = `/notice`

export async function getNoticeCountMap() {
    const url = `${baseUrl}/count_map`
    const [ok, notice_count_list] = await fetchGet<INoticeCount>(url, undefined, true)
    if (!ok) {
        return [false, undefined]
    }
    const count_map = new Map<NoticeType, number>()
    for (const json_obj of notice_count_list) {
        count_map.set(json_obj.notice_type, json_obj.count)
    }
    return [true, count_map]
}

export async function getNotices(notice_type: NoticeType, limit: number = 0, start: number = 0) {
    const url = `${baseUrl}/list/${notice_type}?limit=${limit}&offset=${start}`
    return await fetchGet<NoticeData>(url, NoticeData, true)
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
    return await fetchGet<NoticeData>(url, NoticeData, true)
}