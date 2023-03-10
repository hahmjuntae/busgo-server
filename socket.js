const { Server } = require('socket.io');

const onlineMap = {};
const webSocket = (server, app) => {
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  app.set('io', io);
  app.set('onlineMap', onlineMap);

  io.of(`/online`).on('connection', (socket) => {
    const newNamespace = socket.nsp;

    // 온라인 유저 저장할 빈 객체 생성
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    // 클라이언트에 유저 정보 요청
    socket.emit('userConnect', socket.nsp.name);

    // 유저정보 받아서 객체에 저장
    socket.on('login', (data) => {
      onlineMap[socket.nsp.name][socket.id] = data.userName;
      // 클라이언트로 온라인 유저리스트 보내기
      newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
      // console.log(Object.values(onlineMap[socket.nsp.name]));
    });

    // 첫 연결 시에도 온라인 유저리스트 보내기
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));

    // 연결 종료 시 온라인 유저 객체 삭제
    socket.on('disconnect', () => {
      delete onlineMap[socket.nsp.name][socket.id];
      newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
    });
  });
};

module.exports = webSocket;
