const dayjs = require('dayjs');
const Router = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const router = Router();
const now = dayjs();

require('dotenv').config();

/**
 * @path {GET} /api/info/:number
 * @description 노선정보 가져오기
 */
router.get(`/info/:number`, async (req, res, next) => {
  try {
    const businfoXML = await axios
      .get(
        `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=${process.env.BUS_DATA_API_KEY}&keyword=${req.params.number}`,
      )
      .then((res) => {
        console.log(res.data);
        return res.data;
      });

    /* XML to JSON */
    parser.parseStringPromise(businfoXML).then(function (result) {
      const businfoJSON = JSON.stringify(result);

      return res.status(200).send(businfoJSON);
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
    const businfoXML = await axios
      .get(
        `http://apis.data.go.kr/6410000/buslocationservice/getBusLocationList?serviceKey=${process.env.BUS_DATA_API_KEY}&routeId=${req.params.id}`,
      )
      .then((res) => {
        return res.data;
      });

    /* XML to JSON */
    parser.parseStringPromise(businfoXML).then(function (result) {
      const businfoJSON = JSON.stringify(result);

      return res.status(200).send(businfoJSON);
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
