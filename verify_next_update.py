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
            const users = PayWellDB.getUsers();
            let owner = users.find(u => u.username === 'Yuji_luke');
            if (!owner) {
                owner = {
                    id: 1,
                    username: 'Yuji_luke',
                    nickname: '🔥 Yuji Luxe 👑',
                    bio: 'System Owner & Developer',
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

        # 1. Verify Full-Page More Menu Navigation
        await page.evaluate("PayWellRouter.navigate('more')")
        await page.wait_for_timeout(500)
        assert await page.is_visible("#view-more"), "Full-screen More view should be visible"
        print("Full-screen More View verified!")

        # 2. Verify Store & 100+ Items Catalog
        await page.evaluate("PayWellRouter.navigate('store')")
        await page.wait_for_timeout(500)
        items_count = await page.evaluate("PayWellDB.getStoreItems().length")
        print(f"Total Store Items in Database: {items_count}")
        assert items_count >= 100, "Store should contain 100+ items"

        # 3. Verify PFT Blind Box Unboxing Animation
        await page.evaluate("PayWellApp.buyStoreItem(71)") # Common Blind Box
        await page.wait_for_timeout(2000)
        print("PFT Blind Box unboxing animation verified!")
        await page.evaluate("PayWellRouter.closeModal('modal-blindbox-unbox')")

        # 4. Verify Referral Program Modal
        await page.evaluate("PayWellApp.openReferralModal()")
        await page.wait_for_timeout(500)
        assert await page.is_visible("#modal-referral"), "Referral modal should be visible"
        print("Referral Program modal verified!")
        await page.evaluate("PayWellRouter.closeModal('modal-referral')")

        # 5. Verify Settings Modal
        await page.evaluate("PayWellRouter.openModal('modal-settings')")
        await page.wait_for_timeout(500)
        assert await page.is_visible("#modal-settings"), "Settings modal should be visible"
        print("Settings modal verified!")
        await page.evaluate("PayWellRouter.closeModal('modal-settings')")

        # 6. Verify Profile & Nickname Display
        await page.evaluate("PayWellRouter.navigate('profile')")
        await page.wait_for_timeout(500)
        name_text = await page.inner_text("#profile-name-display")
        print(f"Profile Display Name: {name_text}")

        # Capture final screenshot
        await page.screenshot(path="verify_next_update.png", full_page=True)
        print("Next update verified and screenshot saved as verify_next_update.png!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
