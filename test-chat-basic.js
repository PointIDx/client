const { test, expect } = require('@playwright/test');

test('Basic chat page navigation', async ({ page }) => {
  // Navigate to home first
  await page.goto('/');
  console.log('Home page loaded');
  
  // Try to navigate to chat directly
  await page.goto('/chat');
  console.log('Attempted to navigate to chat page');
  
  // Wait a bit and check the URL
  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());
  
  // Check if we can see any element on the page
  const bodyText = await page.locator('body').textContent();
  console.log('Page content snippet:', bodyText.substring(0, 200));
});
EOF < /dev/null
