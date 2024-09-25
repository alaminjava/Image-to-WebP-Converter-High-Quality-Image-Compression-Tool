
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.use(express.static('public'));

// Route to handle image upload and conversion
app.post('/convert', upload.single('image'), async (req, res) => {
    const inputImage = req.file.path;
    const outputImage = `uploads/${Date.now()}.webp`;

    try {
        await sharp(inputImage)
            .webp({ quality: 80 }) // Adjust the quality if necessary
            .toFile(outputImage);

        fs.unlinkSync(inputImage); // Delete original image after conversion
        res.json({ webpImageUrl: `/${outputImage}` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error converting image to WebP');
    }
});

// Serve static WebP files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
