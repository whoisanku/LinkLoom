
import { type ReactNode, useState, type JSX } from 'react'
import { createPortal } from 'react-dom'

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
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleBackdropClick}>
          <div className="relative w-full max-w-md mx-4 max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-5 sm:p-6">{children}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Modal

