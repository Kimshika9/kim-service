import asyncio
from playwright.async_api import async_playwright
import os

async def verify_luxury_app():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        # Start server in background
        os.system("python3 main.py > server_luxury.log 2>&1 &")
        await asyncio.sleep(5) # Wait for loading screen duration (3s) + extra

        try:
            await page.goto('http://localhost:8080')
            # Check loading screen
            await page.wait_for_selector('#loadingScreen', state='hidden', timeout=15000)

            # Capture Home
            await page.screenshot(path='/home/jules/verification/luxury_home.png')
            print("Captured Luxury Home")

            # Click Graphics
            await page.click('text=Graphics')
            await asyncio.sleep(1) # wait for bubble animations
            await page.screenshot(path='/home/jules/verification/luxury_bubbles.png')
            print("Captured Luxury Bubbles")

            # Click Branding Design
            await page.click('text=Branding Design')
            await asyncio.sleep(0.5)
            await page.screenshot(path='/home/jules/verification/luxury_services.png')
            print("Captured Luxury Services")

            # Click a service
            await page.click('text=Monogram Logo')
            await page.screenshot(path='/home/jules/verification/luxury_config.png')
            print("Captured Luxury Config")

            # Fill description
            await page.fill('#orderDescription', 'A luxury purple brand for my new agency.')
            await page.click('text=Proceed to Order')
            await page.screenshot(path='/home/jules/verification/luxury_payment.png')
            print("Captured Luxury Payment")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()
            os.system("kill $(lsof -t -i :8080) 2>/dev/null || true")

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification'):
        os.makedirs('/home/jules/verification')
    asyncio.run(verify_luxury_app())
