
import { type ReactNode, useState, type JSX } from 'react'

export interface ModalType {
  trigger: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Modal = ({ trigger, children, open: controlledOpen, onOpenChange }: ModalType): JSX.Element => {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  const handleClose = () => handleOpenChange(false)
  const handleOpen = () => handleOpenChange(true)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <>
      <div onClick={handleOpen}>{trigger}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={handleBackdropClick}>
          <div className="relative bg-modal-background rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default Modal

