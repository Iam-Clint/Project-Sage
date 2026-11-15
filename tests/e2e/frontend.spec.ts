import { expect, test, type Page } from '@playwright/test'

const authBase = 'https://ep-sweet-cake-b9w516p7.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth/'
const storageKey = 'sage-learning-v1-demo'

test.beforeEach(async ({ context }) => {
  await context.route(`${authBase}**`, async route => {
    const origin=route.request().headers().origin || 'http://localhost:5180'
    const headers={'access-control-allow-origin':origin,'access-control-allow-credentials':'true','access-control-allow-headers':'content-type,neon-client-info','access-control-allow-methods':'GET,POST,OPTIONS'}
    const request=route.request()
    if(request.method()==='OPTIONS') return route.fulfill({status:204,headers})
    if(new URL(request.url()).pathname.endsWith('/sign-in/email')) return route.fulfill({status:401,headers,contentType:'application/json',body:JSON.stringify({code:'INVALID_EMAIL_OR_PASSWORD',message:'Invalid email or password'})})
    return route.fulfill({status:200,headers,contentType:'application/json',body:'null'})
  })
})

async function enterDemo(page: Page, path='/app') {
  await page.goto('/login', {waitUntil:'domcontentloaded'})
  await page.getByRole('button',{name:'Explore the demo',exact:true}).click()
  await page.locator('.app-content h1').waitFor()
  if(path!=='/app') await page.goto(path, {waitUntil:'domcontentloaded'})
  await page.locator('.app-content h1').waitFor()
}
async function stored(page: Page) { return page.evaluate(key=>JSON.parse(localStorage.getItem(key) || '{}').state,storageKey) }

test('direct topic practice uses the topic’s subject and records one checked answer', async ({page})=>{
  await enterDemo(page,'/app/practice?topic=biology-2')
  await expect(page.getByLabel('Choose a subject')).toHaveValue('biology')
  const beforeCount=(await stored(page))?.attempts.length ?? 18
  await page.getByRole('button',{name:'Let’s practise',exact:true}).click()
  await page.getByRole('radio').first().check({force:true})
  await page.getByRole('button',{name:'Check my answer',exact:true}).click()
  await expect(page.locator('.answer-feedback')).toBeVisible()
  const after=await stored(page)
  expect(after.attempts).toHaveLength(beforeCount+1)
  expect(after.attempts.at(-1).subjectId).toBe('biology')
  await page.getByRole('button',{name:'See how you did',exact:true}).click()
  await expect(page.getByRole('heading',{name:'That’s another step forward.'})).toBeVisible()
  await page.reload({waitUntil:'domcontentloaded'})
  expect((await stored(page)).attempts).toHaveLength(beforeCount+1)
})

test('planner validates blank titles, persists sessions, completes and removes them', async({page})=>{
  await enterDemo(page,'/app/planner?date=2026-02-31')
  const date=page.locator('.planner-toolbar input[type=date]')
  expect(await date.inputValue()).not.toBe('2026-02-31')
  await page.getByRole('button',{name:'Add study session',exact:true}).click()
  await page.getByLabel('Session title',{exact:true}).fill('   ')
  await page.getByRole('button',{name:'Save session',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('Add a session title')
  await page.getByLabel('Session title',{exact:true}).fill('Regression study session')
  await page.getByRole('button',{name:'Save session',exact:true}).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload({waitUntil:'domcontentloaded'})
  await expect(page.getByText('Regression study session',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Complete Regression study session',exact:true}).click()
  await expect(page.getByRole('button',{name:'Mark incomplete Regression study session',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button',{name:'Remove Regression study session',exact:true}).click()
  await expect(page.getByText('Regression study session',{exact:true})).toHaveCount(0)
})

test('malformed persisted rows do not crash the workspace and bookmarks persist', async({page})=>{
  await enterDemo(page,'/app/subjects')
  await page.getByRole('button',{name:'Save Photosynthesis',exact:true}).click()
  await page.reload({waitUntil:'domcontentloaded'})
  await expect(page.getByRole('button',{name:'Unsave Photosynthesis',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.evaluate(key=>{
    const data=JSON.parse(localStorage.getItem(key)!)
    data.state.plans.push({id:'bad',title:'Broken time',date:data.state.plans[0].date,minutes:20})
    data.state.attempts.push({id:'bad',seconds:-1,correct:true,date:'2026-11-15'})
    localStorage.setItem(key,JSON.stringify(data))
  },storageKey)
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/app/planner', {waitUntil:'domcontentloaded'})
  await expect(page.locator('.app-content h1')).toBeVisible()
  await expect(page.getByText('Broken time',{exact:true})).toHaveCount(0)
  expect(errors).toEqual([])
})

test('protected routes redirect, login errors recover, and reset requires its email token', async({page})=>{
  await page.goto('/app/progress', {waitUntil:'domcontentloaded'})
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Email address',{exact:true}).fill('student@example.com')
  await page.locator('input[name=password]').fill('wrong-password')
  await page.getByRole('button',{name:'Sign in',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('Invalid email or password')
  await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeEnabled()
  await page.getByRole('link', {name:'Create an account', exact:true}).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByLabel('Your name', {exact:true}).fill('   ')
  await page.getByLabel('Email address', {exact:true}).fill('student@example.com')
  await page.locator('input[name=password]').fill('valid-password')
  await page.getByRole('button', {name:'Create account', exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('Please add your name')
  await page.goto('/reset-password', {waitUntil:'domcontentloaded'})
  await page.locator('input[name=password]').fill('new-password')
  await page.getByRole('button',{name:'Update password',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('Open the password reset link')
  await expect(page.getByRole('button',{name:'Update password',exact:true})).toBeEnabled()
})

test('long learner names fit, theme persists, and a collapsed sidebar retains mobile labels', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('sage-theme')) localStorage.setItem('sage-theme', 'dark') })
  await page.route(`${authBase}**`, async route => {
    if (!new URL(route.request().url()).pathname.endsWith('/get-session')) return route.fallback()
    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': 'http://localhost:5180', 'access-control-allow-credentials': 'true' },
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'audit-learner', name: 'ChimamandaNgoziAdebayo'.repeat(6), email: `${'student'.repeat(8)}@example.com`, emailVerified: true },
        session: { id: 'audit-session', userId: 'audit-learner', token: 'mock-only', expiresAt: new Date(Date.now() + 3600000).toISOString() },
      }),
    })
  })
  await page.goto('/app', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.app-content h1')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440)

  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  expect(await page.evaluate(() => localStorage.getItem('sage-theme'))).toBe('light')
  await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click()
  await expect(page.locator('.app-shell')).toHaveClass(/sidebar-collapsed/)
  expect(await page.evaluate(() => localStorage.getItem('sage-sidebar-collapsed'))).toBe('true')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.app-content h1')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('.app-shell')).toHaveClass(/sidebar-collapsed/)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const subjectLink = page.locator('.mobile-navigation .main-navigation').getByRole('link', { name: 'My subjects', exact: true })
  await expect(subjectLink.locator('span').first()).toBeVisible()
  await subjectLink.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/app\/subjects$/)
  await expect(page.locator('.app-content h1')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
