import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        page.on('response', async (response) => {
            if (response.url().includes('api/admin/')) {
                console.log(`API RESPONSE [${response.status()}] ${response.url()}`);
                try {
                    console.log('BODY:', await response.text());
                } catch (e) { }
            }
        });

        await page.goto('http://localhost:8080/login');

        // Wait for page load
        await new Promise(r => setTimeout(r, 2000));

        await page.waitForSelector('#username');
        await page.type('#username', 'admin');
        await page.type('#password', '123456');

        console.log("Submitting login!");
        await page.click('button[type="submit"]');

        // wait for redirect or error
        await new Promise(r => setTimeout(r, 8000));

        const url = page.url();
        console.log("FINAL URL:", url);

        await browser.close();
    } catch (err) {
        console.error("Test script failed:", err);
    }
})();
