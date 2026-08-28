import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to PayWell App...")
        await page.goto("http://localhost:8080")
        await page.wait_for_timeout(1000)

        # Login as Owner @Yuji_luke
        await page.evaluate("""async () => {
            const users = PayWellDB.getUsers();
            let owner = users.find(u => u.username === 'Yuji_luke');
            if (!owner) {
                owner = {
                    id: 1,
                    username: 'Yuji_luke',
                    nickname: '🔥 Yuji Luxe 👑',
                    bio: 'System Owner & Lead Developer',
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
        await page.evaluate("PayWellRouter.closeModal('modal-auth')")
        await page.wait_for_timeout(1000)

        # 1. Test Full-Screen Wallet View
        await page.evaluate("PayWellRouter.navigate('wallet')")
        await page.wait_for_timeout(500)
        assert await page.is_visible("#view-wallet"), "Wallet view should be visible"
        overview_txt = await page.inner_text("#wallet-overview-amount")
        print(f"Full-Screen Wallet Overview Amount: {overview_txt}")

        # 2. Test Dedicated Global Market View
        await page.evaluate("PayWellRouter.navigate('global-market')")
        await page.wait_for_timeout(500)
        assert await page.is_visible("#view-global-market"), "Global Market view should be visible"
        print("Dedicated Global Market View verified!")

        # 3. Test Owner Diagnostic Checker
        await page.evaluate("PayWellRouter.navigate('crown')")
        await page.wait_for_timeout(500)
        await page.evaluate("async () => { PayWellOwner.pinInput = '201171'; await PayWellOwner.verifyPin(); }")
        await page.wait_for_timeout(500)

        await page.evaluate("PayWellOwner.openUserCheckerModal()")
        await page.evaluate("document.getElementById('checker-user-input').value = 'Yuji_luke'")
        await page.evaluate("PayWellOwner.startDiagnosticUserCheck()")
        await page.wait_for_timeout(2500)

        report_txt = await page.inner_text("#checker-result-card")
        print("Diagnostic User Checker Report generated successfully!")

        await page.screenshot(path="verify_next_full.png", full_page=True)
        print("Full update verified and screenshot saved as verify_next_full.png!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
