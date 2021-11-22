const s3 = require('./s3');
/** 
 * TODO - turn into promise.
*/
module.exports = async function s3Uploader(key, image, onSuccess) {
  const params = {
    Bucket: 'nechavot-style',
    Key: key,
    Body: image,
    ACL: 'public-read'
  };
  const uploadedFile = await s3.upload(params, (err, data) => {
    if (err) {
      console.log(err)
      return
    }
    onSuccess(data.Location);
  });
}


