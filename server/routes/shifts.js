const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get active shift for current user
router.get('/current', authenticateToken, async (req, res) => {
    try {
        const activeShift = await prisma.shift.findFirst({
            where: {
                user_id: req.user.userId,
                status: 'active'
            }
        });
        res.json(activeShift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch active shift' });
    }
});

// Clock In/Out Toggle
router.post('/toggle', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { location } = req.body; // { lat, lng }

    try {
        // 1. Check for active shift
        const activeShift = await prisma.shift.findFirst({
            where: { user_id: userId, status: 'active' }
        });

        if (activeShift) {
            // CLOCK OUT
            const shift = await prisma.$transaction(async (prisma) => {
                const endTime = new Date();
                const startTime = new Date(activeShift.start_time);
                const durationHours = (endTime - startTime) / (1000 * 60 * 60);

                // Update Shift
                const updatedShift = await prisma.shift.update({
                    where: { id: activeShift.id },
                    data: {
                        end_time: endTime,
                        status: 'completed',
                        total_hours: parseFloat(durationHours.toFixed(2))
                    }
                });

                // Create TimeEntry
                await prisma.timeEntry.create({
                    data: {
                        shift_id: activeShift.id,
                        type: 'clock_out',
                        location_lat: location?.lat,
                        location_lng: location?.lng
                    }
                });

                return updatedShift;
            });
            res.json({ status: 'clocked_out', shift });

        } else {
            // CLOCK IN
            const shift = await prisma.$transaction(async (prisma) => {
                // Create Shift
                const newShift = await prisma.shift.create({
                    data: {
                        user_id: userId,
                        status: 'active',
                        start_time: new Date()
                    }
                });

                // Create TimeEntry
                await prisma.timeEntry.create({
                    data: {
                        shift_id: newShift.id,
                        type: 'clock_in',
                        location_lat: location?.lat,
                        location_lng: location?.lng
                    }
                });

                return newShift;
            });
            res.json({ status: 'clocked_in', shift });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle shift' });
    }
});

// Get User Shift History
router.get('/', authenticateToken, async (req, res) => {
    try {
        const shifts = await prisma.shift.findMany({
            where: { user_id: req.user.userId },
            orderBy: { start_time: 'desc' },
            take: 50 // Limit to last 50
        });
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// --- MANAGER ROUTES ---

// Middleware to ensure user is manager
const requireManager = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    next();
};

// GET: All shifts for Organization (Manager)
// GET: All shifts for Organization (Manager) - Supports Date Range
router.get('/all', authenticateToken, requireManager, async (req, res) => {
    const { start, end } = req.query;

    try {
        const where = {
            user: { org_id: req.user.orgId },
            // If returning only completed shifts for payroll, we might add status: 'completed'
            // But sometimes they want to see all. Let's filter by range if provided.
        };

        if (start && end) {
            where.start_time = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }

        const shifts = await prisma.shift.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { start_time: 'desc' },
            // If date range is specific, don't limit. If no date range, limit to recent.
            take: (start && end) ? undefined : 100
        });
        res.json(shifts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch all shifts' });
    }
});

// POST: Manual Entry (Manager)
router.post('/manual', authenticateToken, requireManager, async (req, res) => {
    const { user_id, start_time, end_time, notes } = req.body;

    // CALCULATE DURATION
    const start = new Date(start_time);
    const end = new Date(end_time);
    const durationHours = (end - start) / (1000 * 60 * 60);

    try {
        const newShift = await prisma.shift.create({
            data: {
                user_id: parseInt(user_id),
                start_time: start,
                end_time: end,
                status: 'completed',
                total_hours: parseFloat(durationHours.toFixed(2)) // <--- Added this
            }
        });
        res.json(newShift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create manual entry' });
    }
});

// PUT: Edit Shift (Manager)
router.put('/:id', authenticateToken, requireManager, async (req, res) => {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    // RE-CALCULATE DURATION
    const start = new Date(start_time);
    const end = new Date(end_time);
    const durationHours = (end - start) / (1000 * 60 * 60);

    try {
        const updated = await prisma.shift.update({
            where: { id: parseInt(id) },
            data: {
                start_time: start,
                end_time: end,
                total_hours: parseFloat(durationHours.toFixed(2)) // <--- Added this
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update shift' });
    }
});

module.exports = router;
