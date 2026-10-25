export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

export function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value) {
    return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

export function parseId(value) {
    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function parseMemberIds(value) {
    if (!Array.isArray(value)) {
        return { error: "Members must be an array of user ids." };
    }

    const ids = [];

    for (const rawId of value) {
        const id = parseId(rawId);

        if (id === null) {
            return { error: "Member ids must be positive integers." };
        }

        if (!ids.includes(id)) {
            ids.push(id);
        }
    }

    return { ids };
}
