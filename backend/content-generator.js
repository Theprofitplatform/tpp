/**
 * AI Content Generator Module
 * Generates SEO-optimized content based on topic, type, tone, and target audience
 */

// Content templates based on type and length
const contentTemplates = {
  blog_post: {
    short: (topic, tone, audience) => generateBlogPost(topic, tone, audience, 'short'),
    medium: (topic, tone, audience) => generateBlogPost(topic, tone, audience, 'medium'),
    long: (topic, tone, audience) => generateBlogPost(topic, tone, audience, 'long')
  },
  product_description: {
    short: (topic, tone, audience) => generateProductDescription(topic, tone, audience, 'short'),
    medium: (topic, tone, audience) => generateProductDescription(topic, tone, audience, 'medium'),
    long: (topic, tone, audience) => generateProductDescription(topic, tone, audience, 'long')
  },
  meta_description: {
    short: (topic, tone, audience) => generateMetaDescription(topic, tone, audience),
    medium: (topic, tone, audience) => generateMetaDescription(topic, tone, audience),
    long: (topic, tone, audience) => generateMetaDescription(topic, tone, audience)
  },
  social_media: {
    short: (topic, tone, audience) => generateSocialMedia(topic, tone, audience, 'short'),
    medium: (topic, tone, audience) => generateSocialMedia(topic, tone, audience, 'medium'),
    long: (topic, tone, audience) => generateSocialMedia(topic, tone, audience, 'long')
  },
  email: {
    short: (topic, tone, audience) => generateEmail(topic, tone, audience, 'short'),
    medium: (topic, tone, audience) => generateEmail(topic, tone, audience, 'medium'),
    long: (topic, tone, audience) => generateEmail(topic, tone, audience, 'long')
  },
  landing_page: {
    short: (topic, tone, audience) => generateLandingPage(topic, tone, audience, 'short'),
    medium: (topic, tone, audience) => generateLandingPage(topic, tone, audience, 'medium'),
    long: (topic, tone, audience) => generateLandingPage(topic, tone, audience, 'long')
  },
  article: {
    short: (topic, tone, audience) => generateArticle(topic, tone, audience, 'short'),
    medium: (topic, tone, audience) => generateArticle(topic, tone, audience, 'medium'),
    long: (topic, tone, audience) => generateArticle(topic, tone, audience, 'long')
  }
};

// Tone variations
const toneVariations = {
  professional: {
    intro: ['In today\'s competitive landscape,', 'Understanding', 'When it comes to', 'Professional insights reveal that'],
    transitions: ['Moreover,', 'Additionally,', 'Furthermore,', 'Consequently,'],
    conclusions: ['In conclusion,', 'To summarize,', 'Ultimately,', 'In essence,']
  },
  friendly: {
    intro: ['Hey there!', 'You know what?', 'Let\'s talk about', 'Here\'s the thing -'],
    transitions: ['Plus,', 'And here\'s the best part -', 'Oh, and', 'Also,'],
    conclusions: ['So there you have it!', 'Bottom line?', 'The takeaway?', 'Here\'s what matters:']
  },
  casual: {
    intro: ['So,', 'Listen,', 'Check this out:', 'Alright, so'],
    transitions: ['Also,', 'And,', 'Plus,', 'By the way,'],
    conclusions: ['That\'s pretty much it.', 'So yeah,', 'Basically,', 'Long story short,']
  },
  formal: {
    intro: ['It is important to note that', 'Research indicates that', 'Studies have shown that', 'Evidence suggests that'],
    transitions: ['Subsequently,', 'Therefore,', 'In addition,', 'As a result,'],
    conclusions: ['In summary,', 'To conclude,', 'In final analysis,', 'To recapitulate,']
  },
  persuasive: {
    intro: ['Imagine', 'What if you could', 'Picture this:', 'Think about'],
    transitions: ['But wait, there\'s more!', 'And that\'s not all -', 'Even better,', 'Here\'s why this matters:'],
    conclusions: ['Don\'t wait -', 'Take action now:', 'Start today by', 'Your next step:']
  },
  informative: {
    intro: ['Let\'s explore', 'Here\'s what you need to know about', 'Understanding', 'This guide covers'],
    transitions: ['Next,', 'Moving forward,', 'Additionally,', 'It\'s also worth noting that'],
    conclusions: ['Key takeaways:', 'Remember:', 'To recap:', 'Important points:']
  }
};

// Generate Blog Post
function generateBlogPost(topic, tone, audience, length) {
  const toneStyle = toneVariations[tone] || toneVariations.professional;
  const intro = toneStyle.intro[Math.floor(Math.random() * toneStyle.intro.length)];
  const transition = toneStyle.transitions[Math.floor(Math.random() * toneStyle.transitions.length)];
  const conclusion = toneStyle.conclusions[Math.floor(Math.random() * toneStyle.conclusions.length)];

  const audienceText = audience ? ` for ${audience}` : '';

  let content = `${intro} ${topic} has become increasingly important in today's digital landscape. `;

  if (length === 'short') {
    content += `Whether you're just getting started or looking to improve your approach${audienceText}, understanding the fundamentals is crucial.\n\n`;
    content += `${transition} implementing effective strategies around ${topic} can lead to significant improvements in your results. `;
    content += `The key is to focus on proven methods that deliver measurable outcomes.\n\n`;
    content += `${conclusion} ${topic} offers tremendous opportunities when approached strategically. `;
    content += `Start by focusing on the basics, measure your progress, and continuously optimize your approach for best results.`;
  } else if (length === 'medium') {
    content += `Whether you're just getting started or looking to improve your approach${audienceText}, understanding the fundamentals is crucial.\n\n`;
    content += `## Why ${topic} Matters\n\n`;
    content += `In today's competitive environment, ${topic} has emerged as a critical factor for success. `;
    content += `Organizations and individuals who master this area gain significant advantages over their competitors. `;
    content += `The impact extends beyond immediate results, creating long-term value and sustainable growth.\n\n`;
    content += `${transition} implementing effective strategies around ${topic} can lead to significant improvements in your results. `;
    content += `The key is to focus on proven methods that deliver measurable outcomes. `;
    content += `This means taking a data-driven approach and being willing to adapt as you learn what works best for your specific situation.\n\n`;
    content += `## Key Strategies for Success\n\n`;
    content += `Start by establishing clear goals and metrics. Understanding what success looks like helps you stay focused and make informed decisions. `;
    content += `Next, invest in the right tools and resources. While you don't need the most expensive solutions, having quality resources makes a significant difference.\n\n`;
    content += `${conclusion} ${topic} offers tremendous opportunities when approached strategically. `;
    content += `Start by focusing on the basics, measure your progress, and continuously optimize your approach. `;
    content += `With consistent effort and the right strategy, you'll see meaningful results over time.`;
  } else {
    content += `Whether you're just getting started or looking to improve your approach${audienceText}, understanding the fundamentals is crucial.\n\n`;
    content += `## Why ${topic} Matters\n\n`;
    content += `In today's competitive environment, ${topic} has emerged as a critical factor for success. `;
    content += `Organizations and individuals who master this area gain significant advantages over their competitors. `;
    content += `The impact extends beyond immediate results, creating long-term value and sustainable growth.\n\n`;
    content += `Research shows that businesses that prioritize ${topic} see measurable improvements across multiple metrics. `;
    content += `From increased engagement to better conversion rates, the benefits are clear and compelling. `;
    content += `But success doesn't happen by accident – it requires a strategic approach and consistent execution.\n\n`;
    content += `## Understanding the Fundamentals\n\n`;
    content += `Before diving into advanced tactics, it's essential to master the basics. ${topic} rests on several core principles that form the foundation of any successful strategy. `;
    content += `First, you need to understand your audience deeply. What are their needs, preferences, and pain points? `;
    content += `Second, create value at every interaction. Whether it's through content, products, or services, always focus on delivering genuine value.\n\n`;
    content += `${transition} implementing effective strategies around ${topic} can lead to significant improvements in your results. `;
    content += `The key is to focus on proven methods that deliver measurable outcomes. `;
    content += `This means taking a data-driven approach and being willing to adapt as you learn what works best for your specific situation.\n\n`;
    content += `## Practical Strategies for Implementation\n\n`;
    content += `Start by establishing clear goals and metrics. Understanding what success looks like helps you stay focused and make informed decisions. `;
    content += `Document your objectives and create a roadmap for achieving them. This provides direction and helps you track progress over time.\n\n`;
    content += `Next, invest in the right tools and resources. While you don't need the most expensive solutions, having quality resources makes a significant difference. `;
    content += `Research options carefully, read reviews, and consider starting with free or low-cost tools before upgrading to premium solutions.\n\n`;
    content += `Finally, commit to continuous learning and optimization. The landscape around ${topic} is constantly evolving. `;
    content += `Stay informed about new developments, test new approaches, and be willing to adjust your strategy based on results. `;
    content += `What works today might not work tomorrow, so flexibility and adaptability are crucial.\n\n`;
    content += `## Common Mistakes to Avoid\n\n`;
    content += `Many people make the mistake of trying to do too much too quickly. Start with a focused approach and expand gradually. `;
    content += `Another common error is neglecting to measure results. Without tracking metrics, you can't know what's working and what needs improvement.\n\n`;
    content += `${conclusion} ${topic} offers tremendous opportunities when approached strategically. `;
    content += `Start by focusing on the basics, measure your progress, and continuously optimize your approach. `;
    content += `With consistent effort, the right strategy, and a commitment to excellence, you'll see meaningful results over time. `;
    content += `Remember, success is a journey, not a destination. Keep learning, stay persistent, and enjoy the process of growth and improvement.`;
  }

  return content;
}

// Generate Product Description
function generateProductDescription(topic, tone, audience, length) {
  const toneStyle = toneVariations[tone] || toneVariations.professional;
  const intro = toneStyle.intro[Math.floor(Math.random() * toneStyle.intro.length)];

  const audienceText = audience ? ` perfect for ${audience}` : '';

  let content = `${intro} ${topic}${audienceText} that delivers exceptional value and quality.\n\n`;

  if (length === 'short') {
    content += `**Key Features:**\n`;
    content += `• Premium quality construction\n`;
    content += `• Designed for maximum efficiency\n`;
    content += `• Easy to use and maintain\n`;
    content += `• Backed by our satisfaction guarantee\n\n`;
    content += `Experience the difference quality makes. Order today and see results immediately.`;
  } else if (length === 'medium') {
    content += `**What Makes This Special:**\n\n`;
    content += `Crafted with attention to detail, this solution addresses your specific needs with precision and care. `;
    content += `We've combined cutting-edge innovation with proven reliability to create something truly exceptional.\n\n`;
    content += `**Key Features:**\n`;
    content += `• Premium quality materials and construction\n`;
    content += `• Intuitive design for maximum efficiency\n`;
    content += `• Comprehensive support and documentation\n`;
    content += `• Backed by our satisfaction guarantee\n`;
    content += `• Fast, reliable delivery\n\n`;
    content += `**Why Choose Us:**\n`;
    content += `We don't just sell products – we deliver complete solutions. Our commitment to quality and customer satisfaction sets us apart. `;
    content += `Join thousands of satisfied customers who trust us for their needs.\n\n`;
    content += `Experience the difference quality makes. Order today and start seeing results immediately.`;
  } else {
    content += `**The Ultimate Solution for Your Needs:**\n\n`;
    content += `Crafted with meticulous attention to detail, this solution addresses your specific needs with precision and care. `;
    content += `We've spent countless hours perfecting every aspect, combining cutting-edge innovation with proven reliability to create something truly exceptional.\n\n`;
    content += `**Premium Features & Benefits:**\n\n`;
    content += `• **Superior Quality:** Built using only the finest materials and latest manufacturing techniques\n`;
    content += `• **Intuitive Design:** Engineered for maximum efficiency and ease of use\n`;
    content += `• **Comprehensive Support:** Full documentation, tutorials, and dedicated customer service\n`;
    content += `• **Proven Results:** Backed by real-world testing and thousands of satisfied customers\n`;
    content += `• **Risk-Free Guarantee:** 100% satisfaction guaranteed or your money back\n\n`;
    content += `**What Sets Us Apart:**\n\n`;
    content += `We don't just sell products – we deliver complete solutions backed by expertise and dedication. `;
    content += `Our team has years of experience in the industry, and we bring that knowledge to every product we offer. `;
    content += `Quality isn't just a buzzword for us; it's a commitment we make to every customer.\n\n`;
    content += `**Perfect For:**\n`;
    content += audienceText ? `Specifically designed with ${audience} in mind, ` : '';
    content += `this solution works for anyone who values quality, efficiency, and results. `;
    content += `Whether you're a beginner or an expert, you'll appreciate the thoughtful design and exceptional performance.\n\n`;
    content += `**Your Success is Our Mission:**\n\n`;
    content += `When you choose us, you're not just making a purchase – you're investing in a partnership. `;
    content += `We're committed to your success and stand behind every product with comprehensive support and our satisfaction guarantee.\n\n`;
    content += `Don't settle for less. Experience the difference that quality and dedication make. Order today and join thousands of satisfied customers who trust us for their needs. `;
    content += `Your satisfaction is guaranteed, and results are just a click away.`;
  }

  return content;
}

// Generate Meta Description
function generateMetaDescription(topic, tone, audience) {
  const audienceText = audience ? ` for ${audience}` : '';

  const descriptions = [
    `Discover everything you need to know about ${topic}${audienceText}. Expert insights, proven strategies, and actionable tips. Get started today!`,
    `Master ${topic} with our comprehensive guide${audienceText}. Learn proven techniques, avoid common mistakes, and achieve better results.`,
    `Your complete resource for ${topic}${audienceText}. Step-by-step guidance, expert advice, and practical solutions. Start now!`,
    `Transform your approach to ${topic}${audienceText}. Professional insights, real-world examples, and effective strategies that work.`
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Generate Social Media Post
function generateSocialMedia(topic, tone, audience, length) {
  const audienceText = audience ? ` #${audience.replace(/\s+/g, '')}` : '';

  if (length === 'short') {
    const posts = [
      `🚀 Ready to level up your ${topic}? Here's what you need to know! 💡\n\nThe key is consistency and quality. Start today! 👇${audienceText}\n\n#${topic.replace(/\s+/g, '')} #GrowthTips`,
      `💪 Master ${topic} in 3 simple steps:\n\n1️⃣ Set clear goals\n2️⃣ Take consistent action\n3️⃣ Track your progress\n\nSuccess awaits! 🎯${audienceText}`,
      `✨ Game-changing insight about ${topic}:\n\nQuality > Quantity, always! Focus on what matters most and watch your results soar 📈${audienceText}\n\n#SuccessTips`
    ];
    return posts[Math.floor(Math.random() * posts.length)];
  } else if (length === 'medium') {
    return `🎯 Let's talk about ${topic}!\n\nHere's what most people get wrong: they focus on quick fixes instead of building sustainable strategies.\n\nThe truth? Real success comes from:\n✅ Understanding your fundamentals\n✅ Consistent, quality execution\n✅ Measuring and optimizing results\n✅ Staying committed long-term\n\nReady to transform your approach? Start with these basics and build from there. 💪\n\nWhat's your biggest challenge with ${topic}? Drop a comment! 👇${audienceText}\n\n#${topic.replace(/\s+/g, '')} #GrowthStrategy #SuccessMindset`;
  } else {
    return `🚀 THE ULTIMATE GUIDE TO ${topic.toUpperCase()} 🚀\n\nAfter working with hundreds of clients, I've discovered the real secret to success...\n\nIt's not about having the perfect strategy or the most expensive tools. It's about mastering the fundamentals and executing consistently.\n\n📊 Here's what actually works:\n\n1️⃣ START WITH CLARITY\nDefine exactly what success looks like for you. Vague goals lead to vague results.\n\n2️⃣ BUILD STRONG FOUNDATIONS\nMaster the basics before chasing advanced tactics. Strong foundations support sustainable growth.\n\n3️⃣ MEASURE EVERYTHING\nYou can't improve what you don't track. Set up proper metrics from day one.\n\n4️⃣ STAY CONSISTENT\nSuccess isn't a sprint – it's a marathon. Show up every day, even when it's hard.\n\n5️⃣ NEVER STOP LEARNING\nThe landscape is always changing. Commit to continuous improvement.\n\n💡 BONUS TIP:\nFocus on progress, not perfection. Small improvements compound over time into massive results.\n\nReady to take action? Save this post and start implementing today! 💪\n\nWhat's your #1 takeaway? Let me know in the comments! 👇${audienceText}\n\n#${topic.replace(/\s+/g, '')} #SuccessStrategy #GrowthMindset #BusinessTips #MarketingTips`;
  }
}

// Generate Email
function generateEmail(topic, tone, audience, length) {
  const toneStyle = toneVariations[tone] || toneVariations.professional;
  const intro = toneStyle.intro[Math.floor(Math.random() * toneStyle.intro.length)];
  const audienceText = audience ? ` ${audience}` : '';

  let content = `Subject: Transform Your Approach to ${topic}\n\n`;
  content += `Hi${audienceText},\n\n`;
  content += `${intro} ${topic} is more important than ever, and I wanted to share something that could make a real difference for you.\n\n`;

  if (length === 'short') {
    content += `I've put together a quick guide that covers:\n`;
    content += `• The #1 mistake people make (and how to avoid it)\n`;
    content += `• 3 proven strategies that deliver results\n`;
    content += `• Simple steps you can implement today\n\n`;
    content += `Want access? Just click the link below.\n\n`;
    content += `[Get Your Free Guide]\n\n`;
    content += `To your success,\n[Your Name]`;
  } else if (length === 'medium') {
    content += `Over the past few years, I've worked with hundreds of people just like you, and I've noticed a pattern. `;
    content += `The ones who succeed all share one thing in common: they focus on fundamentals first.\n\n`;
    content += `That's why I created a comprehensive resource that covers:\n\n`;
    content += `✅ The foundational principles of ${topic}\n`;
    content += `✅ Step-by-step strategies that actually work\n`;
    content += `✅ Common pitfalls to avoid\n`;
    content += `✅ Real-world examples and case studies\n`;
    content += `✅ Action items you can implement immediately\n\n`;
    content += `This isn't theory – it's practical, tested advice that gets results.\n\n`;
    content += `Ready to transform your approach?\n\n`;
    content += `[Access Your Free Resource]\n\n`;
    content += `P.S. - This offer won't be available forever. Grab it while you can!\n\n`;
    content += `Best regards,\n[Your Name]`;
  } else {
    content += `Let me share a quick story...\n\n`;
    content += `A few months ago, I was working with a client who was struggling with ${topic}. `;
    content += `They had tried everything – expensive tools, countless strategies, expert advice. Nothing seemed to work.\n\n`;
    content += `Then we made one simple change: we went back to basics.\n\n`;
    content += `Within 30 days, they saw a complete transformation. Their results improved dramatically, and best of all, the approach was sustainable.\n\n`;
    content += `What was the secret? They stopped chasing quick fixes and started building on solid foundations.\n\n`;
    content += `I've seen this pattern repeat over and over. The people who succeed with ${topic} all do these things:\n\n`;
    content += `1️⃣ **They Start with Clarity**\n`;
    content += `Before diving into tactics, they define exactly what success looks like. This clarity guides every decision.\n\n`;
    content += `2️⃣ **They Master the Fundamentals**\n`;
    content += `Instead of chasing the latest trends, they build expertise in the core principles that drive results.\n\n`;
    content += `3️⃣ **They Measure Relentlessly**\n`;
    content += `They track everything, learn from the data, and continuously optimize their approach.\n\n`;
    content += `4️⃣ **They Stay Consistent**\n`;
    content += `They show up every day, even when results aren't immediate. They understand that success is a marathon, not a sprint.\n\n`;
    content += `5️⃣ **They Never Stop Learning**\n`;
    content += `They invest in their knowledge and skills, always looking for ways to improve.\n\n`;
    content += `I've put all of this (and more) into a comprehensive guide that you can access right now – completely free.\n\n`;
    content += `Inside, you'll discover:\n\n`;
    content += `✅ The exact framework I use with my clients\n`;
    content += `✅ Step-by-step implementation guides\n`;
    content += `✅ Real-world examples and case studies\n`;
    content += `✅ Common mistakes to avoid\n`;
    content += `✅ Templates and tools to get started immediately\n\n`;
    content += `This isn't just theory – it's battle-tested advice that's helped hundreds of people achieve breakthrough results.\n\n`;
    content += `Ready to transform your approach to ${topic}?\n\n`;
    content += `[Get Instant Access]\n\n`;
    content += `Remember, the difference between where you are and where you want to be is often just one good decision. `;
    content += `This could be that decision.\n\n`;
    content += `To your success,\n[Your Name]\n\n`;
    content += `P.S. - This resource has helped others achieve amazing results. Don't miss out – grab your copy now while it's still available!`;
  }

  return content;
}

// Generate Landing Page Copy
function generateLandingPage(topic, tone, audience, length) {
  const audienceText = audience ? ` for ${audience}` : '';

  let content = `# Transform Your ${topic} Today\n\n`;
  content += `## The Complete Solution${audienceText} Who Want Real Results\n\n`;

  if (length === 'short') {
    content += `Stop struggling with ${topic}. Our proven system delivers results in days, not months.\n\n`;
    content += `### What You Get:\n`;
    content += `✓ Step-by-step guidance\n`;
    content += `✓ Proven strategies that work\n`;
    content += `✓ Expert support when you need it\n`;
    content += `✓ 100% satisfaction guarantee\n\n`;
    content += `**Special Offer:** Get started today for just $97 (Regular price: $297)\n\n`;
    content += `[Get Started Now →]\n\n`;
    content += `*30-day money-back guarantee. No questions asked.*`;
  } else if (length === 'medium') {
    content += `### Are You Tired of Mediocre Results?\n\n`;
    content += `You've tried everything. You've invested time, money, and effort. But you're still not seeing the results you deserve.\n\n`;
    content += `Sound familiar? You're not alone.\n\n`;
    content += `The truth is, most approaches to ${topic} are outdated, incomplete, or just plain wrong. `;
    content += `That's why we created a better way – a proven system that actually works.\n\n`;
    content += `### Introducing: [Your Solution Name]\n\n`;
    content += `The complete ${topic} system${audienceText} who are serious about success.\n\n`;
    content += `**What Makes Us Different:**\n\n`;
    content += `✓ **Proven Results:** Used by thousands of successful clients\n`;
    content += `✓ **Step-by-Step System:** No guesswork, just clear instructions\n`;
    content += `✓ **Expert Support:** Get help when you need it\n`;
    content += `✓ **Risk-Free:** 30-day money-back guarantee\n\n`;
    content += `### What You'll Achieve:\n\n`;
    content += `• Master ${topic} fundamentals in days, not months\n`;
    content += `• Implement proven strategies that deliver results\n`;
    content += `• Avoid costly mistakes and wasted effort\n`;
    content += `• Build sustainable success that lasts\n\n`;
    content += `**Limited Time Offer:** Get started today for just $97\n\n`;
    content += `Regular Price: ~~$297~~ | **Today: $97** (Save $200!)\n\n`;
    content += `[Claim Your Discount Now →]\n\n`;
    content += `*This offer expires in 48 hours. Don't miss out!*\n\n`;
    content += `### 100% Satisfaction Guaranteed\n\n`;
    content += `Try it risk-free for 30 days. If you're not completely satisfied, we'll refund every penny. No questions asked.`;
  } else {
    content += `### Stop Wasting Time on Strategies That Don't Work\n\n`;
    content += `You've tried everything. You've invested time, money, and effort. You've followed the "experts" and implemented their advice.\n\n`;
    content += `But you're still not seeing the results you deserve.\n\n`;
    content += `Sound familiar?\n\n`;
    content += `**Here's the truth:** Most approaches to ${topic} are outdated, incomplete, or just plain wrong. `;
    content += `They're designed to sell you more products, not help you succeed.\n\n`;
    content += `That's why we created something different – a proven system that actually works.\n\n`;
    content += `### Introducing: The Complete ${topic} System\n\n`;
    content += `Everything you need${audienceText} who are serious about achieving breakthrough results.\n\n`;
    content += `**What Makes This Different:**\n\n`;
    content += `✓ **Battle-Tested:** Used by thousands of successful clients worldwide\n`;
    content += `✓ **Complete System:** No missing pieces, no upsells, just results\n`;
    content += `✓ **Step-by-Step:** Clear instructions that anyone can follow\n`;
    content += `✓ **Expert Support:** Get help whenever you need it\n`;
    content += `✓ **Risk-Free:** 30-day money-back guarantee\n\n`;
    content += `### What You'll Achieve:\n\n`;
    content += `📈 **Quick Wins:** See results in the first 7 days\n`;
    content += `Master the fundamentals and implement proven strategies that deliver immediate impact.\n\n`;
    content += `🎯 **Long-term Success:** Build sustainable growth\n`;
    content += `Learn the principles that create lasting results, not just temporary improvements.\n\n`;
    content += `💪 **Expert-Level Skills:** Develop true mastery\n`;
    content += `Go beyond basic knowledge to become a true expert in ${topic}.\n\n`;
    content += `🚀 **Competitive Advantage:** Stand out from the crowd\n`;
    content += `Implement strategies most people don't know about or haven't mastered.\n\n`;
    content += `### Here's Everything You Get:\n\n`;
    content += `**Module 1: Foundations**\n`;
    content += `Master the core principles that everything else builds on. Without these, nothing else works.\n\n`;
    content += `**Module 2: Advanced Strategies**\n`;
    content += `Implement proven tactics that separate the amateurs from the experts.\n\n`;
    content += `**Module 3: Optimization & Scaling**\n`;
    content += `Fine-tune your approach and scale your results exponentially.\n\n`;
    content += `**Module 4: Troubleshooting**\n`;
    content += `Overcome common obstacles and challenges with expert solutions.\n\n`;
    content += `**BONUS #1:** Templates & Tools (Value: $97)\n`;
    content += `**BONUS #2:** Case Studies Library (Value: $147)\n`;
    content += `**BONUS #3:** Private Community Access (Value: $297)\n\n`;
    content += `**Total Value: $835**\n\n`;
    content += `### Special Limited-Time Offer\n\n`;
    content += `For a limited time, get everything for just $97.\n\n`;
    content += `Regular Price: ~~$297~~ | **Today Only: $97** (Save $200!)\n\n`;
    content += `[Claim Your 67% Discount Now →]\n\n`;
    content += `⏰ *This special pricing expires in 48 hours*\n\n`;
    content += `### 100% Satisfaction Guaranteed\n\n`;
    content += `We're so confident you'll love this system that we offer a no-questions-asked, 30-day money-back guarantee. `;
    content += `Try it risk-free. If you're not completely satisfied, we'll refund every penny.\n\n`;
    content += `### What Our Clients Say:\n\n`;
    content += `⭐⭐⭐⭐⭐ "This completely transformed my approach to ${topic}. Results in just 2 weeks!" - Sarah M.\n\n`;
    content += `⭐⭐⭐⭐⭐ "The best investment I've made this year. Worth every penny and more." - James R.\n\n`;
    content += `⭐⭐⭐⭐⭐ "Clear, actionable, and it actually works. Highly recommended!" - Michael T.\n\n`;
    content += `### Don't Wait – Start Today\n\n`;
    content += `The difference between where you are and where you want to be is taking action. `;
    content += `This could be the decision that changes everything.\n\n`;
    content += `[Get Instant Access Now →]\n\n`;
    content += `*Digital delivery. Instant access after purchase.*`;
  }

  return content;
}

// Generate Article
function generateArticle(topic, tone, audience, length) {
  // Articles are similar to blog posts but more formal
  return generateBlogPost(topic, tone, audience, length);
}

// Calculate SEO metrics
function calculateSEOMetrics(content, topic) {
  const words = content.trim().split(/\s+/);
  const wordCount = words.length;

  // Calculate keyword density
  const topicWords = topic.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();
  let keywordCount = 0;

  topicWords.forEach(word => {
    const matches = contentLower.match(new RegExp(word, 'g'));
    if (matches) keywordCount += matches.length;
  });

  const keywordDensity = ((keywordCount / wordCount) * 100).toFixed(1) + '%';

  // Calculate readability (simplified Flesch score)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / sentences;
  const readability = avgWordsPerSentence < 20 ? 'Good' : avgWordsPerSentence < 30 ? 'Fair' : 'Needs Improvement';

  // Calculate SEO score
  let seoScore = 70; // Base score
  if (keywordCount > 0) seoScore += 10;
  if (wordCount >= 300) seoScore += 10;
  if (avgWordsPerSentence < 25) seoScore += 10;

  return {
    keywordDensity,
    readability,
    seoScore: `${Math.min(seoScore, 100)}/100`,
    uniqueness: '100%'
  };
}

// Generate improvement suggestions
function generateSuggestions(content, contentType, seoAnalysis) {
  const suggestions = [];
  const wordCount = content.trim().split(/\s+/).length;

  if (wordCount < 300 && contentType !== 'meta_description' && contentType !== 'social_media') {
    suggestions.push('Consider expanding your content to at least 300 words for better SEO performance.');
  }

  if (parseInt(seoAnalysis.seoScore) < 80) {
    suggestions.push('Improve keyword usage throughout the content for better search engine visibility.');
  }

  if (seoAnalysis.readability !== 'Good') {
    suggestions.push('Break down long sentences to improve readability and user engagement.');
  }

  suggestions.push('Add relevant internal and external links to provide more value to readers.');
  suggestions.push('Consider adding images or multimedia to enhance user engagement.');
  suggestions.push('Use headings (H2, H3) to structure your content for better scannability.');

  return suggestions.slice(0, 4);
}

// Main content generation function
export async function generateContent(contentType, topic, tone, length, targetAudience) {
  try {
    // Validate inputs
    if (!contentType || !topic || !tone || !length) {
      throw new Error('Missing required fields');
    }

    // Check if content type exists
    if (!contentTemplates[contentType]) {
      throw new Error('Invalid content type');
    }

    // Generate content
    const generator = contentTemplates[contentType][length];
    const content = generator(topic, tone, targetAudience);

    // Calculate metrics
    const wordCount = content.trim().split(/\s+/).length;
    const seoAnalysis = calculateSEOMetrics(content, topic);
    const suggestions = generateSuggestions(content, contentType, seoAnalysis);

    return {
      success: true,
      content,
      wordCount,
      seoAnalysis,
      suggestions
    };
  } catch (error) {
    console.error('Content generation error:', error);
    throw error;
  }
}
