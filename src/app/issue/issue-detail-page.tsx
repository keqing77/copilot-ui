"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useStore } from "@/store"
import { toast } from "sonner"
import useSWRMutation from "swr/mutation"

import { errorMapping, issueFetcher } from "@/lib/api"
import { issue_description, issue_title } from "@/lib/conts"
import { Button } from "@/components/ui/button"
import FeedbackDialog from "@/components/issue/feedbackDialog"
import LoadedArea from "@/components/issue/LoadedArea"
import LoadingTextarea from "@/components/issue/LoadingTextarea"
import PageTitle from "@/components/issue/PageTitle"
import RetryModal from "@/components/issue/RetryModal"
import StartRating from "@/components/issue/StartRate"
import TermsAndConditions from "@/components/issue/TermsAndCondition"
import TextareaWithCopy from "@/components/issue/TextareaWithCopy"

export function IssueDetailPage() {
  const {
    proposedIssueTitle,
    proposedIssueDescription,
    issueId,
    rated,
    isAcceptTAndC,
    responseData,
    isReviewing,
    setRetryModalOpen,
    setRetryCountDown,
    setIsReviewing,
    setProposedIssueTitle,
    setProposedIssueDescription,
    setResponseData,
    setIssueId,
    setRating,
    setRated,
    setError,
    setErrorCode,
    setErrorMessage,
    setAcceptTAndC,
    initializeIssue,
  } = useStore()
  const { trigger, isMutating } = useSWRMutation("/api/issue", issueFetcher)

  useEffect(() => {
    initializeIssue()
  }, [initializeIssue])

  useEffect(() => {
    return () => {
      toast.dismiss()
    }
  }, [])

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setProposedIssueTitle(value)
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setProposedIssueDescription(value)
  }

  const resetCheckStatus = () => {
    setRated(false)
    setRating(0)
    setAcceptTAndC(false)
  }

  async function handleReview(): Promise<void> {
    resetCheckStatus()
    setIsReviewing(true)

    try {
      const result = await trigger({
        issue_id: issueId || undefined,
        issue_title: proposedIssueTitle,
        issue_description: proposedIssueDescription,
      })

      if (result && result.data) {
        setResponseData(result)
        setIssueId(result.data.issue_id)
      }

      setRetryCountDown(
        (errorMapping[result.code]?.retryCountdown as number) ?? 5
      )

      if (result && result.status === "fail") {
        if (result.code === 4029) {
          const match = result.message.match(/(\d+)s/)
          let countdown = match ? parseInt(match[1], 10) : 10
          setRetryCountDown(countdown)
        }

        setError(errorMapping[result.code].error)
        setErrorCode(result.code)
        setErrorMessage(errorMapping[result.code].description)

        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("review issue error:", error)
      toast.error(`${error.message}`, {
        duration: Infinity,
        dismissible: true,
      })
      setRetryModalOpen(true)
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <section className="m-auto mt-8 p-8 sm:px-16">
      <PageTitle title={"Issue Creation"} />
      <TextareaWithCopy
        id={"title"}
        label={issue_title}
        rows={1}
        defaultValue={proposedIssueTitle}
        handleChange={handleTitleChange}
        className="mb-4 mt-2 min-h-8 bg-gray-100 dark:bg-zinc-700"
      />
      <TextareaWithCopy
        id={"description"}
        label={issue_description}
        rows={1}
        defaultValue={proposedIssueDescription}
        handleChange={handleDescriptionChange}
        className="mb-4 mt-2 min-h-64 bg-gray-100 dark:bg-zinc-700"
      />
      {isMutating ? (
        <LoadingTextarea />
      ) : (
        <LoadedArea
          isAcceptTAndC={isAcceptTAndC}
          rated={rated}
          responseData={responseData}
        />
      )}
      <StartRating />
      <TermsAndConditions
        isAcceptTAndC={isAcceptTAndC}
        isReviewing={isReviewing}
        setAcceptTAndC={setAcceptTAndC}
      />
      <div className="mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Button
          className="h-8 w-full"
          // disabled={!(isAcceptTAndC && rated) || isReviewing}
          onClick={handleReview}
        >
          {isReviewing ? "Reviewing..." : "Review Again"}
        </Button>
        <FeedbackDialog isLoading={isMutating} />
      </div>
      <RetryModal />
    </section>
  )
}
