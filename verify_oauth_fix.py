import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to PayWell App...")
        await page.goto("http://localhost:8080")
        await page.wait_for_timeout(1000)

        # Test Google OAuth Flow
        async def handle_google_dialog(dialog):
            if dialog.type == "prompt":
                await dialog.accept("mygoogleuser@gmail.com")
            else:
                await dialog.accept()

        page.once("dialog", handle_google_dialog)
        await page.evaluate("PayWellAuth.loginWithGoogle()")
        await page.wait_for_timeout(500)

        current_user = await page.evaluate("PayWellAuth.currentUser.username")
        print(f"Logged in user via Google: @{current_user}")
        assert current_user == "mygoogleuser", f"Expected 'mygoogleuser', got {current_user}"

        # Test Telegram OAuth Flow
        async def handle_tg_dialog(dialog):
            if dialog.type == "prompt":
                await dialog.accept("Yuji_luke")
            else:
                await dialog.accept()

        page.once("dialog", handle_tg_dialog)
        await page.evaluate("PayWellAuth.loginWithTelegram()")
        await page.wait_for_timeout(500)

        tg_user = await page.evaluate("PayWellAuth.currentUser.username")
        print(f"Logged in user via Telegram: @{tg_user}")
        assert tg_user == "Yuji_luke", f"Expected 'Yuji_luke', got {tg_user}"

        await page.screenshot(path="verify_oauth_fix.png", full_page=True)
        print("OAuth bug fix verified and screenshot saved as verify_oauth_fix.png!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
