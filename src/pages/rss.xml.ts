import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => {
    return !data.draft;
  });

  const sortedPosts = blog.sort((a, b) => {
    const dateA = a.data.publishDate || a.data.pubDate;
    const dateB = b.data.publishDate || b.data.pubDate;
    return dateB.valueOf() - dateA.valueOf();
  });

  return rss({
    title: 'The Profit Platform Blog',
    description: 'Digital marketing tips, strategies, and insights for Sydney businesses. Expert advice on SEO, Google Ads, web design, and growth tactics.',
    site: context.site || 'https://theprofitplatform.com.au',
    items: sortedPosts.map((post) => {
      const pubDate = post.data.publishDate || post.data.pubDate || new Date();
      return {
        title: post.data.title,
        pubDate: pubDate,
        description: post.data.description,
        link: `/blog/${post.slug}/`,
        categories: [post.data.category, ...(post.data.tags || [])],
        author: post.data.author,
      };
    }),
    customData: `<language>en-au</language>`,
    stylesheet: '/rss-styles.xsl',
  });
}
