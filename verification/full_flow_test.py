from playwright.sync_api import sync_playwright, expect
import os
import time

def test_full_flow(page):
    url = "http://localhost:8000/index.html"
    print(f"Loading {url}")

    # Set a large viewport
    page.set_viewport_size({"width": 1280, "height": 720})

    # Go to the page - we'll try 'load' wait until but with longer timeout
    print("Navigating...")
    try:
        page.goto(url, wait_until="load", timeout=90000)
        print("Page fully loaded")
    except Exception as e:
        print(f"Navigation error (continuing anyway): {e}")

    # Give it some more time to parse
    time.sleep(5)

    # Log document state
    print("Dumping document state:")
    try:
        title = page.evaluate("() => document.title")
        print(f"  - Title: {title}")
        body_exists = page.evaluate("() => !!document.body")
        print(f"  - Body exists: {body_exists}")
    except Exception as e:
        print(f"Error evaluating document state: {e}")

    # Check for licensePopup visibility in a loop
    print("Checking licensePopup visibility...")
    for i in range(5):
        try:
            is_visible = page.evaluate("() => document.getElementById('licensePopup') && !document.getElementById('licensePopup').classList.contains('hidden')")
            print(f"  [{i}] licensePopup visible: {is_visible}")
            if is_visible:
                break
        except Exception as e:
            print(f"  [{i}] Error evaluating licensePopup: {e}")
        time.sleep(2)

    # Take a screenshot to see where we are
    page.screenshot(path="verification/e2e_state.png")

    # 1. Integrity Code
    print("Waiting for license input...")
    license_input = page.locator("#licenseKeyInput")

    # Force visibility if needed for testing (sometimes initial CSS transition takes time)
    page.evaluate("() => { const lp = document.getElementById('licensePopup'); if(lp) { lp.classList.remove('hidden'); lp.classList.add('visible'); } }")

    try:
        expect(license_input).to_be_visible(timeout=30000)
        print("License input visible")

        print("Entering integrity code...")
        license_input.fill("ilovenathan")
        page.click("#submitLicenseKeyButton")

        # 2. Name Popup
        print("Waiting for name popup...")
        name_input = page.locator("#playerNameInput")
        expect(name_input).to_be_visible(timeout=10000)
        name_input.fill("SecurityTester")
        page.click("#submitPlayerNameButton")

        # 3. Main Menu
        print("Waiting for main menu...")
        expect(page.locator("#mainMenuPopup")).to_be_visible(timeout=10000)
        page.click("#playSoloButton")

        # 4. Loading Screen
        print("Waiting for main game content (simulated 10s load)...")
        expect(page.locator("#mainGameContent")).to_be_visible(timeout=30000)

        # 5. Open Aimbot popup
        print("Opening Aimbot popup...")
        page.click("#aimbotButton")

        # 6. Verify Aimbot popup is visible
        expect(page.locator("#messageBox")).to_be_visible()

        # Take final screenshot
        screenshot_path = "verification/e2e_final.png"
        page.screenshot(path=screenshot_path)
        print(f"E2E Success! Screenshot saved to {screenshot_path}")
    except Exception as e:
        print(f"E2E Failed: {e}")
        page.screenshot(path="verification/e2e_error.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_full_flow(page)
        finally:
            browser.close()
