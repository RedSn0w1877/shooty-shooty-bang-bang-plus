import os
import time
from playwright.sync_api import sync_playwright

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to hash test...")
        path = os.path.abspath("verification/test_hash.html")
        page.goto(f"file://{path}")

        # Wait for the script to run
        time.sleep(1)

        content = page.inner_text("body")
        print(f"Test result: {content}")

        if content == "SUCCESS":
            print("Web Crypto SHA-256 is working correctly in this environment.")
        else:
            print("Web Crypto SHA-256 test failed.")

        browser.close()

if __name__ == "__main__":
    verify_fix()
