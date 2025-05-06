export function createUser(raw) {
    return {
        firstName: raw.firstName ?? '',
        secondName: raw.secondName ?? '',
        patronymic: raw.patronymic ?? '',
        email: raw.email ?? '',
        role: raw.role, // 'admin' или 'user'
        university: raw.university ?? '',
        faculty: raw.faculty ?? '',
        position: raw.position ?? '',
        bio: raw.bio ?? '',
        city: raw.city ?? '',
        created_at: raw.created_at ?? '',
        profile_image: raw.profile_image ?? null,

        // Пример метода, можно вызывать: user.isComplete()
        isComplete() {
            return !!(raw.firstName && raw.secondName && raw.university && raw.faculty && raw.city && raw.position);
        },

        isAdmin() {
            return raw.role === 'admin';
        },
    };
}