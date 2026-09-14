---
title: 'Fixed RAG Compression'
claim: 'A fixed compression layer in a RAG pipeline collapses the reader-scaling trend that the uncompressed setup shows.'
tags: [RAG, Evaluation]
featured: 2
links:
  - { kind: arxiv, url: 'https://arxiv.org/abs/2606.21807' }
  - { kind: github, url: 'https://github.com/aimsresearchlab/Fixed-RAG-Compression-Collapses-Measured-Reader-Scaling' }
publications:
  - 'Fixed RAG Compression Collapses Measured Reader Scaling'
---

## Overview

Retrieval-augmented pipelines often compress retrieved context before it
reaches the reader, with the compression budget held fixed across readers so
the comparison stays controlled.

## What we found

Fixing the budget removes the effect the comparison is meant to measure. Under
an uncompressed pipeline, larger readers do better with more context; under a
fixed compression layer, that trend flattens, so the measured benefit of a
stronger reader is an artifact of where the compression budget was set.
