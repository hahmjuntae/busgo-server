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
    const busInfoXML = await axios
      .get(
        `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=${process.env.BUS_DATA_API_KEY}&keyword=${req.params.number}`,
      )
      .then((res) => {
        return res.data;
      });

    /* XML to JSON */
    parser.parseStringPromise(busInfoXML).then(function (result) {
      const busInfoJSON = JSON.stringify(result);

      return res.status(200).send(busInfoJSON);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @path {GET} /api/timetable
 * @description 노선 시간표 가져오기
 */
router.get('/timetable', async (req, res, next) => {
  try {
    await TimeTables.find().then((timetable) => {
      if (!timetable) return res.status(404).send('시간표가 없습니다.');

      return res.status(200).send(timetable); // auth를 통과한 클라이언트 유저 정보 return
    });
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
    const busLocationXML = await axios
      .get(
        `http://apis.data.go.kr/6410000/buslocationservice/getBusLocationList?serviceKey=${process.env.BUS_DATA_API_KEY}&routeId=${req.params.id}`,
      )
      .then((res) => {
        return res.data;
      });

    /* XML to JSON */
    parser.parseStringPromise(busLocationXML).then(function (result) {
      const busLocationJSON = JSON.stringify(result);

      return res.status(200).send(busLocationJSON);
    });
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
    const busStationXML = await axios
      .get(
        `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteStationList?serviceKey=${process.env.BUS_DATA_API_KEY}&routeId=${req.params.id}`,
      )
      .then((res) => {
        return res.data;
      });

    /* XML to JSON */
    parser.parseStringPromise(busStationXML).then(function (result) {
      const busStationJSON = JSON.stringify(result);

      return res.status(200).send(busStationJSON);
    });
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
    console.log('요청 버스 정보:: ', req.body);

    // DB에서 버스번호로 시간표  찾기
    await TimeTables.findOne({ busNumber: req.body.busNumber }).then((timeTable) => {
      const now = dayjs(); // 요청 받았을 때의 시간을 저장해야하므로 스코프 주의

      // DB에 시간표가 없을 경우
      // DB 생성 후 요일과 시간 등록
      if (!timeTable) {
        console.log(
          `DB에 ${req.body.busNumber}버스 시간표가 없습니다. 새로운 시간표를 생성합니다.`,
        );
        TimeTables.create({
          busNumber: req.body.busNumber,
          busId: req.body.busId,
          table: [
            {
              // 요일,시간 (표 UI 작성 시 요일로 구분해서 사용)
              departure: now.format('ddd,HH:mm'),
            },
          ],
        })
          .then((timeTable) => {
            timeTable
              .save()
              .then(() =>
                res.status(201).send(`${req.body.busNumber}번 시간표를 업데이트 했습니다.`),
              );
          })
          .catch((error) => console.error(error));
      } else {
        // DB에 시간표가 있을 경우
        // 요일과 시간만 등록
        timeTable.table.push({
          departure: now.format('ddd,HH:mm'),
        });
        timeTable
          .save()
          .then(() => res.status(201).send(`${req.body.busNumber}번 시간표를 업데이트 했습니다.`));
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
