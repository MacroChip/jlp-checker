import puppeteer from 'puppeteer';
import { backOff as exponentialBackoff } from 'exponential-backoff'

(async () => {
    await exponentialBackoff(async () => {
        let lastRes = ''
        while (true) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.goto('https://jup.ag/perps-earn');

            const aumLimitXPath = "xpath/.//*[contains(text(), 'AUM limit')]/following-sibling::span";
            await page.waitForSelector(aumLimitXPath)
            const elements = await page.$$(aumLimitXPath);

            let aumLimitValue = 'Not found';
            if (elements.length > 0) {
                // Assuming the first matching element is the correct one
                aumLimitValue = await page.evaluate(el => el.textContent, elements[0]) || 'Not found';
            }
            if (lastRes != aumLimitValue) {
                console.log('!!!!!!!!!NEW VALUE!!!!!!!!!!!!!!')
            }
            lastRes = aumLimitValue
            console.log(`${aumLimitValue} at ${new Date().toLocaleString()}`);

            await browser.close();
            await new Promise((res) => setTimeout(res, 1000 * 60 * 3));
        }
    }, {
        retry: e => {
            console.error(e);
            return true;
        },
        delayFirstAttempt: true,
    })
})()
