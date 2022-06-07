require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const CronJob = require('cron').CronJob;

const nodes = [
  {
    name: 'Arale',
    nodeId: '7SHqrjiLU7qj3pk1jRDbkGoMQZPHQ7tE3',
    ip: '95.179.192.46',
    region: 'UK',
  },
  {
    name: 'Bonbon',
    nodeId: 'Djap76LgWtmnzdKFaexNPNDzYKV8WaNoZ',
    ip: '95.179.192.46',
    region: 'UK'
  },
  {
    name: 'Crepe',
    nodeId: 'MZJ7xQGtKcYWU3qJdB5LiLdasWHmJQTFQ',
    ip: '198.13.48.77',
    region: 'JP'
  },
  {
    name: '-',
    nodeId: '7iXgkoh1uPbDhiCkcT7F3Xhu5hadJx9VV',
    ip: '198.13.48.77',
    region: 'JP'
  },
  {
    name: '-',
    nodeId: '715ERjkpFpDUyKwDsoZHsNEoLrkXYQR6h',
    ip: '107.191.42.165',
    region: 'US'
  },
  {
    name: '-',
    nodeId: '63rSCLEsUh9EKjZGvK5tLhBcDBRJaa6pt',
    ip: '107.191.42.165',
    region: 'US'
  },
]

const healthBody = {
  'id': 1,
  'jsonrpc':'2.0',
  'method': 'health.health'
}

const healthCheck = new CronJob('*/5 * * * *', async () => {
  let message = '';
  let detail = '';
  let isSent = false;
  for (let i = 0; i < nodes.length; i++) {
    const { nodeId, ip, region } = nodes[i];
    try {
      const { data: { result }} = await axios.post(`http://${ip}:9650/ext/health`, healthBody);  
      for (const key in result.checks) {
        if (result.checks[key].error) {
            detail = `${key} ${result.checks[key].error}\n${detail}`
        }
      }
      message = `${region} - ${nodeId} - ${result.healthy}`; 
      if (!result.healthy) isSent = true;
    } catch (error) {
      isSent = true;
      if (error.response) {
        message = error.response.dat;
      } else if (error.request) {
        message = `${region} - ${nodeId} - The request was made but no response was received`; 
      } else {
        message = `${region} - ${nodeId} - ${error.message}`;
      }
    }

    if (detail.length > 0) message = `${message}\n${detail}`

    const chatworkEndpoint = `https://api.chatwork.com/v2/rooms/${process.env.CHATWORK_ROOM}/messages`;
    const chatworkBody = new FormData();
    const formHeaders = chatworkBody.getHeaders();
    chatworkBody.append('body', message);
    const chatworkHeader = { headers: { 'X-ChatWorkToken': process.env.CHATWORK_TOKEN, ...formHeaders } }
    if (isSent) {
      await axios.post(chatworkEndpoint, chatworkBody, chatworkHeader).catch(error => console.log(error));
    }
    detail = '';
  }
}, null, false, process.env.TIME_ZONE);

module.exports = {
	check: () => {
		healthCheck.start();
	}
};

