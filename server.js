require('dotenv').config()
const app = require('./app');
const connectCloudinary = require('./config/connectCloudinary');
const connectDatabase = require('./config/database');
// const cloudinary = require('cloudinary');
const PORT = process.env.PORT || 4000;


// UncaughtException Error
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

connectDatabase();
connectCloudinary();

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});


// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
