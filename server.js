const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// تست سلامت سرور
app.get('/', (req, res) => {
    res.send('Server photo_collecter is running!');
});

// مسیر دریافت عکس از اندروید و ارسال به واتساپ
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'هیچ عکسی دریافت نشد.' });
        }

        const filePath = req.file.path;
        console.log('عکس جدید دریافت شد:', filePath);

        // خواندن متغیرهای محیطی Render
        const wasenderToken = process.env.WASENDER_TOKEN;
        const whatsappTo = process.env.WHATSAPP_TO;

        // آماده‌سازی فرم ارسال فایل به API
        const formData = new FormData();
        formData.append('to', whatsappTo);
        formData.append('file', fs.createReadStream(filePath));

        // ارسال عکس به WaSender API
        /*
        await axios.post('https://wasender.dev/api/v1/send-file', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${wasenderToken}`
            }
        });
        */

        // پاک کردن فایل موقت بعد از ارسال
        fs.unlinkSync(filePath);

        res.status(200).json({ status: 'success', message: 'عکس با موفقیت دریافت و ارسال شد.' });
    } catch (error) {
        console.error('خطا در پردازش یا ارسال عکس:', error);
        
        // پاکسازی فایل موقت در صورت بروز خطا
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
