export function createFile(raw) {
    return {
        id: raw.id,
        fileName: raw.fileName ?? '',
        folderId: raw.folderId,
        uploaded_at: raw.uploaded_at ?? null,
        user_id: raw.user_id ?? null,

        getExtension() {
            return this.fileName.split('.').pop().toLowerCase();
        },

        getIconType() {
            const ext = this.getExtension();
            if (['docx', 'doc'].includes(ext)) return 'word';
            if (['pdf'].includes(ext)) return 'pdf';
            if (['xlsx', 'xls'].includes(ext)) return 'excel';
            return 'file';
        },
    };
}