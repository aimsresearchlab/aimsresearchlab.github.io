---
title: 'SEAM'
claim: 'Measuring how much typed user speech gets absorbed into edited artifacts at unmarked within-turn seams.'
tags: [HumanCenteredAI, LLMEditing]
cover: /projects/seam.webp
coverVideo: /projects/seam-demo.webm
featured: 2
links:
  - { kind: demo, url: '/seam/' }
  - { kind: github, url: 'https://github.com/aimsresearchlab/seam' }
---

## Overview

When a user pastes a document and types an instruction in the same turn, the
boundary between the two is unmarked. A model that misreads it edits the
instruction into the artifact, or treats part of the artifact as a command.

## Benchmark

SEAM measures how often that absorption happens and how far it spreads. The
walkthrough and the model leaderboard are on the [demo page](/seam/).
