/**
 * _next_uuid is the next uuid for the data classes.
 */
let _next_uuid = 0

/**
 * BaseData is the base class for all data classes.
 */
export class BaseData {
	public readonly uuid: number

	constructor(json_data?: any) {
		this.uuid = ++_next_uuid
		if (json_data) {
			Object.assign(this, json_data)
		}
	}
}

export abstract class BaseCloneable extends BaseData {
	abstract reset(): void;

	// 1. 移除 abstract 关键字，提供通用实现
	clone(): this {
		// 2. 获取当前实例的构造函数
		// 使用 as new () => this 断言，告诉 TS 这是一个返回当前类实例的无参构造函数
		const Constructor = this.constructor as new () => this;

		// 3. 创建新实例（会自动调用子类的构造函数）
		const item = new Constructor();

		// 4. 复制数据
		item.copy(this);

		return item;
	}
	abstract copy(source: this): void;
	abstract equals(other: this): boolean;
}