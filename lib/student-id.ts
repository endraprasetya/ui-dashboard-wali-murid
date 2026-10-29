export const STUDENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isStudentId(value: string) {
  return STUDENT_ID_PATTERN.test(value)
}
