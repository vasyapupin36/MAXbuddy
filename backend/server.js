const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REQUESTS_FILE = path.join(__dirname, 'requests.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Вспомогательная функция для чтения заявок из файла
function readRequests() {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading requests file:', error);
  }
  return { requests: [], users: [] };
}

// Вспомогательная функция для записи заявок в файл
function writeRequests(data) {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
    console.log('Data successfully written to file');
    return true;
  } catch (error) {
    console.error('Error writing requests file:', error);
    return false;
  }
}

// Получить все заявки
app.get('/api/requests', (req, res) => {
  console.log('GET /api/requests');
  try {
    const data = readRequests();
    res.json(data.requests);
  } catch (error) {
    console.error('Error in GET /api/requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новую заявку
app.post('/api/requests', (req, res) => {
  console.log('POST /api/requests', req.body);
  
  const { userId, userName, userMaxLink, userInstitute, userCourse, text } = req.body;
  
  // Проверка обязательных полей
  if (!userId || !userMaxLink || !userInstitute || !userCourse || !text) {
    console.log('Missing required fields:', { userId, userMaxLink, userInstitute, userCourse, text });
    return res.status(400).json({ 
      error: 'Все поля обязательны для заполнения',
      details: {
        userId: !userId ? 'missing' : 'provided',
        userMaxLink: !userMaxLink ? 'missing' : 'provided',
        userInstitute: !userInstitute ? 'missing' : 'provided',
        userCourse: !userCourse ? 'missing' : 'provided',
        text: !text ? 'missing' : 'provided'
      }
    });
  }
  
  try {
    const data = readRequests();
    
    // Ищем пользователя по maxLink
    let existingUser = data.users.find(u => u.maxLink === userMaxLink);
    let actualUserId = userId;
    
    if (existingUser) {
      console.log('Found existing user:', existingUser);
      // Обновляем данные существующего пользователя
      existingUser.name = userName;
      existingUser.institute = userInstitute;
      existingUser.course = userCourse;
      actualUserId = existingUser.id;
    } else {
      console.log('Creating new user');
      // Создаем нового пользователя
      const newUser = {
        id: userId,
        name: userName,
        maxLink: userMaxLink,
        institute: userInstitute,
        course: userCourse
      };
      data.users.push(newUser);
    }
    
    // Создаем новую заявку
    const newRequest = {
      id: Date.now().toString(),
      userId: actualUserId,
      text: text,
      date: new Date().toISOString().split('T')[0]
    };
    
    console.log('New request:', newRequest);
    
    data.requests.unshift(newRequest);
    
    if (writeRequests(data)) {
      console.log('Request created successfully');
      res.status(201).json(newRequest);
    } else {
      console.log('Failed to write data to file');
      res.status(500).json({ error: 'Ошибка при сохранении заявки' });
    }
  } catch (error) {
    console.error('Error in POST /api/requests:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удалить заявку
app.delete('/api/requests/:id', (req, res) => {
  const requestId = req.params.id;
  console.log('DELETE /api/requests/', requestId);
  
  try {
    const data = readRequests();
    
    const requestIndex = data.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    data.requests.splice(requestIndex, 1);
    
    if (writeRequests(data)) {
      res.status(200).json({ message: 'Заявка успешно удалена' });
    } else {
      res.status(500).json({ error: 'Ошибка при удалении заявки' });
    }
  } catch (error) {
    console.error('Error in DELETE /api/requests:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить всех пользователей
app.get('/api/users', (req, res) => {
  console.log('GET /api/users');
  try {
    const data = readRequests();
    res.json(data.users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`MAXbuddy backend server running on port ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
  
  // Проверяем существование файла данных
  if (!fs.existsSync(REQUESTS_FILE)) {
    console.log('Creating new requests.json file');
    writeRequests({ requests: [], users: [] });
  }
});