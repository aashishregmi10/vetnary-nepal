const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsOptions = require('./config/cors');
const authRoutes = require('./routes/auth.route');
const productsRoutes = require('./routes/products.route');
const categoriesRoutes = require('./routes/categories.route');
const ordersRoutes = require('./routes/orders.route');
const addressesRoutes = require('./routes/addresses.route');
const wishlistRoutes = require('./routes/wishlist.route');
const adminRoutes = require('./routes/admin.route');
const feedRoutes = require('./routes/feed.route');
const contactRoutes = require('./routes/contact.route');
const uploadRoutes = require('./routes/upload.route');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' }, message: 'PawMart API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
