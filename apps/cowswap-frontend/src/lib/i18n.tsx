import { ReactNode, useEffect } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'
import { isLinguiInternationalizationEnabled } from '@cowprotocol/common-utils'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

/**
 * Loads and activates the default locale (en-ES) for the application.
 *
 * This sets up the i18n instance with an empty message catalog for the default locale,
 * ensuring that translation keys are used as fallbacks when no translations are available.
 */
const loadDefaultLocale = (): void => {
  i18n.load(DEFAULT_LOCALE, {})
  i18n.activate(DEFAULT_LOCALE)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function dynamicActivate(locale: SupportedLocale) {
  try {
    if (!isLinguiInternationalizationEnabled) {
      loadDefaultLocale()
      return
    }

    const catalog = await import(`../locales/${locale}.po`)

    // Bundlers will either export it as default or as a named export named default.
    i18n.load(locale, catalog.messages || catalog.default.messages)
    i18n.activate(locale)
  } catch (error) {
    // Do nothing
    console.error('Could not load locale file: ' + locale, error)
  }
}

interface ProviderProps {
  children: ReactNode
  locale: SupportedLocale
  onActivate?: (locale: SupportedLocale) => void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Provider({ locale, onActivate, children }: ProviderProps) {
  useEffect(() => {
    dynamicActivate(locale)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale, onActivate])

  // Initialize the locale immediately if it is DEFAULT_LOCALE, so that keys are shown while the translation messages load.
  // This renders the translation _keys_, not the translation _messages_, which is only acceptable while loading the DEFAULT_LOCALE,
  // as [there are no "default" messages](https://github.com/lingui/js-lingui/issues/388#issuecomment-497779030).
  // See https://github.com/lingui/js-lingui/issues/1194#issuecomment-1068488619.
  if (i18n.locale === undefined && locale === DEFAULT_LOCALE) {
    loadDefaultLocale()
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
