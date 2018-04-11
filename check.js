const puppeteer = require('puppeteer');
const fs = require('fs');
const _list = process.argv[2]
const _succ = process.argv[3]
const _regex = /^https:\/\/discordapp.com\/invite/
const discords = fs.readFileSync(_list).toString().split('\n').filter(d => _regex.test(d))

'use strict';

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
}

let successDiscords = []
let count = 0

async function isValid(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      browser.close();
    });

    try {

      await page.goto(url, {"waitUntil" : "networkidle0"})
      const content = await page.evaluate(() => document.documentElement.innerHTML)
      const i = content.indexOf('instant invite is invalid or has expired')
      await browser.close();

      if(i === -1) {
        successDiscords.push(url)
      }

    }catch(error) {
      console.log(error);
      browser.close();
    }
    count++
    process.stdout.write('\x1Bc')
    console.log(`${count}/${discords.length}`)
}

async function iterateDiscords() {
  await discords.forEachAsync(isValid)
}

iterateDiscords().then(() => {
  fs.writeFileSync(_succ, successDiscords.join('\n'))
})
