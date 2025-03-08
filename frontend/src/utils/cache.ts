class ResultCache {
  cache: Map<string, unknown>;

  constructor() {
    this.cache = new Map();
  }

  tryGet(key: string): unknown {
    return this.cache.get(key);
  }

  add(key: string, value: unknown) {
    this.cache.set(key, value);
  }
}

const cache: ResultCache = new ResultCache();

export default cache;
