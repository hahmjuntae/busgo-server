const dayjs = require('dayjs');
const Router = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const { TimeTables } = require('../model/TimeTables');
const parser = new xml2js.Parser();
const router = Router();
require('dotenv').config();

/**
 * @path {GET} /api/info/:number
 * @description 노선정보 가져오기
 */
router.get(`/info/:number`, async (req, res, next) => {
  try {
    const { data: busInfoXML } = await axios.get(
      `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList`,
      {
        params: {
          serviceKey: process.env.BUS_DATA_API_KEY,
          keyword: req.params.number,
        },
      },
    );

    const busInfoJSON = await parser.parseStringPromise(busInfoXML);

    return res.status(200).send(JSON.stringify(busInfoJSON));
  } catch (error) {
    next(error);
  }
});

/**
 * @path {GET} /api/location/:id
 * @description 노선 실시간 위치 가져오기
 */
router.get(`/location/:id`, async (req, res, next) => {
  try {
    const { data: busLocationXML } = await axios.get(
      `http://apis.data.go.kr/6410000/buslocationservice/getBusLocationList`,
      {
        params: {
          serviceKey: process.env.BUS_DATA_API_KEY,
          routeId: req.params.id,
        },
      },
    );

    const busLocationJSON = await parser.parseStringPromise(busLocationXML);

    return res.status(200).send(JSON.stringify(busLocationJSON));
  } catch (error) {
    next(error);
  }
});

/**
 * @path {GET} /api/station/:id
 * @description 노선 정류장 정보 가져오기
 */
router.get(`/station/:id`, async (req, res, next) => {
  try {
    const { data: busStationXML } = await axios.get(
      `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteStationList`,
      {
        params: {
          serviceKey: process.env.BUS_DATA_API_KEY,
          routeId: req.params.id,
        },
      },
    );

    const busStationJSON = await parser.parseStringPromise(busStationXML);

    return res.status(200).send(JSON.stringify(busStationJSON));
  } catch (error) {
    next(error);
  }
});

/**
 * @path {GET} /api/timetale/:id/departure
 * @description 기점 출발 시 시간표 등록
 */
router.post(`/timetable/departure`, async (req, res, next) => {
  try {
    console.log('요청 버스 정보:: ', req.body); // 요청된 버스 정보 출력

    const now = dayjs(); // 현재 시간을 dayjs를 이용해 구함
    const timeTable = await TimeTables.findOne({ busNumber: req.body.busNumber }); // 요청된 버스 번호에 해당하는 시간표를 DB에서 찾음

    if (!timeTable) {
      // DB에 해당 버스 번호에 해당하는 시간표가 없는 경우
      console.log(`DB에 ${req.body.busNumber}버스 시간표가 없습니다. 새로운 시간표를 생성합니다.`); // 새로운 시간표를 생성한다는 로그 출력
      const newTimeTable = await TimeTables.create({
        // 새로운 시간표 생성
        busNumber: req.body.busNumber,
        busId: req.body.busId,
        table: [{ departure: now.format('ddd,HH:mm') }], // 현재 시간을 departure으로 하는 새로운 시간표 생성
      });
      await newTimeTable.save(); // DB에 저장
      res.status(201).send(`${req.body.busNumber}번 시간표를 업데이트 했습니다.`); // 성공적으로 업데이트 되었다는 메시지 전송
    } else {
      // DB에 해당 버스 번호에 해당하는 시간표가 있는 경우
      timeTable.table.push({ departure: now.format('ddd,HH:mm') }); // 해당 시간표에 현재 시간을 departure으로 하는 새로운 시간 추가
      await timeTable.save(); // DB에 저장
      res.status(201).send(`${req.body.busNumber}번 시간표를 업데이트 했습니다.`); // 성공적으로 업데이트 되었다는 메시지 전송
    }
  } catch (error) {
    next(error); // 에러 발생 시 다음 미들웨어로 전달
  }
});

/**
 * @path {GET} /api/timetable
 * @description 노선 시간표 가져오기
 */
router.get('/timetable', async (req, res, next) => {
  try {
    const timetable = await TimeTables.find();
    if (!timetable) return res.status(404).send('시간표가 없습니다.');
    return res.status(200).send(timetable);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
