require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/adresses_db';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const addressSchema = new mongoose.Schema({
    numero: Number,
    voie_nom: String,
    code_postal: String,
    commune_nom: String,
    latitude: Number,
    longitude: Number,
    date_der_maj: Date
}, { strict: false });
const Address = mongoose.model('Address', addressSchema);

// GET 
app.get('/addresses/xxx', async (req, res) => {
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

// POST 
app.post('/addresses', async (req, res) => {
    try {
        const { numero, voie_nom, code_postal, commune_nom, latitude, longitude, date_der_maj } = req.body;
        const newAddress = new Address({ numero, voie_nom, code_postal, commune_nom, latitude, longitude, date_der_maj: date_der_maj ? new Date(date_der_maj) : new Date() });
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT
app.put('/addresses/:id', async (req, res) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAddress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
app.delete('/addresses/:id', async (req, res) => {
    try {
        await Address.findByIdAndDelete(req.params.id);
        res.json({ message: 'Adresse supprimée' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));