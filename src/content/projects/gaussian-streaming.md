---
title: '4D Gaussian Streaming'
claim: 'Which Gaussians you pick as anchors barely matters: cheap samplers match the default strategy at deployment budgets, so the standard 8,192-anchor choice over-spends compute.'
cover: /projects/gaussian-streaming.webp
coverVideo: /projects/anchor_policies.mp4
tags: [ComputerVision, GaussianSplatting]
featured: 1
links:
  - { kind: arxiv, url: 'https://arxiv.org/abs/2603.17227' }
publications:
  - 'Does It Matter Which Gaussians You Pick in 4D Gaussian Streaming?'
---

## Overview

Streaming 4D Gaussian scenes requires choosing a subset of Gaussians as
anchors. The field has settled on a default strategy and a default count of
8,192 without much pressure on either.

## What we found

At the budgets that matter for deployment, cheap samplers match the default
strategy, which makes the standard anchor count more compute than the result
requires.
