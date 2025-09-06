const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Assign Doctor to Patient
router.post('/', authenticateToken, async (req, res) => {
    const { patient_id, doctor_id } = req.body;
    try {
        const mapping = await pool.query(
            'INSERT INTO mappings (patient_id, doctor_id) VALUES ($1, $2) RETURNING *',
            [patient_id, doctor_id]
        );
        res.json(mapping.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create mapping' });
    }
});

// Get All Mappings
router.get('/', authenticateToken, async (req, res) => {
    try {
        const mappings = await pool.query(
            'SELECT m.id, p.name AS patient_name, d.name AS doctor_name FROM mappings m JOIN patients p ON m.patient_id=p.id JOIN doctors d ON m.doctor_id=d.id'
        );
        res.json(mappings.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch mappings' });
    }
});

// Get Doctors for a Specific Patient
router.get('/:patient_id', authenticateToken, async (req, res) => {
    const { patient_id } = req.params;
    try {
        const doctors = await pool.query(
            'SELECT d.id, d.name, d.specialization FROM mappings m JOIN doctors d ON m.doctor_id=d.id WHERE m.patient_id=$1',
            [patient_id]
        );
        res.json(doctors.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch patient doctors' });
    }
});

// Remove Doctor from Patient
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await pool.query('DELETE FROM mappings WHERE id=$1 RETURNING *', [id]);
        if (deleted.rows.length === 0) return res.status(404).json({ error: 'Mapping not found' });
        res.json({ message: 'Mapping removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete mapping' });
    }
});

module.exports = router;
