import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import type { TIntroducer, TTarget } from '../type/data'
import { useIntroducer } from '../hooks/useIntroducer'

interface RequestIntroductionModalProps {
  introducer: TIntroducer
  target: TTarget
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const RequestIntroductionModal = ({
  introducer,
  target,
  trigger,
  open,
  onOpenChange,
}: RequestIntroductionModalProps) => {
  const { addConnection } = useIntroducer()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add the connection
    addConnection(introducer.id, target.id)

    setIsSubmitting(false)
    setSubmitted(true)

    // Close modal after 1.5 seconds
    setTimeout(() => {
      onOpenChange?.(false)
      setSubmitted(false)
      setMessage('')
    }, 1500)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange?.(false)
      setSubmitted(false)
      setMessage('')
    }
  }

  if (submitted) {
    return (
      <Modal trigger={trigger} open={open} onOpenChange={onOpenChange}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Request Sent!</h3>
          <p className="text-sm text-gray-400 text-center">
            Your introduction request has been sent successfully.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal trigger={trigger} open={open} onOpenChange={handleClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white">Request Introduction</h2>
          <p className="text-sm text-gray-400 mt-2">
            Send a request to connect with this target through an introducer
          </p>
        </div>

        {/* Introduction Details */}
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">INTRODUCER</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">{introducer.username}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {introducer.connections.length} connections · Score: {introducer.score}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">TARGET</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-white">{target.username}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Score: {target.score}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-1">Relevance</div>
              <div className="text-sm text-gray-300">{target.relevance}</div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
              placeholder="Add a personal message to your introduction request..."
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </div>
          </div>

          {/* Why This Connection Section */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-200 mb-1">
                  Why this introduction?
                </div>
                <div className="text-xs text-blue-300">
                  {introducer.username} has {introducer.connections.length} connections and a score
                  of {introducer.score}, making them a strong introducer for {target.username}.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default RequestIntroductionModal
