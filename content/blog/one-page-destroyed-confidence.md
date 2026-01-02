---
title: "I Built Everything Fast… Then One Page Destroyed My Confidence"
date: "2024-12-07"
tags:
  - webdev
  - programming
  - javascript
  - opensource
readTime: 1
summary: "Shipping a personal site in record time felt great until one stubborn page forced me to slow down and rethink my process."
---

Every indie project has *that* moment. I shipped the rest of this site in an afternoon, but the blog page chewed through two evenings of false starts.

I rewrote the layout three times trying to make it "perfect" instead of shipping something decent. Eventually I listed the blockers:

- I didn't have a markdown pipeline, so I kept stubbing JSON data.
- Navigation was an afterthought, which made testing feel clumsy.
- I was coding without content, so every decision was abstract.

Writing those out was enough to snap me back to reality. I moved the posts into `content/blog`, parsed them with `gray-matter`, and committed to tiny improvements instead of a redesign.

The lesson: momentum dies when I grind on polish without a foundation. Start with real content, wire up the boring plumbing, and only then worry about gradients and animations.
