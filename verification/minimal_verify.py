from playwright.sync_api import sync_playwright
import time

def test_minimal(page):
    url = "http://localhost:8000/index.html"
    print(f"Loading {url} (minimal test)")

    # We only care about the script loading
    try:
        page.goto(url, wait_until="commit", timeout=60000)
        print("Page committed")
    except Exception as e:
        print(f"Navigation error: {e}")

    time.sleep(5)

    print("Checking for hashString function...")
    try:
        exists = page.evaluate("() => typeof hashString === 'function'")
        print(f"  - hashString exists: {exists}")
        if exists:
            # Try to run a quick hash test
            hash_result = page.evaluate("async () => await hashString('test')")
            print(f"  - hashString('test') result: {hash_result}")
            # Expected SHA-256 for 'test': 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
            if hash_result == "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08":
                print("Minimal hash verification PASSED!")
    except Exception as e:
        print(f"Error checking hashString: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_minimal(page)
        finally:
            browser.close()
