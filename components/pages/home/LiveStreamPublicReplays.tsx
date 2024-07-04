import React, { useEffect, useRef, useState } from 'react'
import {
  Post,
  PublicationMetadataMainFocusType,
  PublicationType,
  usePublications
} from '@lens-protocol/react-web'
import HomeVideoCard from '../../common/HomeVideoCard'
import LoadingVideoCard from '../../ui/LoadingVideoCard'
import { useStreamReplayPublications } from '../../../utils/hooks/useStreamReplayPublications'
import { usePublicationsStore } from '../../store/usePublications'
import { Button, IconButton } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import useIsMobile from '../../../utils/hooks/useIsMobile'
import { useStreamersWithProfiles } from '../../store/useStreamersWithProfiles'
import useInnerWidth from '../../../utils/hooks/useInnerWidth'
import { useIsVerifiedQuery } from '../../../graphql/generated'
import { APP_ID } from '../../../utils/config'
import { CATEGORIES } from '../../../utils/categories'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import clsx from 'clsx'
import StreamCard from './StreamCard'
const HomePageCards = () => {
  const [showShowMoreButton, setShowShowMoreButton] = useState(true)
  const [showAll, setShowAll] = React.useState(false)
  const publications = usePublicationsStore((state) => state.publications)
  const width = useInnerWidth()
  const [selectedCategory, setSelectedCategory] = React.useState(CATEGORIES[0])
  const streamReplayPublication = usePublicationsStore(
    (state) => state.streamReplayPublication
  )
  const {
    profiles,
    loading: profilesLoading,
    streamersWithProfiles
  } = useStreamersWithProfiles((state) => {
    return {
      profiles: state.profilesFromPublicReplays,
      loading: state.loading,
      streamersWithProfiles: state.streamersWithProfiles
    }
  })

  const profilesMap = new Map(profiles?.map((p) => [p?.id, p]))

  const isMobile = useIsMobile()

  const publicationsMap = new Map(publications?.map((p) => [p?.id, p]))

  const renderLoadingCards = () => {
    // Create an array of 8 elements and map over it
    return Array(8)
      .fill(null)
      .map((_, i) => <LoadingVideoCard key={i} />)
  }

  const filteredPublications =
    streamReplayPublication?.streamReplayPublications?.filter((p) => {
      const post = p?.publicationId
        ? // @ts-ignore
          publicationsMap.get(p?.publicationId)
        : null

      if (p?.publicationId && !post) return false

      if (selectedCategory?.tags?.length > 0) {
        return (
          post?.__typename === 'Post' &&
          post?.metadata?.tags?.some((tag) =>
            selectedCategory?.tags?.includes(tag)
          )
        )
      }

      return true
    })

  // for clips

  const { data, loading } = usePublications({
    where: {
      publicationTypes: [PublicationType.Post, PublicationType.Quote],
      metadata: {
        mainContentFocus: [
          PublicationMetadataMainFocusType.ShortVideo,
          PublicationMetadataMainFocusType.Video
        ],
        // @ts-ignore
        publishedOn: [APP_ID],
        tags:
          selectedCategory?.tags?.length > 0
            ? {
                oneOf: [selectedCategory?.tags[0]]
              }
            : undefined
      }
    }
  })

  const { data: isVerified } = useIsVerifiedQuery({
    variables: {
      profileIds: data?.map((p) => p.by?.id)
    }
  })

  const verifiedMap = new Map(
    isVerified?.isVerified?.map((v) => [v?.profileId, v?.isVerified ?? false])
  )

  // add type streamClips to data
  const streamClips =
    data?.map((post) => {
      return {
        ...post,
        type: 'streamClips'
      }
    }) ?? []

  const streamReplays =
    filteredPublications?.map((post) => {
      return {
        ...post,
        type: 'streamReplays'
      }
    }) ?? []

  const combinedData = [...streamReplays, ...streamClips].sort(
    (a, b) =>
      new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime()
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [isOverflowingLeft, setIsOverflowingLeft] = useState(false)
  const [isOverflowingRight, setIsOverflowingRight] = useState(false)

  const checkOverflow = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current

      setIsOverflowingLeft(scrollLeft > 0)
      setIsOverflowingRight(scrollLeft + clientWidth + 3 < scrollWidth)
    }
  }

  useEffect(() => {
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [])

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -600, behavior: 'smooth' })
      checkOverflow()
    }
  }

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 600, behavior: 'smooth' })
      checkOverflow()
    }
  }

  const lengthToShow = isMobile ? 9 : width < 1536 ? 12 : 16

  useEffect(() => {
    if (combinedData?.length <= lengthToShow) {
      setShowShowMoreButton(false)
    } else {
      setShowShowMoreButton(true)
    }
  }, [combinedData])

  return (
    <>
      {/* categories row  */}
      <div className="relative w-full overflow-x-hidden">
        {isOverflowingLeft && !isMobile && (
          <div className="absolute left-0 bg-p-bg z-10 px-1 -mt-0.5">
            <IconButton onClick={scrollLeft} size="medium">
              <ChevronLeftIcon fontSize="medium" />
            </IconButton>
          </div>
        )}
        <div
          className="sm:w-[calc(100vw-300px)] no-scrollbar overflow-y-auto flex flex-row items-center gap-x-3 gap-y-2 mb-4 px-2"
          ref={containerRef}
          style={{
            scrollBehavior: 'smooth'
          }}
          onScroll={checkOverflow}
        >
          {CATEGORIES.map((category) => (
            <button
              key={category?.name}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                'flex-shrink-0 cursor-pointer border-none py-1.5 px-3 sm:py-2 sm:px-4 font-semibold text-sm outline-none shadow-sm transition duration-300 ease-in-out transform rounded-md ',
                selectedCategory?.name === category?.name
                  ? 'bg-p-text text-p-bg'
                  : 'bg-p-bg sm:bg-s-bg text-p-text hover:bg-p-hover'
              )}
            >
              {category?.name === 'None' ? 'All' : category?.name}
            </button>
          ))}
        </div>
        {isOverflowingRight && !isMobile && (
          <div className="absolute top-0 right-0 bg-p-bg z-10 px-1 -mt-0.5">
            <IconButton onClick={scrollRight} size="medium">
              <ChevronRightIcon fontSize="medium" />
            </IconButton>
          </div>
        )}
      </div>

      {/* @ts-ignore */}
      <div className="flex flex-row flex-wrap w-full gap-y-6">
        {selectedCategory?.name === 'None' &&
          streamersWithProfiles?.map((streamer) => {
            return <StreamCard key={streamer?.profileId} streamer={streamer} />
          })}
        {!loading &&
        !profilesLoading &&
        streamReplayPublication?.streamReplayPublications &&
        streamReplayPublication?.streamReplayPublications?.length > 0 &&
        combinedData &&
        combinedData?.length > 0
          ? combinedData
              ?.slice(0, showAll ? combinedData?.length : lengthToShow)
              ?.map((post) => {
                if (post?.type === 'streamClips') {
                  return (
                    <HomeVideoCard
                      // @ts-ignore
                      premium={verifiedMap.get(post?.by?.id)}
                      // @ts-ignore
                      key={post?.id}
                      post={post as Post}
                    />
                  )
                }

                // @ts-ignore
                const publication = post?.publicationId
                  ? // @ts-ignore
                    publicationsMap.get(post?.publicationId)
                  : null
                return (
                  <HomeVideoCard
                    // @ts-ignore
                    cover={post?.thumbnail}
                    // @ts-ignore
                    duration={post?.sourceSegmentsDuration}
                    // @ts-ignore
                    premium={!!post?.premium}
                    // @ts-ignore
                    key={publication?.id ?? post?.sessionId}
                    post={publication as Post}
                    // @ts-ignore
                    session={
                      publication
                        ? undefined
                        : {
                            createdAt: post?.createdAt!,
                            // @ts-ignore
                            sessionId: post?.sessionId!,
                            profile: profilesMap.get(
                              // @ts-ignore
                              post?.profileId
                            )
                          }
                    }
                  />
                )
              })
          : renderLoadingCards()}

        {!showAll && showShowMoreButton && (
          <div className="w-full centered-row -mt-4">
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              variant="text"
              autoCapitalize=""
              onClick={() => setShowAll(true)}
              sx={{ textTransform: 'none' }}
            >
              Show more
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

const ProfilesHomeCards = ({ profileId }: { profileId: string }) => {
  const { loading, publications, streamReplayPublication } =
    useStreamReplayPublications({
      profileId: profileId
    })

  const streamReplayMap = new Map(
    streamReplayPublication?.streamReplayPublications?.map((p) => [
      p?.publicationId,
      p
    ])
  )

  return (
    <>
      {/* @ts-ignore */}
      {publications?.length > 0 ? (
        <div className="flex flex-row flex-wrap w-full gap-y-6">
          {publications?.map((post) => {
            return (
              <HomeVideoCard
                // @ts-ignore
                cover={streamReplayMap.get(post?.id)?.thumbnail}
                // @ts-ignore
                duration={streamReplayMap.get(post?.id)?.sourceSegmentsDuration}
                premium={!!streamReplayMap.get(post?.id)?.premium}
                key={post?.id}
                post={post as Post}
              />
            )
          })}
        </div>
      ) : (
        <>{loading && <LoadingVideoCard />}</>
      )}
    </>
  )
}

const LiveStreamPublicReplays = ({ profileId }: { profileId?: string }) => {
  const isMobile = useIsMobile()
  return (
    <div className="w-full">
      {!isMobile && profileId && (
        <div className="text-p-text leading-5 font-bold text-2xl py-2 px-2 mb-2 sm:mb-4">
          Past Streams
        </div>
      )}

      {profileId ? (
        <ProfilesHomeCards profileId={profileId} />
      ) : (
        <HomePageCards />
      )}
    </div>
  )
}

export default LiveStreamPublicReplays
