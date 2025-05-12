export function createFolder(raw) {
    return {
        id: raw.id,
        name: raw.name ?? '',
        parent_id: raw.parent_id ?? null,
        createdAt: raw.createdAt ?? null,

        isRoot() {
            return !this.parentId;
        },
    };
}