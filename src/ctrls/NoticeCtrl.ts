import NoticeData from "../data/NoticeData";
import {fetchDelete, fetchGet} from "./FetchCtrl";
import {NoticeType} from "../data/Enums";

const baseUrl = "http://127.0.0.1:8000/api/notice"

export async function getNotices(notice_type: NoticeType) {
    const url = `${baseUrl}/list/${notice_type}`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const list = []
    for (const json_data of response) {
        const data = new NoticeData(json_data)
        list.push(data)
    }
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