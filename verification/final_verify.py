import os
import time
from playwright.sync_api import sync_playwright

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Block fonts and images to speed up and avoid timeouts
        page.route("**/*.{png,jpg,jpeg,svg,woff,woff2,ttf}", lambda route: route.abort())

        print("Navigating...")
        try:
            # We use the file path directly but with a timeout and ignore some errors
            path = os.path.abspath("index.html")
            page.goto(f"file://{path}", wait_until="commit", timeout=10000)
            print("Page committed.")

            # Wait for content
            time.sleep(2)
            page.screenshot(path="verification/final_check.png")
            print("Screenshot taken.")

            # Check if elements are there
            license_input = page.locator("#licenseKeyInput")
            if license_input.count() > 0:
                print("License input found.")
            else:
                print("License input NOT found.")

        except Exception as e:
            print(f"Verification error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_fix()
