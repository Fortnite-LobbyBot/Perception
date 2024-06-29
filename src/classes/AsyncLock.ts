interface LockPromise {
	promise: Promise<void>;
	resolve: () => void;
}

export class AsyncLock {
	private lockPromise?: LockPromise;
	constructor() {
		this.lockPromise = undefined;
	}

	public get isLocked() {
		return !!this.lockPromise;
	}

	public wait() {
		return this.lockPromise?.promise || Promise.resolve();
	}

	public lock() {
		let resolve: any;
		const promise = new Promise<void>((res) => {
			resolve = res;
		});

		this.lockPromise = { promise, resolve: resolve as () => void };
	}

	public unlock() {
		this.lockPromise?.resolve();
		this.lockPromise = undefined;
	}
}
