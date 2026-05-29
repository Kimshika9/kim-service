import asyncio
from playwright.async_api import async_playwright
import os

async def verify_final():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 390, 'height': 844}) # iPhone 12 Pro size
        page = await context.new_page()

        # Open the app
        await page.goto('http://localhost:8080')
        await page.wait_for_selector('#app', state='visible', timeout=10000)
        await page.screenshot(path='/home/jules/verification/final_home.png')
        print("Home screen captured.")

        # Click Product Design (one of the previously broken ones)
        await page.click('text=Product Design')
        await page.wait_for_selector('#subServicePage', state='visible')
        await page.screenshot(path='/home/jules/verification/final_product_services.png')
        print("Product Design services captured.")

        # Select a service and go to Config
        await page.click('text=Packaging Design')
        await page.wait_for_selector('#configPage', state='visible')

        # Fill details
        await page.fill('#orderTitle', 'Test Package')
        await page.fill('#orderDesc', 'A premium purple box design.')

        # Click Continue to Summary
        await page.click('text=Continue')
        await page.wait_for_selector('#summaryPage', state='visible')
        await page.screenshot(path='/home/jules/verification/final_summary.png')
        print("Summary screen with description captured.")

        # Go back using internal back circle (since we can't easily trigger TG BackButton in playwright without mock)
        await page.click('.back-circle')
        await page.wait_for_selector('#configPage', state='visible')
        print("Internal back button verified.")

        # Check History
        await page.click('text=History')
        await page.wait_for_selector('#historyPage', state='visible')
        await page.screenshot(path='/home/jules/verification/final_history.png')
        print("History screen captured.")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification'):
        os.makedirs('/home/jules/verification')
    asyncio.run(verify_final())
