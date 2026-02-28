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
            if (response.url().includes('api/supply/demands')) {
                console.log(`API RESPONSE [${response.status()}] ${response.url()}`);
            }
        });

        await page.goto('http://localhost:8080/login');
        await new Promise(r => setTimeout(r, 2000));

        // Use an admin or coordinator account
        await page.waitForSelector('#username');
        await page.type('#username', 'manager');
        await page.type('#password', '123456');

        console.log("Submitting login!");
        await page.click('button[type="submit"]');

        // Wait for redirect to finish
        await new Promise(r => setTimeout(r, 4000));

        // Navigate manually since Manager's sidebar might not have "coordinator/orders" listed if they don't have the role in mock
        console.log("Navigating to coordinator/orders!");
        await page.goto('http://localhost:8080/coordinator/orders');
        await new Promise(r => setTimeout(r, 5000));

        const url = page.url();
        console.log("FINAL URL:", url);

        await browser.close();
    } catch (err) {
        console.error("Test script failed:", err);
    }
})();
