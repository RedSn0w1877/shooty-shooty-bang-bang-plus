import os
import time
from playwright.sync_api import sync_playwright, expect

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to http://localhost:8000/index.html")
        page.goto("http://localhost:8000/index.html", wait_until="domcontentloaded")

        # Wait for the license popup to be visible.
        page.wait_for_selector("#licensePopup.visible", timeout=60000)

        print("Page loaded and license popup visible.")
        # 1. Test License Key (Integrity Code)
        page.fill("#licenseKeyInput", "wrongcode")
        page.click("#submitLicenseKeyButton")
        expect(page.locator("#licenseErrorText")).to_be_visible()
        page.screenshot(path="verification/license_error.png")
        print("Wrong license key test passed.")

        page.fill("#licenseKeyInput", "admin")
        page.click("#submitLicenseKeyButton")
        # Wait for namePopup to become visible
        page.wait_for_selector("#namePopup.visible", timeout=10000)
        page.screenshot(path="verification/name_popup.png")
        print("Correct license key test passed.")

        page.fill("#playerNameInput", "TestPlayer")
        page.click("#submitPlayerNameButton")
        page.wait_for_selector("#mainMenuPopup.visible", timeout=10000)

        page.click("#playSoloButton")
        print("Clicked Play Solo, waiting for game content.")

        # The loading screen takes 10 seconds.
        page.wait_for_selector("#mainGameContent", state="visible", timeout=30000)
        page.screenshot(path="verification/game_started.png")

        # 2. Test Aimbot Code
        page.click("#aimbotButton")
        page.wait_for_selector("#codeInputSection", state="visible")
        page.fill("#codeInput", "ultrasecretpassword")
        page.click("#submitCodeButton")
        # messageBox should be hidden eventually
        page.wait_for_selector("#messageBox", state="hidden")
        print("Aimbot code test passed.")

        # 3. Test Admin Password
        page.click("#invincibilityButton")
        page.wait_for_selector("#adminPasswordPopup.visible", timeout=10000)
        page.fill("#adminPasswordInput", "ilovenathan")
        page.click("#submitAdminPasswordButton")
        page.wait_for_selector("#adminPasswordPopup", state="hidden")
        print("Admin password test passed.")

        browser.close()

if __name__ == "__main__":
    verify_fix()
