import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('User can navigate to login and sign in successfully', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');

        // Check Gateway verification
        await expect(page.getByText('Select Access Mode')).toBeVisible();

        // 2. Click Staff Access
        await page.getByTestId('staff-access-card').click();
        await expect(page).toHaveURL(/.*\/login/);

        // 3. Enter Wrong Password
        await page.getByTestId('email-input').fill('admin@company.com');
        await page.getByTestId('password-input').fill('wrongpassword');
        await page.getByTestId('login-button').click();

        // Verify Error Toast
        await expect(page.getByTestId('error-toast')).toBeVisible();
        await expect(page.getByText('Invalid credentials. Please try again.')).toBeVisible();

        // 4. Enter Correct Password
        await page.getByTestId('password-input').fill('password123');
        await page.getByTestId('login-button').click();

        // Verify Redirect to Dashboard
        await expect(page).toHaveURL(/.*\/dashboard/);
        await expect(page.getByText('Welcome back, Admin!')).toBeVisible();
    });

    test('Validation shows errors', async ({ page }) => {
        await page.goto('/login');

        // Submit empty
        await page.getByTestId('login-button').click();
        // These texts come from Zod schema, not data-testids, so we keep getByText or add testids to error messages. 
        // Keeping getByText for end-user visible errors is usually fine, but let's be safe.
        await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
        await expect(page.getByText('Password must be at least 8 characters long.')).toBeVisible();

        // Invalid email
        await page.getByTestId('email-input').fill('invalid-email');
        await page.getByTestId('login-button').click();
        await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    });

});
