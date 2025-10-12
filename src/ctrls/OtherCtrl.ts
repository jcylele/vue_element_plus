import { ECacheKey } from "../data/Enums"
import { ISettingItem } from "../data/SchemasOthers"
import { fetchGet, fetchPost } from "./FetchCtrl"

const baseUrl = `/others`

export async function resetManual() {
	const url = `${baseUrl}/reset_manual`
	return await fetchGet(url)
}

export async function findSimilarActorNames() {
	const url = `${baseUrl}/similar_names`
	return await fetchGet(url)
}

export async function cleanFiles() {
	const url = `${baseUrl}/remove_outdated`
	return await fetchGet(url)
}

export async function openLogs() {
	const url = `${baseUrl}/logs`
	return await fetchGet(url)
}

export async function getCustomPage() {
	const url = `${baseUrl}/custom_page`
	return await fetchGet<number>(url)
}

export async function getSettings() {
	const url = `${baseUrl}/settings`
	return await fetchGet(url)
}

export async function changeSetting(key: ECacheKey, value: string | number | boolean) {
	const url = `${baseUrl}/change_setting`
	const item: ISettingItem = {
		key: key,
		value: value
	}
	return await fetchPost(url, item)
}