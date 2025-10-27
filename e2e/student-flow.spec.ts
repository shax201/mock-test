import { test, expect } from '@playwright/test'

test.describe('Student Test Flow', () => {
  test('should complete full IELTS mock test flow', async ({ page }) => {
    // Navigate to test entry page
    await page.goto('/test')
    
    // Check if we're on the test entry page
    await expect(page).toHaveTitle(/IELTS Mock Test/)
    await expect(page.locator('h2')).toContainText('IELTS Mock Test')
    
    // Enter test token
    await page.fill('input[name="token"]', 'test-token-123')
    await page.click('button[type="submit"]')
    
    // Should redirect to instructions page
    await expect(page).toHaveURL(/\/test\/test-token-123\/instructions/)
    await expect(page.locator('h1')).toContainText('IELTS Mock Test Instructions')
    
    // Accept instructions
    await page.check('input[name="instructions-accepted"]')
    await page.click('button:has-text("Begin Test")')
    
    // Should redirect to listening module
    await expect(page).toHaveURL(/\/test\/test-token-123\/listening/)
    await expect(page.locator('h1')).toContainText('Listening Module')
    
    // Complete listening module (simplified)
    await page.fill('input[type="radio"][value="B"]', 'B')
    await page.fill('input[type="text"]', 'three')
    await page.click('button:has-text("Submit & Continue to Reading")')
    
    // Should redirect to reading module
    await expect(page).toHaveURL(/\/test\/test-token-123\/reading/)
    await expect(page.locator('h1')).toContainText('Reading Module')
    
    // Complete reading module (simplified)
    await page.click('button:has-text("Submit & Continue to Writing")')
    
    // Should redirect to writing module
    await expect(page).toHaveURL(/\/test\/test-token-123\/writing/)
    await expect(page.locator('h1')).toContainText('Writing Module')
    
    // Complete writing tasks
    await page.fill('textarea', 'This is a sample response for Task 1. It contains more than 150 words to meet the minimum requirement. The response describes the chart data and provides a summary of the main features. This should be sufficient to demonstrate the writing ability and meet the word count requirement.')
    
    // Switch to Task 2
    await page.click('button:has-text("Task 2")')
    await page.fill('textarea', 'This is a sample response for Task 2. It contains more than 250 words to meet the minimum requirement. The response discusses the topic in detail and provides a comprehensive analysis. This demonstrates the ability to write a longer essay and meet the word count requirement for the second task.')
    
    await page.click('button:has-text("Submit & Continue to Speaking")')
    
    // Should redirect to speaking module
    await expect(page).toHaveURL(/\/test\/test-token-123\/speaking/)
    await expect(page.locator('h1')).toContainText('Speaking Module')
    
    // Complete speaking responses
    await page.fill('textarea', 'My hometown is a small city with friendly people and good weather.')
    await page.fill('textarea', 'I enjoy reading books and playing sports in my free time.')
    await page.fill('textarea', 'I would describe a memorable journey to the mountains where I went hiking with my friends.')
    await page.fill('textarea', 'Travel has become much more accessible and affordable in recent years.')
    await page.fill('textarea', 'Traveling to different countries helps us learn about new cultures and broaden our perspectives.')
    
    await page.click('button:has-text("Complete Test")')
    
    // Should redirect to completion page
    await expect(page).toHaveURL(/\/test\/test-token-123\/complete/)
    await expect(page.locator('h1')).toContainText('Test Completed Successfully!')
    
    // Check completion details
    await expect(page.locator('text=CAND001')).toBeVisible()
    await expect(page.locator('text=IELTS Academic Mock Test 1')).toBeVisible()
  })
  
  test('should handle invalid token', async ({ page }) => {
    await page.goto('/test')
    
    // Enter invalid token
    await page.fill('input[name="token"]', 'invalid-token')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.bg-red-50')).toBeVisible()
    await expect(page.locator('text=Invalid token')).toBeVisible()
  })
  
  test('should handle expired token', async ({ page }) => {
    await page.goto('/test')
    
    // Enter expired token
    await page.fill('input[name="token"]', 'expired-token')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.bg-red-50')).toBeVisible()
    await expect(page.locator('text=Token has expired')).toBeVisible()
  })
})
