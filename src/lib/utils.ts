import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const inputClass =
  'block w-full rounded-md border-0 py-1.5 ' +
  'bg-surface text-text-base ' +
  'shadow-sm ring-1 ring-inset ring-border ' +
  'placeholder:text-text-muted ' +
  'focus:ring-2 focus:ring-inset focus:ring-primary ' +
  'sm:text-sm sm:leading-6';

export const buttonPrimaryClass =
  'flex w-full justify-center rounded-md ' +
  'bg-primary hover:bg-primary-hover ' +
  'px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-primary transition-colors';

