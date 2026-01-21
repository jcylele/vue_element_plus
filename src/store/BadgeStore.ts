import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { NoticeType } from "../data/Enums";
import { getTaskCount } from "../ctrls/DownloadCtrl";
import { getNoticeCountMap } from "../ctrls/NoticeCtrl";

export const BadgeStore = defineStore('BadgeStore', () => {
	const task_count = ref(0)
	const notice_count_map = ref(new Map<NoticeType, number>())

	const all_task_count = computed(() => task_count.value)
	const all_notice_count = computed(() => {
		let all_count = 0
		notice_count_map.value.forEach((count, notice_type) => {
			all_count += count
		})
		return all_count
	})

	async function fetchTaskCount() {
		const [ok, count] = await getTaskCount()
		if (ok) {
			task_count.value = count
		}
	}
	async function fetchAllNoticeCount() {
		const [ok, count_map] = await getNoticeCountMap()
		if (ok) {
			notice_count_map.value = count_map as Map<NoticeType, number>
		}
	}

	function getNoticeCount(notice_type: NoticeType) {
		return notice_count_map.value.get(notice_type) || 0
	}

	function setNoticeCount(notice_type: NoticeType, count: number) {
		notice_count_map.value.set(notice_type, count)
	}

	function setTaskCount(count: number) {
		task_count.value = count
	}

	return { all_task_count, all_notice_count, fetchTaskCount, fetchAllNoticeCount, getNoticeCount, setNoticeCount, setTaskCount }
})
