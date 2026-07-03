const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Click the HR Administrator gateway button
  const hrBtn = await page.$x("//button[contains(., 'HR Administrator')]");
  if (hrBtn.length) await hrBtn[0].click();
  await page.waitForTimeout(500);

  // Try to toggle to Register mode if 'Register' text exists
  const registerToggle = await page.$x("//button[contains(., 'Register') or contains(., 'Create')]");
  if (registerToggle.length) {
    await registerToggle[0].click();
    await page.waitForTimeout(300);
  }

  const now = Date.now();
  const testEmail = `test-hr-${now}@mspl.local`;
  const testPass = 'TestPass123!';

  const emailInput = await page.$x("//input[@type='email' or contains(@placeholder,'email') or contains(@aria-label,'email')]");
  const pwdInput = await page.$x("//input[@type='password' or contains(@placeholder,'password') or contains(@aria-label,'password')]");

  if (!emailInput.length || !pwdInput.length) {
    console.error('Email or password input not found');
    await browser.close();
    process.exit(1);
  }

  await emailInput[0].focus();
  await page.keyboard.type(testEmail);
  await pwdInput[0].focus();
  await page.keyboard.type(testPass);

  let submitBtn = await page.$x("//button[contains(., 'Register') or contains(., 'Sign up') or contains(., 'Create')]");
  if (!submitBtn.length) submitBtn = await page.$x("//button[@type='submit']");
  if (!submitBtn.length) {
    console.error('Submit button not found');
    await browser.close();
    process.exit(1);
  }

  await submitBtn[0].click();
  await page.waitForTimeout(1500);

  // Switch to Login mode if necessary
  const loginToggle = await page.$x("//button[contains(., 'Login') or contains(., 'Sign in')]");
  if (loginToggle.length) {
    await loginToggle[0].click();
    await page.waitForTimeout(500);
  }

  const emailInput2 = await page.$x("//input[@type='email' or contains(@placeholder,'email') or contains(@aria-label,'email')]");
  const pwdInput2 = await page.$x("//input[@type='password' or contains(@placeholder,'password') or contains(@aria-label,'password')]");
  await emailInput2[0].click({ clickCount: 3 });
  await page.keyboard.type(testEmail);
  await pwdInput2[0].click({ clickCount: 3 });
  await page.keyboard.type(testPass);

  let loginBtn = await page.$x("//button[contains(., 'Login') or contains(., 'Sign in') or contains(., 'Sign In') or contains(., 'Sign-in')]");
  if (!loginBtn.length) loginBtn = await page.$x("//button[@type='submit']");
  await loginBtn[0].click();

  await page.waitForTimeout(2000);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('--- PAGE BODY TEXT ---');
  console.log(bodyText.slice(0, 2000));

  await browser.close();
})();
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Click the HR Administrator gateway button
  const hrBtn = await page.$x("//button[contains(., 'HR Administrator')]");
  if (hrBtn.length) await hrBtn[0].click();
  await page.waitForTimeout(500);

  // Try to toggle to Register mode if 'Register' text exists
  const registerToggle = await page.$x("//button[contains(., 'Register') or contains(., 'Create')]");
  if (registerToggle.length) {
    await registerToggle[0].click();
    await page.waitForTimeout(300);
  }

  const now = Date.now();
  const testEmail = `test-hr-${now}@mspl.local`;
  const testPass = 'TestPass123!';

  const emailInput = await page.$x("//input[@type='email' or contains(@placeholder,'email') or contains(@aria-label,'email')]");
  const pwdInput = await page.$x("//input[@type='password' or contains(@placeholder,'password') or contains(@aria-label,'password')]");

  if (!emailInput.length || !pwdInput.length) {
    console.error('Email or password input not found');
    await browser.close();
    process.exit(1);
  }

  await emailInput[0].focus();
  await page.keyboard.type(testEmail);
  await pwdInput[0].focus();
  await page.keyboard.type(testPass);

  let submitBtn = await page.$x("//button[contains(., 'Register') or contains(., 'Sign up') or contains(., 'Create')]");
  if (!submitBtn.length) submitBtn = await page.$x("//button[@type='submit']");
  if (!submitBtn.length) {
    console.error('Submit button not found');
    await browser.close();
    process.exit(1);
  }

  await submitBtn[0].click();
  await page.waitForTimeout(1500);

  // Switch to Login mode if necessary
  const loginToggle = await page.$x("//button[contains(., 'Login') or contains(., 'Sign in')]");
  if (loginToggle.length) {
    await loginToggle[0].click();
    await page.waitForTimeout(500);
  }

  const emailInput2 = await page.$x("//input[@type='email' or contains(@placeholder,'email') or contains(@aria-label,'email')]");
  const pwdInput2 = await page.$x("//input[@type='password' or contains(@placeholder,'password') or contains(@aria-label,'password')]");
  await emailInput2[0].click({ clickCount: 3 });
  await page.keyboard.type(testEmail);
  await pwdInput2[0].click({ clickCount: 3 });
  await page.keyboard.type(testPass);

  let loginBtn = await page.$x("//button[contains(., 'Login') or contains(., 'Sign in') or contains(., 'Sign In') or contains(., 'Sign-in')]");
  if (!loginBtn.length) loginBtn = await page.$x("//button[@type='submit']");
  await loginBtn[0].click();

  await page.waitForTimeout(2000);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('--- PAGE BODY TEXT ---');
  console.log(bodyText.slice(0, 2000));

  await browser.close();
})();
