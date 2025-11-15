import { test, expect, Page } from '@playwright/test';

// Seed helpers
async function seedClient(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('mpsone_user_type', 'client');
    localStorage.setItem('mpsone_role', 'Admin');
    // Ensure offline flag does not interfere; PRList uses demo rows when offline=0
    localStorage.setItem('mpsone_offline', '0');
  });
}

async function seedSuppliers(page: Page) {
  await page.addInitScript(() => {
    const suppliers = [
      { id: 'MBERKAH@', name: 'MBERKAH', code: 'MBERKAH@', status: 'pending' },
      { id: 'SAMARINDA_SUP@', name: 'SAMARINDA_SUP', code: 'SAMARINDA_SUP@', status: 'pending' },
      { id: 'PT_KALTIM@', name: 'PT_KALTIM', code: 'PT_KALTIM@', status: 'pending' },
    ];
    localStorage.setItem('mpsone_suppliers', JSON.stringify(suppliers));
  });
}

test.describe('End-to-end procurement core flow', () => {
  test('PR → Quote → PO → Delivery → Invoice (gated)', async ({ page }) => {
    // Client context and suppliers
    await seedClient(page);
    await seedSuppliers(page);

    // 1) PR List: use demo Approved PR row PR-444 and send to suppliers
    await page.goto('/procurement/pr');
    await expect(page.locator('#main-content')).toBeVisible();
    const prRow = page.locator('tr').filter({ hasText: 'PR-444' });
    await expect(prRow).toBeVisible();
    // Click "Send PR to suppliers" (enabled only for Approved)
    await prRow.getByRole('button', { name: /send pr to suppliers/i }).click();

    // 2) Quote Comparison: seed mock PR approval context and approve a quote
    await page.addInitScript(() => {
      const rows = [{ id: 'PR-444', status: 'Approved', title: 'Excavator Bucket', department: 'Maintenance' }];
      localStorage.setItem('mock_pr_rows', JSON.stringify(rows));
    });
    await page.goto('/client/quotes/PR-444');
    await expect(page.locator('#main-content')).toBeVisible();
    // Approve a quote version for first supplier and generate PO
    const supplierCard = page.locator('.card').filter({ hasText: /Supplier:/ });
    await expect(supplierCard.first()).toBeVisible();
    // Approve Quote (pick version row button)
    await page.getByRole('button', { name: /approve quote/i }).first().click();
    // Generate PO becomes available for accepted quote
    await page.getByRole('button', { name: /generate po/i }).click();

    // 3) PO Preview renders
    await page.waitForURL('**/procurement/po/preview');
    await expect(page.getByText(/PO Preview/i)).toBeVisible();

    // 4) Delivery Notes: adjust corrections to unlock invoicing
    await page.goto('/inventory/delivery-notes');
    await expect(page.locator('#main-content')).toBeVisible();
    // Make large correction to ensure deliveredAmount > existing invoices for PO-9821
    const correctionInputs = page.locator('input[type="number"]').filter({ has: page.locator('[aria-label*="Safety Helmet"]') }).first();
    await correctionInputs.fill('200');

    // 5) Supplier Reporting: create invoice with gating validation
    await page.goto('/supplier/reporting');
    await expect(page.locator('#main-content')).toBeVisible();
    // Find row for PO-9821 and open Create Invoice
    const poRow = page.locator('tr').filter({ hasText: 'PO-9821' });
    await expect(poRow).toBeVisible();
    const createBtn = poRow.getByRole('button', { name: /create invoice/i });
    // Button should be enabled after DeliveryNotes gate update
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // Modal shows remaining deliverable; try over-amount to assert validation
    const amountInput = page.getByRole('spinbutton');
    await expect(amountInput).toBeVisible();
    await amountInput.fill('999999999');
    await expect(page.getByRole('alert')).toContainText(/exceeds/);
    // Fix amount to a valid number and set due date
    await amountInput.fill('10000000');
    const dueInput = page.getByRole('textbox', { name: /due date/i });
    await dueInput.fill(new Date(Date.now() + 15*24*3600*1000).toISOString().slice(0,10));
    // Create invoice
    await page.getByRole('button', { name: /^create$/i }).click();

    // Verify new invoice appears
    await expect(page.getByText(/INV-/)).toBeVisible();
  });
});
