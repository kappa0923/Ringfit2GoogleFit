import * as functions from 'firebase-functions';

/**
 * Ringfitのスクショをtwitterに投稿したら文字認識してGoogleFitに登録する。
 */
export const ringfit2gfit = functions.https.onRequest((request, response) => {
  console.log(request);
  response.send("Hello from Firebase!");
});
