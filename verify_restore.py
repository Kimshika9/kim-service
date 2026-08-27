import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})

        page.on("dialog", lambda dialog: dialog.accept())

        print("Navigating to PayWell App...")
        await page.goto("http://localhost:8080/index.html")
        await page.wait_for_timeout(1000)

        # Register User via JS
        await page.fill("#reg-username", "TestUserRestore")
        await page.fill("#reg-pwd", "UserPass123!")
        await page.evaluate("document.getElementById('form-register').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))")
        await page.wait_for_timeout(1000)

        # Check Balance
        bal = await page.inner_text("#bal-main")
        print(f"Registered user balance: {bal} PW")

        # Open Pet Modal and interact
        await page.evaluate("PayWellPet.openPetModal()")
        await page.wait_for_timeout(500)
        await page.evaluate("PayWellPet.performAction('feed')")
        await page.wait_for_timeout(500)
        await page.evaluate("PayWellRouter.closeModal('modal-pet-system')")

        # Open Exchange Modal
        await page.evaluate("PayWellRouter.openModal('modal-exchange')")
        await page.wait_for_timeout(500)
        await page.fill("#ex-amt-input", "50000")
        await page.fill("#ex-acct-input", "09123456789 (Test User)")
        await page.evaluate("PayWellApp.submitExchangeRequest()")
        await page.wait_for_timeout(500)
        await page.evaluate("PayWellRouter.closeModal('modal-exchange')")

        # Login as Owner Yuji_luke
        await page.evaluate("PayWellAuth.logout()")
        await page.wait_for_timeout(500)

        await page.fill("#login-ident", "Yuji_luke")
        await page.fill("#login-pwd", "OwnerPass123!")
        await page.evaluate("document.getElementById('form-login').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))")
        await page.wait_for_timeout(1000)

        # Click Crown Nav
        await page.evaluate("PayWellRouter.navigate('crown')")
        await page.wait_for_timeout(500)

        # Enter PIN 201171 via PayWellOwner.handlePinKey
        for digit in ["2", "0", "1", "1", "7", "1"]:
            await page.evaluate(f"PayWellOwner.handlePinKey('{digit}')")
            await page.wait_for_timeout(100)

        await page.wait_for_timeout(1000)

        # Take screenshot of Owner Cockpit
        await page.screenshot(path="verify_restore_owner.png")
        print("Owner Cockpit verified and screenshot saved as verify_restore_owner.png!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
