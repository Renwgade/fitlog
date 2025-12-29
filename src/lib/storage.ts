// src/lib/storage.ts
// Centralised localStorage helper utilities for the Workout app.
// All functions are typed and return sensible defaults when data is missing.

export interface UserData {
    currentDay: number;
    selectedVersion: "versionA" | "versionB";
    progress: Record<number, string[]>; // day -> completed exercise names
    workoutDates?: Record<string, { day: number; exercises: string[] }>;
}

/** Retrieve the stored user data from localStorage.
 * Returns a default object if nothing is stored yet.
 */
export function getUserData(): UserData {
    const raw = localStorage.getItem("workoutUser");
    if (raw) {
        try {
            return JSON.parse(raw) as UserData;
        } catch {
            // fall through to default
        }
    }
    // Default fresh user state
    return {
        currentDay: 1,
        selectedVersion: "versionA",
        progress: { 1: [] },
    };
}

/** Persist the given user data back to localStorage. */
export function setUserData(data: UserData): void {
    localStorage.setItem("workoutUser", JSON.stringify(data));
}

/** Update only the progress for a specific day. */
export function updateProgress(day: number, completed: string[]): void {
    const data = getUserData();
    data.progress[day] = completed;
    setUserData(data);
}

/** Update the selected version (master/detailed plan). */
export function setSelectedVersion(version: "versionA" | "versionB"): void {
    const data = getUserData();
    data.selectedVersion = version;
    setUserData(data);
}

/** Update the current day counter. */
export function setCurrentDay(day: number): void {
    const data = getUserData();
    data.currentDay = day;
    setUserData(data);
}

/** Retrieve stored workout dates map (history). */
export function getWorkoutDates(): Record<string, { day: number; exercises: string[] }> {
    const data = getUserData();
    return data.workoutDates ?? {};
}

export function setWorkoutDates(dates: Record<string, { day: number; exercises: string[] }>) {
    const data = getUserData();
    data.workoutDates = dates;
    setUserData(data);
}

/** Retrieve stored plans (cached from Firebase). */
export function getAllPlans(): any {
    const raw = localStorage.getItem("workoutPlans");
    return raw ? JSON.parse(raw) : null;
}

export function setAllPlans(plans: any): void {
    localStorage.setItem("workoutPlans", JSON.stringify(plans));
}
