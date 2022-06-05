const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes');
const multerMid = require('./middleware/upload');

// const multerMid = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     // no larger than 5mb.
//     fileSize: 5 * 1024 * 1024,
//   },
// })

const PORT = 8080;
const app = express();

// app.use('/image', express.static('images'));
app.use(cors());
// app.disable('x-powered-by')
app.use(multerMid.single('avatar'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', router);

app.listen(PORT, () => console.log(`Server run on Port ${PORT}`));
