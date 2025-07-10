import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { badgeVariants } from '@/components/ui/badge'
import { alertVariants } from '@/components/ui/alert'

export type ButtonVariants = VariantProps<typeof buttonVariants>
export type BadgeVariants = VariantProps<typeof badgeVariants>
export type AlertVariants = VariantProps<typeof alertVariants>
