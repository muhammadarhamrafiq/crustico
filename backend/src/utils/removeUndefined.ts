function removeUndefined<T extends Record<string, unknown>>(obj: T) {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as {
        [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>
    }
}

export { removeUndefined }
