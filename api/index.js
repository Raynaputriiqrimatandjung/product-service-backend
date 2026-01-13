// FILE: product-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// --- PERUBAHAN DI SINI ---
// Mengambil link MONGO_URL dari settingan Vercel/Railway
const mongoURI = process.env.MONGO_URL; 

// Opsi tambahan agar koneksi stabil di Vercel
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000 
})
    .then(() => console.log('MongoDB Product Service Connected... ✅'))
    .catch(err => console.error('DB Connection Error: ❌', err));

// Model Produk (Sesuai kode asli Anda)
const Product = mongoose.model('Product', {
    name: String,
    price: Number,
    stock: Number
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

// Listener (Penting untuk Vercel)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));

module.exports = app;