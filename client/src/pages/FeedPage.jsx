import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";

export default function FeedPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/posts/feed?page=${pageParam}&limit=8`);
      return data;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const observerRef = useRef(null);
  const sentinelRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const posts = data?.pages.flatMap((p) => p.posts) || [];

  return (
    <div className="max-w-xl mx-auto pt-4 px-2 md:px-0">
      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="text-center text-gray-400 mt-20">
          No posts yet. Follow people or create your first post!
        </p>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={() => refetch()} />
      ))}

      <div ref={sentinelRef} />
      {isFetchingNextPage && <PostSkeleton />}
    </div>
  );
}
