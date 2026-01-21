export interface LocalShift {
    id: string;
    employeeName: string;
    startTime: string; // ISO
    endTime?: string; // ISO
    synced: boolean;
}

const STORAGE_KEY = 'secure-app-shifts';

export const ShiftStorage = {
    getAll: (): LocalShift[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    save: (shifts: LocalShift[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
    },

    addShift: (employeeName: string, startTime: Date) => {
        const shifts = ShiftStorage.getAll();
        const newShift: LocalShift = {
            id: crypto.randomUUID(),
            employeeName,
            startTime: startTime.toISOString(),
            synced: false
        };
        shifts.push(newShift);
        ShiftStorage.save(shifts);
        return newShift.id;
    },

    completeShift: (id: string | null, endTime: Date) => {
        // If we don't have an ID (e.g. reload), try to find the last open shift for this user?
        // For simplicity in this scope, let's assume valid ID or just logging a "completion" event might be safer if ID lost.
        // But let's try to update by ID.
        if (!id) return;

        const shifts = ShiftStorage.getAll();
        const index = shifts.findIndex(s => s.id === id);
        if (index !== -1) {
            shifts[index].endTime = endTime.toISOString();
            shifts[index].synced = false; // logic to mark synced later
            ShiftStorage.save(shifts);
        }
    },

    // CSV Generation
    generateCSV: (): string => {
        const shifts = ShiftStorage.getAll();
        const headers = ['ID', 'Employee Name', 'Start Time', 'End Time', 'Duration (Hours)', 'Synced'];
        const rows = shifts.map(s => {
            const start = new Date(s.startTime);
            const end = s.endTime ? new Date(s.endTime) : null;
            let duration = '';

            if (end) {
                const diff = end.getTime() - start.getTime();
                duration = (diff / (1000 * 60 * 60)).toFixed(2);
            }

            return [
                s.id,
                `"${s.employeeName}"`, // Quote name
                s.startTime,
                s.endTime || '',
                duration,
                s.synced ? 'Yes' : 'No'
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    },

    downloadCSV: () => {
        const csv = ShiftStorage.generateCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kiosk-backup-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
};
