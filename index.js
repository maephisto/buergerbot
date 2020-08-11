'use strict';

// includes
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { setIntervalAsync } = require('set-interval-async/dynamic');

// config of request url params

const policeClearanceCertificateId = 120926;
const serviceId = policeClearanceCertificateId;

const baseUrl = 'https://service.berlin.de';
const path = '/terminvereinbarung/termin/tag.php';
const providerList = [122210, 122217,122219,122227,122231,122238,122243,122252,122260,122262,122254,122271,122273,
  122277,122280,122282,122284,122291,122285,122286,122296,327262,325657,150230,122301,122297,122294,122312,122314,
  122304,122311,122309,317869,324434,122281,122279,122276,122274,122267,122246,122251,122257,122208,122226];
const urlParams = [
  'termin=1',
  `anliegen[]=${serviceId}`,
  `dienstleisterlist=${providerList.join(',')}`,
  'herkunft=http%3A%2F%2Fservice.berlin.de%2Fdienstleistung%2F120926%2F'
];

const checkForAvailableAppointment = async () => {
  console.log('> checking for appointments...');
  const url = `${baseUrl}${path}?${urlParams.join('&')}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);

  const $availableTerminList = $('.calendar-month-table:first-child td.buchbar a');

  if ($availableTerminList.length > 0) {
    $availableTerminList.each(_ => {
      // we have an open booking
      let day = $(this).text();
      let month = $(this).parentsUntil('th.month').text();

      console.info('!!!! OPEN BOOKING ON %s %s ! Go, go, go!', day, month);
    });
  } else {
    console.debug('> No available appointments found')
  }

};

console.info('~> 🐒 Starting script');
checkForAvailableAppointment();
setIntervalAsync(checkForAvailableAppointment, 20000);
