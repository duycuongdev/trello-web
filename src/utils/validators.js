import i18n from '~/i18n'

// Một vài biểu thức chính quy - Regular Expression và custom message.
// Về Regular Expression khá hại não: https://viblo.asia/p/hoc-regular-expression-va-cuoc-doi-ban-se-bot-kho-updated-v22-Az45bnoO5xY
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/

// Liên quan đến Validate File
export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']
export const singleFileValidator = (file) => {
  if (!file || !file.name || !file.size || !file.type) {
    return i18n.t('validation.fileBlank')
  }
  if (file.size > LIMIT_COMMON_FILE_SIZE) {
    return i18n.t('validation.fileTooLarge')
  }
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.type)) {
    return i18n.t('validation.fileTypeInvalid')
  }
  return null
}