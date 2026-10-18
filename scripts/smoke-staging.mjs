const targets = [
  ['http://127.0.0.1:4000/api/v1/health/live', value => value?.status === 'ok'],
  ['http://127.0.0.1:4000/api/v1/health/ready', value => value?.status === 'ok'],
  ['http://127.0.0.1:3000/health', value => value?.status === 'ok'],
  ['http://127.0.0.1:3001/health', value => value?.status === 'ok'],
];
for (const [url, valid] of targets) {
  let success = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok && valid(await response.json())) { success = true; break; }
    } catch { /* application is starting */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!success) throw new Error(`Staging smoke failed: ${url}`);
  console.log(`PASS ${url}`);
}
