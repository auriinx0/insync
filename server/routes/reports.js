const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET: Payroll Report (CSV)
router.get('/payroll', authenticateToken, async (req, res) => {
    try {
        // Mock data logic for specific date range would go here
        // For now, return all shifts for all users in Org
        const shifts = await prisma.shift.findMany({
            where: { user: { org_id: req.user.orgId }, status: 'completed' },
            include: { user: true, time_entries: true }
        });

        // Basic CSV Construction
        let csv = 'Employee ID,Name,Pay Rate,Date,Hours Worked,Total Pay\n';

        shifts.forEach(shift => {
            const start = new Date(shift.start_time);
            const end = new Date(shift.end_time);
            const hours = (end - start) / (1000 * 60 * 60);
            const rate = shift.user.pay_rate || 0;
            const pay = hours * rate;

            csv += `${shift.user.id},${shift.user.name},${rate},${start.toLocaleDateString()},${hours.toFixed(2)},${pay.toFixed(2)}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('payroll_report.csv');
        res.send(csv);

    } catch (error) {
        res.status(500).send("Error generating report");
    }
});

// GET: Calendar Export (ICS)
router.get('/calendar.ics', authenticateToken, async (req, res) => {
    try {
        const schedules = await prisma.schedule.findMany({
            where: { user: { org_id: req.user.orgId } },
            include: { user: true }
        });

        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//InSync//NONSGML v1.0//EN\n';

        schedules.forEach(sch => {
            const start = sch.start_time.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const end = sch.end_time.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            ics += `BEGIN:VEVENT\n`;
            ics += `UID:${sch.id}@insync.app\n`;
            ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}\n`;
            ics += `DTSTART:${start}\n`;
            ics += `DTEND:${end}\n`;
            ics += `SUMMARY:Shift - ${sch.user.name}\n`;
            ics += `DESCRIPTION:${sch.notes || ''}\n`;
            ics += `END:VEVENT\n`;
        });

        ics += 'END:VCALENDAR';

        res.header('Content-Type', 'text/calendar');
        res.attachment('schedule.ics');
        res.send(ics);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating calendar");
    }
});

module.exports = router;
