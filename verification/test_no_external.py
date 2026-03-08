import os
from playwright.sync_api import sync_playwright, expect

def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Block external requests
        def handle_route(route):
            if "localhost" in route.request.url:
                route.continue_()
            else:
                route.abort()

        page.route("**/*", handle_route)

        print("Navigating...")
        # Using the http server started before
        page.goto("http://localhost:8000/index.html", wait_until="commit")

        print("Waiting for license input...")
        license_input = page.locator("#licenseKeyInput")
        # Just check for presence
        expect(license_input).to_be_attached(timeout=5000)

        # We can't really test the hashing logic if SubtleCrypto is not available in non-secure context
        # But localhost is usually considered a secure context.

        print("Testing license key verification...")
        page.fill("#licenseKeyInput", "admin")
        page.click("#submitLicenseKeyButton")

        # If hashing works, namePopup should appear
        name_popup = page.locator("#namePopup")
        expect(name_popup).to_be_attached(timeout=5000)
        print("Logic seems to work!")

        browser.close()

if __name__ == "__main__":
    verify_fix()
