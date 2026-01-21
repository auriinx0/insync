export const calculateDuration = (startTime: Date, endTime: Date): number => {
    // Difference in milliseconds
    const diffMs = endTime.getTime() - startTime.getTime();

    // Ensure accurate rounding to 2 decimal places? 
    // Usually timesheets track decimal hours.
    // 1 hour = 3600000 ms
    const hours = diffMs / (1000 * 60 * 60);

    return Number(hours.toFixed(2));
};

export const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
};

// Format based on locale, handling timezone offsets safely
// For this app, we assume input dates are correctly parsed objects.
export const formatLocalTime = (date: Date, locale: string = 'en'): string => {
    return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);
};
