"use client";

import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "deep-agents-user-id";

/**
 * Returns a persistent user ID from localStorage.
 * Generates and stores a new UUID on first visit.
 */
export function getUserId(): string {
    if (typeof window === "undefined") return "";

    let userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) {
        userId = uuidv4();
        localStorage.setItem(STORAGE_KEY, userId);
    }
    return userId;
}
