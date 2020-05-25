const functions = require('firebase-functions');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const cheerio = require('cheerio');

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

  // return req.get(options, (err, res, body) => {
  //   const $ = cheerio.load(body);
  //   const imageUrl = $("meta[property='og:image']").attr("content")
  //   console.log(imageUrl);
  //   return imageUrl;
  // });
}

/**
 * 画像URLからテキストを認識する
 * @param url 画像取得するURL
 */
const detectTextFromUrl = async (url) => {
  const client = new vision.ImageAnnotatorClient();
  console.log('Detect image from URL: '+ url);

  return client.textDetection(url).then(result => {
    console.log(result);
    const detections = result[0].textAnnotations;
    console.log('Text:');
    detections.forEach(text => console.log(text));
  });
}