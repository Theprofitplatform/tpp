import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => {
    return !data.draft;
  });

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) =>
    b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );

  return rss({
    title: 'The Profit Platform Blog',
    description: 'Digital marketing insights, SEO strategies, and growth tactics for Sydney businesses',
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author === 'Avi' ? 'avi@theprofitplatform.com.au (Avi)' : 'team@theprofitplatform.com.au (TPP Team)',
    })),
    customData: `<language>en-AU</language>
    <copyright>Copyright ${new Date().getFullYear()} The Profit Platform</copyright>
    <managingEditor>avi@theprofitplatform.com.au (Avi)</managingEditor>
    <webMaster>team@theprofitplatform.com.au (TPP Team)</webMaster>
    <ttl>60</ttl>
    <image>
      <url>https://theprofitplatform.com.au/logo.png</url>
      <title>The Profit Platform Blog</title>
      <link>https://theprofitplatform.com.au/blog</link>
    </image>`,
  });
}
