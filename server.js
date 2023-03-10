require('dotenv').config();

const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const express = require('express');
const apiRouter = require('./routes/api.js');
// const webSocket = require('./socket.js');

const app = express();
const httpServer = http.createServer(app);

/* Mongoose, MongoDB 연결 */
mongoose.set('strictQuery', false);
const mongodbConnect = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('MongoDB:: 연결 완료');
      // webSocket(server, app);
    })
    .catch((error) => console.log(error));
};

mongodbConnect();
mongoose.connection.on('disconnected', mongodbConnect);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  express.static(path.join(__dirname, 'build'), {
    maxAge: 2629800,
    immutable: true,
  }),
);
app.use(
  '/src',
  express.static(path.join(__dirname, 'build/src'), {
    maxAge: 2629800,
    immutable: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api', apiRouter);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = httpServer.listen(process.env.PORT, () => {
  console.log(`Express:: ${process.env.PORT} 포트 오픈`);
});
