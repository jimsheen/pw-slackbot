const SlackBot = require('slackbots');
const chalk = require('chalk');
const dotenv = require('dotenv')
const zonedTimeToUtc = require('date-fns-tz/zonedTimeToUtc')
const format = require('date-fns-tz/format')
var getDayOfYear = require('date-fns/getDayOfYear')
var getDay = require('date-fns/getDay')
var quotes = require('./quotes.json')


const defaultTimezone = 'Europe/London'
const log = console.log;

const unixToDate = unix => new Date(parseInt(unix, 10) * 1000)

const formatDate = (value, timezone = defaultTimezone) => {
  if (!value) return ''
  return zonedTimeToUtc(unixToDate(value), timezone)
}

const getRandomArrayItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

dotenv.config()

const bot = new SlackBot({
  token: `${process.env.BOT_TOKEN}`,
  name: 'pwbot'
})

// last date it was updated
let lastUpdated = null

bot.on('start', function() {
  // more information about additional params https://api.slack.com/methods/chat.postMessage


  function pollDate() {
    const d = zonedTimeToUtc(new Date(), defaultTimezone);
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    const dayOfYear = getDayOfYear(d);
    const dayOfWeek = getDay(d);


    if ((h === 9 && m === 01) && dayOfWeek !== 6 && dayOfWeek !== 7) {
    if (lastUpdated !== dayOfYear + h + m) {
      lastUpdated = dayOfYear + h + m;
      const quote = getRandomArrayItem(quotes)
      const formattedDate = format(d, 'EEEE do MMMM', defaultTimezone) || 'Today';
      const author = !!quote?.author ? quote.author : 'Unknown'
      var params = {
        icon_emoji: ':mega:',
        blocks: [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `<!here> *Daily update for ${formattedDate}* \n\n`
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*${quote.text}* - ${author}`
            }
          }
        ]
      };
      bot.postMessageToGroup('daily_update', null, params);
      log(chalk.green(`Message posted at ${h}:${m}:${s}`))
    }
    }
  }

  setInterval(() => {
    pollDate()
  }, 30000)
});
