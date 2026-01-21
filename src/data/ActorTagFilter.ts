import { MAX_SCORE } from "./Consts"

export class ActorTagFilter {

	name: string
	minScore: number
	maxScore: number
	minUsedCount: number
	maxUsedCount: number

	get show_min_score(): number {
		return this.minScore / 2
	}

	set show_min_score(value: number) {
		this.minScore = value * 2
	}

	get show_max_score(): number {
		return this.maxScore / 2
	}

	set show_max_score(value: number) {
		this.maxScore = value * 2
	}

	constructor() {
		this.name = ""
		this.minScore = 0
		this.maxScore = MAX_SCORE
		this.minUsedCount = 0
		this.maxUsedCount = 0
	}
}