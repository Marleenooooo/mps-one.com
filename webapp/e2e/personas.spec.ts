import { test, expect } from '@playwright/test';

async function seed(page: any, userType: 'client' | 'supplier', role: string) {
  await page.addInitScript((ut, r) => {
    localStorage.setItem('mpsone_user_type', ut);
    localStorage.setItem('mpsone_role', r);
    localStorage.setItem('mpsone_offline', '0');
  }, userType, role);
}

test.describe('Persona access matrix', () => {
  test('Client Admin: client pages allowed; supplier pages blocked', async ({ page }) => {
    await seed(page, 'client', 'Admin');
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/procurement/pr');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/supplier/reporting');
    await page.waitForURL('**/login/supplier');
  });

  test('Client PIC Operational: client pages allowed; supplier pages blocked', async ({ page }) => {
    await seed(page, 'client', 'PIC Operational');
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/procurement/pr');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/supplier/reporting');
    await page.waitForURL('**/login/supplier');
  });

  test('Client PIC Procurement: client pages allowed; supplier pages blocked', async ({ page }) => {
    await seed(page, 'client', 'PIC Procurement');
    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/procurement/pr');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/supplier/reporting');
    await page.waitForURL('**/login/supplier');
  });

  test('Client PIC Finance: finance page allowed; supplier pages blocked', async ({ page }) => {
    await seed(page, 'client', 'PIC Finance');
    await page.goto('/finance/invoice-matching');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/supplier/reporting');
    await page.waitForURL('**/login/supplier');
  });

  test('Supplier Admin: supplier admin/reporting allowed; client procurement blocked', async ({ page }) => {
    await seed(page, 'supplier', 'Admin');
    await page.goto('/supplier/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.goto('/supplier/reporting');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.main')).toBeVisible();

    await page.goto('/procurement/pr');
    await page.waitForURL('**/login/client');
  });

  test('Supplier PIC Procurement: clients page allowed; admin/reporting blocked', async ({ page }) => {
    await seed(page, 'supplier', 'PIC Procurement');
    await page.goto('/supplier/clients');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.main')).toBeVisible();

    await page.goto('/supplier/admin');
    await page.waitForURL('**/supplier/clients');

    await page.goto('/supplier/reporting');
    await page.waitForURL('**/supplier/clients');
  });

  test('Supplier PIC Finance: clients page allowed; admin/reporting blocked', async ({ page }) => {
    await seed(page, 'supplier', 'PIC Finance');
    await page.goto('/supplier/clients');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.main')).toBeVisible();

    await page.goto('/supplier/admin');
    await page.waitForURL('**/supplier/clients');

    await page.goto('/supplier/reporting');
    await page.waitForURL('**/supplier/clients');
  });
});
