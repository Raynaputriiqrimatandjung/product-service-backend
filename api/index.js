// FILE: product-service/api/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// 1. KONEKSI DATABASE
const mongoURI = process.env.MONGO_URL;

if (!mongoURI) {
    console.error("❌ Error: MONGO_URL belum disetting di Environment Variable Vercel!");
}

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('✅ MongoDB Product Service Connected...'))
    .catch(err => console.error('❌ DB Connection Error:', err));

// 2. MODEL PRODUK (Definisi langsung di sini agar tidak error path)
// Menggunakan 'mongoose.models.Product ||' untuk mencegah error Overwrite di Vercel
const Product = mongoose.models.Product || mongoose.model('Product', {
    name: String,
    price: Number,
    stock: Number
});

// 3. RUTE UTAMA (Health Check)
app.get('/', (req, res) => {
    res.json({ message: "Product Service is Running... 🚀" });
});

// READ ALL
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE
app.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// READ ONE
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "ID Produk tidak valid" });
    }
});

// Listener
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));

module.exports = app;