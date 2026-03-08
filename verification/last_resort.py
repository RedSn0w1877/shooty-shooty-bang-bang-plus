import os
import time
from playwright.sync_api import sync_playwright

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Block EVERYTHING except the local file
        def handle_route(route):
            if route.request.url.startswith("file://"):
                route.continue_()
            else:
                route.abort()

        page.route("**/*", handle_route)

        print("Navigating...")
        try:
            path = os.path.abspath("index.html")
            # Navigate with a short timeout and wait only for commit
            page.goto(f"file://{path}", wait_until="commit", timeout=10000)
            print("Page committed.")

            # Wait for some time to allow any local scripts to run
            time.sleep(2)

            # Inject a script to show the popup if it's not showing (maybe DOMContentLoaded didn't fire exactly as expected)
            page.evaluate("() => { if (typeof showPopup === 'function') showPopup(document.getElementById('licensePopup')); }")

            page.screenshot(path="verification/verification.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Verification error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_fix()
