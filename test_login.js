const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        await page.goto('http://localhost:5173/login');
        
        await page.waitForSelector('#username');
        await page.type('#username', 'manager');
        await page.type('#password', '123456');
        
        await page.click('button[type="submit"]');
        
        await new Promise(r => setTimeout(r, 5000));
        
        await browser.close();
    } catch (err) {
        console.error("Test script failed:", err);
    }
})();
