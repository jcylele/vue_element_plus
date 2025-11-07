import { getActor } from "../ctrls/ActorCtrl"
import ActorData from "./ActorData"
import { ActorElement } from "./ArrayElement"

/**
 * ActorDataMgr is manager for ActorData in Actors.vue
 */
export default class ActorDataMgr {
	locked_actor_list: ActorElement[] = []
	actor_list: ActorElement[] = []
	actor_ids: number[] = []

	get actor_id_count() {
		return this.actor_ids.length
	}

	getSelected() {
		let result_list: ActorElement[] = []
		for (const actor of this.locked_actor_list) {
			if (actor.selected) {
				result_list.push(actor)
			}
		}
		for (const actor of this.actor_list) {
			if (actor.selected) {
				result_list.push(actor)
			}
		}
		return result_list
	}

	batchSelectAll(val: boolean) {
		for (const actor of this.locked_actor_list) {
			actor.selected = val
		}
		for (const actor of this.actor_list) {
			actor.selected = val
		}
	}

	lockActors(lock: boolean) {
		let locked_actor_list: ActorElement[] = []
		let actor_list: ActorElement[] = []
		if (lock) {
			locked_actor_list = [...this.locked_actor_list]
			for (const actor of this.actor_list) {
				if (actor.selected) {
					locked_actor_list.push(actor)
				} else {
					actor_list.push(actor)
				}
			}
		} else {
			for (const actor of this.locked_actor_list) {
				if (actor.selected) {
					actor_list.push(actor)
				} else {
					locked_actor_list.push(actor)
				}
			}
			actor_list.push(...this.actor_list)
		}

		this.locked_actor_list = locked_actor_list
		this.actor_list = actor_list
		this.batchSelectAll(false)
	}

	innerRefreshActors(ar_map: Map<number, ActorData>, actor_list: ActorElement[]) {
		for (const actor_data of actor_list) {
			const new_actor = ar_map.get(actor_data.data.actor_id)
			if (new_actor) {
				actor_data.data = new_actor
			}
		}
	}

	refreshActors(actor_map: Map<number, ActorData>) {
		this.innerRefreshActors(actor_map, this.locked_actor_list)
		this.innerRefreshActors(actor_map, this.actor_list)
		this.batchSelectAll(false)
	}

	innerUpdateActors(actor_id_set: Set<number>, actor_list: ActorElement[], updateFunc: (actor: ActorData) => void) {
		for (const actor of actor_list) {
			if (actor_id_set.has(actor.data.actor_id)) {
				updateFunc(actor.data)
			}
		}
	}

	updateActors(actor_ids: number[], updateFunc: (actor: ActorData) => void) {
		const actor_id_set = new Set(actor_ids)
		this.innerUpdateActors(actor_id_set, this.locked_actor_list, updateFunc)
		this.innerUpdateActors(actor_id_set, this.actor_list, updateFunc)
		this.batchSelectAll(false)
	}

	refreshActorIds(actor_ids: number[] | undefined = undefined) {
		if (actor_ids === undefined) {
			this.actor_list = []
			this.actor_ids = []
		} else {
			this.actor_list = []
			this.actor_ids = actor_ids
			this.asyncFetchActors()
		}
	}

	async asyncFetchActors() {
		for (let i = 0; i < this.actor_ids.length; i++) {
			let actor_id = this.actor_ids[i]
			const [ok, actor] = await getActor(actor_id)
			if (ok) {
				// check if outdated
				if (this.actor_ids[i] != actor_id
					|| this.actor_list.length != i) {
					return
				}
				this.actor_list.push(new ActorElement(actor))
				// wait a moment
				await new Promise(resolve => {
					setTimeout(resolve, 100)
				})
			} else {
				return
			}
		}
	}
}