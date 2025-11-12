import { test, expect } from '@playwright/test';

// Helper to seed localStorage prior to navigation
async function seedClient(page) {
  await page.addInitScript(() => {
    localStorage.setItem('mpsone_user_type', 'client');
    localStorage.setItem('mpsone_role', 'Admin');
  });
}

async function seedSupplier(page) {
  await page.addInitScript(() => {
    localStorage.setItem('mpsone_user_type', 'supplier');
    localStorage.setItem('mpsone_role', 'Admin');
    localStorage.setItem('mpsone_user_id', 'SUP-1');
  });
}

test.describe('Core workflows render', () => {
  test('PR List renders for client', async ({ page }) => {
    await seedClient(page);
    await page.goto('/procurement/pr');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('.main')).toBeVisible();
  });

  test('Quote Comparison renders with approved PR context', async ({ page }) => {
    await seedClient(page);
    // Seed Approved PR rows
    await page.addInitScript(() => {
      const rows = [{ id: 'PR-999', status: 'Approved', title: 'Test', department: 'Ops' }];
      localStorage.setItem('mock_pr_rows', JSON.stringify(rows));
    });
    await page.goto('/client/quotes/PR-999');
    await expect(page.locator('.main')).toBeVisible();
    // Fallback text hint is stable
    await expect(page.getByText('No quotes yet', { exact: false })).toBeVisible();
  });

  test('PO Preview renders with accepted quote context', async ({ page }) => {
    await seedClient(page);
    await page.addInitScript(() => {
      const seed = { prId: 'PR-1000', supplierId: 'SUP-1', version: 1 };
      localStorage.setItem('mpsone_po_from_quote', JSON.stringify(seed));
      localStorage.setItem('mpsone_quote_accepted', JSON.stringify({ 'PR-1000': { supplierId: 'SUP-1', version: 1 } }));
    });
    await page.goto('/procurement/po/preview');
    await expect(page.getByText('PO Preview', { exact: false })).toBeVisible();
  });

  test('Document Manager renders when logged in', async ({ page }) => {
    await seedClient(page);
    await page.goto('/docs');
    await expect(page.locator('.main')).toBeVisible();
  });

  test('Communication Hub renders when logged in', async ({ page }) => {
    await seedClient(page);
    await page.goto('/comms');
    await expect(page.locator('.main')).toBeVisible();
  });

  test('Order Tracker renders', async ({ page }) => {
    await seedSupplier(page);
    await page.goto('/supply/order-tracker');
    await expect(page.locator('.main')).toBeVisible();
  });

  test('Delivery Notes renders', async ({ page }) => {
    await seedSupplier(page);
    await page.goto('/inventory/delivery-notes');
    await expect(page.locator('.main')).toBeVisible();
  });
});

test.describe('Procurement guards', () => {
  test('PO Preview redirects to workflow when seed missing', async ({ page }) => {
    await seedClient(page);
    await page.goto('/procurement/po/preview');
    await page.waitForURL('**/procurement/workflow');
  });

  test('Quote Builder redirects to client login when supplier lacks approved PR', async ({ page }) => {
    await seedSupplier(page);
    // Ensure no sent PRs seeded
    await page.addInitScript(() => {
      localStorage.removeItem('mpsone_pr_sent');
    });
    await page.goto('/procurement/quote-builder');
    // Final redirect ends up at client login due to ClientOnlyProcurement wrapping workflow
    await page.waitForURL('**/login/client');
  });
});
