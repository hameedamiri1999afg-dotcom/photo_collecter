const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// تست سلامت سرور
app.get('/', (req, res) => {
    res.send('Server photo_collecter is running!');
});

// مسیر دریافت عکس از اندروید و ارسال به واتساپ
app.post('/upload-image', upload.single('image'), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'هیچ عکسی دریافت نشد.' });
        }

        filePath = req.file.path;
        console.log('عکس جدید دریافت شد:', filePath);

        // خواندن متغیرهای محیطی Render
        const wasenderToken = process.env.WASENDER_TOKEN;
        const whatsappTo = process.env.WHATSAPP_TO;

        if (!wasenderToken || !whatsappTo) {
            console.error('متغیرهای WASENDER_TOKEN یا WHATSAPP_TO در Render تنظیم نشده‌اند!');
            fs.unlinkSync(filePath);
            return res.status(500).json({ status: 'error', message: 'تنظیمات سرور ناقص است.' });
        }

        // تبدیل فایل به Base64 برای ارسال بدون نیاز به کتابخانه form-data
        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');

        // ارسال فعال به API سرویس WaSender
        await axios.post('https://wasender.dev/api/v1/send-file', {
            to: whatsappTo,
            file: `data:${req.file.mimetype};base64,${base64File}`,
            filename: req.file.originalname || 'photo.jpg'
        }, {
            headers: {
                'Authorization': `Bearer ${wasenderToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('عکس با موفقیت به واتساپ ارسال شد.');

        // پاک کردن فایل موقت
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({ status: 'success', message: 'عکس با موفقیت دریافت و ارسال شد.' });
    } catch (error) {
        console.error('خطا در پردازش یا ارسال عکس:', error.response ? error.response.data : error.message);
        
        // پاکسازی فایل موقت در صورت بروز خطا
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
