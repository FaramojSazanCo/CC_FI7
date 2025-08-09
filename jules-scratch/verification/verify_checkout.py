from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies the custom checkout form functionality.
    """
    # 1. Navigate to the checkout page.
    # Using a generic URL. This might need to be adjusted.
    page.goto("http://localhost:8888/checkout/", timeout=60000)

    # 2. Initial State Verification
    # Expect the invoice checkbox to be present and wait for it.
    invoice_checkbox = page.locator("#billing_invoice_request")
    expect(invoice_checkbox).to_be_visible(timeout=30000)

    # Take a screenshot of the initial state. Buyer info should be hidden.
    page.screenshot(path="jules-scratch/verification/01_initial_state.png")

    # 3. Invoice Section Visibility
    # Click the checkbox to request an official invoice.
    invoice_checkbox.check()

    # Wait for the person type dropdown to appear.
    person_type_select = page.locator("#billing_person_type")
    expect(person_type_select).to_be_visible()

    # Take a screenshot showing the buyer information section.
    page.screenshot(path="jules-scratch/verification/02_invoice_section_visible.png")

    # 4. Legal Person Fields Visibility
    # Select the "Legal" person type. The value for 'حقوقی' is 'legal'.
    person_type_select.select_option("legal")

    # Wait for the company name field to appear, which is specific to legal persons.
    company_name_field = page.locator("#billing_company_name")
    expect(company_name_field).to_be_visible()

    # Take the final screenshot showing the legal person fields.
    page.screenshot(path="jules-scratch/verification/03_legal_fields_visible.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
