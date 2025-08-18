import ActorData from "./ActorData";
import BaseData from "./BaseData";

export class BaseResult extends BaseData {
	succeed: boolean
	msg: string

	constructor(json_data?) {
		super(json_data);
	}
}


export class ActorResult extends BaseResult {
	actor: ActorData

	constructor(json_data?) {
		super(json_data);
		if (!json_data) {
			return
		}
		if (json_data.actor) {
			this.actor = new ActorData(json_data.actor)
		}
	}
}

export class ActorListResult extends BaseResult {
	// actor_list: ActorData[]   server data
	actor_map: Map<number, ActorData>

	constructor(json_data?) {
		super(json_data);
		if (!json_data) {
			return
		}
		this.actor_map = new Map<number, ActorData>()
		for (const json_obj of json_data.actor_list) {
			const actor = new ActorData(json_obj)
			this.actor_map.set(actor.actor_id, actor)
		}
	}
}
