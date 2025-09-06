const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Add Doctor
router.post('/', authenticateToken, async (req, res) => {
    const { name, specialization } = req.body;
    try {
        const newDoctor = await pool.query(
            'INSERT INTO doctors (name, specialization) VALUES ($1, $2) RETURNING *',
            [name, specialization]
        );
        res.json(newDoctor.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add doctor' });
    }
});

// Get All Doctors
router.get('/', async (req, res) => {
    try {
        const doctors = await pool.query('SELECT * FROM doctors');
        res.json(doctors.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});

// Get Doctor by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await pool.query('SELECT * FROM doctors WHERE id=$1', [id]);
        if (doctor.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
        res.json(doctor.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch doctor' });
    }
});

// Update Doctor
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, specialization } = req.body;
    try {
        const updated = await pool.query(
            'UPDATE doctors SET name=$1, specialization=$2 WHERE id=$3 RETURNING *',
            [name, specialization, id]
        );
        if (updated.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update doctor' });
    }
});

// Delete Doctor
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await pool.query('DELETE FROM doctors WHERE id=$1 RETURNING *', [id]);
        if (deleted.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete doctor' });
    }
});

module.exports = router;
