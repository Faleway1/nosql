require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/adresses_db';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Address Schema & Model
const addressSchema = new mongoose.Schema({}, { strict: false });
const Address = mongoose.model('Address', addressSchema);

// GET - Liste avec pagination, projection, tri et recherche avancée
app.get('/addresses', async (req, res) => {
    try {
        let { page = 1, limit = 20, sortField, sortOrder, fields, search, startDate, endDate } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        
        let query = {};
        if (search) {
            query["voie_nom"] = { $regex: search, $options: 'i' };
        }
        if (startDate || endDate) {
            query["date_der_maj"] = {};
            if (startDate) query["date_der_maj"].$gte = new Date(startDate);
            if (endDate) query["date_der_maj"].$lte = new Date(endDate);
        }

        let projection = {};
        if (fields) {
            fields.split(',').forEach(field => projection[field] = 1);
        }

        let sort = {};
        if (sortField && sortOrder) {
            sort[sortField] = sortOrder === 'asc' ? 1 : -1;
        }

        const addresses = await Address.find(query)
            .select(projection)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await Address.countDocuments(query);
        res.json({ total, page, limit, addresses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Ajouter une adresse
app.post('/addresses', async (req, res) => {
    try {
        const newAddress = new Address(req.body);
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT - Modifier une adresse
app.put('/addresses/:id', async (req, res) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAddress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE - Supprimer une adresse
app.delete('/addresses/:id', async (req, res) => {
    try {
        await Address.findByIdAndDelete(req.params.id);
        res.json({ message: 'Adresse supprimée' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Lancer le serveur
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));