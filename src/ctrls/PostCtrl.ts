import { fetchPost, fetchPostStr, VoidResult } from "./FetchCtrl";
import { ActorPostInfo, EditingPostData, PostData, PostFilterForm } from "../data/PostData";

const baseUrl = "/post"

export async function getPostCountList(form: PostFilterForm) {
	const url = `${baseUrl}/post_count_list`
	return await fetchPost<ActorPostInfo>(url, form, ActorPostInfo, true)
}

export async function getPosts(form: PostFilterForm) {
	const url = `${baseUrl}/post_list`
	return await fetchPost<EditingPostData>(url, form, EditingPostData, true)
}

export async function setPostComment(post_id: string, comment: string): Promise<VoidResult> {
	const url = `${baseUrl}/${post_id}/comment`
	return await fetchPostStr(url, comment, undefined, false)
}