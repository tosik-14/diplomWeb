const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');
const ticketsCreateRoutes = require('./routes/ticketsCreateRoutes');
const path = require('path');



/*const User = require('./sequelize/models/user');

async function testModels() {
    const users = await User.findAll();
    console.log('Users:', users);
}

testModels()*/

const app = express();

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(cors()); // разрешаем запросы из любого источника
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', folderRoutes);
app.use('/api', fileRoutes);
app.use('/api/tickets-create', ticketsCreateRoutes);


const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
