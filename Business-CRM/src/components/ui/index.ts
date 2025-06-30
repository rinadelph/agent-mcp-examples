import { cva, type VariantProps } from 'class-variance-authority'

// Basic components
export { default as Button } from './button.vue'
export { default as Input } from './input.vue'

// Card components
export { default as Card } from './card.vue'
export { default as CardContent } from './card-content.vue'
export { default as CardDescription } from './card-description.vue'
export { default as CardFooter } from './card-footer.vue'
export { default as CardHeader } from './card-header.vue'
export { default as CardTitle } from './card-title.vue'

// Dialog components
export { default as Dialog } from './dialog.vue'
export { default as DialogContent } from './dialog-content.vue'
export { default as DialogDescription } from './dialog-description.vue'
export { default as DialogFooter } from './dialog-footer.vue'
export { default as DialogHeader } from './dialog-header.vue'
export { default as DialogTitle } from './dialog-title.vue'
export { default as DialogTrigger } from './dialog-trigger.vue'

// Sheet components
export { default as Sheet } from './sheet.vue'
export { default as SheetContent } from './sheet-content.vue'
export { default as SheetDescription } from './sheet-description.vue'
export { default as SheetFooter } from './sheet-footer.vue'
export { default as SheetHeader } from './sheet-header.vue'
export { default as SheetTitle } from './sheet-title.vue'
export { default as SheetTrigger } from './sheet-trigger.vue'

// Table components
export { default as Table } from './table.vue'
export { default as TableBody } from './table-body.vue'
export { default as TableCaption } from './table-caption.vue'
export { default as TableCell } from './table-cell.vue'
export { default as TableHead } from './table-head.vue'
export { default as TableHeader } from './table-header.vue'
export { default as TableRow } from './table-row.vue'

// Dropdown Menu components
export { default as DropdownMenu } from './dropdown-menu.vue'
export { default as DropdownMenuContent } from './dropdown-menu-content.vue'
export { default as DropdownMenuItem } from './dropdown-menu-item.vue'
export { default as DropdownMenuLabel } from './dropdown-menu-label.vue'
export { default as DropdownMenuSeparator } from './dropdown-menu-separator.vue'
export { default as DropdownMenuTrigger } from './dropdown-menu-trigger.vue'

// Form components
export { default as Form } from './form.vue'
export { default as FormDescription } from './form-description.vue'
export { default as FormField } from './form-field.vue'
export { default as FormItem } from './form-item.vue'
export { default as FormLabel } from './form-label.vue'
export { default as FormMessage } from './form-message.vue'

// Tabs components
export { default as Tabs } from './tabs.vue'
export { default as TabsContent } from './tabs-content.vue'
export { default as TabsList } from './tabs-list.vue'
export { default as TabsTrigger } from './tabs-trigger.vue'

// Alert Dialog components
export { default as AlertDialog } from './alert-dialog.vue'
export { default as AlertDialogAction } from './alert-dialog-action.vue'
export { default as AlertDialogCancel } from './alert-dialog-cancel.vue'
export { default as AlertDialogContent } from './alert-dialog-content.vue'
export { default as AlertDialogDescription } from './alert-dialog-description.vue'
export { default as AlertDialogFooter } from './alert-dialog-footer.vue'
export { default as AlertDialogHeader } from './alert-dialog-header.vue'
export { default as AlertDialogTitle } from './alert-dialog-title.vue'
export { default as AlertDialogTrigger } from './alert-dialog-trigger.vue'

// Carousel components
export { default as Carousel } from './carousel.vue'
export { default as CarouselItem } from './carousel-item.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-blue-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>