import {Notice_Type_Names} from "./Consts";
import EditableData from "./EditableData";
import { NoticeType } from "./Enums";

export default class NoticeData extends EditableData {
	notice_id: number
	notice_type: NoticeType
	notice_param0: string
	notice_param1: string
	notice_param2: string
	notice_param3: string

	get str_notice_type(): string {
		return Notice_Type_Names[this.notice_type]
	}
}