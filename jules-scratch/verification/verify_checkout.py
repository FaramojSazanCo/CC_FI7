from playwright.sync_api import sync_playwright, Page, expect
import time

def run_verification(page: Page):
    """
    This script verifies the custom checkout form functionality on the user's provided URL.
    """
    # 1. Navigate to the checkout page.
    page.goto("https://rfkala.ir/checkout/", timeout=90000)

    # Add a small delay to ensure all elements, especially those from other plugins, are loaded.
    time.sleep(5)

    # 2. Initial State Verification
    # Expect the main checkout form to be present.
    checkout_form = page.locator("form.checkout")
    expect(checkout_form).to_be_visible(timeout=30000)

    # Take a screenshot of the initial state.
    page.screenshot(path="jules-scratch/verification/01_live_initial_state.png")

    # 3. Check for the custom structure
    # We expect our custom wrapper to NOT exist if the CSS/JS are blocked.
    # For debugging, let's just take a screenshot and manually inspect.
    # Let's try to find the invoice checkbox, which is the start of our custom form.
    invoice_checkbox = page.locator("#billing_invoice_request")

    if invoice_checkbox.is_visible():
        # If the checkbox is visible, the form is working. Let's test the interactions.
        invoice_checkbox.check()
        person_type_select = page.locator("#billing_person_type")
        expect(person_type_select).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_live_invoice_section_visible.png")

        person_type_select.select_option("legal")
        company_name_field = page.locator("#billing_company_name")
        expect(company_name_field).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_live_legal_fields_visible.png")
    else:
        # If the checkbox is not visible, it confirms the form is not being rendered correctly.
        # We can still take a screenshot to show what is being rendered instead.
        page.screenshot(path="jules-scratch/verification/02_live_form_not_rendered.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
