const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Add Patient
router.post('/', authenticateToken, async (req, res) => {
    const { name, age, gender } = req.body;
    try {
        const newPatient = await pool.query(
            'INSERT INTO patients (name, age, gender, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, age, gender, req.user.id]
        );
        res.json(newPatient.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add patient' });
    }
});

// Get All Patients for Authenticated User
router.get('/', authenticateToken, async (req, res) => {
    try {
        const patients = await pool.query('SELECT * FROM patients WHERE user_id=$1', [req.user.id]);
        res.json(patients.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// Get Patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const patient = await pool.query('SELECT * FROM patients WHERE id=$1 AND user_id=$2', [id, req.user.id]);
        if (patient.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

// Update Patient
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, age, gender } = req.body;
    try {
        const updated = await pool.query(
            'UPDATE patients SET name=$1, age=$2, gender=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
            [name, age, gender, id, req.user.id]
        );
        if (updated.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

// Delete Patient
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await pool.query('DELETE FROM patients WHERE id=$1 AND user_id=$2 RETURNING *', [id, req.user.id]);
        if (deleted.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

module.exports = router;
