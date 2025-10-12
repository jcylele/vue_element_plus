
import { SettingItemConfig } from "./Interfaces";

export class SettingItemData {
	config: SettingItemConfig
	value: string | number | boolean
	changed: boolean

	constructor(config: SettingItemConfig, value: string | number | boolean) {
		this.config = config
		this.value = value
		this.changed = false
	}

	get label() {
		return this.config.label
	}

	get type() {
		return this.config.type
	}
}