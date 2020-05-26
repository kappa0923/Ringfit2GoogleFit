const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const cheerio = require('cheerio');
const Rectangle = require('./rectangle.js');
const RECORD_DATE_POINT = { "x": 450, "y": 60 };
const RECORD_TIME_POINT = { "x": 510, "y": 150 };
const RECORD_CAL_POINT = { "x": 760, "y": 150 };
const RECORD_DIST_POINT = { "x": 1015, "y": 150 };

/**
 * Ringfitのスクショをtwitterに投稿したら文字認識してGoogleFitに登録する。
 */
exports.ringfit2gfit = functions.https.onRequest(async (request, response) => {
  // console.log(request.body);
  // const url = getImageUrl(request.body.FirstLinkUrl);
  const url = await getImageUrl('https://t.co/aHnFIvdrH3');
  console.log('URL: ' + url);

  await detectTextFromUrl(url);
  response.send("Hello from Firebase!");
});

/**
 * Twitterの短縮URLから画像のURLを取得する
 * @param url 画像を取得する対象のTwitterURL
 * @return 取得した画像のURL
 */
const getImageUrl = async (url) => {
  return axios(url).then(res => {
    const $ = cheerio.load(res.data);
    const imageUrl = $("meta[property='og:image']").attr("content")
    console.log(imageUrl);
    return imageUrl;
  })
}

/**
 * 画像URLからテキストを認識する
 * @param url 画像取得するURL
 */
const detectTextFromUrl = async (url) => {
  const client = new vision.ImageAnnotatorClient();
  console.log('Detect image from URL: ' + url);

  return client.textDetection(url).then(result => {
    console.log(result);
    const detections = result[0].textAnnotations;

    // 認識した文字から必要なデータを探す
    console.log('Text:');
    const recordDate = detections.filter(text => {
      const rect = new Rectangle(text.boundingPoly.vertices[0].x, text.boundingPoly.vertices[0].y, text.boundingPoly.vertices[2].x, text.boundingPoly.vertices[2].y);
      return rect.hasPoint(RECORD_DATE_POINT.x, RECORD_DATE_POINT.y);
    });
    const recordTime = detections.filter(text => {
      const rect = new Rectangle(text.boundingPoly.vertices[0].x, text.boundingPoly.vertices[0].y, text.boundingPoly.vertices[2].x, text.boundingPoly.vertices[2].y);
      return rect.hasPoint(RECORD_TIME_POINT.x, RECORD_TIME_POINT.y);
    });
    const recordCal = detections.filter(text => {
      const rect = new Rectangle(text.boundingPoly.vertices[0].x, text.boundingPoly.vertices[0].y, text.boundingPoly.vertices[2].x, text.boundingPoly.vertices[2].y);
      return rect.hasPoint(RECORD_CAL_POINT.x, RECORD_CAL_POINT.y);
    });
    const recordDist = detections.filter(text => {
      const rect = new Rectangle(text.boundingPoly.vertices[0].x, text.boundingPoly.vertices[0].y, text.boundingPoly.vertices[2].x, text.boundingPoly.vertices[2].y);
      return rect.hasPoint(RECORD_DIST_POINT.x, RECORD_DIST_POINT.y);
    });

    // 取得した情報
    console.log('Date: ' + JSON.stringify(recordDate[1].description));
    console.log('Time: ' + JSON.stringify(recordTime[1].description));
    console.log('Cal: ' + JSON.stringify(recordCal[1].description));
    console.log('Distinct: ' + JSON.stringify(recordDist[1].description));
  });
}