const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to ensure user is manager
const requireManager = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    next();
};

// GET: List schedules (with optional date filtering)
router.get('/', authenticateToken, async (req, res) => {
    const { start, end } = req.query; // format: YYYY-MM-DD

    const where = {};
    if (req.user.role === 'ADMIN') {
        // Managers see all for their org (via User relation)
        where.user = { org_id: req.user.orgId };
    } else {
        // Employees only see their own
        where.user_id = req.user.userId;
    }

    if (start && end) {
        where.start_time = {
            gte: new Date(start),
            lte: new Date(end)
        };
    }

    try {
        const schedules = await prisma.schedule.findMany({
            where,
            include: { user: { select: { name: true } } }, // Join user name
            orderBy: { start_time: 'asc' }
        });
        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// POST: Create Schedule (Manager Only)
router.post('/', authenticateToken, requireManager, async (req, res) => {
    const { user_id, start_time, end_time, notes } = req.body;
    try {
        const newSchedule = await prisma.schedule.create({
            data: {
                user_id: parseInt(user_id),
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                notes
            }
        });
        res.json(newSchedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// POST: Auto-Generate Schedules from Templates
router.post('/generate', authenticateToken, requireManager, async (req, res) => {
    const { start, end } = req.body; // YYYY-MM-DD
    try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const employees = await prisma.user.findMany({
            where: { org_id: req.user.orgId, is_active: true }
        });

        const newSchedules = [];

        // Loop through each day in range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

            for (const emp of employees) {
                if (!emp.recurring_schedule) continue;

                let template = {};
                try { template = JSON.parse(emp.recurring_schedule); } catch (e) { }

                const shift = template[dayName];
                if (shift && shift.start && shift.end) {
                    // Caculate Start/End DateTimes
                    // shift.start is "09:00", shift.end is "17:00"
                    const [sH, sM] = shift.start.split(':');
                    const [eH, eM] = shift.end.split(':');

                    const startDt = new Date(d);
                    startDt.setHours(parseInt(sH), parseInt(sM));

                    const endDt = new Date(d);
                    endDt.setHours(parseInt(eH), parseInt(eM));

                    // Push to array for creation
                    newSchedules.push({
                        user_id: emp.id,
                        start_time: startDt,
                        end_time: endDt,
                        notes: 'Auto-generated'
                    });
                }
            }
        }

        if (newSchedules.length > 0) {
            await prisma.schedule.createMany({ data: newSchedules });
        }

        res.json({ count: newSchedules.length, message: `Created ${newSchedules.length} shifts` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate schedules' });
    }
});

// DELETE: Remove Schedule (Manager Only)
router.delete('/:id', authenticateToken, requireManager, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.schedule.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

module.exports = router;
