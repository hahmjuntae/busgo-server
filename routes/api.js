const dayjs = require('dayjs');
const Router = require('express');
const axios = require('axios');

require('dotenv').config();
const router = Router();
const now = dayjs();

axios
  .get(
    `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=${process.env.BUS_DATA_API_KEY}&keyword=6004`,
  )
  .then((res) => {
    console.log(res.data);
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = router;
