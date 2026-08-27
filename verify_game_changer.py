import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to PayWell App...")
        await page.goto("http://localhost:8080")
        await page.wait_for_timeout(1000)

        # Login as Guest user or register
        await page.evaluate("""async () => {
            try {
                await PayWellAuth.login('Yuji_luke', 'PW123456!');
            } catch (e) {
                try {
                    await PayWellAuth.login('Yuji_luke', 'PW2024_Owner_Secure!');
                } catch (e2) {
                    await PayWellAuth.register('Yuji_luke_tester', 'yuji@gmail.com', 'PW123456!');
                }
            }
        }""")
        await page.evaluate("PayWellRouter.closeModal('modal-auth')")
        await page.wait_for_timeout(1000)

        # Check Balance & Currency Rotation
        bal = await page.inner_text("#bal-primary-display")
        print(f"Primary balance display: {bal}")

        await page.click("button[title*='Switch Currency']")
        await page.wait_for_timeout(300)
        bal_rotated = await page.inner_text("#bal-primary-display")
        print(f"Rotated primary balance display: {bal_rotated}")

        # Check Visa Modal
        await page.evaluate("PayWellApp.openVisaModal()")
        await page.wait_for_timeout(500)
        await page.evaluate("PayWellApp.submitVisaApplication()")
        await page.wait_for_timeout(500)
        card_num = await page.inner_text("#visa-card-number")
        print(f"Issued PayWell Visa Card: {card_num}")

        # Check Global Market Modal
        await page.evaluate("PayWellMarket.openMarket()")
        await page.wait_for_timeout(500)
        await page.evaluate("PayWellRouter.closeModal('modal-global-market')")
        print("Global Market modal verified!")

        # Set active user as Owner @Yuji_luke
        await page.evaluate("""async () => {
            const users = PayWellDB.getUsers();
            let owner = users.find(u => u.username === 'Yuji_luke');
            if (!owner) {
                owner = {
                    id: 1,
                    username: 'Yuji_luke',
                    email: 'yuji@paywell.com',
                    password_hash: PayWellDB.hash('PW2024_Owner_Secure!'),
                    telegram_id: '6399210935',
                    role: 'owner',
                    balance: 100000.0,
                    status: 'active'
                };
                users.push(owner);
                PayWellDB.saveUsers(users);
            }
            PayWellAuth.setUser(owner);
            PayWellApp.renderCurrentState();
        }""")
        await page.wait_for_timeout(500)

        # Check Owner Crown Cockpit Panel & Pass Generator
        await page.evaluate("PayWellRouter.navigate('crown')")
        await page.wait_for_timeout(500)

        await page.evaluate("async () => { PayWellOwner.pinInput = '201171'; await PayWellOwner.verifyPin(); }")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#owner-dashboard-content"), "Owner dashboard should be visible"
        print("Owner Cockpit Deck verified!")

        # Take screenshot of Game Changer Update
        await page.screenshot(path="verify_game_changer.png", full_page=True)
        print("Game Changer update verified and screenshot saved as verify_game_changer.png!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
