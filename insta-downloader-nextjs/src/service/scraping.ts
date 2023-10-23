import puppeteer, { Browser, Page } from 'puppeteer';
// const fetch = require('node-fetch');
import fetch from 'node-fetch';

class Timer {
  #startTime: number;
  #endTime: number;

  constructor() {
    this.#startTime = 0;
    this.#endTime = 0;
  }

  start() {
    this.#startTime = new Date().getTime();
  }

  end() {
    this.#endTime = new Date().getTime();
  }

  printSec(description: string) {
    console.log(`${description}: \x1b[34m${((this.#endTime - this.#startTime) / 1000).toFixed(2)}s\x1b[0m`);
  }
}

let browser: Browser | null;
let page: Page | null;
let isWorking: boolean = false;

async function getBrowserPage() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  }
  if (!page) {
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'ping', 'json', 'fetch', 'manifest', 'other'].includes(req.resourceType())) {
        req.abort();
      } else {
        // console.log(`\x1b[33m${req.resourceType()}\x1b[0m:`);

        req.continue();
      }
    });
  }
  return page;
}

// 정기적인 브라우저 리셋 로직 (예: 매 시간마다)
const clearBrowser = async () => {
  if (isWorking) {
    setTimeout(clearBrowser, 1000 * 60); // 1분 후에 다시 시도
  } else {
    if (page) {
      await page.close();
      page = null;
    }
    if (browser) {
      await browser.close();
      browser = null;
    }
  }
};
// setInterval(clearBrowser, 1000 * 60 * 60); // 1시간마다. 안꺼보겠습니다.


export async function scrap(url: string): Promise<any> {
  isWorking = true;
  const timer = new Timer();
  let browser = null;
  let page = null;

  if (process.env.NODE_ENV === 'development') { // dev일떄는 직접 브라우저를 열어서 작업
    // [[[ start puppeteer launch ]]]
    timer.start();
    browser = await puppeteer.launch({
      headless: "new", args: ['--no-sandbox', '--lang=ko-KR']
    });
    // --no-sandbox 를 추가해야 docker에서 동작한다
    // root 사용자로 실행되는 docker 컨테이너이기 때문에 문제가 발생함 <- 보안 문제가 발생할 수는 있음
    // 신뢰할 수 있는 사이트만 접근해야함
    timer.end();
    timer.printSec('puppeteer launch');

    // [[[ start new page ]]]
    timer.start();
    page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'ping', 'json', 'fetch', 'manifest', 'other'].includes(req.resourceType())) {
        req.abort();
      } else {
        // console.log(`\x1b[33m${req.resourceType()}\x1b[0m:`);

        req.continue();
      }
    });
    timer.end();
    timer.printSec('open new page');
  } else {
    timer.start();
    page = await getBrowserPage();
    timer.end();
    timer.printSec('open new page');
  }


  // [[[ start page goto ]]]
  timer.start();
  // 인스타그램의 게시물 URL로 이동
  await page.goto(url, { waitUntil: 'domcontentloaded' }); // DOM만 다운받고 바로 진행함. 어차피 밑에서 Selector로 대기하기 때문에
  try {
    await page.waitForSelector("div[role='button'] img", { visible: true, timeout: 10000 });
    // await page.waitForTimeout(4000);
  } catch (error) {
    console.error("The image did not load within the specified timeout.");
  }
  timer.end();
  timer.printSec('page goto');

  // [[[ start page evaluate ]]]
  timer.start();
  const mainImgsSet = new Set<string>();
  const nextButton = await page.$('button[aria-label="Next"]');
  while (true) {
    const isMultiArticle = nextButton !== null;
    // "style" 속성이 있는 img 요소의 src 가져오기
    const imgSrcs = await page.$$eval("div[role='button'] img", // 사진을 넘겨도 이 dom은 변경되지 않음 
      imgs =>
        imgs
          .filter(img => img.hasAttribute('style'))
          .map(img => img.src)
    );

    if (imgSrcs.length === 0) {
      break; // 이미지가 없으면 루프 종료
    }

    imgSrcs.forEach(imgSrc => mainImgsSet.add(imgSrc));

    // 첫 번째 이미지의 src를 사용하여 페이지 컨텍스트에서 더 많은 작업 수행
    if (isMultiArticle) {
      try {
        await nextButton.click(); // 위에서 찾은 button을 클릭합니다.
        // await page.waitForTimeout(50); // 클릭 후에 페이지가 로드될 시간을 기다립니다. 실제 시간은 조정이 필요할 수 있습니다.
        // 없어도 잘 동작한다..? 그래도 만일을 위해 남겨둡니다.  
      } catch (error) {
        break;
      }
    } else {
      break;
    }
  }
  timer.end();
  timer.printSec('page evaluate');
  if (process.env.NODE_ENV === 'development' && browser) {
    await browser.close(); // 브라우저 닫기
  }
  // await page.close(); // 페이지 닫기
  const mainImgSrcs = Array.from(mainImgsSet);

  // [[[ start encode images ]]]
  // 이미지를 Base64로 인코딩
  timer.start();
  const imagesBase64 = await Promise.all(
    mainImgSrcs.map(async (imgSrc) => {
      const response = await fetch(imgSrc);
      const arrBuf = await response.arrayBuffer();
      const contentType = response.headers.get('Content-Type');
      const base64String = Buffer.from(arrBuf).toString('base64');
      return `data:${contentType};base64,` + base64String; // 이미지를 Base64로 인코딩
    })
  );
  timer.end();
  timer.printSec('encode images');

  isWorking = false;
  return imagesBase64;
};