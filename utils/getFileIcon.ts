import { IconPrefix, IconName } from '@fortawesome/fontawesome-common-types'

const icons: { [key: string]: [IconPrefix, IconName] } = {
  image: ['far', 'file-image'],
  pdf: ['far', 'file-pdf'],
  word: ['far', 'file-word'],
  powerpoint: ['far', 'file-powerpoint'],
  excel: ['far', 'file-excel'],
  audio: ['far', 'file-audio'],
  video: ['far', 'file-video'],
  archive: ['far', 'file-archive'],
  code: ['far', 'file-code'],
  text: ['far', 'file-alt'],
  file: ['far', 'file'],
  markdown: ['fab', 'markdown'],
  book: ['fas', 'book'],
}

const extensions = {
  gif: icons.image,
  jpeg: icons.image,
  jpg: icons.image,
  png: icons.image,
  heic: icons.image,
  webp: icons.image,

  pdf: icons.pdf,

  doc: icons.word,
  docx: icons.word,

  ppt: icons.powerpoint,
  pptx: icons.powerpoint,

  xls: icons.excel,
  xlsx: icons.excel,

  aac: icons.audio,
  mp3: icons.audio,
  ogg: icons.audio,
  flac: icons.audio,
  oga: icons.audio,
  opus: icons.audio,
  m4a: icons.audio,

  avi: icons.video,
  flv: icons.video,
  mkv: icons.video,
  mp4: icons.video,
  mov: icons.video,

  '7z': icons.archive,
  bz2: icons.archive,
  xz: icons.archive,
  wim: icons.archive,
  gz: icons.archive,
  rar: icons.archive,
  tar: icons.archive,
  zip: icons.archive,

  css: icons.code,
  py: icons.code,
  html: icons.code,
  js: icons.code,
  ts: icons.code,
  c: icons.code,
  rb: icons.code,
  cpp: icons.code,

  txt: icons.text,
  rtf: icons.text,
  md: icons.markdown,

  epub: icons.book,
  mobi: icons.book,
  azw3: icons.book,
}

/**
 * To stop TypeScript complaining about indexing the object with a non-existent key
 * https://dev.to/mapleleaf/indexing-objects-in-typescript-1cgi
 *
 * @param obj Object with keys to index
 * @param key The index key
 * @returns Whether or not the key exists inside the object
 */
export const hasKey = <O>(obj: O, key: PropertyKey): key is keyof O => {
  return key in obj
}

export const getExtension = (fileName: string) => {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

export const getFileIcon = (fileName: string) => {
  const extension = getExtension(fileName)
  return hasKey(extensions, extension) ? extensions[extension] : icons.file
}
