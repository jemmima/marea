import imageUrlBuilder from '@sanity/image-url'
import groq from 'groq'
import {NextSeo} from 'next-seo'
import React from 'react'

import client from '../client'
import Layout from '../components/Layout'
import RenderSections from '../components/RenderSections'
import {getSlugVariations, slugParamToPath} from '../utils/urls'

const pageFragment = groq`
...,
content[] {
  ...,
  cta {
    ...,
    route->
  },
  ctas[] {
    ...,
    route->
  }
}`

/**
 * Fetches data for our pages.
 *
 * The [[...slug]] name for this file is intentional - it means Next will run this getServerSideProps
 * for every page requested - /, /about, /contact, etc..
 * From the received params.slug, we're able to query Sanity for the route coresponding to the currently requested path.
 */
export const getServerSideProps = async ({locale, params}) => {
  const slug = slugParamToPath(params?.slug)
  let data

  // Frontpage - fetch the linked `frontpage` from the global configuration document.
  if (slug === '/') {
    data = await client
      .fetch(
        locale === 'no'
        ? groq`
      *[_id == "global-config__i18n_no"][0]{
        frontpage -> {
          ${pageFragment}
        }
      }
    `
        : groq`
      *[_id == "global-config"][0]{
        frontpage -> {
          ${pageFragment}
        }
      }
    `,
      )
      .then((res) => (res?.frontpage ? { ...res.frontpage, slug } : undefined));
  } else {
    // Regular route: fetch the document for the current locale
    data = await client
      .fetch(
        groq`
          *[_type == "route" && slug.current == $slug && __i18n_lang == $locale][0]{
            page-> {
              ${pageFragment}
            }
          }
        `,
        { slug, locale }
      )
      .then((res) => (res?.page ? { ...res.page, slug } : undefined));
  }

  if (!data?._type === 'page') {
    return {
      notFound: true,
    }
  }

  return {
    props: data || {},
  }
}

const builder = imageUrlBuilder(client)

const LandingPage = (props) => {
  const {
    title = 'Missing title',
    description,
    disallowRobots,
    openGraphImage,
    content = [],
    config = {},
    slug,
  } = props

  const openGraphImages = openGraphImage
    ? [
        {
          url: builder.image(openGraphImage).width(800).height(600).url(),
          width: 800,
          height: 600,
          alt: title,
        },
        {
          // Facebook recommended size
          url: builder.image(openGraphImage).width(1200).height(630).url(),
          width: 1200,
          height: 630,
          alt: title,
        },
        {
          // Square 1:1
          url: builder.image(openGraphImage).width(600).height(600).url(),
          width: 600,
          height: 600,
          alt: title,
        },
      ]
    : []

  return (
    <Layout config={config}>
      <NextSeo
        title={title}
        titleTemplate={`%s | ${config.title}`}
        description={description}
        canonical={config.url && `${config.url}/${slug}`}
        openGraph={{
          images: openGraphImages,
        }}
        noindex={disallowRobots}
      />
      {content && <RenderSections sections={content} />}
    </Layout>
  )
}

export default LandingPage
