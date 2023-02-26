const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const keys = require('../keys');
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = require('../keys');
const { MongoMissingCredentialsError } = require('mongodb');

const oAuth2Client = new google.auth.OAuth2(keys.GMAIL_CLIENT_ID, keys.GMAIL_CLIENT_SECRET, keys.GMAIL_REDIRECT_URI);

oAuth2Client.setCredentials({refresh_token:keys.GMAIL_REFRESH_TOKEN});

async function sendMail(email){
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'oAuth2',
        user:'mipl4321@gmail.com',
        clientId:keys.GMAIL_CLIENT_ID,
        clientSecret:keys.GMAIL_CLIENT_SECRET,
        refreshToken:keys.GMAIL_REFRESH_TOKEN,
        accessToken
      }

    });

    const mailOptions = {
      from: `BookShop <${keys.EMAIL_FROM}>`,
      to:email,
      subject:'Registration',
      text:'Registration was complete',
      html:`
        <div style="text-align:center">
          <h1>Вам привествует книжный магазин BookShop</h1>
          <img src="https://booksread.ru/uploads/_pages/1785/mini/knigi-na-1-2-chasa-900-600.jpg">
          <a href="http://${keys.BASE_URL}" style="font-size:20px">Перейти в магазин</a>
        </div>
      `
    }
    const result = await transport.sendMail(mailOptions);
    console.log('Was Sent')
    return result;
  }
  catch (error) {
    return error
  }
}

module.exports = function(email){
  sendMail(email);
}
