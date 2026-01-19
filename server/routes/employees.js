const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to ensure user is manager (ADMIN)
const requireManager = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied: Managers only' });
    next();
};

// GET: List all employees in org
router.get('/', authenticateToken, requireManager, async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: {
                org_id: req.user.orgId,
                role: 'USER'
            },
            select: {
                id: true, name: true, email: true, username: true, pin: true, is_active: true,
                phone: true, dob: true, ssn: true, pay_rate: true, pay_type: true, pto_balance: true,
                recurring_schedule: true
            }
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Helper to generate unique username
const generateUsername = async (name) => {
    let base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = base;
    let counter = 1;

    while (true) {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (!existing) return username;
        username = `${base}${counter}`;
        counter++;
    }
};

// POST: Create new employee
router.post('/', authenticateToken, requireManager, async (req, res) => {
    const { name, email } = req.body;
    try {
        // 1. Generate PIN
        let pin;
        while (true) {
            pin = Math.floor(1000 + Math.random() * 9000).toString();
            const existingPin = await prisma.user.findFirst({ where: { pin } });
            if (!existingPin) break;
        }

        // 2. Generate Username
        const username = await generateUsername(name);

        // 3. Create User & Set Initial Password to PIN
        const passwordHash = await bcrypt.hash(pin, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email || null,
                username,
                pin,
                password_hash: passwordHash,
                role: 'USER',
                org_id: req.user.orgId,
                // New Fields (Optional on creation)
                phone: req.body.phone || null,
                dob: req.body.dob ? new Date(req.body.dob) : null,
                ssn: req.body.ssn || null,
                pay_rate: req.body.payRate ? parseFloat(req.body.payRate) : null,
                pay_type: req.body.payType || 'HOURLY'
            }
        });

        res.json(newUser);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Data conflict (Username, Email or PIN already exists)' });
        }
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// PUT: Update employee
router.put('/:id', authenticateToken, requireManager, async (req, res) => {
    const { id } = req.params;
    const { name, email, pin, is_active } = req.body;

    try {
        if (pin) {
            const existingPin = await prisma.user.findFirst({ where: { pin, NOT: { id: parseInt(id) } } });
            if (existingPin) return res.status(400).json({ error: 'PIN already currently in use' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email: email || null,
                pin,
                is_active,
                // Update new fields
                phone: req.body.phone || null,
                dob: req.body.dob ? new Date(req.body.dob) : null,
                ssn: req.body.ssn || null,
                pay_rate: req.body.payRate ? parseFloat(req.body.payRate) : null,
                pay_type: req.body.payType,
                pay_rate: req.body.payRate ? parseFloat(req.body.payRate) : null,
                pay_type: req.body.payType,
                pto_balance: req.body.ptoBalance ? parseFloat(req.body.ptoBalance) : undefined,
                recurring_schedule: req.body.recurringSchedule ? JSON.stringify(req.body.recurringSchedule) : undefined
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

module.exports = router;
