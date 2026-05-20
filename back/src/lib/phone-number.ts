const WHATSAPP_PREFIX = 'whatsapp:'
const BRAZIL_COUNTRY_CODE = '55'
const BRAZIL_AREA_CODE_LENGTH = 2
const BRAZIL_MOBILE_SUBSCRIBER_LENGTH_WITHOUT_NINTH_DIGIT = 8
const BRAZIL_NINTH_DIGIT = '9'

function normalizePhoneDigits(phoneNumber: string) {
  const withoutWhatsappPrefix = phoneNumber.toLowerCase().startsWith(WHATSAPP_PREFIX)
    ? phoneNumber.slice(WHATSAPP_PREFIX.length)
    : phoneNumber

  return withoutWhatsappPrefix.replace(/\D/g, '')
}

function addBrazilNinthDigitVariant(digits: string) {
  const nationalNumber = digits.slice(BRAZIL_COUNTRY_CODE.length)
  const expectedNationalLength =
    BRAZIL_AREA_CODE_LENGTH + BRAZIL_MOBILE_SUBSCRIBER_LENGTH_WITHOUT_NINTH_DIGIT

  if (
    !digits.startsWith(BRAZIL_COUNTRY_CODE) ||
    nationalNumber.length !== expectedNationalLength
  ) {
    return null
  }

  const areaCodeEnd = BRAZIL_COUNTRY_CODE.length + BRAZIL_AREA_CODE_LENGTH

  return `${digits.slice(0, areaCodeEnd)}${BRAZIL_NINTH_DIGIT}${digits.slice(areaCodeEnd)}`
}

function removeBrazilNinthDigitVariant(digits: string) {
  const nationalNumber = digits.slice(BRAZIL_COUNTRY_CODE.length)
  const expectedNationalLength =
    BRAZIL_AREA_CODE_LENGTH +
    BRAZIL_NINTH_DIGIT.length +
    BRAZIL_MOBILE_SUBSCRIBER_LENGTH_WITHOUT_NINTH_DIGIT
  const ninthDigitIndex = BRAZIL_COUNTRY_CODE.length + BRAZIL_AREA_CODE_LENGTH

  if (
    !digits.startsWith(BRAZIL_COUNTRY_CODE) ||
    nationalNumber.length !== expectedNationalLength ||
    digits[ninthDigitIndex] !== BRAZIL_NINTH_DIGIT
  ) {
    return null
  }

  return `${digits.slice(0, ninthDigitIndex)}${digits.slice(ninthDigitIndex + 1)}`
}

export function buildPhoneNumberLookupVariants(phoneNumber: string) {
  const digits = normalizePhoneDigits(phoneNumber)

  if (!digits) {
    return []
  }

  const digitVariants = new Set<string>([digits])
  const withNinthDigit = addBrazilNinthDigitVariant(digits)
  const withoutNinthDigit = removeBrazilNinthDigitVariant(digits)

  if (withNinthDigit) {
    digitVariants.add(withNinthDigit)
  }

  if (withoutNinthDigit) {
    digitVariants.add(withoutNinthDigit)
  }

  const lookupVariants = new Set<string>()

  for (const digitVariant of digitVariants) {
    lookupVariants.add(`+${digitVariant}`)
    lookupVariants.add(digitVariant)
  }

  return Array.from(lookupVariants)
}
