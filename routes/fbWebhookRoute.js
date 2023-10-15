const express = require('express');
const router = express.Router();
require('dotenv').config();

const { chatCompletion } = require('../helper/openaiApi');
const { sendMessage } = require('../helper/messengerApi');

router.get('/', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.error('Failed to verify webhook');
      res.sendStatus(403);
    }
  } else {
    console.error('Invalid request');
    res.sendStatus(400);
  }
});

router.post('/', async (req, res) => {
  try {
    let body = req.body;
    let requestType = body.object;
    if (requestType === 'page' && body.entry && body.entry[0] && body.entry[0].messaging && body.entry[0].messaging[0]) {
      let senderId = body.entry[0].messaging[0].sender.id;
      let query = body.entry[0].messaging[0].message.text;
      if (query) {
        let result = await chatCompletion(query);
        if (result && result.response) {
          await sendMessage(senderId, result.response);
        } else {
          console.error('Failed to get response from OpenAI');
        }
      } else {
        console.error('Empty message received');
      }
    } else {
      console.error('Invalid request format');
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
  res.status(200).send('EVENT_RECEIVED');
});

module.exports = {
  router
};
