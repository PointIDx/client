import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ClassValue } from '@/interfaces/utility-types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
