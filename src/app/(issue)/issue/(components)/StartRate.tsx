import { useStore } from "@/store"
import { toast } from "sonner"
import useSWRMutation from "swr/mutation"

import { feedbackFetcher } from "@/lib/api"

const StartRating = () => {
  const rating = useStore((state) => state.rating)
  const isReviewing = useStore((state) => state.isReviewing)
  const hoverRating = useStore((state) => state.hoverRating)
  const setRating = useStore((state) => state.setRating)
  const setHoverRating = useStore((state) => state.setHoverRating)
  const { trigger: feedbackTrigger, isMutating: isFeedbackMutating } =
    useSWRMutation(`v1/issues/feedback`, feedbackFetcher)

  const labels = [
    "Significantly Worse",
    "Worse",
    "Similar",
    "Better",
    "Significantly Better",
  ]

  const handleRating = async (rate: number) => {
    try {
      setRating(rate)
      // const score = rate * 20
      // const responseData = useStore.getState().responseData;
      // const feedback_result = await feedbackTrigger({
      //   request_id: "test-request_id",
      //   score,
      //   feedback: "",
      // })
      // toast("Scuess!")
    } catch (error) {
      toast.error("Error")
      setRating(0)
      setHoverRating(0)
    }
  }

  return (
    <div className="flex items-center justify-center  sm:justify-start">
      {labels.map((label, index) => (
        <button
          key={index}
          type="button"
          onMouseEnter={() => setHoverRating(index + 1)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => handleRating(index + 1)}
          className={`focus:outline-none ${isFeedbackMutating ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={isFeedbackMutating || isReviewing}
        >
          {isFeedbackMutating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-yellow-300"></div>
          ) : (
            <svg
              className={`me-1 h-4 w-4 ${
                (hoverRating || rating) > index
                  ? "text-yellow-300"
                  : "text-gray-300 dark:text-gray-500"
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
          )}
        </button>
      ))}

      <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
        {hoverRating || rating
          ? labels[(hoverRating || rating) - 1]
          : "No rating yet"}
      </p>
      {/* Please rate the quality of the output: */}
      {/* <span className="mx-2">Quality of output</span> */}
    </div>
  )
}

export default StartRating
