
const cloudinary = require('cloudinary')

function connectCloudinary() {
    cloudinary.config({
        cloud_name: 'dorkg3ul4',
        api_key: '352236855563716',
        api_secret: 'RsdJiFa0fS8wRzp-EBwUoOR1m_A',
    });
}


module.exports = connectCloudinary