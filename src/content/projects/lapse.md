---
title: 'LAPSE'
claim: 'Memory consolidation flattens the temporal shape of user facts: an ongoing activity is stored as a standing one.'
tags: [ConversationalMemory, Evaluation]
cover: /projects/lapse.webp
coverVideo: /projects/lapse-video.mp4
links:
  - { kind: arxiv, url: 'https://arxiv.org/abs/2609.36457' }
  - { kind: github, url: 'https://github.com/aimsresearchlab/lapse' }
publications:
  - 'Memory Consolidation Flattens the Temporal Shape of User Facts'
---

## Overview

Long-term memory systems turn conversations into short stored notes. A note
can keep a user fact while losing the evidence of whether the fact still
holds: "I am driving a Peugeot" becomes "The user drives a Peugeot", and the
cue that the activity is ongoing is gone. LAPSE is a benchmark of matched user
statements that differ only in temporal form, built to measure this.

## What we found

Memory writers flatten aspect selectively. Three writer models flattened the
progressive statement but kept its simple-present match in 244 of 381 pairs,
and never the reverse. The asymmetry holds in all 11 model configurations
tested and in the installed pipelines mem0, Graphiti, and Letta.

The lost cue matters to later readers. In exploratory tests, changing only the
stored verb shifted all three readers' estimates that a fact still holds, and
when readers could ask the user before acting, two of three acted without
asking more often on flattened notes.
