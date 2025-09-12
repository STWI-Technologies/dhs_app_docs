const puppeteer = require('puppeteer');

async function takeScreenshotAndDebug() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1200, height: 800 });
  
  // Listen for console messages
  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Listen for failed requests
  page.on('requestfailed', request => {
    console.log('FAILED REQUEST:', request.url(), request.failure()?.errorText);
  });
  
  try {
    console.log('Navigating to http://localhost:51848...');
    await page.goto('http://localhost:51848', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if React content is present
    const rootContent = await page.$eval('#root', el => el.innerHTML.length > 0);
    console.log('Root element has content:', rootContent);
    
    // Check if loading fallback is still visible
    const loadingVisible = await page.$eval('#loading-fallback', 
      el => getComputedStyle(el).display !== 'none'
    ).catch(() => false);
    console.log('Loading fallback still visible:', loadingVisible);
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'debug-screenshot.png',
      fullPage: true 
    });
    console.log('Screenshot saved as debug-screenshot.png');
    
    // Get some basic page info
    const bodyText = await page.$eval('body', el => el.textContent.slice(0, 200));
    console.log('Body text preview:', bodyText);
    
  } catch (error) {
    console.log('ERROR:', error.message);
    
    // Try to take a screenshot even if there's an error
    try {
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('Error screenshot saved as error-screenshot.png');
    } catch (screenshotError) {
      console.log('Could not take error screenshot:', screenshotError.message);
    }
  }
  
  await browser.close();
}

takeScreenshotAndDebug().catch(console.error);