const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me';

// Register Organization & Manager
router.post('/signup', async (req, res) => {
    const { orgName, email, password } = req.body;

    try {
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create Org and User Transaction
        const result = await prisma.$transaction(async (prisma) => {
            const org = await prisma.organization.create({
                data: { name: orgName }
            });

            const user = await prisma.user.create({
                data: {
                    email,
                    password_hash: passwordHash,
                    role: 'ADMIN',
                    org_id: org.id
                }
            });

            return { org, user };
        });

        // 4. Generate Token
        const token = jwt.sign({ userId: result.user.id, role: 'ADMIN', orgId: result.org.id }, JWT_SECRET);

        res.json({ token, user: { id: result.user.id, name: result.user.name, email: result.user.email, role: 'ADMIN' } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // email can be username now

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role, orgId: user.org_id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role } });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create User (Admin Only - Replaces public signup)
router.post('/create-user', authenticateToken, async (req, res) => {
    // 1. Verify Admin
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

    const { name, email, password, role, pin } = req.body;
    // role can be 'USER' or 'ADMIN'

    try {
        // 2. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // 3. Hash password (if provided) or use default
        // For employees (USER), we might initially set a default or rely on PIN, 
        // but for this internal tool, let's allow setting a password for everyone if needed,
        // or just for managers.
        const passwordHash = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('welcome123', 10);

        // 4. Create User linked to Admin's Org
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: passwordHash,
                role: role || 'USER',
                pin: pin || null, // Optional PIN for kiosk users
                org_id: req.user.orgId
            }
        });

        // Return user without sensitive data
        res.json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, pin: newUser.pin });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Old /employees route (can be deprecated or kept as alias, but /create-user is more robust)
router.post('/employees', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });

    const { name, email, pin } = req.body;
    // ... existing logic but using req.user.orgId ...
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role: 'USER',
                password_hash: await bcrypt.hash('welcome123', 10), // Default pw
                pin: pin,
                org_id: req.user.orgId
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// Verify PIN (Kiosk Mode)
router.post('/verify-pin', async (req, res) => {
    const { pin } = req.body;

    try {
        const user = await prisma.user.findFirst({ where: { pin } });
        if (!user) return res.status(400).json({ error: 'Invalid PIN' });

        // In production, compare hash
        // if (user.pin !== pin) ...

        const token = jwt.sign({ userId: user.id, role: user.role, orgId: user.org_id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;
