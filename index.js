const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Enable the Chrome DevTools Protocol
  const client = await page.target().createCDPSession();

  // Enable the network domain
  await client.send('Network.enable');
  await page.setDefaultNavigationTimeout(60000);

  // Listen for WebSocket events
  client.on('Network.webSocketCreated', ({ requestId, url }) => {
    console.log(`WebSocket created: ${url}`);
  });

  client.on('Network.webSocketClosed', ({ requestId, timestamp }) => {
    console.log(`WebSocket closed: ${timestamp}`);
  });

  client.on(
    'Network.webSocketFrameReceived',
    ({ requestId, timestamp, response }) => {
      // console.log(`WebSocket frame received:=> ${response.payloadData}`);
      let dataString = response.payloadData;
      try {
        dataString = JSON.parse(JSON.parse(dataString.replace(/^a\[/, '[')));
        dataString = JSON.parse(dataString.message.split('::')[1]);
        console.log('=>>>>', dataString);
        // let dataString = 'a["{\"message\":\"pid-1175152::{\\\"pid\\\":\\\"1175152\\\",\\\"last_dir\\\":\\\"redBg\\\",\\\"last_numeric\\\":39043.8,\\\"last\\\":\\\"39,043.8\\\",\\\"bid\\\":\\\"39,042.7\\\",\\\"ask\\\":\\\"39,044.9\\\",\\\"high\\\":\\\"39,122.4\\\",\\\"low\\\":\\\"38,848.6\\\",\\\"pc\\\":\\\"+47.4\\\",\\\"pcp\\\":\\\"+0.12%\\\",\\\"pc_col\\\":\\\"greenFont\\\",\\\"time\\\":\\\"20:12:42\\\",\\\"timestamp\\\":1709323962}\"}"]';

        const dataObject = {
          message: dataString,
        };
        console.log('=>>>>', dataObject.message.pid);
      } catch (error) {}
    }
  );

  // client.on(
  //   'Network.webSocketFrameSent',
  //   ({ requestId, timestamp, response }) => {
  //     console.log(`WebSocket frame sent: ${response.payloadData}`);
  //   }
  // );

  // Navigate to the website
  await page.goto(
    'https://www.investing.com/equities/apple-computer-inc-chart'
  );

  // Wait for some time to capture WebSocket traffic
  await page.waitForTimeout(10000);
  // Increase the navigation timeout

  await browser.close();
})();
