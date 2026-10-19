import { readFileSync } from 'node:fs'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { STATUS_LABEL } from '@/features/orders/status'
import { renderApp, money } from '@/test/render'
import { en } from './en'

const switchToEnglish = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(await screen.findByRole('button', { name: 'Cambiar idioma a English' }))

describe('language selector', () => {
  it('should_switch_header_home_and_catalog_to_english_and_set_the_html_lang', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/')

    expect(await screen.findByText('Explorar la tienda')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('es')

    await switchToEnglish(user)

    expect(document.documentElement.lang).toBe('en')
    expect(await screen.findByText('Explore the shop')).toBeInTheDocument()
    expect(screen.queryByText('Explorar la tienda')).not.toBeInTheDocument()
    const banner = within(screen.getByRole('banner'))
    expect(banner.getByRole('link', { name: 'Shop' })).toBeInTheDocument()
    expect(banner.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(banner.getByRole('link', { name: 'Cart, 0 items' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch language to Español' })).toBeInTheDocument()
    expect(await screen.findAllByRole('button', { name: /^Add .+ to cart$/ })).not.toHaveLength(0)

    await router.navigate('/productos')
    expect(await screen.findByLabelText('Sort by')).toBeInTheDocument()
    expect(screen.getByLabelText('Search by name')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Shop' })).toBeInTheDocument()
    // los datos del api no se traducen
    expect(await screen.findByText('Monstera Deliciosa')).toBeInTheDocument()
  })

  it('should_remember_the_chosen_language_after_reloading', async () => {
    const user = userEvent.setup()
    const first = renderApp('/')
    await switchToEnglish(user)
    expect(window.localStorage.getItem('bloom.lang')).toBe('en')
    first.unmount()

    renderApp('/')

    expect(await screen.findByText('Explore the shop')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('should_keep_prices_in_colombian_pesos_in_english', async () => {
    const user = userEvent.setup()
    renderApp('/productos')
    await switchToEnglish(user)

    expect(await screen.findByText(money(45.9))).toBeInTheDocument()
    expect(screen.getByText('4 products')).toBeInTheDocument()
  })

  it('should_show_validation_errors_in_english', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    await switchToEnglish(user)

    await user.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter your email')).toBeInTheDocument()
    expect(screen.getByText('Enter your password')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})

describe('translations outside t() literals', () => {
  it('should_translate_every_order_status_label', () => {
    for (const label of Object.values(STATUS_LABEL)) expect(en[label], label).toBeTruthy()
  })

  it('should_translate_every_validation_message_of_the_zod_schemas', () => {
    const files = ['src/features/auth/schemas.ts', 'src/features/admin/productSchema.ts']
    const messages = files.flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/'([^'\n]+)'/g)]
        .map((match) => match[1])
        .filter((text) => text.includes(' ')),
    )
    expect(messages.length).toBeGreaterThan(15)
    for (const message of messages) expect(en[message], message).toBeTruthy()
  })
})
