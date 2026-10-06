---
title: 'UAV Smoke Detection'
claim: 'A lightweight CNN screens every frame on the drone and hands only uncertain ones to a stronger model, cutting processing time by up to 56.9%.'
tags: [ComputerVision, EdgeAI]
cover: /projects/smoke-detection.webp
coverVideo: /projects/smoke-detection-demo.webm
links:
  - { kind: paper, url: 'https://doi.org/10.1109/JIOT.2025.3578445' }
  - { kind: poster, url: '/projects/smoke-detection-poster.pdf' }
publications:
  - 'Bayesian Optimization-Aided Hybrid Deep Learning Model for Lightweight UAV-Based Smoke Detection'
---

## Overview

Early wildfire smoke detection protects lives and limits damage, but accurate
deep models need more compute and energy than a battery-powered UAV can spare.
This work keeps all inference onboard: a custom CNN with 0.69 million
parameters scores every incoming frame, and a stronger depth-wise CNN runs
only when that score falls between a lower and an upper confidence threshold.
Bayesian Optimization picks the two thresholds to balance accuracy against
processing time.

## What we found

Across five backbone networks, the hybrid framework cut processing time by up
to 56.9% and calls to the depth-wise model by up to 64.1%, at an average
accuracy cost of about 4%. The saved computation translates into energy
savings and longer flights.

## Poster

[![Poster: Bayesian Optimization-Aided Hybrid Deep Learning Model for Lightweight UAV-Based Smoke Detection](/projects/smoke-detection-poster.webp)](/projects/smoke-detection-poster.pdf)
