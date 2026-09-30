const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// تست سلامتی سرور
app.get('/', (req, res) => {
    res.send('Server photo_collecter is running!');
});

// مسیر دریافت عکس از اندروید
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'هیچ عکسی دریافت نشد.' });
        }

        const filePath = req.file.path;
        console.log('عکس جدید دریافت شد:', filePath);

        // TODO: اتصال به WaSender API در مراحل بعدی

        // پاک کردن فایل موقت بعد از پردازش
        fs.unlinkSync(filePath);

        res.status(200).json({ status: 'success', message: 'عکس با موفقیت دریافت شد.' });
    } catch (error) {
        console.error('خطا در پردازش عکس:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
