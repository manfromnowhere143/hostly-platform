// ═══════════════════════════════════════════════════════════════════════════════
// UI COMPONENTS - Barrel Export
// ═══════════════════════════════════════════════════════════════════════════════
// Single entry point for all UI components.
// Import: import { Button, Input, Card } from '@/components/ui'
// ═══════════════════════════════════════════════════════════════════════════════

// Button
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button'

// Input
export { Input, type InputProps, type InputSize } from './Input'

// Card
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardProps,
  type CardVariant,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
} from './Card'

// Badge
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from './Badge'

// Avatar
export { Avatar, type AvatarProps, type AvatarSize } from './Avatar'

// Skeleton
export {
  Skeleton,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  type SkeletonProps,
  type SkeletonVariant,
} from './Skeleton'

// Spinner
export {
  Spinner,
  PageSpinner,
  InlineSpinner,
  type SpinnerProps,
  type SpinnerSize,
  type SpinnerVariant,
} from './Spinner'

// Select
export { Select, type SelectProps, type SelectSize, type SelectOption } from './Select'

// Textarea
export { Textarea, type TextareaProps } from './Textarea'
