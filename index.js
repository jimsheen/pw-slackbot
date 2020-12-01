const SlackBot = require('slackbots');
const axios = require('axios')

const dotenv = require('dotenv')
const zonedTimeToUtc = require('date-fns-tz/zonedTimeToUtc')
const format = require('date-fns-tz/format')

const defaultFormat = 'DD/MM/YYYY HH:mm'
const defaultTimezone = 'Europe/London'

const unixToDate = unix => new Date(parseInt(unix, 10) * 1000)

const formatDate = (value, timezone = defaultTimezone) => {
  if (!value) return ''
  return zonedTimeToUtc(unixToDate(value), timezone)
}

dotenv.config()

const bot = new SlackBot({
  token: `${process.env.BOT_TOKEN}`,
  name: 'jim'
})

// last date it was updated
let lastUpdated = null

bot.on('start', function() {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var params = {
    icon_emoji: ':mega:',
  };

  function pollDate() {
    const d = zonedTimeToUtc(new Date(), defaultTimezone);
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    if (s % 10 === 0) {
      if (lastUpdated !== d) {

        lastUpdated = d
        const formattedDate = format(d, 'EEEE do MMMM', defaultTimezone) || 'Today';
        bot.postMessageToGroup('daily_update', `Daily update for ${formattedDate}`, params);
      }
    }
  }

  setInterval(() => {
    pollDate()
  }, 1000)

});
