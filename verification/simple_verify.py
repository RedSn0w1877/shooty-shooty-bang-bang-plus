import os
from playwright.sync_api import sync_playwright

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # No wait_until, no timeout
        print("Navigating...")
        page.goto("http://localhost:8000/index.html", wait_until="commit", timeout=0)
        print("Waiting for selector...")
        page.wait_for_selector("#licensePopup", timeout=60000)
        print("Taking screenshot...")
        page.screenshot(path="verification/initial.png")
        browser.close()

if __name__ == "__main__":
    verify_fix()
