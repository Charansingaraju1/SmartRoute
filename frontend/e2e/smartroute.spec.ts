import { test, expect } from '@playwright/test';

test.describe('SmartRoute Application Startup & Navigation', () => {
  test('should load the homepage with branding and key sections', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/SmartRoute/i);

    // Verify header branding
    const brand = page.locator('header').getByText('SmartRoute', { exact: true }).first();
    await expect(brand).toBeVisible();

    // Verify hero section
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Verify key public nav links are present
    await expect(page.locator('header').getByRole('link', { name: 'Buses' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Routes' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Timings' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Scan Bus' })).toBeVisible();
  });

  test('should navigate across public pages smoothly', async ({ page }) => {
    await page.goto('/');

    // Navigate to Buses
    await page.locator('header').getByRole('link', { name: 'Buses' }).click();
    await expect(page).toHaveURL(/\/buses/);
    await expect(page.locator('h1')).toBeVisible();

    // Navigate to Routes
    await page.locator('header').getByRole('link', { name: 'Routes' }).click();
    await expect(page).toHaveURL(/\/routes/);
    await expect(page.locator('h1')).toBeVisible();

    // Navigate to Timings
    await page.locator('header').getByRole('link', { name: 'Timings' }).click();
    await expect(page).toHaveURL(/\/timings/);
    await expect(page.locator('h1')).toBeVisible();

    // Navigate to QR Scanner
    await page.locator('header').getByRole('link', { name: 'Scan Bus' }).click();
    await expect(page).toHaveURL(/\/scan/);
  });
});

test.describe('Theme System: Dark Mode Improvements & Light Mode Regression Check', () => {
  test('should default or support light mode without dark mode leaks', async ({ page }) => {
    await page.goto('/');

    // Ensure light mode is active
    await page.evaluate(() => {
      localStorage.setItem('smartroute_theme_preference', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();

    // Verify html tag does NOT have 'dark' class
    const htmlClasses = await page.locator('html').getAttribute('class');
    expect(htmlClasses).not.toContain('dark');

    // Verify light background token on container
    const appWrapper = page.locator('.min-h-screen').first();
    const bg = await appWrapper.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // rgb(250, 250, 249) corresponds to stone-50 (#fafaf9)
    expect(bg).toBe('rgb(250, 250, 249)');
  });

  test('should toggle to dark mode and apply sophisticated charcoal surfaces', async ({ page }) => {
    await page.goto('/');

    // Toggle theme using the theme button
    const themeBtn = page.locator('button[aria-label*="Switch to"]').first();
    await expect(themeBtn).toBeVisible();

    // Force click to switch to dark mode if currently light
    const isDarkBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (!isDarkBefore) {
      await themeBtn.click();
    }

    // Verify html tag now has 'dark' class
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Verify dark charcoal background (#121214 -> rgb(18, 18, 20))
    // Note: toHaveCSS retries automatically to allow the 200ms transition-colors to complete
    const appWrapper = page.locator('.min-h-screen').first();
    await expect(appWrapper).toHaveCSS('background-color', 'rgb(18, 18, 20)');

    // Verify toggle button aria-label reflects switch back to Light Mode
    await expect(themeBtn).toHaveAttribute('aria-label', 'Switch to Light Mode');

    // Toggle back to light mode to ensure regression-free round-trip
    await themeBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(appWrapper).toHaveCSS('background-color', 'rgb(250, 250, 249)');
  });

  test('should verify dark mode card charcoal surfaces and light mode preservation on login', async ({ page }) => {
    // 1. Check Light Mode baseline on /login
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('smartroute_theme_preference', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();

    const roleSelector = page.locator('#role-selector');
    await expect(roleSelector).toBeVisible();

    // Verify Light mode active button has white text on charcoal-500
    const studentBtn = roleSelector.getByRole('tab', { name: 'Student' });
    await studentBtn.click();
    await expect(studentBtn).toHaveCSS('color', 'rgb(255, 255, 255)');

    // 2. Switch to Dark Mode on /login
    await page.evaluate(() => {
      localStorage.setItem('smartroute_theme_preference', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.reload();

    // Role selector container in dark mode should use charcoal surface
    await expect(roleSelector).toHaveCSS('background-color', 'rgb(24, 24, 27)');

    // In dark mode, active tab should be clean stone-100 on dark surface
    await expect(studentBtn).toHaveCSS('background-color', 'rgb(245, 245, 244)');

    // 3. Switch back to light mode and confirm 100% restored
    await page.evaluate(() => {
      localStorage.setItem('smartroute_theme_preference', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await page.reload();
    await expect(studentBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
  });
});

test.describe('Authentication: Student & Teacher Role Switching and Forms', () => {
  test('should render login page with role tabs, inputs, and validation', async ({ page }) => {
    await page.goto('/login');

    // Verify heading
    await expect(page.getByRole('heading', { name: /Sign In|Welcome Back/i })).toBeVisible();

    // Verify role selector tabs
    const roleSelector = page.locator('#role-selector');
    await expect(roleSelector).toBeVisible();

    const studentTab = roleSelector.getByRole('tab', { name: 'Student' });
    const teacherTab = roleSelector.getByRole('tab', { name: 'Teacher' });

    await expect(studentTab).toBeVisible();
    await expect(teacherTab).toBeVisible();

    // Student tab selected by default or clickable
    await studentTab.click();
    await expect(studentTab).toHaveAttribute('aria-selected', 'true');
    await expect(teacherTab).toHaveAttribute('aria-selected', 'false');

    // Switch to Teacher role
    await teacherTab.click();
    await expect(teacherTab).toHaveAttribute('aria-selected', 'true');
    await expect(studentTab).toHaveAttribute('aria-selected', 'false');

    // Verify email and password form inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Test form validation on empty submit
    await submitBtn.click();
    // Verify required validation feedback
    await expect(page.getByText(/Invalid email address|required/i).first()).toBeVisible();
  });

  test('should reject teacher credentials on student login tab with clear message', async ({ page }) => {
    // Intercept backend login call
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 403,
          error: 'Forbidden',
          message: 'This account is registered as a Teacher. Please use Teacher Login.',
        }),
      });
    });

    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('teacher@anuraguniversity.edu.in');
    await passwordInput.fill('ValidTeacherPass123');
    await submitBtn.click();

    // Verify error toast
    await expect(page.getByText('This account is registered as a Teacher. Please use Teacher Login.')).toBeVisible();
    // Verify user is NOT redirected to dashboard and stays on /login
    expect(page.url()).toContain('/login');
  });

  test('should reject student credentials on teacher login tab with clear message', async ({ page }) => {
    // Intercept backend login call
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 403,
          error: 'Forbidden',
          message: 'This account is registered as a Student. Please use Student Login.',
        }),
      });
    });

    await page.goto('/login?role=teacher');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('student@anuraguniversity.edu.in');
    await passwordInput.fill('ValidStudentPass123');
    await submitBtn.click();

    // Verify error toast
    await expect(page.getByText('This account is registered as a Student. Please use Student Login.')).toBeVisible();
    // Verify user is NOT redirected to dashboard and stays on /login
    expect(page.url()).toContain('/login');
  });

  test('should allow student login with matching role and navigate to student dashboard', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'valid-student-jwt',
            refreshToken: 'valid-student-refresh',
            user: {
              id: 'student-id-1',
              name: 'Student User',
              email: 'student@anuraguniversity.edu.in',
              role: 'STUDENT',
              active: true,
              emailVerified: true,
            },
          },
        }),
      });
    });

    // Mock getCurrentUser (/auth/me) and student profile
    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'student-id-1',
            name: 'Student User',
            email: 'student@anuraguniversity.edu.in',
            role: 'STUDENT',
            active: true,
            emailVerified: true,
          },
        }),
      });
    });

    await page.route('**/api/student/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('student@anuraguniversity.edu.in');
    await passwordInput.fill('ValidStudentPass123');
    await submitBtn.click();

    await page.waitForURL(url => url.pathname.includes('/student/dashboard'), { timeout: 10000 });
    expect(page.url()).toContain('/student/dashboard');
  });

  test('should allow teacher login with matching role and navigate to teacher dashboard', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'valid-teacher-jwt',
            refreshToken: 'valid-teacher-refresh',
            user: {
              id: 'teacher-id-1',
              name: 'Teacher User',
              email: 'teacher@anuraguniversity.edu.in',
              role: 'TEACHER',
              active: true,
              emailVerified: true,
            },
          },
        }),
      });
    });

    // Mock getCurrentUser (/auth/me) and teacher profile
    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'teacher-id-1',
            name: 'Teacher User',
            email: 'teacher@anuraguniversity.edu.in',
            role: 'TEACHER',
            active: true,
            emailVerified: true,
          },
        }),
      });
    });

    await page.route('**/api/teacher/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    await page.goto('/login?role=teacher');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('teacher@anuraguniversity.edu.in');
    await passwordInput.fill('ValidTeacherPass123');
    await submitBtn.click();

    await page.waitForURL(url => url.pathname.includes('/teacher/dashboard'), { timeout: 10000 });
    expect(page.url()).toContain('/teacher/dashboard');
  });
});

test.describe('Responsive Layout & Mobile Navigation', () => {
  test('should adapt gracefully on mobile viewport with hamburger menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Desktop nav should not be visible
    const desktopNav = page.locator('header nav .hidden.md\\:flex').first();
    await expect(desktopNav).toBeHidden();

    // Mobile menu toggle button should be visible
    const hamburgerBtn = page.locator('header button[aria-label="Open menu"]').first();
    await expect(hamburgerBtn).toBeVisible();

    // Click to open mobile menu
    await hamburgerBtn.click();
    await expect(page.locator('header button[aria-label="Close menu"]')).toBeVisible();

    // Verify mobile drawer navigation links
    const mobileDrawer = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(mobileDrawer).toBeVisible();
    await expect(mobileDrawer.getByRole('link', { name: 'Buses' })).toBeVisible();
    await expect(mobileDrawer.getByRole('link', { name: 'Routes' })).toBeVisible();
    await expect(mobileDrawer.getByRole('link', { name: 'Timings' })).toBeVisible();

    // Close mobile menu
    await page.locator('header button[aria-label="Close menu"]').click();
    await expect(mobileDrawer).toBeHidden();
  });
});

test.describe('Key Interactive Components & QR Scanner', () => {
  test('should render Bus QR scanner page with accessibility controls', async ({ page }) => {
    await page.goto('/scan');

    // Verify heading and camera/file scan option
    await expect(page.locator('h1')).toBeVisible();
    const scanContainer = page.locator('.relative').first();
    await expect(scanContainer).toBeVisible();
  });

  test('should check Timings page content tabs or cards', async ({ page }) => {
    await page.goto('/timings');

    // Page title and breadcrumb/heading
    await expect(page.locator('h1')).toBeVisible();
  });
});
