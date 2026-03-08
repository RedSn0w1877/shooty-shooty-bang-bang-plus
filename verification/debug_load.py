import os
from playwright.sync_api import sync_playwright

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print("Navigating...")
        try:
            page.goto("http://localhost:8000/index.html", wait_until="commit", timeout=30000)
            print("Committed. Waiting 5 seconds...")
            page.wait_for_timeout(5000)
            page.screenshot(path="verification/debug.png")
            print(f"Page title: {page.title()}")
            # print(f"Page content snippet: {page.content()[:500]}")

            license_popup = page.locator("#licensePopup")
            print(f"licensePopup exists: {license_popup.count() > 0}")
            if license_popup.count() > 0:
                print(f"licensePopup classes: {license_popup.get_attribute('class')}")
                print(f"licensePopup is visible: {license_popup.is_visible()}")

        except Exception as e:
            print(f"Error during navigation: {e}")

        browser.close()

if __name__ == "__main__":
    verify_fix()
