import { ActorLogType } from "./Enums";
import { Actor_Log_Type_Names } from "./Consts";
import { BaseData } from "./BaseData";
import { IActorLog } from "./Schemas";

const COLLAPSIBLE_LOG_TYPE = new Set<ActorLogType>([ActorLogType.Score, ActorLogType.Tag, ActorLogType.Remark, ActorLogType.Comment, ActorLogType.ClearFolder])

export class ActorLog extends BaseData {
	log_type: ActorLogType
	log_param: string
	log_time: string
	collapsed: boolean
	collapsed_count: number

	public get log_type_name(): string {
		return Actor_Log_Type_Names[this.log_type]
	}

	public get log_type_name_count(): string {
		if(this.collapsed_count > 0) {
			return `${this.log_type_name} [${this.collapsed_count + 1}]`
		}
		return this.log_type_name
	}

	public get tag_id_list(): number[] {
		// console.log(`this.log_param = ${this.log_param}`)
		return this.log_param.split('\n').filter((str_tag_id) => {
			return str_tag_id
		}).map(a => parseInt(a))
	}

	public get group_id(): number {
		return parseInt(this.log_param)
	}

	public get show_score(): number {
		return parseInt(this.log_param) / 2
	}

	public set show_score(val: number) {
		// this.log_param = (val * 2).toString()
		// do nothing, just to support v-model
	}

	public get remark(): string {
		return this.log_param
	}

	public get comment(): string {
		return this.log_param
	}

	public get actor_names(): string[] {
		return this.log_param.split('\n')
	}

	public get post_count(): number {
		return parseInt(this.log_param)
	}

	constructor(json_data?: IActorLog) {
		super(json_data);
		this.collapsed = false
		this.collapsed_count = 0
	}

	public static simplifyLogs(logs: ActorLog[]): ActorLog[] {
		let contain_log: ActorLog | undefined = undefined
		const simplified_logs: ActorLog[] = []
		for (let i = logs.length - 1; i >= 0; i--) {
			const log = logs[i]
			if (contain_log && log.log_type === contain_log.log_type) {
				contain_log.collapsed_count++
				log.collapsed = true
			} else {
				simplified_logs.push(log)
				if (COLLAPSIBLE_LOG_TYPE.has(log.log_type)) {
					contain_log = log
				} else {
					contain_log = undefined
				}
			}
		}
		
		return simplified_logs.reverse()
	}
}