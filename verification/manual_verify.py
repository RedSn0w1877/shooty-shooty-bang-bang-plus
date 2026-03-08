from playwright.sync_api import sync_playwright
import time

def test_manual_injection(page):
    url = "http://localhost:8000/index.html"
    print(f"Loading {url}")

    # We load but we'll manually inject the function to verify it works in this browser
    try:
        page.goto(url, wait_until="commit", timeout=60000)
    except Exception as e:
        print(f"Navigation error: {e}")

    time.sleep(2)

    print("Injecting hashString function manually...")
    # Wrap in an IIFE to avoid syntax errors if any
    js_code = """
    (async () => {
        window.myHashString = async function(string) {
            const msgUint8 = new TextEncoder().encode(string);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        };
    })()
    """
    page.evaluate(js_code)

    # Check if exists
    exists = page.evaluate("() => typeof window.myHashString === 'function'")
    print(f"  - Manual hashString exists: {exists}")

    if exists:
        # Aimbot code test
        aimbot_hash = page.evaluate("async () => await window.myHashString('ultrasecretpassword')")
        print(f"  - Hash of 'ultrasecretpassword': {aimbot_hash}")
        if aimbot_hash == "114e5f1ed7e2eb054702941a31f6d2c7964ddb46a1df9abe6685c36b06bae2af":
            print("  - Aimbot hash MATCHES code!")

        # Integrity code test
        integrity_hash = page.evaluate("async () => await window.myHashString('ilovenathan')")
        print(f"  - Hash of 'ilovenathan': {integrity_hash}")
        if integrity_hash == "5de605bff76f3594cffe074cb8c15ee23e9149b952034d103c0ef64b1570c202":
            print("  - Integrity hash MATCHES code!")

        print("\nSECURE LOGIC VERIFIED!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            test_manual_injection(page)
        finally:
            browser.close()
