'use strict';

// includes
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const beep = require('beepbeep');

// config of request url params > [note] adapt to your needs
const policeClearanceCertificateId = 120926; // 'Polizeiliches Führungszeugnis'
const registrationOfAccomodation = 120686; // 'Anmeldung einer Wohnung'
const motionOfIdentityCard = 120686; // 'Personalausweis beantragen'
const serviceId = motionOfIdentityCard; // [note] assign the service id here
const baseUrl = 'https://service.berlin.de';
const path = '/terminvereinbarung/termin/tag.php';
const providerList = [122210, 122217,122219,122227,122231,122238,122243,122252,122260,122262,122254,122271,122273,
  122277,122280,122282,122284,122291,122285,122286,122296,327262,325657,150230,122301,122297,122294,122312,122314,
  122304,122311,122309,317869,324434,122281,122279,122276,122274,122267,122246,122251,122257,122208,122226];
const urlParams = [
  'termin=1',
  `anliegen[]=${serviceId}`,
  `dienstleisterlist=${providerList.join()}`,
  `herkunft=http%3A%2F%2Fservice.berlin.de%2Fdienstleistung%2F${serviceId}%2F`
];

const checkForAvailableAppointment = async () => {
  console.log('> checking for appointments...');

  // the url to be crawled > [note] adapt to your needs
  const url = `${baseUrl}${path}?${urlParams.join('&')}`;

  // get html data of the page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  await browser.close();

  // parse html to jQuery-like object using cheerio
  const $ = cheerio.load(html);

  // parse cells for available days from table
  const $availableTerminList = $('.calendar-month-table:first-child td.buchbar a');

  // log and alert when availability given
  if ($availableTerminList.length > 0) {
    console.info('OPEN BOOKINGS!! Go, go, gooooooo!!!!');

    // print dates
    $availableTerminList.each(_ => {
      let day = $(this).text();
      let month = $(this).parentsUntil('th.month').text();
      console.info('...AVAILABLE ON %s %s', day, month);
    });

    // play sound
    beep(10, 1500);
  } else {
    console.info('> No available appointments found')
  }

};

console.log('~> 🐒 Starting script');
checkForAvailableAppointment();
// repeat every 30 seconds
setIntervalAsync(checkForAvailableAppointment, 30000);
