from playwright.sync_api import sync_playwright

def verify_hash_function():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/index.html", wait_until="commit")

        # Test the hashString function directly in the browser
        test_val = "admin"
        expected_hash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"

        result = page.evaluate("""async (val) => {
            return await hashString(val);
        }""", test_val)

        print(f"Tested hashString('{test_val}')")
        print(f"Result:   {result}")
        print(f"Expected: {expected_hash}")

        if result == expected_hash:
            print("Hash verification SUCCESSFUL!")
        else:
            print("Hash verification FAILED!")

        browser.close()

if __name__ == "__main__":
    verify_hash_function()
