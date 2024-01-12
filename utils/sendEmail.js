const nodemailer = require('nodemailer');

const sendEmail = async (options) => {


    /*
You can use the following configuration:
SMTP Host: mail.privateemail.com
(Alternatively, you can try smtp.privateemail.com)
SMTP Port: 465 (SSL) or 587 (TLS)
Authentication: On
SMTP Username: info@covertnest.com
SMTP Password: password for info@covertnest.com
    */
    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'info@covertnest.com',
            pass: 'infocovertnest2023'
        }
    });

    try {
        const result = await transporter.sendMail(options);
        console.log('result: ', result);
        return true;
    } catch (error) {
        console.log('Error While sending Email: ', error);
        return false;
    }
};

module.exports = sendEmail;