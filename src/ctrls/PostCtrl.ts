import { fetchPost, fetchPostStr } from "./FetchCtrl";
import { ActorPostInfo, EditingPostData, PostData, PostFilterForm } from "../data/PostData";
import { BASE_URL } from "../data/Consts";

const baseUrl = `${BASE_URL}/api/post`

export async function getPostCountList(form: PostFilterForm) {
	const url = `${baseUrl}/post_count_list`
	const [ok, response] = await fetchPost(url, form)
	if (!ok) {
		return [ok, response]
	}
	const list: ActorPostInfo[] = []
	for (const json_data of response) {
		const post = new ActorPostInfo(json_data)
		list.push(post)
	}
	list.sort((a, b) => a.actor_name.localeCompare(b.actor_name))
	return [true, list]
}

export async function getPosts(form: PostFilterForm) {
	const url = `${baseUrl}/post_list`
	const [ok, response] = await fetchPost(url, form)
	if (!ok) {
		return [ok, response]
	}
	const post_info_list: EditingPostData[] = []
	for (const json_data of response) {
		const post_info = new EditingPostData(json_data)
		post_info_list.push(post_info)
		console.log(post_info)
	}
	return [true, post_info_list]
}

export async function setPostComment(post_id: string, comment: string) {
	const url = `${baseUrl}/${post_id}/comment`
	return await fetchPostStr(url, comment)
}