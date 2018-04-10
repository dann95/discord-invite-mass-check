const puppeteer = require('puppeteer');
const fs = require('fs');
const _list = process.argv[2]
const _succ = process.argv[3]
const _regex = /^https:\/\/discordapp.com\/invite/
const discords = fs.readFileSync(_list).toString().split('\n').filter(d => _regex.test(d))

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
}

let successDiscords = []

async function isValid(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {"waitUntil" : "networkidle0"})
    const content = await page.evaluate(() => document.documentElement.innerHTML)
    const i = content.indexOf('instant invite is invalid or has expired')
    await browser.close();
    if(i === -1) {
      successDiscords.push(url)
    }
}

async function iterateDiscords() {
  await discords.forEachAsync(isValid)
}

iterateDiscords().then(() => {
  fs.writeFileSync(_succ, successDiscords.join('\n'))
})
