import { Notice_Type_Configs } from "./Consts";
import { BaseData } from "./BaseData";
import { NoticeType } from "./Enums";

export class NoticeData extends BaseData {
	notice_id: number
	notice_type: NoticeType
	notice_param0: string
	notice_param1: string
	notice_param2: string
	notice_param3: string

	get str_notice_type(): string {
		return Notice_Type_Configs[this.notice_type].name
	}
}