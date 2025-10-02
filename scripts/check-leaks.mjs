import { chromium } from 'playwright';

const baseUrl = 'https://06f6b696.tpp-new.pages.dev';
const pagesToCheck = ['index', 'web-design'];

const browser = await chromium.launch();

for (const pageName of pagesToCheck) {
  const page = await browser.newPage();
  const url = pageName === 'index' ? baseUrl : baseUrl + '/' + pageName;
  
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  const sections = await page.$$eval('section', elements => 
    elements.map((el, idx) => ({
      index: idx + 1,
      class: el.className,
      id: el.id,
      firstText: el.innerText.substring(0, 60).replace(/\n/g, ' ')
    }))
  );
  
  console.log('=== ' + pageName.toUpperCase() + ' PAGE SECTIONS ===\n');
  
  sections.forEach(s => {
    const isLeak = s.class.includes('hero-modern') || 
                   s.class.includes('trust-signals') || 
                   s.class.includes('services section');
    const marker = isLeak ? '⚠️  LEAK' : '   ';
    console.log(marker + ' ' + s.index + '. ' + s.class);
    if (isLeak) {
      console.log('       Text: ' + s.firstText);
    }
  });
  console.log('');
  
  await page.close();
}

await browser.close();
