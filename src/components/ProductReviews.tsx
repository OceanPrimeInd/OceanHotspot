"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Star,
  MessageCircle,
  Loader2,
  CheckCircle,
  ThumbsUp,
} from "lucide-react";

interface Review {
  id: string;
  buyer_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  seller_response: string | null;
}

interface Question {
  id: string;
  question: string;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
}

interface ProductReviewsProps {
  productId: string;
  sellerId: string;
  /** Inside product detail tab — hide outer section chrome */
  embedded?: boolean;
  /** When set, show only reviews or Q&A (no nested sub-tabs). */
  section?: "reviews" | "questions";
}

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const display = hover || rating;
  const iconClass = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const hitClass = size === "lg" ? "h-11 w-11" : "h-10 w-10";

  if (!interactive) {
    return (
      <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconClass} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => setHover(0)}
      role="group"
      aria-label="Select a star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={rating === star}
          onMouseEnter={() => setHover(star)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRate?.(star);
          }}
          className={`${hitClass} inline-flex items-center justify-center rounded-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary pointer-events-auto`}
        >
          <Star
            className={`${iconClass} pointer-events-none ${
              star <= display ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export const ProductReviews = ({
  productId,
  sellerId,
  embedded = false,
  section,
}: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "questions">("reviews");
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Question form
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const [reviewsResult, questionsResult] = await Promise.all([
        supabase
          .from("reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("product_questions")
          .select("*")
          .eq("product_id", productId)
          .eq("is_published", true)
          .not("answer", "is", null)
          .order("created_at", { ascending: false }),
      ]);

      if (reviewsResult.data) setReviews(reviewsResult.data);
      if (questionsResult.data) setQuestions(questionsResult.data);
      setLoading(false);
    };

    fetchData();
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast({ title: "Please log in to leave a review", variant: "destructive" });
      return;
    }

    if (reviewRating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setSubmittingReview(true);

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      seller_id: sellerId,
      buyer_id: user.id,
      rating: reviewRating,
      title: reviewTitle.trim() || null,
      content: reviewContent.trim() || null,
    });

    setSubmittingReview(false);

    if (error) {
      toast({ title: "Failed to submit review", variant: "destructive" });
      return;
    }

    toast({ title: "Review submitted! It will appear after moderation." });
    setShowReviewForm(false);
    setReviewRating(0);
    setReviewTitle("");
    setReviewContent("");
  };

  const handleSubmitQuestion = async () => {
    if (!user) {
      toast({ title: "Please log in to ask a question", variant: "destructive" });
      return;
    }

    if (!newQuestion.trim()) {
      toast({ title: "Please enter your question", variant: "destructive" });
      return;
    }

    setSubmittingQuestion(true);

    const { error } = await supabase.from("product_questions").insert({
      product_id: productId,
      asker_id: user.id,
      question: newQuestion.trim(),
    });

    setSubmittingQuestion(false);

    if (error) {
      toast({ title: "Failed to submit question", variant: "destructive" });
      return;
    }

    toast({ title: "Question submitted! The seller will be notified." });
    setNewQuestion("");
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const showReviews = !section || section === "reviews";
  const showQuestions = !section || section === "questions";
  const reviewsActive = section ? section === "reviews" : activeTab === "reviews";
  const questionsActive = section ? section === "questions" : activeTab === "questions";

  const reviewsPanel = (
        <div className="space-y-6">
          {/* Summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-3xl font-bold text-headline">{averageRating}</div>
              <div>
                <StarRating rating={Math.round(Number(averageRating))} />
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {!showReviewForm && (
            <Button variant="outline" onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}

          {showReviewForm && (
            <div className="relative z-10 rounded-lg border border-border p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Write your review</h3>
                {reviews.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>
                    Hide
                  </Button>
                )}
              </div>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Select a rating below, then{" "}
                  <Link href="/login" className="font-medium text-primary underline">
                    log in
                  </Link>{" "}
                  to submit.
                </p>
              )}
              <div className="space-y-2">
                <Label>Rating *</Label>
                <StarRating rating={reviewRating} onRate={setReviewRating} interactive size="lg" />
              </div>
              <div className="space-y-2">
                <Label>Title (Optional)</Label>
                <Input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                />
              </div>
              <div className="space-y-2">
                <Label>Review</Label>
                <Textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewRating === 0}
                >
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Review
                </Button>
                {reviews.length > 0 && (
                  <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">
              No published reviews yet — yours can be the first after moderation.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold mb-1">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {review.seller_response && (
                    <div className="mt-3 pl-4 border-l-2 border-primary">
                      <p className="text-xs font-semibold text-primary mb-1">Seller Response</p>
                      <p className="text-sm">{review.seller_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
  );

  const questionsPanel = (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-headline">Q&amp;A</h2>
          {!user && (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary underline">
                Log in
              </Link>{" "}
              to ask a question about this product.
            </p>
          )}
          {/* Ask Question Form */}
          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Have a question? Ask here..."
              className="flex-1"
            />
            <Button
              onClick={handleSubmitQuestion}
              disabled={submittingQuestion || !newQuestion.trim()}
            >
              {submittingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
            </Button>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No questions yet. Be the first to ask!
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-semibold text-primary">Q:</span>
                    <p className="font-medium">{q.question}</p>
                  </div>
                  {q.answer && (
                    <div className="flex items-start gap-2 pl-4 mt-2">
                      <span className="font-semibold text-green-600">A:</span>
                      <p className="text-muted-foreground">{q.answer}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 pl-4">
                    Answered{" "}
                    {q.answered_at &&
                      new Date(q.answered_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
  );

  return (
    <div className={embedded ? "" : "mt-12 border-t border-border pt-8"}>
      {!section && (
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 -mb-px transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" />
            Reviews ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-2 pb-3 px-1 border-b-2 -mb-px transition-colors ${
              activeTab === "questions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Q&amp;A ({questions.length})
          </button>
        </div>
      )}

      {showReviews && reviewsActive && (
        <>
          {section === "reviews" && (
            <h2 className="text-lg font-semibold text-headline mb-4">Reviews</h2>
          )}
          {reviewsPanel}
        </>
      )}
      {showQuestions && questionsActive && questionsPanel}
    </div>
  );
};

export default ProductReviews;
