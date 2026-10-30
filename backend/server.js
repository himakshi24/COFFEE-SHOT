require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CoffeeShot API',
      version: '1.0.0',
      description: 'CoffeeShot backend API documentation',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CoffeeShot API is running successfully.'
  });
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/event-bookings', require('./routes/eventBookingRoutes'));
app.use('/api/event-reviews', require('./routes/eventReviewRoutes'));
app.use('/api/menu-reviews', require('./routes/menuReviewRoutes'));
app.use('/api/event-launch-requests', require('./routes/eventLaunchRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
