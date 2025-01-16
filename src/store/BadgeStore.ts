import {defineStore} from "pinia";
import {NoticeType} from "../data/Enums";
import {getTaskCount} from "../ctrls/DownloadCtrl";
import {getNoticeCountMap} from "../ctrls/NoticeCtrl";


export const BadgeStore = defineStore('BadgeStore', {
    state: () => ({
        task_count: 0,
        notice_count_map: new Map<NoticeType, number>(),
    }),
    getters: {
        all_task_count: (state) => {
            return state.task_count
        },
        all_notice_count: (state) => {
            let all_count = 0
            state.notice_count_map.forEach((count, notice_type) => {
                all_count += count
            })
            return all_count
        }
    },
    actions: {
        async fetchTaskCount() {
            const [ok, count] = await getTaskCount()
            if (ok) {
                this.task_count = count
            }
        },
        async fetchAllNoticeCount() {
            const [ok, count_map] = await getNoticeCountMap()
            if (ok) {
                this.notice_count_map = count_map
            }
        },

        getNoticeCount(notice_type: NoticeType) {
            return this.notice_count_map.get(notice_type) || 0
        },

        setNoticeCount(notice_type: NoticeType, count: number) {
            this.notice_count_map.set(notice_type, count)
        },

        setTaskCount(count: number) {
            this.task_count = count
        },
    },
})
