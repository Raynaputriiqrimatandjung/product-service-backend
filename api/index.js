// FILE: product-service/api/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Product Service DB Connected...'))
    .catch(err => console.error('❌ DB Error:', err));

// --- MODEL PRODUK (UPDATE LENGKAP) ---
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, default: 'Umum' }, // beras, minyak, dll
    image: { type: String, default: 'https://placehold.co/300x300?text=No+Image' }, // Link gambar
    description: { type: String, default: '-' },
    is_active: { type: Boolean, default: true }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// --- ROUTES ---

// GET ALL (Bisa filter category)
app.get('/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = { is_active: true };

        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' }; // Search case insensitive

        const products = await Product.find(filter);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET ONE
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produk 404" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Error ID" });
    }
});

// CREATE (Admin)
app.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE (Admin)
app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE (Soft Delete / Hard Delete)
app.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Produk dihapus" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/', (req, res) => res.json({ message: "Product Service Ready 🛒" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Product Service running on ${PORT}`));

module.exports = app;